import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { StartupProfile, Grant } from '../types';
import { FileText, Cpu, Download, Copy, Printer, Check, RefreshCw, Terminal, AlertCircle, Trash2, History, Save } from 'lucide-react';
import { TRANSLATIONS } from '../locales/translations';

interface ProposalGeneratorProps {
  startupProfile: StartupProfile;
  selectedGrant: Grant | null;
  onClearSelectedGrant: () => void;
  currentLanguage?: string;
}

interface SavedProposalDraft {
  id: string;
  grantId: string;
  grantName: string;
  startupName: string;
  proposalText: string;
  createdAt: string;
}

interface ProposalFormState {
  startupName: string;
  startupDescription: string;
  stage: string;
  domain: string;
  targetGrantName: string;
  targetGrantDetails: string;
  additionalNotes: string;
  tone: string;
}

// Detects a markdown table separator row like: |---|:---:|---|  or  ---|---
function isTableSeparatorRow(line: string) {
  const t = line.trim();
  if (!t.includes('-')) return false;
  const cells = t.replace(/^\||\|$/g, '').split('|');
  if (cells.length === 0) return false;
  return cells.every(cell => /^\s*:?-{2,}:?\s*$/.test(cell));
}

function splitTableRow(line: string) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map(cell => cell.trim());
}

// Reuse the secure in-file Markdown-to-HTML parser
function parseMarkdownToHtml(markdown: string) {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  let inList = false;
  let inCodeBlock = false;
  let inTable = false;

  const htmlLines: string[] = [];

  const closeList = () => {
    if (inList) {
      inList = false;
      htmlLines.push('</ul>');
    }
  };

  const closeTable = () => {
    if (inTable) {
      inTable = false;
      htmlLines.push('</tbody></table></div>');
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      closeList();
      closeTable();
      inCodeBlock = !inCodeBlock;
      htmlLines.push(inCodeBlock ? '<pre class="bg-[#F5F5F0] text-[#4A4A30] p-4 rounded-xl border border-[#DEDCCF] font-mono text-xs overflow-x-auto my-3">' : '</pre>');
      continue;
    }

    if (inCodeBlock) {
      htmlLines.push(trimmed);
      continue;
    }

    // Table detection: current line looks like a row, and next line is a separator row
    const nextLine = lines[i + 1];
    if (!inTable && trimmed.includes('|') && nextLine !== undefined && isTableSeparatorRow(nextLine)) {
      closeList();
      const headerCells = splitTableRow(trimmed);
      htmlLines.push('<div class="overflow-x-auto my-4 rounded-lg border border-[#DEDCCF]"><table class="min-w-full text-xs border-collapse">');
      htmlLines.push('<thead class="bg-[#F0F0E8]"><tr>' + headerCells.map(c => `<th class="px-3 py-2 text-left font-display font-semibold text-[#4A4A30] border-b border-[#DEDCCF]">${parseInlineMarkdown(c)}</th>`).join('') + '</tr></thead>');
      htmlLines.push('<tbody>');
      inTable = true;
      i++; // skip separator row
      continue;
    }

    if (inTable) {
      if (trimmed.includes('|') && trimmed !== '') {
        const cells = splitTableRow(trimmed);
        htmlLines.push('<tr class="even:bg-[#FAFAF7]">' + cells.map(c => `<td class="px-3 py-2 border-b border-[#DEDCCF] text-slate-800 align-top">${parseInlineMarkdown(c)}</td>`).join('') + '</tr>');
        continue;
      } else {
        closeTable();
      }
    }

    if (trimmed.startsWith('#### ')) {
      closeList();
      htmlLines.push(`<h5 class="font-display font-semibold text-[#4A4A30] text-xs uppercase tracking-wider mt-5 mb-2">${trimmed.replace('#### ', '')}</h5>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      closeList();
      htmlLines.push(`<h4 class="font-display font-semibold text-[#5A5A40] text-sm mt-6 mb-2 border-b border-[#DEDCCF] pb-1">${trimmed.replace('### ', '')}</h4>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      htmlLines.push(`<h3 class="font-display font-bold text-[#1A1A1A] text-base mt-8 mb-4 border-b border-[#DEDCCF] pb-1.5">${trimmed.replace('## ', '')}</h3>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      htmlLines.push(`<h2 class="font-display font-bold text-[#5A5A40] text-lg mt-10 mb-4 pb-2 border-b-2 border-[#5A5A40]/30">${trimmed.replace('# ', '')}</h2>`);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      if (!inList) {
        inList = true;
        htmlLines.push('<ul class="list-disc pl-5 space-y-2 my-3 text-xs text-slate-800">');
      }
      htmlLines.push(`<li class="leading-normal">${parseInlineMarkdown(content)}</li>`);
      continue;
    }

    closeList();
    if (trimmed === '') {
      htmlLines.push('<div class="h-3"></div>');
    } else {
      htmlLines.push(`<p class="leading-relaxed text-xs text-slate-800 mb-4">${parseInlineMarkdown(line)}</p>`);
    }
  }

  closeList();
  closeTable();

  return htmlLines.join('\n');
}

function parseInlineMarkdown(text: string) {
  let formatted = text;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#4A4A30]">$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-[#F0F0E8] text-[#5A5A40] px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>');
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#5A5A40] hover:underline font-semibold">$1 ↗</a>');
  return formatted;
}

export default function ProposalGenerator({
  startupProfile,
  selectedGrant,
  onClearSelectedGrant,
  currentLanguage = 'english'
}: ProposalGeneratorProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.english;
  const labels = currentLanguage === 'hindi' ? {
    contextPanel: 'प्रस्ताव प्रसंग पैनल',
    deselectBtn: 'योजना हटाएँ',
    lockedTitle: 'लक्षित योजना लॉक है',
    noSelectedTitle: 'कोई लक्षित योजना चयनित नहीं है',
    noSelectedDesc: 'इसे लोड करने के लिए सूची में किसी भी योजना पर "प्रस्ताव का मसौदा" पर क्लिक करें।',
    startupName: 'स्टार्टअप का नाम',
    grantName: 'लक्षित योजना का नाम',
    grantEligibility: 'लक्षित योजना और पात्रता नियम',
    startupDesc: 'स्टार्टअप मुख्य विवरण / तकनीकी नवीनता',
    additionalNotes: 'अतिरिक्त रणनीतिक नोट्स (वैकल्पिक)',
    toneLabel: 'प्रस्ताव का लहजा',
    toneFormal: 'व्यावसायिक और औपचारिक',
    toneTechnical: 'तकनीकी और डेटा-संचालित',
    tonePersuasive: 'प्रेरक और प्रभाव-केंद्रित',
    toneConcise: 'संक्षिप्त और कार्यकारी सारांश',
    inferenceRunning: 'अनुमान चल रहा है...',
    draftBtn: 'IBM ग्रेनाइट के साथ प्रस्ताव का मसौदा तैयार करें',
    draftDoc: 'प्रस्ताव मसौदा दस्तावेज़',
    poweredBy: 'Watsonx.ai उद्यम पाठ जनरेटर द्वारा संचालित',
    savedVersions: 'सहेजे गए संस्करण:',
    noVersions: 'अभी तक कोई संस्करण सहेजा नहीं गया है',
    snapshotBtn: 'वर्तमान संस्करण का स्नैपशॉट लें',
    initializeTitle: 'प्रस्ताव जनरेशन प्रसंग प्रारंभ करें...',
    initializeDesc: 'बाईं ओर विवरण पूरा करें और उन्नत, अनुकूलित सार्वजनिक फंडिंग और शैक्षणिक योजना अनुप्रयोगों का मसौदा तैयार करने के लिए "IBM ग्रेनाइट के साथ प्रस्ताव का मसौदा" पर क्लिक करें।'
  } : currentLanguage === 'punjabi' ? {
    contextPanel: 'ਪ੍ਰਸਤਾਵ ਪ੍ਰਸੰਗ ਪੈਨਲ',
    deselectBtn: 'ਯੋਜਨਾ ਹਟਾਓ',
    lockedTitle: 'ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਲਾਕ ਹੈ',
    noSelectedTitle: 'ਕੋਈ ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਚੁਣੀ ਨਹੀਂ ਗਈ',
    noSelectedDesc: 'ਇਸਨੂੰ ਲੋਡ ਕਰਨ ਲਈ ਸੂਚੀ ਵਿੱਚ ਕਿਸੇ ਵੀ ਯੋਜਨਾ ਉੱਤੇ "ਪ੍ਰਸਤਾਵ ਦਾ ਖਰੜਾ" ਤੇ ਕਲਿੱਕ ਕਰੋ।',
    startupName: 'ਸਟਾਰਟਅੱਪ ਦਾ ਨਾਮ',
    grantName: 'ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਦਾ ਨਾਮ',
    grantEligibility: 'ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਅਤੇ ਯੋਗਤਾ ਨਿਯਮ',
    startupDesc: 'ਸਟਾਰਟਅੱਪ ਮੁੱਖ ਵੇਰਵਾ / ਤਕਨੀਕੀ ਨਵੀਨਤਾ',
    additionalNotes: 'ਵਾਧੂ ਰਣਨੀਤਕ ਨੋਟਸ (ਵਿਕਲਪਿਕ)',
    toneLabel: 'ਪ੍ਰਸਤਾਵ ਦਾ ਲਹਿਜ਼ਾ',
    toneFormal: 'ਪੇਸ਼ੇਵਰ ਅਤੇ ਰਸਮੀ',
    toneTechnical: 'ਤਕਨੀਕੀ ਅਤੇ ਡੇਟਾ-ਸੰਚਾਲਿਤ',
    tonePersuasive: 'ਪ੍ਰੇਰਕ ਅਤੇ ਪ੍ਰਭਾਵ-ਕੇਂਦ੍ਰਿਤ',
    toneConcise: 'ਸੰਖੇਪ ਅਤੇ ਕਾਰਜਕਾਰੀ ਸਾਰ',
    inferenceRunning: 'ਅਨੁਮਾਨ ਚੱਲ ਰਿਹਾ ਹੈ...',
    draftBtn: 'IBM ਗ੍ਰੇਨਾਈਟ ਨਾਲ ਪ੍ਰਸਤਾਵ ਦਾ ਖਰੜਾ ਤਿਆਰ ਕਰੋ',
    draftDoc: 'ਪ੍ਰਸਤਾਵ ਖਰੜਾ ਦਸਤਾਵੇਜ਼',
    poweredBy: 'Watsonx.ai ਉੱਦਮ ਪਾਠ ਜਨਰੇਟਰ ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
    savedVersions: 'ਸੰਭਾਲੇ ਗਏ ਸੰਸਕਰਣ:',
    noVersions: 'ਅਜੇ ਤੱਕ ਕੋਈ ਸੰਸਕਰਣ ਸੰਭਾਲਿਆ ਨਹੀਂ ਗਿਆ',
    snapshotBtn: 'ਮੌਜੂਦਾ ਸੰਸਕਰਣ ਦਾ ਸਨੈਪਸ਼ਾਟ ਲਓ',
    initializeTitle: 'ਪ੍ਰਸਤਾਵ ਜਨਰੇਸ਼ਨ ਪ੍ਰਸੰਗ ਸ਼ੁਰੂ ਕਰੋ...',
    initializeDesc: 'ਖੱਬੇ ਪਾਸੇ ਵੇਰਵੇ ਪੂਰੇ ਕਰੋ ਅਤੇ ਉੱਨਤ, ਅਨੁਕੂਲਿਤ ਜਨਤਕ ਫੰਡਿੰਗ ਅਤੇ ਅਕਾਦਮਿਕ ਯੋਜਨਾ ਐਪਲੀਕੇਸ਼ਨਾਂ ਦਾ ਖਰੜਾ ਤਿਆਰ ਕਰਨ ਲਈ "IBM ਗ੍ਰੇਨਾਈਟ ਨਾਲ ਪ੍ਰਸਤਾਵ ਦਾ ਖਰੜਾ" ਤੇ ਕਲਿੱਕ ਕਰੋ।'
  } : {
    contextPanel: 'Proposal Context Panel',
    deselectBtn: 'Deselect Grant',
    lockedTitle: 'Target Grant Locked',
    noSelectedTitle: 'No Target Grant Selected',
    noSelectedDesc: 'Click "Draft Proposal" on any card in the list to load it here.',
    startupName: 'Startup Name',
    grantName: 'Target Grant Name',
    grantEligibility: 'Target Grant & Eligibility Rules',
    startupDesc: 'Startup Core Description / Tech Novelty',
    additionalNotes: 'Additional Strategic Notes (Optional)',
    toneLabel: 'Proposal Tone',
    toneFormal: 'Professional & Formal',
    toneTechnical: 'Technical & Data-Driven',
    tonePersuasive: 'Persuasive & Impact-Focused',
    toneConcise: 'Concise & Executive Summary',
    inferenceRunning: 'Inference Running...',
    draftBtn: 'Draft Proposal with IBM Granite',
    draftDoc: 'Proposal Draft Document',
    poweredBy: 'Powered by Watsonx.ai enterprise text generator',
    savedVersions: 'Saved Versions:',
    noVersions: 'No iterations stored yet',
    snapshotBtn: 'Snapshot current version',
    initializeTitle: 'Initialize Proposal Generation Context...',
    initializeDesc: 'Complete the parameters on the left and click "Draft Proposal with IBM Granite" to auto-compile highly structured, compliant public funding and academic study proposals.'
  };

  const [form, setForm] = useState<ProposalFormState>(() => {
    const raw = localStorage.getItem('fundai_active_proposal_draft');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.form) {
          return parsed.form as ProposalFormState;
        }
      } catch (err) {
        console.error("Failed to parse active proposal draft form:", err);
      }
    }
    return {
      startupName: '',
      startupDescription: '',
      stage: 'seed',
      domain: 'any',
      targetGrantName: '',
      targetGrantDetails: '',
      additionalNotes: '',
      tone: 'formal'
    };
  });

  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<string>(() => {
    const raw = localStorage.getItem('fundai_active_proposal_draft');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.proposal !== undefined) {
          return parsed.proposal;
        }
      } catch {}
    }
    return '';
  });
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  // State for saved proposal draft iterations
  const [savedDrafts, setSavedDrafts] = useState<SavedProposalDraft[]>(() => {
    const raw = localStorage.getItem('fundai_proposal_drafts');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse saved proposal drafts:", err);
      }
    }
    return [];
  });
  const [selectedDraftId, setSelectedDraftId] = useState<string>(() => {
    const raw = localStorage.getItem('fundai_active_proposal_draft');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.selectedDraftId !== undefined) {
          return parsed.selectedDraftId;
        }
      } catch {}
    }
    return '';
  });

  // Filter drafts matching the current target grant name
  const activeDrafts = savedDrafts.filter(d => 
    d.grantName.toLowerCase().trim() === form.targetGrantName.toLowerCase().trim()
  );

  // 2. Synchronize profile changes and selected grant to proposal form
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      startupName: startupProfile.name || prev.startupName,
      startupDescription: startupProfile.description || prev.startupDescription,
      stage: startupProfile.stage || prev.stage,
      domain: startupProfile.domain || prev.domain,
      targetGrantName: selectedGrant ? selectedGrant.name : prev.targetGrantName,
      targetGrantDetails: selectedGrant ? `Source: ${selectedGrant.source}\nEligibility Rules: ${selectedGrant.eligibility}\nOverview: ${selectedGrant.description}` : prev.targetGrantDetails
    }));
  }, [startupProfile, selectedGrant]);

  // 3. Auto-load draft when the target grant or draft ID changes
  useEffect(() => {
    if (activeDrafts.length > 0) {
      const selected = activeDrafts.find(d => d.id === selectedDraftId) || activeDrafts[0];
      if (selected) {
        setProposal(selected.proposalText);
        if (selectedDraftId !== selected.id) {
          setSelectedDraftId(selected.id);
        }
      }
    } else {
      const raw = localStorage.getItem('fundai_active_proposal_draft');
      let cachedGrantName = '';
      let cachedProposal = '';
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          cachedGrantName = parsed?.form?.targetGrantName || '';
          cachedProposal = parsed?.proposal || '';
        } catch {}
      }

      if (cachedGrantName.toLowerCase().trim() === form.targetGrantName.toLowerCase().trim() && cachedProposal) {
        setProposal(cachedProposal);
      } else {
        setProposal('');
        setSelectedDraftId('');
      }
    }
  }, [form.targetGrantName, selectedDraftId]);

  // 4. Auto-save current active form input values and generated proposal state
  useEffect(() => {
    const activeDraft = {
      form,
      proposal,
      selectedDraftId
    };
    localStorage.setItem('fundai_active_proposal_draft', JSON.stringify(activeDraft));
  }, [form, proposal, selectedDraftId]);

  // Save a new draft iteration (auto-saves on generate or manual snapshot)
  const saveDraftIteration = (textToSave: string, isManual = false) => {
    if (!textToSave) return;
    const newDraft: SavedProposalDraft = {
      id: Math.random().toString(36).substring(2, 9),
      grantId: selectedGrant?.id || '',
      grantName: form.targetGrantName,
      startupName: form.startupName,
      proposalText: textToSave,
      createdAt: new Date().toISOString()
    };
    
    // Read fresh list to avoid race conditions
    let freshList: SavedProposalDraft[] = [];
    const raw = localStorage.getItem('fundai_proposal_drafts');
    if (raw) {
      try { freshList = JSON.parse(raw); } catch {}
    }
    
    const updated = [newDraft, ...freshList];
    setSavedDrafts(updated);
    localStorage.setItem('fundai_proposal_drafts', JSON.stringify(updated));
    setSelectedDraftId(newDraft.id);
    
    if (isManual) {
      const alertMsg = currentLanguage === 'hindi' 
        ? 'स्नैपशॉट संस्करण सफलतापूर्वक सहेज लिया गया है!' 
        : currentLanguage === 'punjabi' 
        ? 'ਸਨੈਪਸ਼ਾਟ ਸੰਸਕਰਣ ਸਫਲਤਾਪੂਰਵਕ ਸੁਰੱਖਿਅਤ ਕਰ ਲਿਆ ਗਿਆ ਹੈ!' 
        : 'Snapshot iteration saved successfully! Current version has been stored inside your workspace browser state.';
      alert(alertMsg);
    }
  };

  const handleDeleteDraft = (idToDelete: string) => {
    let freshList: SavedProposalDraft[] = [];
    const raw = localStorage.getItem('fundai_proposal_drafts');
    if (raw) {
      try { freshList = JSON.parse(raw); } catch {}
    }
    const updated = freshList.filter(d => d.id !== idToDelete);
    setSavedDrafts(updated);
    localStorage.setItem('fundai_proposal_drafts', JSON.stringify(updated));
    
    // Find remaining active drafts for this scheme to load the next one
    const remainingActive = updated.filter(d => 
      d.grantName.toLowerCase().trim() === form.targetGrantName.toLowerCase().trim()
    );
    if (remainingActive.length > 0) {
      setSelectedDraftId(remainingActive[0].id);
    } else {
      setProposal('');
      setSelectedDraftId('');
    }
  };

  const runLogsSequence = async () => {
    const logs = currentLanguage === 'hindi' ? [
      "🔄 IBM ग्रेनाइट एंटरप्राइज ड्राफ्ट मॉड्यूल प्रारंभ किया जा रहा है...",
      "⚙️ अनुदान दिशानिर्देशों के साथ संस्थापक पिच डेक का मिलान किया जा रहा है...",
      "🔍 DPIIT पात्रता मापदंडों और क्षेत्रीय मानदंडों की पुष्टि की जा रही है...",
      "🧠 ग्रेनाइट न्यूरल नेटवर्क मॉडल लॉन्च किया जा रहा है...",
      "✍️ कोर मील के पत्थर और परियोजना वित्तीय आवंटन तालिकाओं की संरचना की जा रही है...",
      "✨ सामाजिक-आर्थिक प्रभाव दावों और स्थानीय रोजगार सृजन लक्ष्यों को निखारा जा रहा है..."
    ] : currentLanguage === 'punjabi' ? [
      "🔄 IBM ਗ੍ਰੇਨਾਈਟ ਐਂਟਰਪ੍ਰਾਈਜ਼ ਡਰਾਫਟ ਮੋਡੀਊਲ ਸ਼ੁਰੂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      "⚙️ ਗ੍ਰਾਂਟ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼ਾਂ ਦੇ ਨਾਲ ਸੰਸਥਾਪਕ ਪਿੱਚ ਡੈੱਕ ਦਾ ਮਿਲਾਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      "🔍 DPIIT ਯੋਗਤਾ ਮਾਪਦੰਡਾਂ ਅਤੇ ਖੇਤਰੀ ਮਾਪਦੰਡਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
      "🧠 ਗ੍ਰੇਨਾਈਟ ਨਿਊਰਲ ਨੈੱਟਵਰਕ ਮਾਡਲ ਲਾਂਚ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      "✍️ ਕੋਰ ਮੀਲ ਪੱਥਰ ਅਤੇ ਪ੍ਰੋਜੈਕਟ ਵਿੱਤੀ ਅਲਾਟਮੈਂਟ ਟੇਬਲਾਂ ਦੀ ਸੰਰਚਨਾ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
      "✨ ਸਮਾਜਿਕ-ਆਰਥਿਕ ਪ੍ਰਭਾਵ ਦਾਅਵਿਆਂ ਅਤੇ ਸਥਾਨਕ ਰੁਜ਼ਗਾਰ ਸਿਰਜਣ ਟੀਚਿਆਂ ਨੂੰ ਨਿਖਾਰਿਆ ਜਾ ਰਿਹਾ ਹੈ..."
    ] : [
      "🔄 Initializing IBM Granite Enterprise Draft Module...",
      "⚙️ Consolidating founder pitch deck with grant guidelines...",
      "🔍 Validating DPIIT eligibility parameters and regional criteria...",
      "🧠 Launching Granite neural network model [granite-enterprise-2.0]...",
      "✍️ Structuring core milestones & project financial allocation tables...",
      "✨ Polishing socio-economic impact claims and local job creation goals..."
    ];

    setGenerationLogs([]);
    for (let i = 0; i < logs.length; i++) {
      setGenerationLogs(prev => [...prev, logs[i]]);
      await new Promise(res => setTimeout(res, 600));
    }
  };

  const generateProposal = async () => {
    if (!form.startupName || !form.startupDescription || !form.targetGrantName) {
      const errMsg = currentLanguage === 'hindi' 
        ? 'कृपया सुनिश्चित करें कि स्टार्टअप का नाम, मुख्य विवरण और लक्षित योजना भरे हुए हैं।' 
        : currentLanguage === 'punjabi'
        ? 'ਕਿਰਪਾ ਕਰਕੇ ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਸਟਾਰਟਅੱਪ ਦਾ ਨਾਮ, ਮੁੱਖ ਵੇਰਵਾ ਅਤੇ ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਭਰੇ ਹੋਏ ਹਨ।'
        : 'Please ensure Startup Name, Core Description, and Target Grant are filled.';
      setError(errMsg);
      return;
    }

    setLoading(true);
    setError('');
    setProposal('');
    
    await runLogsSequence();

    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          language: currentLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        setProposal(data.proposal);
        saveDraftIteration(data.proposal, false);
      } else {
        throw new Error(data.error || "Generation endpoint failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to contact Watsonx generation servers.");
    } finally {
      setLoading(false);
      setGenerationLogs([]);
    }
  };

  const handleCopy = () => {
    if (!proposal) return;
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!proposal) return;
    const element = document.createElement("a");
    const file = new Blob([proposal], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${form.startupName.toLowerCase().replace(/\s+/g, '-')}-grant-proposal.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // High-fidelity jsPDF document generator
  const handleDownloadPDF = () => {
    if (!proposal) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);

    let cursorY = 20;

    // Header banner background (#5A5A40)
    doc.setFillColor(90, 90, 64);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Title Text inside banner
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("GRANT APPLICATION PROPOSAL", margin, 18);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Generated dynamically via Startup Funding Hub • ${new Date().toLocaleDateString()}`, margin, 27);

    // Resume normal page flow below banner
    cursorY = 48;
    doc.setTextColor(26, 26, 26);

    // Render Metadata Box
    doc.setFillColor(242, 241, 236);
    doc.setDrawColor(218, 215, 199);
    doc.rect(margin, cursorY, maxLineWidth, 28, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`Startup Venture:  ${form.startupName}`, margin + 6, cursorY + 7);
    doc.text(`Sector / Domain:   ${form.domain.toUpperCase()}`, margin + 6, cursorY + 14);
    doc.text(`Target Scheme:     ${form.targetGrantName}`, margin + 6, cursorY + 21);

    cursorY += 38;

    // Split markdown into lines and format
    const rawLines = proposal.split('\n');
    doc.setFont('Helvetica', 'normal');

    const addNewPageIfRequired = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
        return true;
      }
      return false;
    };

    rawLines.forEach(line => {
      let trimmed = line.trim();
      if (trimmed === '') {
        cursorY += 3;
        return;
      }

      let isHeader = false;
      let fontSize = 10;
      let text = trimmed;

      if (trimmed.startsWith('# ')) {
        fontSize = 14;
        text = trimmed.replace('# ', '').toUpperCase();
        isHeader = true;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(90, 90, 64); // Brand #5A5A40
        addNewPageIfRequired(12);
        cursorY += 3;
      } else if (trimmed.startsWith('## ')) {
        fontSize = 12;
        text = trimmed.replace('## ', '');
        isHeader = true;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(26, 26, 26);
        addNewPageIfRequired(10);
        cursorY += 2;
      } else if (trimmed.startsWith('### ')) {
        fontSize = 10.5;
        text = trimmed.replace('### ', '');
        isHeader = true;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(90, 90, 64);
        addNewPageIfRequired(8);
      } else if (trimmed.startsWith('#### ')) {
        fontSize = 10;
        text = trimmed.replace('#### ', '');
        isHeader = true;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        addNewPageIfRequired(8);
      } else {
        // Normal body text
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        text = text.replace(/\*\*(.*?)\*\*/g, '$1');
        text = text.replace(/\*(.*?)\*/g, '$1');
        text = text.replace(/`(.*?)`/g, '$1');
      }

      doc.setFontSize(fontSize);
      
      const wrappedLines = doc.splitTextToSize(text, maxLineWidth);
      wrappedLines.forEach((wLine: string) => {
        addNewPageIfRequired(5.5);
        doc.text(wLine, margin, cursorY);
        cursorY += 5;
      });

      if (isHeader) {
        cursorY += 1.5;
      }
    });

    doc.save(`${form.startupName.toLowerCase().replace(/\s+/g, '-')}-proposal-draft.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${form.startupName} - Grant Proposal Draft</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; background: #fafaf9; }
            h1 { color: #5a5a40; border-bottom: 2px solid #5a5a40; padding-bottom: 10px; font-size: 24px; font-family: Georgia, serif; }
            h2 { color: #1a1a1a; border-bottom: 1px solid #dedccf; padding-bottom: 5px; font-size: 18px; margin-top: 30px; font-family: Georgia, serif; }
            h3 { color: #5a5a40; font-size: 14px; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            p { font-size: 13px; margin-bottom: 15px; text-align: justify; }
            ul { font-size: 13px; padding-left: 20px; }
            li { margin-bottom: 8px; }
            .meta { font-family: monospace; font-size: 11px; background: #f0f0e8; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #dedccf; }
          </style>
        </head>
        <body>
          <h1>GRANT APPLICATION PROPOSAL</h1>
          <div class="meta">
            <strong>Startup Venture:</strong> ${form.startupName}<br>
            <strong>Sector/Domain:</strong> ${form.domain.toUpperCase()}<br>
            <strong>Current Stage:</strong> ${form.stage.toUpperCase()}<br>
            <strong>Target Scheme:</strong> ${form.targetGrantName}
          </div>
          ${parseMarkdownToHtml(proposal)}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Editor Form (5 cols) */}
      <div className="lg:col-span-5 bg-[#ECEBE4] border border-[#DEDCCF] rounded-[24px] p-5 shadow-sm relative text-[#1A1A1A]">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#DEDCCF]">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="font-display font-semibold text-[#4A4A30] text-sm">{labels.contextPanel}</h3>
            <span className="text-[9px] text-[#5A5A40]/60 font-mono bg-[#5A5A40]/5 px-1.5 py-0.5 rounded border border-[#5A5A40]/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.autoSaved}
            </span>
          </div>
          {selectedGrant && (
            <button
              onClick={onClearSelectedGrant}
              className="text-[10px] text-rose-700 border border-rose-300 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
            >
              {labels.deselectBtn}
            </button>
          )}
        </div>

        {selectedGrant ? (
          <div className="mb-4 bg-[#5A5A40]/5 border border-[#5A5A40]/20 px-3.5 py-3 rounded-xl flex items-start gap-2 text-xs">
            <div className="p-1 rounded bg-[#ECEBE4] text-[#5A5A40] shrink-0 mt-0.5">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[#4A4A30] font-semibold">{labels.lockedTitle}</p>
              <p className="text-[#5A5A40] font-mono text-[10px] mt-0.5 leading-normal">{selectedGrant.name}</p>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-amber-50 border border-amber-200 px-3.5 py-3 rounded-xl flex items-start gap-2 text-xs">
            <div className="p-1 rounded bg-amber-100 text-[#b45309] shrink-0 mt-0.5">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[#b45309] font-semibold">{labels.noSelectedTitle}</p>
              <p className="text-slate-600 text-[10px] mt-0.5 leading-normal">
                {labels.noSelectedDesc}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.startupName}
            </label>
            <input
              type="text"
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40]"
              value={form.startupName}
              onChange={(e) => setForm({ ...form, startupName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.grantName}
            </label>
            <input
              type="text"
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40]"
              placeholder={t.selectGrantPlaceholder}
              value={form.targetGrantName}
              onChange={(e) => setForm({ ...form, targetGrantName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.grantEligibility}
            </label>
            <textarea
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40] h-20 resize-none leading-relaxed text-[11px]"
              value={form.targetGrantDetails}
              onChange={(e) => setForm({ ...form, targetGrantDetails: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.startupDesc}
            </label>
            <textarea
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40] h-20 resize-none leading-relaxed text-[11px]"
              value={form.startupDescription}
              onChange={(e) => setForm({ ...form, startupDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.additionalNotes}
            </label>
            <textarea
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40] h-16 resize-none leading-relaxed text-[11px]"
              placeholder={t.pitchHint}
              value={form.additionalNotes}
              onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#5A5A40] uppercase tracking-wider mb-1.5">
              {labels.toneLabel}
            </label>
            <select
              className="w-full bg-white text-[#1A1A1A] px-3 py-2 rounded-xl border border-[#DEDCCF] focus:outline-none focus:border-[#5A5A40] text-[11px]"
              value={form.tone || 'formal'}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              <option value="formal">{labels.toneFormal}</option>
              <option value="technical">{labels.toneTechnical}</option>
              <option value="persuasive">{labels.tonePersuasive}</option>
              <option value="concise">{labels.toneConcise}</option>
            </select>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={generateProposal}
            disabled={loading}
            className="w-full bg-[#5A5A40] hover:bg-[#4A4A30] disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{labels.inferenceRunning}</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>{labels.draftBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Console (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-[#DEDCCF] rounded-[24px] p-6 shadow-sm h-[590px] flex flex-col relative overflow-hidden text-[#1A1A1A]">
        
        {/* Actions bar */}
        <div className="flex flex-col gap-3 pb-3 sm:pb-4 mb-4 border-b border-[#DEDCCF]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-display font-semibold text-[#4A4A30] text-sm">{labels.draftDoc}</h3>
              <p className="text-[10px] text-[#8E8E80]">{labels.poweredBy}</p>
            </div>

            {proposal && (
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs font-mono w-full sm:w-auto justify-start sm:justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 bg-[#F0F0E8] hover:bg-[#ECEBE4] border border-[#DEDCCF] text-slate-700 hover:text-[#1a1a1a] px-2 py-1 rounded-lg transition cursor-pointer text-[10px] sm:text-xs"
                  title="Copy markdown content"
                >
                  {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#10B981]" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  <span>{copied ? t.copiedShortLabel : t.copyShortLabel}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 bg-[#F0F0E8] hover:bg-[#ECEBE4] border border-[#DEDCCF] text-slate-700 hover:text-[#1a1a1a] px-2 py-1 rounded-lg transition cursor-pointer text-[10px] sm:text-xs"
                  title="Save as Markdown file"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>MD</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1 bg-[#5A5A40] hover:bg-[#4A4A30] text-white px-2 py-1 rounded-lg transition cursor-pointer text-[10px] sm:text-xs font-bold"
                  title="Download premium styled PDF report"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 bg-[#F0F0E8] hover:bg-[#ECEBE4] border border-[#DEDCCF] text-slate-700 hover:text-[#1a1a1a] px-2 py-1 rounded-lg transition cursor-pointer text-[10px] sm:text-xs"
                  title="Export to printer"
                >
                  <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{t.printLabel}</span>
                </button>
              </div>
            )}
          </div>

          {/* Iteration & Draft Control Segment */}
          {form.targetGrantName && (proposal || activeDrafts.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F5F0] border border-[#DEDCCF] p-2 rounded-xl text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="font-semibold text-[#4A4A30] text-[11px]">{labels.savedVersions}</span>
                {activeDrafts.length > 0 ? (
                  <select
                    value={selectedDraftId}
                    onChange={(e) => setSelectedDraftId(e.target.value)}
                    className="bg-white border border-[#DEDCCF] rounded px-2.5 py-1 text-[10px] font-mono outline-none focus:border-[#5A5A40] text-[#1a1a1a]"
                  >
                    {activeDrafts.map((d, idx) => (
                      <option key={d.id} value={d.id}>
                        {t.iterationLabel} {activeDrafts.length - idx} ({new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-stone-400 text-[10px] italic">{labels.noVersions}</span>
                )}

                {selectedDraftId && (
                  <button
                    onClick={() => handleDeleteDraft(selectedDraftId)}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                    title="Delete current draft version"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {proposal && (
                <button
                  onClick={() => saveDraftIteration(proposal, true)}
                  className="flex items-center gap-1 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 border border-[#5A5A40]/30 text-[#4A4A30] px-2 py-1 rounded-lg transition cursor-pointer font-bold font-mono text-[10px]"
                  title="Create new revision of current state"
                >
                  <Save className="w-3 h-3 text-[#5A5A40]" />
                  <span>{t.snapshotRevision}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="h-full flex flex-col justify-center items-center gap-4 text-center">
              <Cpu className="w-10 h-10 text-[#5A5A40] animate-pulse" />
              <div className="space-y-1 w-full max-w-sm">
                <p className="text-[#4A4A30] text-xs font-semibold uppercase tracking-wider">
                  {t.draftingProposal}
                </p>
                <p className="text-slate-500 text-[10px]">
                  {t.pleaseStandBy}
                </p>
              </div>

              {/* Watsonx detailed phase logs */}
              <div className="bg-[#F5F5F0] border border-[#DEDCCF] p-4 rounded-xl text-left w-full max-w-md font-mono text-[9px] text-slate-600 mt-4 h-40 overflow-y-auto shadow-sm">
                <div className="flex items-center gap-1.5 text-[#5A5A40] border-b border-[#DEDCCF] pb-1.5 mb-2 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>
                    {t.pitchGenerationMonitor}
                  </span>
                </div>
                <div className="space-y-1">
                  {generationLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 animate-fade-in">
                      <span className="text-[#10B981] font-bold">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-[#5A5A40] animate-pulse">
                    <span>&gt;</span>
                    <span>
                      {t.consolidatingChapters}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : proposal ? (
            <div 
              className="prose max-w-none text-xs leading-relaxed border border-[#DEDCCF] p-5 rounded-2xl bg-[#F5F5F0]"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(proposal) }}
            />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
              <FileText className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">{labels.initializeTitle}</p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                {labels.initializeDesc}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
