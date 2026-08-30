import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Database, 
  CheckCircle2, 
  X, 
  Cpu,
  Fingerprint
} from 'lucide-react';

interface EncryptionVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const EncryptionVaultModal: React.FC<EncryptionVaultModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#121214] rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">
                Client-Side Encryption Vault
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                End-to-End Privacy Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 font-sans">
          
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">
                Zero-Knowledge Decision Protection
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Your decision text, pushback context, and personal outcome reflections are encrypted in your browser using the <strong>Web Crypto API (AES-GCM 256-bit)</strong> with a PBKDF2 derived key (100,000 rounds) before being written to Cloud Firestore.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            
            <div className="flex items-start gap-3 text-xs">
              <Fingerprint className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">User UID Isolation:</span>
                <span className="text-slate-400 block font-mono text-[11px] truncate">
                  {userId}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Database className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Firestore Partition:</span>
                <span className="text-slate-400 block font-mono text-[11px]">
                  /users/{userId.slice(0, 8)}.../decisions/{'{decisionId}'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <KeyRound className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Cipher Specification:</span>
                <span className="text-slate-400 block text-[11px]">
                  AES-GCM (256-bit key) with random 12-byte IV per write
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0A0A0B] border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
