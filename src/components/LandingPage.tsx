import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  BrainCircuit, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Scale,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { PERSONA_PROFILES } from '../constants/personas';

interface LandingPageProps {
  onSignInWithGoogle: () => void;
  onSignInAsGuest: () => void;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignInWithGoogle,
  onSignInAsGuest,
  isLoading,
}) => {
  const [activePersonaPreview, setActivePersonaPreview] = useState<'realist' | 'dreamer' | 'skeptic'>('realist');

  const SAMPLE_DEBATES = {
    realist: {
      headline: "Model the runway, verify fallback cash reserves",
      argument: "Before quitting your W-2 job to freelance, calculate 9 months of baseline living expenses plus health insurance and self-employment taxes. Client acquisition ramp-up takes 3x longer than anticipated.",
      question: "Can your household survive 120 days of zero invoice collections without taking high-interest debt?",
    },
    dreamer: {
      headline: "Uncap your earning ceiling and creative autonomy",
      argument: "Staying in a stagnant role guarantees linear depreciation of your time. Going independent unlocks direct pricing power, compounding intellectual property, and autonomy that no corporate ladder can match.",
      question: "If this leap unlocks complete sovereignty over your daily work, how will you regret not trying?",
    },
    skeptic: {
      headline: "Expose whether this is ambition or burnout avoidance",
      argument: "Are you genuinely drawn to the mechanics of running a freelance business (invoicing, prospecting, constant sales), or are you simply exhausted by your current manager? Changing the medium won't fix the motive.",
      question: "What specific daily friction do you believe freelancing will solve that it might actually worsen?",
    },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#0A0A0B] text-slate-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/5">
        {/* Background Subtle Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-emerald-500/5 to-rose-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Security & Intelligence Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121214] border border-white/10 text-xs font-medium text-slate-300 mb-8 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>End-to-End Encrypted</span>
            <span className="text-slate-600">•</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini 3.6 Flash Multi-Persona Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop making high-stakes decisions with a single point of view.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Bring any decision you are stuck on. Three distinct AI personas debate it live from opposing philosophical frameworks, push back on your assumptions, and help you track real-world outcomes.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="btn-landing-google-signin"
              onClick={onSignInWithGoogle}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-full font-bold text-xs bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting Vault...' : 'Sign In with Google'}</span>
            </button>

            <button
              id="btn-landing-guest-signin"
              onClick={onSignInAsGuest}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs bg-slate-900 text-slate-200 hover:bg-slate-800 border border-white/10 transition-colors disabled:opacity-50"
            >
              <span>Enter as Guest Strategist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Private Firestore Partition
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Client-Side Web Crypto
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Outcome Learning Log
            </span>
          </div>

        </div>
      </section>

      {/* The 3 Persona Showcase */}
      <section className="py-16 bg-[#0D0D0F] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Meet The Three Persona Council
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Each persona maintains an unwavering philosophical stance, analyzing your specific decision parameters without generic platitudes.
            </p>
          </div>

          {/* 3 Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Realist */}
            <div 
              onClick={() => setActivePersonaPreview('realist')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activePersonaPreview === 'realist' 
                  ? 'bg-[#121214] border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                  : 'bg-[#121214]/60 border-white/5 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30 font-serif italic text-xl">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">The Realist</h3>
                  <p className="text-[10px] text-slate-500">Risk & Logistics</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                Calculates cash runways, operational friction, execution complexity, and worst-case downside mitigation to keep you solvent and grounded.
              </p>
            </div>

            {/* Dreamer */}
            <div 
              onClick={() => setActivePersonaPreview('dreamer')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activePersonaPreview === 'dreamer' 
                  ? 'bg-[#141418] border-indigo-500/50 scale-[1.02] shadow-2xl shadow-black z-10'
                  : 'bg-[#121214]/60 border-white/5 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-500/30 font-serif italic text-xl">
                  D
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">The Dreamer</h3>
                  <p className="text-[10px] text-slate-500">Vision & Potential</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                Explores asymmetric upside, compounding personal mastery, creative autonomy, and safeguards against the silent tragedy of regret.
              </p>
            </div>

            {/* Skeptic */}
            <div 
              onClick={() => setActivePersonaPreview('skeptic')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activePersonaPreview === 'skeptic' 
                  ? 'bg-[#121214] border-rose-500/50 shadow-lg shadow-rose-500/5'
                  : 'bg-[#121214]/60 border-white/5 hover:border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center text-rose-400 border border-rose-500/30 font-serif italic text-xl">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">The Skeptic</h3>
                  <p className="text-[10px] text-slate-500">Assumptions & Flaws</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                Pokes holes in wishful thinking, unmasks cognitive biases (boredom vs. passion, sunk cost), and stress-tests both other personas.
              </p>
            </div>

          </div>

          {/* Interactive Live Teaser Box */}
          <div className="mt-8 p-6 rounded-2xl bg-[#121214] text-slate-200 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Sample Decision:</span>
                <span className="text-xs font-medium text-white">"Should I quit my senior role to launch an AI design studio?"</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['realist', 'dreamer', 'skeptic'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePersonaPreview(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                      activePersonaPreview === p
                        ? p === 'realist' ? 'bg-emerald-500 text-black' : p === 'dreamer' ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {SAMPLE_DEBATES[activePersonaPreview].headline}
              </div>
              <p className="text-sm text-slate-300 font-serif italic leading-relaxed">
                "{SAMPLE_DEBATES[activePersonaPreview].argument}"
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Critical Check:</span>
                <span className="italic">{SAMPLE_DEBATES[activePersonaPreview].question}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature & Privacy Architecture Grid */}
      <section className="py-16 bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-[#0D0D0F] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-200">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base text-white">Zero-Leakage Privacy</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Sensitive decisions are encrypted directly in your browser using the Web Crypto API (AES-GCM 256-bit) before being saved to Firestore. Only you hold the decryption key.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D0D0F] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base text-white">Real-World Outcome Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Revisit past resolved crossroads weeks or months later. Log whether siding with the Dreamer or Realist actually paid off in practice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D0D0F] border border-white/5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-200">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-base text-white">Personalized Meta-Insights</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Discover your decision signature without fabricating false patterns. AI analyzes your personal historical win-rates across real outcomes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 bg-[#0A0A0B] text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            <span className="font-serif font-semibold text-slate-300">Decision Room</span>
            <span>— Multi-Persona AI Deliberation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
            <span>Google Cloud Run</span>
            <span>•</span>
            <span>Cloud Firestore</span>
            <span>•</span>
            <span>Gemini 3.6 Flash</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
