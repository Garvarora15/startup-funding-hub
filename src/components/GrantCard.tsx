import { useState, useEffect } from 'react';
import { Grant } from '../types';
import { Calendar, FileText, CheckCircle, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Clock, AlertCircle, Volume2, Square, RefreshCw, Star } from 'lucide-react';
import { TRANSLATIONS } from '../locales/translations';

interface GrantCardProps {
  key?: string;
  grant: Grant;
  score: number;
  reasons: string[];
  onSelectForProposal: (grant: Grant) => void;
  isSelectedForProposal: boolean;
  currentLanguage?: string;
  isFavorite: boolean;
  onToggleFavorite: (grantId: string) => void;
}

export default function GrantCard({
  grant,
  score,
  reasons,
  onSelectForProposal,
  isSelectedForProposal,
  currentLanguage = 'english',
  isFavorite,
  onToggleFavorite
}: GrantCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.english;
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Stop playing on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audio]);

  const handleReadAloud = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const speechText = `${grant.name}. Funding amount is ${grant.amount_display}. Provided by ${grant.source}. Scheme description: ${grant.description}. Eligibility criteria: ${grant.eligibility}`;

    // Watson TTS (and most browser engines) have no real Punjabi/Gurmukhi
    // voice — feeding Gurmukhi text to a Hindi voice silently drops most of
    // the words. Go straight to browser speech synthesis, same as the chat
    // assistant's TTS handling.
    if (currentLanguage === 'punjabi') {
      fallbackWebSpeech(speechText);
      return;
    }

    setTtsLoading(true);
    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: speechText,
          language: currentLanguage
        })
      });

      const data = await response.json();
      if (data.success && data.audioContent) {
        const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => {
          setIsPlaying(false);
        };
        newAudio.onplay = () => {
          setIsPlaying(true);
        };
        newAudio.onerror = () => {
          setIsPlaying(false);
          fallbackWebSpeech(speechText);
        };
        setAudio(newAudio);
        newAudio.play();
      } else {
        fallbackWebSpeech(speechText);
      }
    } catch (err) {
      console.warn("Server TTS failed, falling back to browser speech synthesis:", err);
      fallbackWebSpeech(speechText);
    } finally {
      setTtsLoading(false);
    }
  };

  const fallbackWebSpeech = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    const getSpeechLangCode = () => {
      if (currentLanguage === 'hindi') return 'hi-IN';
      if (currentLanguage === 'punjabi') return 'pa-IN';
      if (currentLanguage === 'spanish') return 'es-ES';
      if (currentLanguage === 'french') return 'fr-FR';
      if (currentLanguage === 'german') return 'de-DE';
      if (currentLanguage === 'japanese') return 'ja-JP';
      return 'en-US';
    };

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = getSpeechLangCode();

      // Try to pick a voice that actually matches the language; Chrome can
      // silently no-op if no matching voice is found for utterance.lang.
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang === utterance.lang) || voices.find(v => v.lang?.startsWith(utterance.lang.split('-')[0]));
      if (matchedVoice) utterance.voice = matchedVoice;
      else if (currentLanguage !== 'english') utterance.lang = 'en-US'; // graceful degrade if no voice for this language

      utterance.onend = () => { setIsPlaying(false); };
      utterance.onerror = () => { setIsPlaying(false); };
      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setAudio({
      pause: () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    } as any);

    // Chrome can silently drop an utterance if speak() is called in the same
    // tick as cancel(), or before the voice list has finished loading.
    const voicesReady = window.speechSynthesis.getVoices().length > 0;
    if (voicesReady) {
      setTimeout(speakNow, 50);
    } else {
      let hasSpoken = false;
      const speakOnce = () => {
        if (hasSpoken) return;
        hasSpoken = true;
        speakNow();
      };
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        setTimeout(speakOnce, 50);
      };
      // Safety net in case onvoiceschanged never fires
      setTimeout(speakOnce, 500);
    }
  };

  const getDeadlineBadge = () => {
    const deadlineStr = grant.deadline;
    if (!deadlineStr) return null;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isDate = dateRegex.test(deadlineStr);

    if (!isDate) {
      // It's a non-date deadline like "Rolling", "Cohort-based", etc.
      const isRolling = deadlineStr.toLowerCase().includes('rolling') || deadlineStr.toLowerCase().includes('open');
      
      let badgeText = deadlineStr;
      if (isRolling) {
        if (currentLanguage === 'hindi') {
          badgeText = 'सतत / रोलिंग';
        } else if (currentLanguage === 'punjabi') {
          badgeText = 'ਸਤਤ / ਰੋਲਿੰਗ';
        } else {
          badgeText = 'Rolling / Open';
        }
      } else {
        if (deadlineStr.toLowerCase().includes('annual')) {
          badgeText = currentLanguage === 'hindi' ? 'वार्षिक योजना' : currentLanguage === 'punjabi' ? 'ਸਾਲਾਨਾ ਯੋਜਨਾ' : deadlineStr;
        } else if (deadlineStr.toLowerCase().includes('cohort')) {
          badgeText = currentLanguage === 'hindi' ? 'कोहॉर्ट आधारित' : currentLanguage === 'punjabi' ? 'ਕੋਹੋਰਟ ਅਧਾਰਤ' : deadlineStr;
        }
      }

      return {
        text: badgeText,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        icon: <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
      };
    }

    const parts = deadlineStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(year, month, day);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      let text = '';
      if (currentLanguage === 'hindi') {
        text = 'समाप्त';
      } else if (currentLanguage === 'punjabi') {
        text = 'ਸਮਾਪਤ';
      } else {
        text = 'Closed';
      }
      return {
        text,
        className: 'bg-slate-100 text-slate-500 border-slate-200/60',
        icon: <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
      };
    } else if (diffDays < 7) {
      let text = '';
      if (currentLanguage === 'hindi') {
        text = `${diffDays} दिन शेष (अति आवश्यक)`;
      } else if (currentLanguage === 'punjabi') {
        text = `${diffDays} ਦਿਨ ਬਾਕੀ (ਬਹੁਤ ਜ਼ਰੂਰੀ)`;
      } else {
        text = `${diffDays} days left (Urgent)`;
      }
      return {
        text,
        className: 'bg-rose-50 text-rose-700 border-rose-200/60 animate-pulse font-semibold',
        icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
      };
    } else if (diffDays < 30) {
      let text = '';
      if (currentLanguage === 'hindi') {
        text = `${diffDays} दिन शेष`;
      } else if (currentLanguage === 'punjabi') {
        text = `${diffDays} ਦਿਨ ਬਾਕੀ`;
      } else {
        text = `${diffDays} days left`;
      }
      return {
        text,
        className: 'bg-amber-50 text-amber-700 border-amber-200/60',
        icon: <Clock className="w-3 h-3 text-amber-600 shrink-0" />
      };
    } else {
      let text = '';
      if (currentLanguage === 'hindi') {
        text = `${diffDays} दिन शेष`;
      } else if (currentLanguage === 'punjabi') {
        text = `${diffDays} ਦਿਨ ਬਾਕੀ`;
      } else {
        text = `${diffDays} days left`;
      }
      return {
        text,
        className: 'bg-sky-50 text-sky-700 border-sky-200/60',
        icon: <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
      };
    }
  };

  const deadlineBadge = getDeadlineBadge();

  // Match score color classes using elegant natural tone variants
  const getScoreColor = (num: number) => {
    if (num >= 80) return 'text-[#198038] bg-[#198038]/5 border-[#198038]/20';
    if (num >= 55) return 'text-[#b45309] bg-[#fef3c7] border-[#fde68a]';
    return 'text-[#b91c1c] bg-[#fee2e2] border-[#fecaca]';
  };

  const getStageLabel = (stages: string[]) => {
    return stages.map(s => {
      if (currentLanguage === 'hindi') {
        if (s === 'any') return 'कोई भी चरण';
        if (s === 'idea') return 'विचार चरण';
        if (s === 'prototype') return 'प्रोटोटाइप चरण';
        if (s === 'seed') return 'सीड चरण';
        if (s === 'early') return 'प्रारंभिक चरण';
        if (s === 'growth') return 'विकास चरण';
      } else if (currentLanguage === 'punjabi') {
        if (s === 'any') return 'ਕੋਈ ਵੀ ਪੜਾਅ';
        if (s === 'idea') return 'ਵਿਚਾਰ ਪੜਾਅ';
        if (s === 'prototype') return 'ਪ੍ਰੋਟੋਟਾਈਪ ਪੜਾਅ';
        if (s === 'seed') return 'ਸੀਡ ਪੜਾਅ';
        if (s === 'early') return 'ਸ਼ੁਰੂਆਤੀ ਪੜਾਅ';
        if (s === 'growth') return 'ਵਿਕਾਸ ਪੜਾਅ';
      }
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).join(' / ');
  };

  const getDomainLabel = (domains: string[]) => {
    if (domains.includes('any')) return t.anySectorShort;
    return domains.map(d => {
      if (currentLanguage === 'hindi') {
        if (d === 'ai') return 'एआई और सास';
        if (d === 'deeptech') return 'डीप टेक और रोबोटिक्स';
        if (d === 'biotech') return 'बायोटेक';
        if (d === 'healthtech') return 'हेल्थटेक';
        if (d === 'agritech') return 'एग्रीटेक';
        if (d === 'fintech') return 'फिनटेक';
        if (d === 'cleantech') return 'क्लीनटेक';
        if (d === 'hardware') return 'हार्डवेयर';
        if (d === 'manufacturing') return 'विनिर्माण';
        if (d === 'edtech') return 'एडटेक';
        if (d === 'spacetech') return 'स्पेस टेक';
        if (d === 'mobility') return 'ईवी और मोबिलिटी';
        if (d === 'ecommerce') return 'ई-कॉमर्स';
        if (d === 'gaming') return 'गेमिंग';
      } else if (currentLanguage === 'punjabi') {
        if (d === 'ai') return 'ਏਆਈ ਅਤੇ ਸਾਸ';
        if (d === 'deeptech') return 'ਡੀਪ ਟੈੱਕ ਅਤੇ ਰੋਬੋਟਿਕਸ';
        if (d === 'biotech') return 'ਬਾਇਓਟੈੱਕ';
        if (d === 'healthtech') return 'ਹੈਲਥਟੈੱਕ';
        if (d === 'agritech') return 'ਐਗਰੀਟੈੱਕ';
        if (d === 'fintech') return 'ਫਿਨਟੈੱਕ';
        if (d === 'cleantech') return 'ਕਲੀਨਟੈੱਕ';
        if (d === 'hardware') return 'ਹਾਰਡਵੇਅਰ';
        if (d === 'manufacturing') return 'ਨਿਰਮਾਣ';
        if (d === 'edtech') return 'ਐਡਟੈੱਕ';
        if (d === 'spacetech') return 'ਸਪੇਸ ਟੈੱਕ';
        if (d === 'mobility') return 'ਈਵੀ ਅਤੇ ਮੋਬਿਲਿਟੀ';
        if (d === 'ecommerce') return 'ਈ-ਕਾਮਰਸ';
        if (d === 'gaming') return 'ਗੇਮਿੰਗ';
      }
      return d.toUpperCase();
    }).join(' · ');
  };

  const labels = currentLanguage === 'hindi' ? {
    source: 'स्रोत:',
    match: 'मिलान',
    reasoningHeader: 'पात्रता और तर्क',
    boardReqs: 'योजना की आवश्यकताएं:',
    matchExplanation: 'मिलान का स्पष्टीकरण:',
    selectedBtn: 'लक्षित योजना चयनित',
    draftBtn: 'प्रस्ताव का मसौदा',
    portal: 'पोर्टल',
    deadline: 'समय सीमा:',
    synced: 'सिंक किया गया:'
  } : currentLanguage === 'punjabi' ? {
    source: 'ਸਰੋਤ:',
    match: 'ਮੈਚ',
    reasoningHeader: 'ਯੋਗਤਾ ਅਤੇ ਤਰਕ',
    boardReqs: 'ਯੋਜਨਾ ਦੀਆਂ ਲੋੜਾਂ:',
    matchExplanation: 'ਮੈਚ ਦੀ ਵਿਆਖਿਆ:',
    selectedBtn: 'ਲਕਸ਼ਿਤ ਯੋਜਨਾ ਚੁਣੀ ਗਈ',
    draftBtn: 'ਪ੍ਰਸਤਾਵ ਦਾ ਖਰੜਾ',
    portal: 'ਪੋਰਟਲ',
    deadline: 'ਆਖਰੀ ਤਾਰੀਖ:',
    synced: 'ਸਿੰਕ ਕੀਤਾ ਗਿਆ:'
  } : {
    source: 'Source:',
    match: 'Match',
    reasoningHeader: 'Eligibility & Reasoning',
    boardReqs: 'Board Requirements:',
    matchExplanation: 'Match Explanation:',
    selectedBtn: 'Target Grant Selected',
    draftBtn: 'Draft Proposal',
    portal: 'Portal',
    deadline: 'Deadline:',
    synced: 'Synced:'
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[20px] p-5 shadow-sm hover:border-[#0F62FE] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between text-[#1F2328]">
      {/* Visual Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#0F62FE]" />

      <div>
        {/* Title and Score Row */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-[#0353E9] text-base tracking-tight leading-tight hover:text-[#0F62FE] transition duration-200">
              {grant.name}
            </h3>
            <p className="text-xs text-[#57606A] font-medium mt-1">
              {labels.source} {grant.source}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(grant.id)}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isFavorite 
                  ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100 shadow-sm' 
                  : 'bg-[#F4F4F4] border-[#E0E0E0] text-[#57606A] hover:bg-[#E8EFFE] hover:text-[#0F62FE]'
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <div className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border text-center ${getScoreColor(score)}`}>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[#57606A]">{labels.match}</span>
              <span className="text-sm font-bold font-mono leading-none mt-0.5">{score}%</span>
            </div>
          </div>
        </div>

        {/* Amount, Stage, Domain & Deadline Badges */}
        <div className="flex flex-wrap gap-1.5 my-3">
          <span className="bg-[#F4F4F4] text-[#0F62FE] border border-[#E0E0E0] text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            💰 {grant.amount_display}
          </span>
          <span className="bg-[#E8EFFE] text-[#0353E9] border border-[#E0E0E0] text-[10px] font-mono px-2.5 py-1 rounded-full">
            🚀 {getStageLabel(grant.stage)}
          </span>
          <span className="bg-[#E8EFFE] text-[#0353E9] border border-[#E0E0E0] text-[10px] font-mono px-2.5 py-1 rounded-full">
            🏷️ {getDomainLabel(grant.domain)}
          </span>
          {deadlineBadge && (
            <span className={`border text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5 ${deadlineBadge.className}`}>
              {deadlineBadge.icon}
              <span>{deadlineBadge.text}</span>
            </span>
          )}
        </div>

        {/* TTS Player Action Bar */}
        <div className="flex items-center gap-2 mb-3.5">
          <button
            onClick={handleReadAloud}
            disabled={ttsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0E0E0] bg-[#FFFFFF] hover:bg-[#E8EFFE] text-[#0F62FE] transition text-[10.5px] font-mono font-bold cursor-pointer disabled:opacity-50"
          >
            {ttsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isPlaying ? (
              <Square className="w-2.5 h-2.5 fill-[#0F62FE] text-[#0F62FE]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#0F62FE]" />
            )}
            <span>
              {ttsLoading 
                ? t.synthesizing
                : isPlaying 
                  ? t.stopLabel
                  : t.listenToScheme}
            </span>
          </button>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-700 leading-relaxed font-sans mb-4">
          {grant.description}
        </p>
      </div>

      <div>
        {/* Collapsible reasoning list */}
        <div className="border-t border-[#E0E0E0] pt-3 mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[#0F62FE] hover:text-[#1F2328] transition text-xs font-semibold uppercase tracking-wider"
          >
            <span>{labels.reasoningHeader}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E0E0E0] text-xs">
              <div>
                <span className="text-slate-600 font-medium block mb-1">{labels.boardReqs}</span>
                <p className="text-slate-800 leading-normal font-sans">{grant.eligibility}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E0E0E0]">
                <span className="text-slate-600 font-medium block">{labels.matchExplanation}</span>
                {reasons.map((reason, idx) => {
                  const isWarning = reason.toLowerCase().includes('warning') || reason.toLowerCase().includes('mismatch') || reason.toLowerCase().includes('ineligible');
                  return (
                    <div key={idx} className="flex items-start gap-1.5 leading-normal">
                      {isWarning ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-[#198038] shrink-0 mt-0.5" />
                      )}
                      <span className={isWarning ? 'text-rose-900' : 'text-slate-800'}>{reason}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex gap-1.5 sm:gap-2 border-t border-[#E0E0E0] pt-3 sm:pt-4 mt-3 sm:mt-4 text-[10.5px] sm:text-xs font-mono">
          <button
            onClick={() => onSelectForProposal(grant)}
            className={`flex-[2] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border font-semibold transition cursor-pointer ${
              isSelectedForProposal
                ? 'bg-[#0F62FE] border-transparent text-white shadow-sm'
                : 'border-[#E0E0E0] bg-[#F4F4F4] text-[#0F62FE] hover:bg-[#E8EFFE]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{isSelectedForProposal ? labels.selectedBtn : labels.draftBtn}</span>
          </button>

          <a
            href={grant.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#E0E0E0] bg-[#F4F4F4] text-slate-700 hover:bg-[#E8EFFE] hover:text-[#1F2328] hover:border-[#0F62FE] transition duration-200"
            title="Launch Official Application Portal"
          >
            <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
            <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">{labels.portal}</span>
          </a>
        </div>

        {/* Footer info row */}
        <div className="flex justify-between text-[10px] text-[#57606A] font-mono mt-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#0F62FE]" /> {labels.deadline} {grant.deadline}
          </span>
          <span>{labels.synced} {grant.last_scraped}</span>
        </div>
      </div>
    </div>
  );
}
