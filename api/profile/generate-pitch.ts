import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGraniteWithRetry } from '../lib/watsonx.js';

const STAGE_LABELS: Record<string, string> = {
  idea: 'idea-stage',
  prototype: 'prototype-stage',
  seed: 'seed-stage',
  early: 'early-revenue',
  growth: 'growth-stage',
};

const LANGUAGE_NOTICE: Record<string, string> = {
  hindi: `\n\n_(यह पिच फ़िलहाल अंग्रेज़ी में दिखाई जा रही है क्योंकि AI सेवा अस्थायी रूप से अनुपलब्ध है — कृपया थोड़ी देर बाद फिर से प्रयास करें।)_`,
  punjabi: `\n\n_(ਇਹ ਪਿੱਚ ਹਾਲ ਦੀ ਘੜੀ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਦਿਖਾਈ ਜਾ ਰਹੀ ਹੈ ਕਿਉਂਕਿ AI ਸੇਵਾ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ — ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।)_`,
  spanish: `\n\n_(Este pitch se muestra en inglés porque el servicio de IA no está disponible temporalmente — inténtalo de nuevo en unos minutos.)_`,
  french: `\n\n_(Ce pitch est affiché en anglais car le service d'IA est temporairement indisponible — veuillez réessayer dans quelques minutes.)_`,
  german: '\n\n_(Dieser Pitch wird auf Englisch angezeigt, da der KI-Dienst vorübergehend nicht verfügbar ist — bitte versuchen Sie es in ein paar Minuten erneut.)_',
  japanese: '\n\n_(AIサービスが一時的に利用できないため、このピッチは英語で表示されています。数分後にもう一度お試しください。)_',
};

function getSmartFallbackPitch(name: string, domain: string, stage: string, format: string, language: string, _frequency: string): string {
  const domainMap: Record<string, { problem: string; tech: string; impact: string }> = {
    ai: { problem: 'critical bottlenecks in manual data structuring and decision intelligence', tech: 'proprietary advanced generative AI and ML engines', impact: 'doubles engineering productivity and lowers operational overheads by 45%' },
    deeptech: { problem: 'slow, manual experimentation cycles in advanced materials and robotics R&D', tech: 'proprietary deep-tech simulation and robotic automation platforms', impact: 'compresses multi-year R&D cycles into months while cutting prototyping costs by half' },
    biotech: { problem: 'lengthy, capital-intensive bottlenecks in bringing novel biological therapies to market', tech: 'high-throughput synthetic biology and protein engineering pipelines', impact: 'accelerates lab-to-market timelines while improving therapeutic yield and safety profiles' },
    fintech: { problem: 'slow, expensive cross-border payroll and settlement processing', tech: 'decentralized instant settlement ledgers', impact: 'enables friction-free, instantaneous global financial operations' },
    healthtech: { problem: 'limited access to specialized diagnostics in rural and semi-urban areas', tech: 'AI-enhanced portable diagnostic devices', impact: 'enables frontline workers to conduct immediate, accurate screenings' },
    agritech: { problem: 'unpredictable crop yields and inefficient water usage in agriculture', tech: 'IoT soil sensors and predictive smart irrigation systems', impact: 'reduces water waste by 35% and increases harvest yields by 28%' },
    cleantech: { problem: 'industrial carbon emissions and fossil fuel dependency', tech: 'novel solid-state catalytic carbon absorption arrays', impact: 'captures up to 92% of emitted industrial atmospheric carbon' },
    hardware: { problem: 'fragmented, import-dependent component supply chains for domestic device manufacturing', tech: 'vertically-integrated hardware design and precision fabrication capabilities', impact: 'cuts production lead times by 30% while building resilient, domestically-made supply chains' },
    manufacturing: { problem: 'low-throughput, high-waste legacy production lines that cannot scale with demand', tech: 'cyber-physical digital twin and precision automation systems', impact: 'reduces changeover times and material waste while boosting production yield by double digits' },
    edtech: { problem: 'lack of personalized learning pathways for diverse student populations', tech: 'adaptive AI curriculum engines with real-time assessment', impact: 'improves learning outcomes by 40% across rural and urban cohorts' },
    spacetech: { problem: 'prohibitively expensive access to space-grade hardware and orbital data for emerging applications', tech: 'miniaturized, low-cost satellite and propulsion engineering', impact: 'democratizes access to orbital connectivity and earth-observation data for critical sectors' },
    mobility: { problem: 'range anxiety and patchy charging infrastructure slowing electric vehicle adoption', tech: 'smart battery-swapping networks and predictive fleet telemetry', impact: 'cuts total cost of ownership for electric fleets while accelerating nationwide EV adoption' },
    ecommerce: { problem: 'high customer-acquisition costs and fragmented last-mile logistics for digital-first brands', tech: 'AI-driven hyperlocal fulfillment and direct-to-consumer commerce infrastructure', impact: 'lowers delivery costs and turnaround times while widening market reach into tier-2 and tier-3 markets' },
    gaming: { problem: 'limited locally-rooted, high-quality interactive content in a market dominated by global studios', tech: 'proprietary game engines and AVGC production pipelines built for original IP', impact: 'drives higher player retention and unlocks new export revenue from original interactive content' },
    any: { problem: 'operational efficiency bottlenecks and legacy system friction', tech: 'proprietary intelligent optimization systems', impact: 'automates complex workflows to drive sustainable, scalable growth' },
  };
  const d = domainMap[(domain || 'any').toLowerCase()] || domainMap.any;
  const fmt = (format || 'elevator').toLowerCase();
  const stageLabel = STAGE_LABELS[(stage || '').toLowerCase()] || 'growing';
  const notice = LANGUAGE_NOTICE[(language || '').toLowerCase()] || '';

  let pitch: string;
  if (fmt === 'twitter') {
    pitch = `Introducing ${name}! 🚀 A ${stageLabel} venture solving ${d.problem} using ${d.tech} to ensure ${d.impact}. Join our mission. #Startup #${(domain || 'Tech').charAt(0).toUpperCase() + (domain || 'Tech').slice(1)} #Innovation`;
  } else if (fmt === 'investor-hook') {
    pitch = `**INVESTOR ALERT:** ${name}, a ${stageLabel} venture, is targeting the trillion-dollar problem of ${d.problem}.\n\nBy deploying ${d.tech}, our high-growth model ensures that ${d.impact} — creating a massive market entry point with strong IP defensibility, government grant backing, and a clear path to Series A.\n\n**The opportunity is now. We're raising to scale.**`;
  } else if (fmt === 'one-pager') {
    pitch = `### ${name} — Executive One-Pager\n\n**Stage**\n${stageLabel.replace('-', ' ')}\n\n**The Problem**\nIndustry is crippled by ${d.problem}, costing enterprises billions annually in inefficiency and lost potential.\n\n**Our Technology**\nWe deploy ${d.tech} that directly tackles this systemic challenge with unprecedented precision and scalability.\n\n**Strategic Impact**\n${d.impact} — positioning ${name} as a category-defining leader in the ${domain || 'technology'} sector with strong alignment to India's self-reliance mission.`;
  } else {
    pitch = `${name}, a ${stageLabel} venture, is solving the critical problem of ${d.problem} through the strategic deployment of ${d.tech}, ensuring that ${d.impact} — driving India's ${domain || 'technology'} ecosystem forward.`;
  }
  return pitch + notice;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { name, domain, stage, format = 'elevator', language = 'english', frequency = 'on-demand' } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Startup Name is required.' });

    const systemPrompt = `You are the IBM Granite Pitch Architect on IBM Watsonx.ai. Generate professional startup pitches tailored for grant applications. Be specific, impactful, and free of marketing buzzwords. Write the content directly without any prefaces or concluding remarks. Respond entirely in ${language.toUpperCase()}. For Hindi use Devanagari. For Punjabi use Gurmukhi.`;

    const userPrompt = `Generate a highly-compelling pitch for:
Startup Name: ${name}
Primary Sector: ${domain}
Venture Stage: ${stage}
Desired Output Format: ${format}
Desired Language: ${language}
Update Frequency: ${frequency}

Format Guidelines:
- elevator: A concise, impactful 2-sentence elevator pitch
- one-pager: 3 bullet points covering Problem, Technology, and Impact
- twitter: Under 260 characters with 2 relevant hashtags
- investor-hook: High-intensity problem-solution hook with market size and competitive moat`;

    const pitch = await callGraniteWithRetry(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.85, max_tokens: 512 }
    );
    res.json({ success: true, pitch: pitch.trim().replace(/^"|"$/g, '') });
  } catch (error: any) {
    console.error('Pitch generation error:', error.message);
    const { name, domain, stage, format = 'elevator', language = 'english', frequency = 'on-demand' } = req.body;
    res.json({ success: true, pitch: getSmartFallbackPitch(name, domain, stage, format, language, frequency) });
  }
}
