import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface CollapsibleFAQProps {
  currentLanguage: string;
}

export default function CollapsibleFAQ({ currentLanguage }: CollapsibleFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const getFaqs = (): FAQItem[] => {
    switch (currentLanguage) {
      case 'hindi':
        return [
          {
            q: "यह स्टार्टअप फंडिंग हब क्या है?",
            a: "यह एक उन्नत एआई-संचालित खोज इंजन है जो भारतीय संस्थापकों के लिए सरकारी योजनाओं (जैसे SISFS, NIDHI-PRAYAS, BIRAC) और प्रारंभिक चरण के सीड फंड को ट्रैक करता है और उनका मिलान करता है।"
          },
          {
            q: "मिलान स्कोर (Match Score) की गणना कैसे की जाती है?",
            a: "हमारा सिस्टम आपके स्टार्टअप प्रोफाइल मापदंडों—जैसे क्षेत्र, विकास चरण, वार्षिक निगमन वर्ष और आवश्यक धन राशि—का मूल्यांकन सीधे योजनाओं की आधिकारिक योग्यता आवश्यकताओं के विरुद्ध रीयल-टाइम में करता है।"
          },
          {
            q: "क्या मेरा व्यावसायिक डेटा और पिच विवरण सुरक्षित हैं?",
            a: "बिल्कुल। आपकी कंपनी का सारा डेटा पूरी तरह से आपके व्यक्तिगत ब्राउज़र कैश (localStorage) में स्थानीय रूप से सहेजा जाता है और किसी तीसरे पक्ष के साथ कभी भी साझा या बेचा नहीं जाता है।"
          },
          {
            q: "प्रस्ताव संपादक (Proposal Generator) का उपयोग कैसे करें?",
            a: "ब्राउज़ टैब में किसी योजना को लक्षित करें, 'प्रस्ताव का मसौदा' (Draft Proposal) पर क्लिक करें, और हमारा एआई सहायक आपकी प्रोफाइल जानकारी के आधार पर एक व्यापक पीडीएफ ड्राफ्ट तैयार करेगा।"
          }
        ];
      case 'punjabi':
        return [
          {
            q: "ਇਹ ਸਟਾਰਟਅੱਪ ਫੰਡਿੰਗ ਹੱਬ ਕੀ ਹੈ?",
            a: "ਇਹ ਇੱਕ ਉੱਨਤ ਏਆਈ-ਸੰਚਾਲਿਤ ਖੋਜ ਇੰਜਣ ਹੈ ਜੋ ਭਾਰਤੀ ਉੱਦਮੀਆਂ ਲਈ ਸਰਕਾਰੀ ਸਕੀਮਾਂ (ਜਿਵੇਂ SISFS, NIDHI-PRAYAS, BIRAC) ਅਤੇ ਸ਼ੁਰੂਆਤੀ ਪੜਾਅ ਦੇ ਸੀਡ ਫੰਡਾਂ ਨੂੰ ਟ੍ਰੈਕ ਅਤੇ ਮੈਚ ਕਰਦਾ ਹੈ।"
          },
          {
            q: "ਮੈਚ ਸਕੋਰ (Match Score) ਦੀ ਗਣਨਾ ਕਿਵੇਂ ਕੀਤੀ ਜਾਂਦੀ ਹੈ?",
            a: "ਸਾਡਾ ਸਿਸਟਮ ਤੁਹਾਡੇ ਸਟਾਰਟਅੱਪ ਪ੍ਰੋਫਾਈਲ ਪੈਰਾਮੀਟਰਾਂ—ਜਿਵੇਂ ਕਿ ਖੇਤਰ, ਵਿਕਾਸ ਪੜਾਅ, ਸਾਲਾਨਾ ਨਿਗਮੀਕਰਨ ਸਾਲ ਅਤੇ ਲੋੜੀਂਦੀ ਫੰਡ ਰਾਸ਼ੀ—ਦਾ ਮੁਲਾਂਕਣ ਸਿੱਧੇ ਸਕੀਮਾਂ ਦੀਆਂ ਯੋਗਤਾ ਲੋੜਾਂ ਦੇ ਵਿਰੁੱਧ ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਕਰਦਾ ਹੈ।"
          },
          {
            q: "ਕੀ ਮੇਰਾ ਵਪਾਰਕ ਡੇਟਾ ਅਤੇ ਪਿੱਚ ਵੇਰਵੇ ਸੁਰੱਖਿਅਤ ਹਨ?",
            a: "ਬਿਲਕੁਲ। ਤੁਹਾਡੀ ਕੰਪਨੀ ਦਾ ਸਾਰਾ ਡੇਟਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਤੁਹਾਡੇ ਨਿੱਜੀ ਬ੍ਰਾਊਜ਼ਰ ਕੈਸ਼ (localStorage) ਵਿੱਚ ਸਥਾਨਕ ਤੌਰ 'ਤੇ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਅਤੇ ਕਿਸੇ ਹੋਰ ਨਾਲ ਕਦੇ ਵੀ ਸਾਂਝਾ ਜਾਂ ਵੇਚਿਆ ਨਹੀਂ ਜਾਂਦਾ।"
          },
          {
            q: "ਪ੍ਰਸਤਾਵ ਸੰਪਾਦਕ (Proposal Generator) ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰੀਏ?",
            a: "ਬ੍ਰਾਊਜ਼ ਟੈਬ ਵਿੱਚ ਕਿਸੇ ਸਕੀਮ ਨੂੰ ਚੁਣੋ, 'ਪ੍ਰਸਤਾਵ ਦਾ ਖਰੜਾ' (Draft Proposal) 'ਤੇ ਕਲਿੱਕ ਕਰੋ, ਅਤੇ ਸਾਡਾ ਏਆਈ ਸਹਾਇਕ ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ 'ਤੇ ਇੱਕ ਵਿਆਪਕ ਪੀਡੀਐਫ ਖਰੜਾ ਤਿਆਰ ਕਰੇਗਾ।"
          }
        ];
      default:
        return [
          {
            q: "What is Startup Funding Hub?",
            a: "Startup Funding Hub is a high-fidelity AI-powered grant and seed funding discovery engine tailored for Indian founders. It aggregates government schemes (such as SISFS, NIDHI-PRAYAS, BIRAC) and early-stage opportunities to match them dynamically against startup profiles."
          },
          {
            q: "How does the Match Score system work?",
            a: "The score is calculated in real-time by analyzing how well your startup profile (industry, developmental stage, incorporation year, and desired funding) aligns with the regulatory constraints and eligibility criteria of each specific scheme."
          },
          {
            q: "Is my startup's configuration and proprietary pitch secure?",
            a: "Yes. All configuration inputs, saved metrics, and generated proposal documents are securely persisted locally on your computer via standard client-side localStorage. Prompt payloads processed via IBM Watsonx are never stored or used to train public language models."
          },
          {
            q: "How do I download and edit my proposal draft?",
            a: "First, click 'Draft Proposal' on any matched grant card. Then configure your narrative pitch strategy and select 'Generate PDF Proposal' under the Proposal Generator tab. You can download and print it as a standard PDF file."
          },
          {
            q: "Who designed and engineered Startup Funding Hub?",
            a: "Startup Funding Hub was envisioned and engineered by Garv Arora, as an advanced ecosystem to connect early-stage Indian founders with strategic growth capitals and deep tech grants."
          }
        ];
    }
  };

  const faqs = getFaqs();

  const getTitle = () => {
    switch (currentLanguage) {
      case 'hindi':
        return 'अक्सर पूछे जाने वाले प्रश्न (FAQ)';
      case 'punjabi':
        return 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ (FAQ)';
      default:
        return 'Frequently Asked Questions';
    }
  };

  return (
    <div id="faq-section" className="bg-white border border-[#DEDCCF] rounded-2xl p-6 shadow-sm mt-8">
      <h3 className="font-display font-semibold text-[#4A4A30] text-sm md:text-base tracking-tight mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded bg-[#5A5A40]/10 text-[#5A5A40] text-xs font-mono font-bold">?</span>
        <span>{getTitle()}</span>
      </h3>
      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx} 
              className="border border-[#DEDCCF] rounded-xl overflow-hidden transition-colors duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 bg-[#F5F5F0] hover:bg-[#ECEBE4] text-left transition cursor-pointer"
              >
                <span className="font-sans font-semibold text-[#4A4A30] text-xs md:text-sm">
                  {faq.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#5A5A40] shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#5A5A40] shrink-0 ml-2" />
                )}
              </button>
              {isOpen && (
                <div className="p-4 bg-white border-t border-[#DEDCCF] font-sans text-xs text-[#2A2A1E] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
