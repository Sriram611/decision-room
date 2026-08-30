import React, { useState, useEffect } from 'react';
import { DecisionItem, PersonaType } from '../types';
import { requestPatternAnalysis } from '../services/api';
import { 
  ShieldAlert, 
  Sparkles, 
  BrainCircuit, 
  Scale, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Compass,
  Lightbulb,
  Award,
  BarChart3
} from 'lucide-react';

interface PatternInsightsProps {
  decisions: DecisionItem[];
}

export const PatternInsights: React.FC<PatternInsightsProps> = ({ decisions }) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resolvedDecisions = decisions.filter(
    (d) => d.status === 'resolved' && d.chosenPersona
  );

  const hasEnoughHistory = resolvedDecisions.length >= 3;

  // Calculate strict deterministic counts from real user data
  const personaStats = {
    realist: {
      total: resolvedDecisions.filter((d) => d.chosenPersona === 'realist').length,
      worked_well: resolvedDecisions.filter((d) => d.chosenPersona === 'realist' && d.outcome === 'worked_well').length,
      mixed: resolvedDecisions.filter((d) => d.chosenPersona === 'realist' && d.outcome === 'mixed').length,
      regret: resolvedDecisions.filter((d) => d.chosenPersona === 'realist' && d.outcome === 'regret').length,
    },
    dreamer: {
      total: resolvedDecisions.filter((d) => d.chosenPersona === 'dreamer').length,
      worked_well: resolvedDecisions.filter((d) => d.chosenPersona === 'dreamer' && d.outcome === 'worked_well').length,
      mixed: resolvedDecisions.filter((d) => d.chosenPersona === 'dreamer' && d.outcome === 'mixed').length,
      regret: resolvedDecisions.filter((d) => d.chosenPersona === 'dreamer' && d.outcome === 'regret').length,
    },
    skeptic: {
      total: resolvedDecisions.filter((d) => d.chosenPersona === 'skeptic').length,
      worked_well: resolvedDecisions.filter((d) => d.chosenPersona === 'skeptic' && d.outcome === 'worked_well').length,
      mixed: resolvedDecisions.filter((d) => d.chosenPersona === 'skeptic' && d.outcome === 'mixed').length,
      regret: resolvedDecisions.filter((d) => d.chosenPersona === 'skeptic' && d.outcome === 'regret').length,
    },
    hybrid: {
      total: resolvedDecisions.filter((d) => d.chosenPersona === 'hybrid' || d.chosenPersona === 'self').length,
      worked_well: resolvedDecisions.filter((d) => (d.chosenPersona === 'hybrid' || d.chosenPersona === 'self') && d.outcome === 'worked_well').length,
      mixed: resolvedDecisions.filter((d) => (d.chosenPersona === 'hybrid' || d.chosenPersona === 'self') && d.outcome === 'mixed').length,
      regret: resolvedDecisions.filter((d) => (d.chosenPersona === 'hybrid' || d.chosenPersona === 'self') && d.outcome === 'regret').length,
    },
  };

  const loadAIAnalysis = async () => {
    if (!hasEnoughHistory) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await requestPatternAnalysis(decisions);
      if (res.hasEnoughHistory && res.analysis) {
        setAnalysisData(res.analysis);
      }
    } catch (err: any) {
      setError('Could not complete AI pattern synthesis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasEnoughHistory && !analysisData) {
      loadAIAnalysis();
    }
  }, [hasEnoughHistory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Private Decision Meta-Cognition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white">
            Decision Signature & Persona Patterns
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-sans">
            Grounded entirely in your personal history of resolved crossroads and logged outcomes.
          </p>
        </div>

        {hasEnoughHistory && (
          <button
            onClick={loadAIAnalysis}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#121214] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh AI Pattern Model</span>
          </button>
        )}
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Realist Stats */}
        <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">The Realist</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              {personaStats.realist.total} chosen
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-white">
            {personaStats.realist.total > 0 
              ? `${Math.round((personaStats.realist.worked_well / personaStats.realist.total) * 100)}%` 
              : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {personaStats.realist.worked_well} positive, {personaStats.realist.regret} regrets logged
          </p>
        </div>

        {/* Dreamer Stats */}
        <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">The Dreamer</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
              {personaStats.dreamer.total} chosen
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-white">
            {personaStats.dreamer.total > 0 
              ? `${Math.round((personaStats.dreamer.worked_well / personaStats.dreamer.total) * 100)}%` 
              : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {personaStats.dreamer.worked_well} positive, {personaStats.dreamer.regret} regrets logged
          </p>
        </div>

        {/* Skeptic Stats */}
        <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-rose-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">The Skeptic</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30">
              {personaStats.skeptic.total} chosen
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-white">
            {personaStats.skeptic.total > 0 
              ? `${Math.round((personaStats.skeptic.worked_well / personaStats.skeptic.total) * 100)}%` 
              : '—'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {personaStats.skeptic.worked_well} positive, {personaStats.skeptic.regret} regrets logged
          </p>
        </div>

        {/* Total Resolved Summary Card */}
        <div className="p-5 rounded-2xl bg-[#121214] text-white border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Pool</span>
            <Scale className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">
            {resolvedDecisions.length} Decisions
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {decisions.filter((d) => d.status === 'active').length} active in deliberation
          </p>
        </div>

      </div>

      {/* Honest History State or Deep AI Meta-Analysis */}
      {!hasEnoughHistory ? (
        <div className="bg-[#0D0D0F] rounded-2xl border border-white/10 p-8 sm:p-12 text-center">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-white">
            Building Your Decision Pattern Profile ({resolvedDecisions.length}/3 Resolved)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed font-sans">
            To prevent fabricating false patterns, Decision Room requires at least <strong>3 resolved decisions</strong> with logged outcomes before synthesizing your AI cognitive signature.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${resolvedDecisions.length >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <div className={`w-3 h-3 rounded-full ${resolvedDecisions.length >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <div className={`w-3 h-3 rounded-full ${resolvedDecisions.length >= 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* AI Synthesis Box */}
          <div className="bg-[#0D0D0F] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-serif text-lg text-white">
                Cognitive Archetype & Pattern Synthesis
              </h3>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-500 mb-2" />
                <p className="text-xs text-slate-400">
                  Synthesizing persona correlations across your {resolvedDecisions.length} decisions...
                </p>
              </div>
            ) : analysisData ? (
              <div className="space-y-6">
                {analysisData.summaryHeadline && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                      Your Signature Tendency
                    </div>
                    <div className="text-base font-serif text-white">
                      {analysisData.summaryHeadline}
                    </div>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {analysisData.aiInsightSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  
                  {/* Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Demonstrated Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {analysisData.topStrengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blindspots */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Key Risk Blindspots
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {analysisData.blindspots?.map((b: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Recommended Heuristic */}
                {analysisData.recommendedRule && (
                  <div className="p-4 rounded-xl bg-[#121214] text-white border border-white/10 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Tailored Decision Heuristic
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-serif italic">
                        "{analysisData.recommendedRule}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      )}

    </div>
  );
};
