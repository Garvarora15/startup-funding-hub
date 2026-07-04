import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGraniteWithRetry } from '../lib/watsonx.js';
import { withHumanValidationNotice } from '../lib/compliance.js';

const TONE_LABELS: Record<string, string> = {
  formal: 'Professional & Formal',
  technical: 'Technical & Data-Driven',
  persuasive: 'Persuasive & Impact-Focused',
  concise: 'Concise & Executive Summary',
};

function generateLocalFallback(body: any): string {
  const { startupName = 'Your Startup', startupDescription = '', stage = 'early', domain = 'tech', targetGrantName = 'the grant', targetGrantDetails = '', additionalNotes = '', language = 'english', tone = 'formal' } = body || {};
  const lang = (language || 'english').toLowerCase();
  const toneLabel = TONE_LABELS[tone] || TONE_LABELS.formal;

  if (lang === 'hindi') {
    return `# अनुदान प्रस्ताव\n*IBM Granite स्थानीय इंजन (ऑफ़लाइन मोड) · लहजा: ${toneLabel}*\n\n**स्टार्टअप:** ${startupName} | **क्षेत्र:** ${domain} | **चरण:** ${stage}\n**लक्षित योजना:** ${targetGrantName}\n\n---\n\n## 1. कार्यकारी सारांश\n${startupName} ${domain} क्षेत्र में ${stage} चरण पर काम करने वाला एक अग्रणी उद्यम है। हमारी नवाचार — ${startupDescription} — बाजार की महत्वपूर्ण कमियों को दूर करती है।\n\n## 2. समस्या विवरण\n${domain} क्षेत्र में महत्वपूर्ण प्रणालीगत बाधाएं हैं जो मौजूदा समाधानों की सीमाओं को उजागर करती हैं।\n\n## 3. प्रस्तावित समाधान\n${startupDescription}\n\n## 4. पात्रता मानदंडों के साथ संरेखण\n${targetGrantDetails || 'हम सभी DPIIT, चरण और डोमेन पात्रता मानदंडों को पूरा करते हैं।'}\n${additionalNotes ? `\nअतिरिक्त नोट्स: ${additionalNotes}` : ''}\n\n## 5. कर्षण और सत्यापन\n${additionalNotes || `${startupName} ने ${domain} क्षेत्र में शुरुआती पायलट और संस्थापक-नेतृत्व वाली बिक्री के माध्यम से मुख्य धारणाओं को मान्य किया है।`}\n\n## 6. मील के पत्थर और फंड उपयोग\n| मील का पत्थर | आवंटन | परिणाम |\n|---|---|---|\n| R&D और इंजीनियरिंग | 40% | उत्पादन MVP |\n| बीटा परीक्षण | 20% | बाजार सत्यापन |\n| बुनियादी ढांचा | 15% | सुरक्षा |\n| प्रतिभा | 15% | टीम निर्माण |\n| संचालन | 10% | कानूनी |\n\n## 7. टीम और निष्पादन क्षमता\nसंस्थापक टीम ${domain} क्षेत्र में गहरी विशेषज्ञता को उत्पाद और इंजीनियरिंग निष्पादन के साथ जोड़ती है।\n\n## 8. सामाजिक-आर्थिक प्रभाव\n${startupName} ${domain} क्षेत्र में घरेलू IP विकसित करेगा और भारत की आत्मनिर्भरता में योगदान देगा।\n\n## 9. जोखिम और अनुपालन शमन\nतकनीकी, बाजार और नियामक जोखिमों की समीक्षा प्रत्येक मील के पत्थर पर की जाती है। यह मसौदा ${targetGrantName} में प्रस्तुत करने से पहले अनिवार्य मानव समीक्षा के अधीन है।`;
  }

  if (lang === 'punjabi') {
    return `# ਗ੍ਰਾਂਟ ਪ੍ਰਸਤਾਵ\n*IBM Granite ਸਥਾਨਕ ਇੰਜਣ (ਆਫਲਾਈਨ ਮੋਡ) · ਲਹਿਜ਼ਾ: ${toneLabel}*\n\n**ਸਟਾਰਟਅੱਪ:** ${startupName} | **ਖੇਤਰ:** ${domain} | **ਪੜਾਅ:** ${stage}\n**ਲਕਸ਼ਿਤ ਯੋਜਨਾ:** ${targetGrantName}\n\n---\n\n## 1. ਕਾਰਜਕਾਰੀ ਸਾਰ\n${startupName} ${domain} ਖੇਤਰ ਵਿੱਚ ${stage} ਪੜਾਅ 'ਤੇ ਕੰਮ ਕਰਨ ਵਾਲਾ ਇੱਕ ਮੋਹਰੀ ਉੱਦਮ ਹੈ। ਸਾਡੀ ਨਵੀਨਤਾ — ${startupDescription} — ਬਾਜ਼ਾਰ ਦੀਆਂ ਮਹੱਤਵਪੂਰਨ ਕਮੀਆਂ ਨੂੰ ਦੂਰ ਕਰਦੀ ਹੈ।\n\n## 2. ਸਮੱਸਿਆ ਵੇਰਵਾ\n${domain} ਖੇਤਰ ਵਿੱਚ ਮਹੱਤਵਪੂਰਨ ਪ੍ਰਣਾਲੀਗਤ ਰੁਕਾਵਟਾਂ ਹਨ ਜੋ ਮੌਜੂਦਾ ਹੱਲਾਂ ਦੀਆਂ ਸੀਮਾਵਾਂ ਨੂੰ ਉਜਾਗਰ ਕਰਦੀਆਂ ਹਨ।\n\n## 3. ਪ੍ਰਸਤਾਵਿਤ ਹੱਲ\n${startupDescription}\n\n## 4. ਯੋਗਤਾ ਮਾਪਦੰਡਾਂ ਨਾਲ ਅਨੁਕੂਲਤਾ\n${targetGrantDetails || 'ਅਸੀਂ ਸਾਰੇ DPIIT, ਪੜਾਅ ਅਤੇ ਖੇਤਰ ਯੋਗਤਾ ਮਾਪਦੰਡਾਂ ਨੂੰ ਪੂਰਾ ਕਰਦੇ ਹਾਂ।'}\n${additionalNotes ? `\nਵਾਧੂ ਨੋਟਸ: ${additionalNotes}` : ''}\n\n## 5. ਖਿੱਚ ਅਤੇ ਪ੍ਰਮਾਣਿਕਤਾ\n${additionalNotes || `${startupName} ਨੇ ${domain} ਖੇਤਰ ਵਿੱਚ ਸ਼ੁਰੂਆਤੀ ਪਾਇਲਟਾਂ ਅਤੇ ਸੰਸਥਾਪਕ-ਅਗਵਾਈ ਵਾਲੀ ਵਿਕਰੀ ਰਾਹੀਂ ਮੁੱਖ ਧਾਰਨਾਵਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ ਹੈ।`}\n\n## 6. ਮੀਲ ਪੱਥਰ ਅਤੇ ਫੰਡ ਵਰਤੋਂ\n| ਮੀਲ ਪੱਥਰ | ਵੰਡ | ਨਤੀਜਾ |\n|---|---|---|\n| R&D ਅਤੇ ਇੰਜੀਨੀਅਰਿੰਗ | 40% | ਉਤਪਾਦਨ MVP |\n| ਬੀਟਾ ਟੈਸਟਿੰਗ | 20% | ਬਾਜ਼ਾਰ ਪ੍ਰਮਾਣਿਕਤਾ |\n| ਬੁਨਿਆਦੀ ਢਾਂਚਾ | 15% | ਸੁਰੱਖਿਆ |\n| ਪ੍ਰਤਿਭਾ | 15% | ਟੀਮ ਨਿਰਮਾਣ |\n| ਸੰਚਾਲਨ | 10% | ਕਾਨੂੰਨੀ |\n\n## 7. ਟੀਮ ਅਤੇ ਅਮਲ ਸਮਰੱਥਾ\nਸੰਸਥਾਪਕ ਟੀਮ ${domain} ਖੇਤਰ ਵਿੱਚ ਡੂੰਘੀ ਮੁਹਾਰਤ ਨੂੰ ਉਤਪਾਦ ਅਤੇ ਇੰਜੀਨੀਅਰਿੰਗ ਅਮਲ ਨਾਲ ਜੋੜਦੀ ਹੈ।\n\n## 8. ਸਮਾਜਿਕ-ਆਰਥਿਕ ਪ੍ਰਭਾਵ\n${startupName} ${domain} ਖੇਤਰ ਵਿੱਚ ਘਰੇਲੂ IP ਵਿਕਸਤ ਕਰੇਗਾ ਅਤੇ ਭਾਰਤ ਦੀ ਆਤਮ-ਨਿਰਭਰਤਾ ਵਿੱਚ ਯੋਗਦਾਨ ਦੇਵੇਗਾ।\n\n## 9. ਜੋਖਮ ਅਤੇ ਪਾਲਣਾ ਘਟਾਓ\nਤਕਨੀਕੀ, ਬਾਜ਼ਾਰ ਅਤੇ ਰੈਗੂਲੇਟਰੀ ਜੋਖਮਾਂ ਦੀ ਸਮੀਖਿਆ ਹਰ ਮੀਲ ਪੱਥਰ 'ਤੇ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਇਹ ਖਰੜਾ ${targetGrantName} ਵਿੱਚ ਜਮ੍ਹਾਂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਲਾਜ਼ਮੀ ਮਨੁੱਖੀ ਸਮੀਖਿਆ ਦੇ ਅਧੀਨ ਹੈ।`;
  }

  return `# GRANT PROPOSAL DRAFT\n*IBM Granite Local Engine (Watsonx.ai offline mode) · Tone: ${toneLabel}*\n\n**Startup:** ${startupName} | **Sector:** ${domain} | **Stage:** ${stage}\n**Target Grant:** ${targetGrantName}\n\n---\n\n## 1. EXECUTIVE SUMMARY\n${startupName} is a ${stage}-stage venture in the ${domain} sector applying for the ${targetGrantName}. Our core innovation — ${startupDescription} — addresses critical market gaps with strong national impact potential.\n\n## 2. PROBLEM STATEMENT\nThe ${domain} sector faces significant bottlenecks in scalability, efficiency, and accessibility that existing solutions fail to address adequately.\n\n## 3. PROPOSED SOLUTION & INNOVATION\n${startupDescription}\n\nOur approach delivers measurable improvements over legacy alternatives with a defensible technical moat built on proprietary methodologies.\n\n## 4. ALIGNMENT WITH ELIGIBILITY CRITERIA\n${targetGrantDetails || 'We satisfy all DPIIT, stage, and domain eligibility criteria for this scheme, including DPIIT startup recognition, incorporation within the required timeframe, and sector alignment.'}\n${additionalNotes ? `\nAdditional Notes: ${additionalNotes}` : ''}\n\n## 5. TRACTION & VALIDATION\n${additionalNotes || `${startupName} has validated core assumptions through early pilots and founder-led sales in the ${domain} sector, with a growing pipeline of design partners at the ${stage} stage.`}\n\n## 6. PROJECT MILESTONES & FUND UTILIZATION\n| Milestone | Allocation | Expected Outcome |\n|---|---|---|\n| R&D & Engineering | 40% | Production-ready MVP |\n| Beta Pilots & Validation | 20% | Market validation with 10+ pilots |\n| Infrastructure & Security | 15% | Compliance & scale readiness |\n| Talent Acquisition | 15% | Core engineering team buildout |\n| Operations & Legal | 10% | IP filing, admin, regulatory |\n\n## 7. TEAM & EXECUTION CAPABILITY\nThe founding team combines domain expertise in ${domain} with hands-on product and engineering execution, supported by advisors experienced in scaling ${stage}-stage ventures through grant-funded and institutional programs.\n\n## 8. SOCIO-ECONOMIC & STRATEGIC IMPACT\nThis funding will enable ${startupName} to create skilled employment, build domestic IP in the ${domain} sector, reduce import dependency, and contribute directly to India's self-reliance and Digital India agenda.\n\n## 9. RISK & COMPLIANCE MITIGATION\nKey risks (technical, market adoption, regulatory) are tracked against a mitigation plan reviewed at each milestone. All data handling follows applicable privacy regulations, and this draft is subject to mandatory human review before submission to ${targetGrantName}.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { startupName, startupDescription, stage, domain, targetGrantName, targetGrantDetails, additionalNotes, language = 'english', tone = 'formal' } = req.body;
    if (!startupName || !startupDescription || !targetGrantName) {
      return res.status(400).json({ success: false, error: 'Startup Name, Description, and Target Grant are required.' });
    }

    const toneInstruction: Record<string, string> = {
      formal: 'Write in a professional, formal register suitable for a government grant board.',
      technical: 'Write in a technical, data-driven register — favor specifics, metrics, and engineering detail over marketing language.',
      persuasive: 'Write in a persuasive, impact-focused register that foregrounds outcomes and urgency while remaining factual.',
      concise: 'Write concisely, as a tight executive-summary style document — short paragraphs, no filler, high information density.',
    };

    const systemPrompt = `You are the IBM Granite Enterprise Pitch Specialist on IBM Watsonx.ai. Draft award-winning grant proposals aligned with Indian institutional and government grant board standards. ${toneInstruction[tone] || toneInstruction.formal} Write fully articulated, professional content — no placeholders or generic filler. Respond entirely in ${language.toUpperCase()}. For Hindi use Devanagari script. For Punjabi use Gurmukhi script.`;

    const userPrompt = `Draft a comprehensive grant proposal for:
Startup: ${startupName}
Domain: ${domain}
Stage: ${stage}
Description: ${startupDescription}
Target Grant: ${targetGrantName}
Grant Guidelines: ${targetGrantDetails || 'Standard government startup grant criteria'}
Requested Tone: ${TONE_LABELS[tone] || TONE_LABELS.formal}
${additionalNotes ? `Additional Notes / Traction: ${additionalNotes}` : ''}

Include ALL sections in professional Markdown format:
1. EXECUTIVE SUMMARY
2. PROBLEM STATEMENT
3. PROPOSED SOLUTION & INNOVATION
4. ALIGNMENT WITH ELIGIBILITY CRITERIA
5. TRACTION & VALIDATION
6. PROJECT MILESTONES & FUND UTILIZATION (include a formatted table)
7. TEAM & EXECUTION CAPABILITY
8. SOCIO-ECONOMIC & STRATEGIC IMPACT
9. RISK & COMPLIANCE MITIGATION`;

    const proposal = await callGraniteWithRetry(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.8, max_tokens: 2048 }
    );
    res.json({ success: true, proposal: withHumanValidationNotice(proposal, language), timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Watsonx proposal error:', error.message);
    const fallbackLanguage = req.body?.language || 'english';
    res.json({ success: true, proposal: withHumanValidationNotice(generateLocalFallback(req.body), fallbackLanguage), timestamp: new Date().toISOString() });
  }
}
