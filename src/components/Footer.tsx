import { Mail, Shield, Heart, Terminal, Cpu, Globe } from 'lucide-react';

interface FooterProps {
  currentLanguage: string;
  onOpenPolicy: (type: 'privacy' | 'cookies' | 'terms') => void;
}

export default function Footer({ currentLanguage, onOpenPolicy }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const getAboutText = () => {
    switch (currentLanguage) {
      case 'hindi':
        return 'Startup Funding Hub भारतीय उद्यमियों और नवप्रवर्तकों के लिए बनाया गया एक उच्च-सटीकता वाला अनुदान खोज इंजन है। IBM Granite और Watsonx.ai द्वारा संचालित, यह वास्तविक समय में सरकारी योजनाओं और सीड फंडिंग का मिलान करता है।';
      case 'punjabi':
        return 'Startup Funding Hub ਭਾਰਤੀ ਉੱਦਮੀਆਂ ਅਤੇ ਨਵੀਨਤਾਕਾਰਾਂ ਲਈ ਬਣਾਇਆ ਗਿਆ ਇੱਕ ਉੱਚ-ਸ਼ੁੱਧਤਾ ਵਾਲਾ ਗ੍ਰਾਂਟ ਖੋਜ ਇੰਜਣ ਹੈ। IBM Granite ਅਤੇ Watsonx.ai ਦੁਆਰਾ ਸੰਚਾਲਿਤ, ਇਹ ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਸੀਡ ਫੰਡਿੰਗ ਦਾ ਮਿਲਾਨ ਕਰਦਾ ਹੈ।';
      default:
        return 'Startup Funding Hub is a high-fidelity startup grant discovery engine engineered for Indian founders and early-stage innovators. Powered by IBM Granite on Watsonx.ai, it delivers precise real-time matching and contextual alignment for government schemes and seed funding.';
    }
  };

  const getContactText = () => {
    switch (currentLanguage) {
      case 'hindi':
        return 'संपर्क और सहायता';
      case 'punjabi':
        return 'ਸੰਪਰਕ ਅਤੇ ਸਹਾਇਤਾ';
      default:
        return 'Contact & Support';
    }
  };

  return (
    <footer id="app-footer" className="bg-[#161616] text-white border-t border-white/10 mt-12">
      <div className="max-w-[1536px] mx-auto px-6 py-12 md:py-16">
        {/* Main Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F62FE] to-[#8A3FFC] border border-white/20">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-display italic font-bold text-xl tracking-tight bg-gradient-to-r from-[#4D98FF] to-[#A56EFF] bg-clip-text text-transparent">Startup Funding Hub</span>
              <span className="bg-gradient-to-r from-[#0F62FE] to-[#8A3FFC] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-white/25">
                IBM Granite
              </span>
            </div>
            
            <p className="text-xs text-white/80 leading-relaxed font-sans max-w-md">
              {getAboutText()}
            </p>
          </div>

          {/* Column 2: Technology & Engine */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>SYSTEM ARCHITECTURE</span>
            </h4>
            <div className="space-y-2 text-xs font-mono text-white/90">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <Globe className="w-3.5 h-3.5 text-[#198038]" />
                <span>NLU: <strong className="text-[#198038]">Watson NLU Analysed</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <Cpu className="w-3.5 h-3.5 text-[#198038]" />
                <span>LLM Backend: <strong className="text-[#198038]">Granite-4-H-Small</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <Terminal className="w-3.5 h-3.5 text-[#198038]" />
                <span>Agent Layer: <strong className="text-[#198038]">Watsonx Orchestrate Ready</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <Shield className="w-3.5 h-3.5 text-[#198038]" />
                <span>Guardrail: <strong className="text-[#198038]">Compliance Layer Active</strong></span>
              </div>
            </div>
          </div>

          {/* Column 3: Contact & Creator */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/60">
              {getContactText()}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-white/90">
                <Mail className="w-4 h-4 text-white/75" />
                <a href="mailto:garv26arora@gmail.com" className="hover:underline hover:text-white transition">
                  garv26arora@gmail.com
                </a>
              </li>
              <li className="pt-2 border-t border-white/10 text-white/75 leading-relaxed font-sans">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Created by</span>
                  <strong className="text-white font-semibold">Garv Arora</strong>
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline animate-pulse" />
                </div>
                <p className="text-[10px] text-white/60 font-mono mt-1">
                  Full Stack Engineer & AI Innovator
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Links */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-[10px] font-mono text-white/60 tracking-wide">
            © {currentYear} STARTUP FUNDING HUB. DESIGNED & DEVELOPED BY <span className="text-white font-bold">GARV ARORA</span>.
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-white/60">
            <button 
              onClick={() => onOpenPolicy('privacy')} 
              className="hover:text-white transition cursor-pointer font-mono text-[10px] bg-transparent border-none p-0 outline-none"
            >
              PRIVACY POLICY
            </button>
            <span>●</span>
            <button 
              onClick={() => onOpenPolicy('cookies')} 
              className="hover:text-white transition cursor-pointer font-mono text-[10px] bg-transparent border-none p-0 outline-none"
            >
              COOKIE POLICY
            </button>
            <span>●</span>
            <button 
              onClick={() => onOpenPolicy('terms')} 
              className="hover:text-white transition cursor-pointer font-mono text-[10px] bg-transparent border-none p-0 outline-none"
            >
              TERMS OF SERVICE
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
