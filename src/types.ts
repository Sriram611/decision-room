export type PersonaType = 'realist' | 'dreamer' | 'skeptic';

export interface PersonaProfile {
  id: PersonaType;
  name: string;
  tagline: string;
  avatarIcon: string;
  themeColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    accent: string;
  };
  description: string;
}

export interface PersonaResponse {
  persona: PersonaType;
  headline: string;
  content: string;
  keyQuestionOrRisk: string;
  confidenceScore?: number;
}

export interface ConversationTurn {
  id: string;
  sender: 'user' | PersonaType;
  targetPersona?: PersonaType | 'all';
  content: string;
  headline?: string;
  keyQuestionOrRisk?: string;
  timestamp: string;
}

export type DecisionStatus = 'active' | 'resolved';

export type OutcomeType = 'worked_well' | 'mixed' | 'regret' | 'too_early' | 'pending';

export interface DecisionItem {
  id: string;
  userId: string;
  title: string;
  context?: string;
  category?: 'career' | 'finance' | 'personal' | 'business' | 'relationships' | 'other';
  status: DecisionStatus;
  turns: ConversationTurn[];
  chosenPersona?: PersonaType | 'hybrid' | 'self' | null;
  resolutionNote?: string;
  resolvedAt?: string;
  outcome?: OutcomeType;
  outcomeReflection?: string;
  outcomeLoggedAt?: string;
  createdAt: string;
  updatedAt: string;
  isEncrypted?: boolean;
}

export interface EncryptedDecisionDoc {
  id: string;
  userId: string;
  titlePreview: string; // Sanitized short non-sensitive preview or hash
  category?: string;
  status: DecisionStatus;
  chosenPersona?: PersonaType | 'hybrid' | 'self' | null;
  outcome?: OutcomeType;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  outcomeLoggedAt?: string;
  encryptedData: string; // Base64 ciphertext of full DecisionItem JSON
  iv: string; // Base64 IV
  salt: string; // Base64 Salt
  version: number;
}

export interface PatternAnalytics {
  totalDecisions: number;
  resolvedDecisions: number;
  personaInfluenceCounts: {
    realist: number;
    dreamer: number;
    skeptic: number;
    hybrid: number;
    self: number;
  };
  outcomeCounts: {
    worked_well: number;
    mixed: number;
    regret: number;
    too_early: number;
    pending: number;
  };
  personaOutcomes: Record<
    string,
    {
      total: number;
      worked_well: number;
      mixed: number;
      regret: number;
      too_early: number;
    }
  >;
  hasEnoughHistory: boolean;
  aiInsightSummary?: string;
  topStrengths?: string[];
  blindspots?: string[];
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}
