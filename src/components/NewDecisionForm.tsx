import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Compass, Lock, Tag, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

interface NewDecisionFormProps {
  onSubmit: (decision: {
    title: string;
    context: string;
    category: 'career' | 'finance' | 'personal' | 'business' | 'relationships' | 'other';
  }) => void;
  isLoading: boolean;
  submissionError?: string | null;
  onClearError?: () => void;
}

const PRESET_SCENARIOS = [
  {
    title: "Should I quit my steady corporate job to freelance full-time?",
    category: "career" as const,
    context: "I have 6 months of living expenses saved up, 3 warm client leads, and 7 years of software design experience, but I have a mortgage and value predictable health insurance.",
  },
  {
    title: "Should we buy a home now or continue renting and investing the surplus?",
    category: "finance" as const,
    context: "Mortgage interest rates are relatively high in our area, but rent is increasing 8% year-over-year. Buying would consume 70% of our liquid savings for the down payment.",
  },
  {
    title: "Should I bootstrap my SaaS idea or pitch angel investors?",
    category: "business" as const,
    context: "I have a functional MVP with 45 active beta users. Bootstrapping means slower product velocity and working nights; raising capital means dilution and investor expectations.",
  },
  {
    title: "Should I accept a promotion that requires moving to another country?",
    category: "personal" as const,
    context: "The role offers a 35% salary increase and VP title, but requires relocating away from close family and my partner would need to rebuild their local client base.",
  },
];

export const NewDecisionForm: React.FC<NewDecisionFormProps> = ({ 
  onSubmit, 
  isLoading,
  submissionError,
  onClearError,
}) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<'career' | 'finance' | 'personal' | 'business' | 'relationships' | 'other'>('career');
  const [validationError, setValidationError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer while summoning to show user live status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please state the decision or crossroads you are facing.');
      return;
    }
    setValidationError('');
    if (onClearError) onClearError();
    onSubmit({
      title: title.trim(),
      context: context.trim(),
      category,
    });
  };

  const handleApplyPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setTitle(scenario.title);
    setContext(scenario.context);
    setCategory(scenario.category);
    setValidationError('');
    if (onClearError) onClearError();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#121214] border border-white/10 text-xs font-semibold text-slate-300 mb-3">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multi-Perspective Deliberation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
          Bring Your Decision to the Council
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-sans">
          Describe the situation you are weighing. The Realist, The Dreamer, and The Skeptic will debate it live.
        </p>
      </div>

      {/* Main Input Form */}
      <div className="bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8">
        
        {/* Error Alert Banner with Retry Button */}
        {submissionError && (
          <div 
            id="submission-error-banner"
            className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 text-xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-rose-100">Council Convening Notice</span>
                <p className="text-rose-300/90 text-xs mt-0.5">{submissionError}</p>
                <p className="text-[11px] text-rose-300/70 mt-1 font-mono">Your inputs have been preserved below. Click retry to re-convene.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="btn-retry-summon"
                type="button"
                onClick={() => handleSubmit()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="p-1 rounded text-rose-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Decision Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(['career', 'finance', 'business', 'personal', 'relationships', 'other'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Decision Title Input */}
          <div>
            <label 
              htmlFor="decision-title-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              The Core Crossroads or Question <span className="text-rose-400">*</span>
            </label>
            <input
              id="decision-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g., Should I leave my job to freelance full-time?"
              maxLength={180}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0A0A0B] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
            />
            {validationError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Context & Constraints Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="decision-context-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Key Details, Runway, or Constraints (Optional)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {context.length}/1000
              </span>
            </div>
            <textarea
              id="decision-context-input"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Mention key numbers, timelines, emotional stakes, financial savings, or family constraints so the personas can give tailored, highly specific responses..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0A0A0B] text-slate-200 text-xs sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-sans"
            />
          </div>

          {/* Privacy Note & Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted client-side with AES-256 before saving</span>
            </div>

            <button
              id="btn-start-debate"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-bold text-xs bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5 transition-all disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Summoning Council ({elapsedSeconds}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Convene Decision Council</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Starter Presets */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or Test with a Realistic Crossroads Scenario
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyPreset(scenario)}
              className="p-4 rounded-xl bg-[#121214] border border-white/5 hover:border-white/20 transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                  {scenario.category}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Load <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {scenario.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {scenario.context}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
