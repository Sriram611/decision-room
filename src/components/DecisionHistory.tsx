import React, { useState } from 'react';
import { DecisionItem, PersonaType, OutcomeType } from '../types';
import { PERSONA_PROFILES } from '../constants/personas';
import { 
  ShieldAlert, 
  Sparkles, 
  BrainCircuit, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  RotateCcw,
  Lock,
  Loader2,
  X
} from 'lucide-react';

interface DecisionHistoryProps {
  decisions: DecisionItem[];
  onSelectDecision: (decision: DecisionItem) => void;
  onNewDecision: () => void;
  onDeleteDecision: (decisionId: string) => Promise<void> | void;
  onOpenOutcomeModal: (decision: DecisionItem) => void;
  isDeletingDecisionId?: string | null;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({
  decisions,
  onSelectDecision,
  onNewDecision,
  onDeleteDecision,
  onOpenOutcomeModal,
  isDeletingDecisionId,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DecisionItem | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    if (filterStatus === 'active' && d.status !== 'active') return false;
    if (filterStatus === 'resolved' && d.status !== 'resolved') return false;
    if (filterPersona !== 'all' && d.chosenPersona !== filterPersona) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (d.title || '').toLowerCase().includes(q);
      const matchCategory = (d.category || '').toLowerCase().includes(q);
      const matchReflection = (d.outcomeReflection || '').toLowerCase().includes(q);
      const matchId = (d.id || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchReflection && !matchId) return false;
    }
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      await onDeleteDecision(targetId);
      setDeleteTarget(null);
    } catch {
      // Handled in parent
    }
  };

  const getPersonaBadge = (persona?: PersonaType | 'hybrid' | 'self' | null) => {
    if (!persona) return null;
    if (persona === 'realist') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <ShieldAlert className="w-3 h-3" />
          The Realist
        </span>
      );
    }
    if (persona === 'dreamer') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3 h-3" />
          The Dreamer
        </span>
      );
    }
    if (persona === 'skeptic') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <BrainCircuit className="w-3 h-3" />
          The Skeptic
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 capitalize">
        <Scale className="w-3 h-3" />
        {persona}
      </span>
    );
  };

  const getOutcomeBadge = (outcome?: OutcomeType) => {
    if (!outcome) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <Clock className="w-3 h-3" />
          Outcome Pending
        </span>
      );
    }
    switch (outcome) {
      case 'worked_well':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Worked Out Well
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <HelpCircle className="w-3 h-3" />
            Mixed Outcome
          </span>
        );
      case 'regret':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            Regret / Hard Lesson
          </span>
        );
      case 'too_early':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3 h-3" />
            Too Early to Tell
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            Decision Archive & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Encrypted records of past crossroads, persona alignments, and real-world outcomes.
          </p>
        </div>

        <button
          id="btn-history-new-decision"
          onClick={onNewDecision}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Decision</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121214] rounded-2xl border border-white/5 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past decisions or reflections..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-white/10 bg-[#0A0A0B] text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {(['all', 'active', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Persona filter */}
          <select
            value={filterPersona}
            onChange={(e) => setFilterPersona(e.target.value)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0A0A0B] border border-white/10 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Personas</option>
            <option value="realist">The Realist</option>
            <option value="dreamer">The Dreamer</option>
            <option value="skeptic">The Skeptic</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

      </div>

      {/* Decision Cards List */}
      {filteredDecisions.length === 0 ? (
        <div className="bg-[#121214] rounded-2xl border border-white/5 p-12 text-center shadow-xl">
          <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-white">
            No decisions match your filter
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            {decisions.length === 0
              ? 'You have not convened the council for any decisions yet.'
              : 'Try clearing your search query or adjusting your filters.'}
          </p>
          {decisions.length === 0 && (
            <button
              onClick={onNewDecision}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>Convene First Decision</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecisions.map((decision) => {
            const isDeletingThis = isDeletingDecisionId === decision.id;
            const isLockedOrCorrupted = decision.title === 'Locked Decision' || (!decision.turns || decision.turns.length === 0);

            return (
              <div
                key={decision.id}
                className="bg-[#121214] rounded-2xl border border-white/5 p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                        {decision.category || 'General'}
                      </span>
                      {decision.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400">
                          <RotateCcw className="w-3 h-3" />
                          Active Council
                        </span>
                      )}
                      {isLockedOrCorrupted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5" />
                          Encrypted / Legacy
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(decision.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onSelectDecision(decision)}
                    className="font-serif text-lg text-white group-hover:text-indigo-400 transition-colors cursor-pointer leading-snug"
                  >
                    {decision.title}
                  </h3>

                  {/* ID stamp for verification */}
                  <div className="text-[10px] text-slate-600 font-mono mt-1">
                    ID: {decision.id}
                  </div>

                  {/* Resolution note preview if exists */}
                  {decision.resolutionNote && (
                    <p className="text-xs text-slate-300 mt-2.5 bg-white/5 p-3 rounded-xl border border-white/5 font-sans">
                      <span className="font-bold text-white">Final Choice:</span> {decision.resolutionNote}
                    </p>
                  )}

                  {/* Reflection if logged */}
                  {decision.outcomeReflection && (
                    <p className="text-xs text-slate-400 mt-2 font-serif italic">
                      "{decision.outcomeReflection}"
                    </p>
                  )}
                </div>

                {/* Bottom Badges & Actions */}
                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getPersonaBadge(decision.chosenPersona)}
                    {getOutcomeBadge(decision.outcome)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {decision.status === 'resolved' && (
                      <button
                        onClick={() => onOpenOutcomeModal(decision)}
                        title="Log or Update Real-World Outcome"
                        className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      >
                        Log Outcome
                      </button>
                    )}

                    <button
                      onClick={() => onSelectDecision(decision)}
                      title="Open in Arena"
                      className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-delete-${decision.id}`}
                      disabled={isDeletingThis}
                      onClick={() => setDeleteTarget(decision)}
                      title="Delete Record"
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-full hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Direct Delete Confirmation Modal (Avoids iframe modal blocks) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-[#141418] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif text-white">Delete Decision Record</h3>
                  <p className="text-xs text-slate-400">Permanent removal from encrypted storage</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(isDeletingDecisionId)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0A0A0B] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="text-sm font-semibold text-white">
                {deleteTarget.title || 'Untitled Decision'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono break-all">
                Document ID: {deleteTarget.id}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1 border-t border-white/5">
                This will delete the document directly from Cloud Firestore and your device vault without requiring decryption. Undecryptable or corrupted documents will be cleanly removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={Boolean(isDeletingDecisionId)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-modal"
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(isDeletingDecisionId)}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isDeletingDecisionId === deleteTarget.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from Firestore...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

