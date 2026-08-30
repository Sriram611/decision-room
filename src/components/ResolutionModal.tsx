import React, { useState } from 'react';
import { PersonaType, DecisionItem } from '../types';
import { PERSONA_PROFILES } from '../constants/personas';
import { 
  ShieldAlert, 
  Sparkles, 
  BrainCircuit, 
  Scale, 
  X, 
  Check, 
  Award,
  Lock
} from 'lucide-react';

interface ResolutionModalProps {
  decision: DecisionItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (chosenPersona: PersonaType | 'hybrid' | 'self', resolutionNote: string) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  decision,
  isOpen,
  onClose,
  onConfirmResolve,
}) => {
  const [chosenPersona, setChosenPersona] = useState<PersonaType | 'hybrid' | 'self'>('realist');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmResolve(chosenPersona, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#121214] rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">
                Resolve Decision
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Log which perspective tipped your final judgment
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Which Persona's Reasoning Most Influenced You?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Realist */}
              <div
                onClick={() => setChosenPersona('realist')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  chosenPersona === 'realist'
                    ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-[#0A0A0B] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">The Realist</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sided with risk mitigation, numbers, and operational runway.
                </p>
              </div>

              {/* Dreamer */}
              <div
                onClick={() => setChosenPersona('dreamer')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  chosenPersona === 'dreamer'
                    ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-[#0A0A0B] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">The Dreamer</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sided with bold growth, asymmetric upside, and avoiding regret.
                </p>
              </div>

              {/* Skeptic */}
              <div
                onClick={() => setChosenPersona('skeptic')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  chosenPersona === 'skeptic'
                    ? 'bg-rose-950/40 border-rose-500/50 ring-1 ring-rose-500/30'
                    : 'bg-[#0A0A0B] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">The Skeptic</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Unmasked a bias or rejected false dilemmas.
                </p>
              </div>

              {/* Hybrid */}
              <div
                onClick={() => setChosenPersona('hybrid')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  chosenPersona === 'hybrid'
                    ? 'bg-white/10 border-white/30 ring-1 ring-white/20'
                    : 'bg-[#0A0A0B] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-white">Synthesized / Hybrid</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Blended constraints with ambition into a balanced plan.
                </p>
              </div>

            </div>
          </div>

          {/* Final Action / Reflection Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Final Commitment or Decision (Encrypted)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Decided to quit in 4 months once I have $25k in liquidity and 2 retainer clients signed..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0A0A0B] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted in memory</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-resolve"
                type="submit"
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Lock Decision</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
