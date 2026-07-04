import { X, Shield, FileText, Info, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../locales/translations';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'cookies' | 'terms' | null;
  currentLanguage: string;
}

export default function PolicyModal({ isOpen, onClose, type, currentLanguage }: PolicyModalProps) {
  if (!isOpen || !type) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.english;
  const currentYear = new Date().getFullYear();

  const getTitle = () => {
    switch (type) {
      case 'privacy':
        return t.privacyPolicy;
      case 'cookies':
        return t.cookiePolicy;
      case 'terms':
        return t.termsOfService;
      default:
        return '';
    }
  };

  const getPrivacyContent = () => (
    <div className="space-y-4 font-sans text-xs text-[#2A2A1E] leading-relaxed">
      <div className="bg-[#F5F5F0] border border-[#DEDCCF] rounded-lg p-3.5 mb-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-mono font-bold text-[10px] text-[#5A5A40] uppercase tracking-wide">Data Security Guarantee</h4>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">We utilize local client-side memory storage (localStorage) and secure enterprise IBM Cloud architecture. Your startup's proprietary code, financial structures, and pitches are processed directly and never sold or shared.</p>
        </div>
      </div>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">1. Information We Collect</h3>
      <p>
        To deliver targeted grant discovery and draft tailored funding proposals, <strong>Startup Funding Hub</strong> processes:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Startup Profile Information:</strong> Including company name, industry vertical, development stage, regional location, and core funding requirements.</li>
        <li><strong>Conversational Queries:</strong> Interactive inputs provided during your chats with the IBM Granite-powered AI assistant.</li>
        <li><strong>NLU Keywords:</strong> Search strings processed anonymously via IBM Watson Natural Language Understanding (NLU) to match schemes.</li>
      </ul>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">2. How We Use Your Data</h3>
      <p>
        Your data is processed strictly for the following purposes:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Algorithmic Grant Scoring:</strong> Evaluating eligibility profiles against our index of national startup schemes and private seed grants.</li>
        <li><strong>Contextual AI Generation:</strong> Providing the IBM Granite LLM with the necessary contextual parameters to formulate responsive startup guidance and proposal documents.</li>
        <li><strong>Local Experience Persistence:</strong> Storing active drafts, generated pitches, and configuration settings in your browser's local cache.</li>
      </ul>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">3. Third-Party Integrations & AI Cloud Processing</h3>
      <p>
        We employ enterprise-grade APIs provided by <strong>IBM Watsonx.ai</strong> (including Text-to-Speech synthesis and Natural Language Understanding). Content is transferred securely over encrypted TLS connections. No prompt parameters or inputs are retained for training third-party public models.
      </p>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">4. Contact Information</h3>
      <p>
        For inquiries regarding our cryptographic data processing pipelines or to purge local localStorage cached items, please contact: <a href="mailto:garv26arora@gmail.com" className="text-[#5A5A40] underline font-bold">garv26arora@gmail.com</a>.
      </p>
    </div>
  );

  const getCookieContent = () => (
    <div className="space-y-4 font-sans text-xs text-[#2A2A1E] leading-relaxed">
      <div className="bg-[#F5F5F0] border border-[#DEDCCF] rounded-lg p-3.5 mb-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-mono font-bold text-[10px] text-[#5A5A40] uppercase tracking-wide">Zero Tracking Commitment</h4>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">Startup Funding Hub does not utilize invasive advertising, cross-site tracking pixels, or commercial behavioral profiling scripts. Your preferences are stored cleanly on your device.</p>
        </div>
      </div>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">1. What are Cookies and Local Storage?</h3>
      <p>
        Cookies and browser local storage (localStorage) are small configuration scripts or key-value entries stored in your browser's memory. They allow the system to recognize your preference selections across sessions without requiring a heavy backend database authentication.
      </p>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">2. How We Use Local Memory Storage</h3>
      <p>
        We use local storage strictly for functional, high-fidelity user experiences:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><strong>Language Selection:</strong> Saving your preference for English, Hindi, or Punjabi to automatically load translation schemas.</li>
        <li><strong>Startup Profile State:</strong> Keeping your startup metrics (industry, stage, funding needed) filled so you do not have to re-enter them on reload.</li>
        <li><strong>Active Proposal Drafts:</strong> Storing active PDF draft templates and pitch results to prevent loss of intellectual work.</li>
      </ul>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">3. Managing and Opting Out</h3>
      <p>
        You can easily control, clear, or prevent local storage entries by modifying your browser's security preferences. To purge all session data immediately, click the 'Reset Profile' or 'Clear Local Cache' options provided in the Startup Profile Configuration panel.
      </p>
    </div>
  );

  const getTermsContent = () => (
    <div className="space-y-4 font-sans text-xs text-[#2A2A1E] leading-relaxed">
      <div className="bg-[#F5F5F0] border border-[#DEDCCF] rounded-lg p-3.5 mb-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-mono font-bold text-[10px] text-[#5A5A40] uppercase tracking-wide">Enterprise Legal Framework</h4>
          <p className="text-[11px] text-[#5A5A40] mt-0.5">Please review these terms carefully before utilizing our automated matching algorithms. These terms protect your intellectual property and outline correct usage guidelines.</p>
        </div>
      </div>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">1. Description of Services</h3>
      <p>
        <strong>Startup Funding Hub</strong> is an AI-assisted evaluation tool. It aggregates publicly available governmental, municipal, and private-equity grant opportunities in India and executes contextual, translation-ready match computations using secure IBM Watsonx technologies.
      </p>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">2. No Financial or Legal Representation</h3>
      <p>
        The content generated by our tools, including proposal outlines, matched scores, and legal advisories:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Does not constitute binding legal representation, authorized financial advising, or guaranteed approval of grants.</li>
        <li>All schemes (such as SISFS, NIDHI-PRAYAS, BIRAC) are subject to independent government evaluation boards. Users are highly encouraged to cross-reference matched metrics with the primary governmental program dashboards.</li>
      </ul>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">3. Intellectual Property Rights</h3>
      <p>
        Any pitch formulations, generated texts, PDF proposal drafts, or custom strategies produced by the platform belong entirely to the user. <strong>Startup Funding Hub</strong> lays no claim to your intellectual property or the commercial inventions described in your inputs.
      </p>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">4. Limitation of Liability</h3>
      <p>
        We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from any discrepancies in matched deadlines, amounts, or any rejection of funding applications by governmental agencies.
      </p>

      <h3 className="font-mono font-bold text-[11px] text-[#5A5A40] uppercase tracking-wide">5. Governing Law</h3>
      <p>
        These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1A10]/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-white border border-[#DEDCCF] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col z-10 overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F5F5F0] border-b border-[#DEDCCF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'privacy' && <Shield className="w-5 h-5 text-[#5A5A40]" />}
            {type === 'cookies' && <Info className="w-5 h-5 text-[#5A5A40]" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-[#5A5A40]" />}
            <h2 className="font-sans font-extrabold text-[#1A1A1A] text-sm md:text-base leading-none">
              {getTitle()}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#DEDCCF] bg-white text-[#5A5A40] hover:bg-[#ECEBE4] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {type === 'privacy' && getPrivacyContent()}
          {type === 'cookies' && getCookieContent()}
          {type === 'terms' && getTermsContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F5F5F0] border-t border-[#DEDCCF] flex items-center justify-between">
          <span className="font-mono text-[9px] text-[#8E8E80]">
            LAST UPDATED: JUNE 2026 ● © {currentYear} STARTUP FUNDING HUB
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#5A5A40] text-white hover:bg-[#4A4A30] text-xs font-mono font-bold transition cursor-pointer"
          >
            {t.acknowledge}
          </button>
        </div>
      </div>
    </div>
  );
}
