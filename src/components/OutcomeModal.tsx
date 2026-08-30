import React, { useState } from 'react';
import { DecisionItem, OutcomeType } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  X, 
  Check, 
  Scale,
  Lock
} from 'lucide-react';

interface OutcomeModalProps {
  decision: DecisionItem;
  isOpen: boolean;
  onClose: () => void;
  onSaveOutcome: (outcome: OutcomeType, reflection: string) => void;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  decision,
  isOpen,
  onClose,
  onSaveOutcome,
}) => {
  const [outcome, setOutcome] = useState<OutcomeType>(decision.outcome || 'worked_well');
  const [reflection, setReflection] = useState(decision.outcomeReflection || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOutcome(outcome, reflection);
  };

  const OUTCOME_OPTIONS = [
    {
      id: 'worked_well' as const,
      label: 'Worked out well',
      desc: 'The decision produced positive, validating results aligned with your intentions.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      theme: 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30',
    },
    {
      id: 'mixed' as const,
      label: 'Mixed / Partial outcome',
      desc: 'Some aspects succeeded while other unexpected frictions surfaced.',
      icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
      theme: 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30',
    },
    {
      id: 'regret' as const,
      label: 'Regret it / Would choose differently',
      desc: 'The downsides materialized or the unaddressed blindspots caused regret.',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      theme: 'bg-rose-950/40 border-rose-500/50 ring-1 ring-rose-500/30',
    },
    {
      id: 'too_early' as const,
      label: 'Too early to tell',
      desc: 'The consequences are still playing out over time.',
      icon: <Clock className="w-4 h-4 text-indigo-400" />,
      theme: 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#121214] rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 text-slate-300 flex items-center justify-center border border-white/10">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white">
                Log Real-World Outcome
              </h3>
              <p className="text-xs text-slate-400 max-w-[320px] truncate font-sans">
                "{decision.title}"
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
              How did this play out in reality?
            </label>
            <div className="space-y-2">
              {OUTCOME_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setOutcome(opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    outcome === opt.id
                      ? opt.theme
                      : 'bg-[#0A0A0B] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-white">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Reflection Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Outcome Reflection & Lessons Learned (Encrypted)
            </label>
            <textarea
              rows={3}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What surprised you? Did the Realist or Skeptic's prediction hold true? What would you tell your past self?"
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
                id="btn-save-outcome-confirm"
                type="submit"
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Outcome Log</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
