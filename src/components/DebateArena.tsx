import React, { useState } from 'react';
import { 
  DecisionItem, 
  PersonaType, 
  ConversationTurn 
} from '../types';
import { PERSONA_PROFILES } from '../constants/personas';
import { 
  ShieldAlert, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle, 
  Send, 
  CornerDownRight, 
  Scale, 
  Award, 
  Calendar, 
  AlertTriangle, 
  RotateCcw, 
  User, 
  HelpCircle,
  Trash2,
  X,
  Loader2
} from 'lucide-react';

interface DebateArenaProps {
  decision: DecisionItem;
  onSendPushback: (userReply: string, targetPersona: PersonaType | 'all') => void;
  onOpenResolutionModal: () => void;
  onOpenOutcomeModal: () => void;
  onDeleteDecision?: (decisionId: string) => void;
  isLoading: boolean;
  activeModelUsed?: string;
  isDeleting?: boolean;
}

export const DebateArena: React.FC<DebateArenaProps> = ({
  decision,
  onSendPushback,
  onOpenResolutionModal,
  onOpenOutcomeModal,
  onDeleteDecision,
  isLoading,
  activeModelUsed,
  isDeleting,
}) => {
  const [pushbackText, setPushbackText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<PersonaType | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmitPushback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushbackText.trim() || isLoading) return;
    onSendPushback(pushbackText.trim(), selectedTarget);
    setPushbackText('');
  };

  const getPersonaIcon = (type: PersonaType) => {
    switch (type) {
      case 'realist':
        return <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'dreamer':
        return <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'skeptic':
        return <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  // Group initial council turns vs subsequent pushback turns safely and robustly
  const turns = Array.isArray(decision?.turns) ? decision.turns : [];

  // Find opening arguments for each council persona
  const initialRealistTurn = turns.find((t) => t.sender === 'realist');
  const initialDreamerTurn = turns.find((t) => t.sender === 'dreamer');
  const initialSkepticTurn = turns.find((t) => t.sender === 'skeptic');

  // Identify all turns that are subsequent pushbacks or replies
  const openingTurnIds = new Set(
    [initialRealistTurn?.id, initialDreamerTurn?.id, initialSkepticTurn?.id].filter(Boolean)
  );
  const subsequentTurns = turns.filter((t) => !openingTurnIds.has(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Decision Header Bar */}
      <div className="bg-[#0D0D0F] rounded-2xl border border-white/5 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                {decision.category || 'Decision'}
              </span>
              {decision.status === 'resolved' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  Active Council Deliberation
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-serif text-white tracking-tight">
              {decision.title}
            </h1>

            {decision.context && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl font-sans">
                <span className="font-semibold text-slate-300">Context:</span> {decision.context}
              </p>
            )}
          </div>

          {/* Action Resolution / Outcome Button & Options */}
          <div className="flex items-center gap-2 sm:gap-3">
            {decision.status !== 'resolved' ? (
              <button
                id="btn-resolve-decision-header"
                onClick={onOpenResolutionModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Resolve Decision</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-500 font-mono">Chosen Alignment</div>
                  <div className="text-xs font-bold capitalize text-white font-serif">
                    {decision.chosenPersona || 'Custom'}
                  </div>
                </div>
                <button
                  id="btn-log-outcome-header"
                  onClick={onOpenOutcomeModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white text-black hover:bg-slate-200 shadow-md transition-all"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{decision.outcome ? `Outcome: ${decision.outcome.replace('_', ' ')}` : 'Log Real Outcome'}</span>
                </button>
              </div>
            )}

            {onDeleteDecision && (
              <button
                id="btn-arena-delete-decision"
                onClick={() => setShowDeleteModal(true)}
                title="Delete this decision permanently"
                className="p-2 text-slate-500 hover:text-rose-400 rounded-full hover:bg-rose-950/40 border border-white/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Council 3-Column Debate Arena */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              The Three-Persona Council Opening Arguments
            </h2>
          </div>
          {activeModelUsed && (
            <span className="text-[10px] text-slate-500 font-mono">
              Engine: {activeModelUsed}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0">
          
          {/* Realist Column */}
          {(() => {
            const profile = PERSONA_PROFILES.realist;
            const turn = initialRealistTurn;
            return (
              <div className="bg-[#121214] rounded-2xl lg:rounded-l-2xl lg:rounded-r-none border border-white/5 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30 font-serif italic text-xl">
                        R
                      </div>
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                          {profile.name}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Risk & Logistics
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Downside Protection
                    </span>
                  </div>

                  {turn ? (
                    <div className="space-y-3">
                      {turn.headline && (
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          {turn.headline}
                        </h4>
                      )}
                      <div className="text-sm font-serif italic text-slate-300 leading-relaxed whitespace-pre-line">
                        "{turn.content}"
                      </div>

                      {turn.keyQuestionOrRisk && (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans">
                          <span className="font-bold text-emerald-400 block mb-1">Pivotal Reality Check:</span>
                          {turn.keyQuestionOrRisk}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Deliberating practical factors...
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedTarget('realist');
                      document.getElementById('debate-pushback-input')?.focus();
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Push back on Realist</span>
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Dreamer Column (Elevated) */}
          {(() => {
            const profile = PERSONA_PROFILES.dreamer;
            const turn = initialDreamerTurn;
            return (
              <div className="bg-[#141418] rounded-2xl lg:rounded-none border-y border-x lg:border-x-0 border-white/10 p-6 flex flex-col justify-between shadow-2xl shadow-black relative z-10 lg:scale-[1.02] overflow-hidden">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-500/30 font-serif italic text-xl">
                        D
                      </div>
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                          {profile.name}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Vision & Potential
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                      Asymmetric Upside
                    </span>
                  </div>

                  {turn ? (
                    <div className="space-y-3">
                      {turn.headline && (
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          {turn.headline}
                        </h4>
                      )}
                      <div className="text-sm font-serif italic text-slate-300 leading-relaxed whitespace-pre-line">
                        "{turn.content}"
                      </div>

                      {turn.keyQuestionOrRisk && (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans">
                          <span className="font-bold text-indigo-400 block mb-1">Catalytic Growth Question:</span>
                          {turn.keyQuestionOrRisk}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Deliberating upside potential...
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedTarget('dreamer');
                      document.getElementById('debate-pushback-input')?.focus();
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Push back on Dreamer</span>
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Skeptic Column */}
          {(() => {
            const profile = PERSONA_PROFILES.skeptic;
            const turn = initialSkepticTurn;
            return (
              <div className="bg-[#121214] rounded-2xl lg:rounded-r-2xl lg:rounded-l-none border border-white/5 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center text-rose-400 border border-rose-500/30 font-serif italic text-xl">
                        S
                      </div>
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                          {profile.name}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Assumptions & Flaws
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/30">
                      Blindspot Probe
                    </span>
                  </div>

                  {turn ? (
                    <div className="space-y-3">
                      {turn.headline && (
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          {turn.headline}
                        </h4>
                      )}
                      <div className="text-sm font-serif italic text-slate-300 leading-relaxed whitespace-pre-line">
                        "{turn.content}"
                      </div>

                      {turn.keyQuestionOrRisk && (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-sans">
                          <span className="font-bold text-rose-400 block mb-1">Uncomfortable Probe:</span>
                          {turn.keyQuestionOrRisk}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Deliberating hidden blindspots...
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedTarget('skeptic');
                      document.getElementById('debate-pushback-input')?.focus();
                    }}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Push back on Skeptic</span>
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Subsequent Multi-Turn Conversation Thread */}
      {subsequentTurns.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Multi-Turn Deliberation & Pushback History ({subsequentTurns.length} turns)
          </h2>

          <div className="space-y-4">
            {subsequentTurns.map((turn) => {
              const isUser = turn.sender === 'user';
              const personaProfile = !isUser ? PERSONA_PROFILES[turn.sender as PersonaType] : null;

              return (
                <div
                  key={turn.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isUser
                      ? 'bg-white/5 border-white/10 ml-4 sm:ml-12'
                      : turn.sender === 'realist'
                      ? 'bg-emerald-950/20 border-emerald-500/30 mr-4 sm:mr-12'
                      : turn.sender === 'dreamer'
                      ? 'bg-indigo-950/20 border-indigo-500/30 mr-4 sm:mr-12'
                      : 'bg-rose-950/20 border-rose-500/30 mr-4 sm:mr-12'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {isUser ? (
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        getPersonaIcon(turn.sender as PersonaType)
                      )}
                      <span className="text-xs font-bold text-white">
                        {isUser ? 'You' : personaProfile?.name}
                      </span>
                      {isUser && turn.targetPersona && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          Targeting: {turn.targetPersona === 'all' ? 'All Council' : PERSONA_PROFILES[turn.targetPersona]?.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {turn.headline && (
                    <div className="text-xs sm:text-sm font-bold text-slate-200 mb-1">
                      {turn.headline}
                    </div>
                  )}

                  <div className="text-xs sm:text-sm font-serif italic text-slate-300 whitespace-pre-line leading-relaxed">
                    "{turn.content}"
                  </div>

                  {turn.keyQuestionOrRisk && (
                    <div className="mt-2.5 p-2 rounded-lg bg-black/20 text-xs text-slate-300 font-sans">
                      <span className="font-semibold text-white">Probe:</span> {turn.keyQuestionOrRisk}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Pushback Box */}
      <div className="bg-[#0D0D0F]/90 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xl sticky bottom-4 z-20">
        <form onSubmit={handleSubmitPushback} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Direct Pushback to:
              </span>
              <div className="flex items-center gap-1.5">
                {(['all', 'realist', 'dreamer', 'skeptic'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTarget(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                      selectedTarget === t
                        ? t === 'realist' 
                          ? 'bg-emerald-500 text-black' 
                          : t === 'dreamer'
                          ? 'bg-indigo-600 text-white'
                          : t === 'skeptic'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-black'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All Council' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 hidden sm:block font-mono">
              Press Enter to push back
            </div>
          </div>

          <div className="flex gap-2">
            <input
              id="debate-pushback-input"
              type="text"
              value={pushbackText}
              onChange={(e) => setPushbackText(e.target.value)}
              placeholder={
                selectedTarget === 'all'
                  ? 'Reply or push back on the entire council...'
                  : `Challenge ${PERSONA_PROFILES[selectedTarget]?.name}'s argument specifically...`
              }
              className="flex-1 px-4 py-3 rounded-full border border-white/10 bg-[#0A0A0B] text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
            <button
              id="btn-submit-pushback"
              type="submit"
              disabled={isLoading || !pushbackText.trim()}
              className="px-6 py-3 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-lg shadow-white/5"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isLoading ? 'Thinking...' : 'Push Back'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                  <p className="text-xs text-slate-400">Permanent removal from storage</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0A0A0B] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="text-sm font-semibold text-white">
                {decision.title || 'Untitled Decision'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono break-all">
                Document ID: {decision.id}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1 border-t border-white/5">
                This will delete the document directly from Cloud Firestore and your encrypted vault by document ID.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-arena-delete"
                type="button"
                onClick={() => {
                  if (onDeleteDecision) {
                    onDeleteDecision(decision.id);
                  }
                }}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
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
