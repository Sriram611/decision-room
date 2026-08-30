import { PersonaProfile, PersonaType } from '../types';

export const PERSONA_PROFILES: Record<PersonaType, PersonaProfile> = {
  realist: {
    id: 'realist',
    name: 'The Realist',
    tagline: 'Risk & Logistics',
    avatarIcon: 'ShieldAlert',
    themeColor: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
      accent: 'emerald',
    },
    description: 'Grounds decisions in hard numbers, runway, operational risks, and worst-case scenarios to safeguard your stability.',
  },
  dreamer: {
    id: 'dreamer',
    name: 'The Dreamer',
    tagline: 'Vision & Potential',
    avatarIcon: 'Sparkles',
    themeColor: {
      bg: 'bg-indigo-950/40',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30',
      accent: 'indigo',
    },
    description: 'Champions bold ambition, compounding potential, creative autonomy, and preventing the silent tragedy of regret.',
  },
  skeptic: {
    id: 'skeptic',
    name: 'The Skeptic',
    tagline: 'Assumptions & Flaws',
    avatarIcon: 'BrainCircuit',
    themeColor: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      badge: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
      accent: 'rose',
    },
    description: 'Pokes holes in wishful thinking, exposes hidden cognitive traps, and tests both sides with unvarnished clarity.',
  },
};
