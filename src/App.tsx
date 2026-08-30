/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthUserProfile, 
  DecisionItem, 
  PersonaType, 
  OutcomeType, 
  ConversationTurn 
} from './types';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signInAsGuest, 
  signOutUser, 
  saveDecision, 
  loadUserDecisions, 
  deleteDecision 
} from './lib/firebase';
import { requestDebateTurn } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { NewDecisionForm } from './components/NewDecisionForm';
import { DebateArena } from './components/DebateArena';
import { DecisionHistory } from './components/DecisionHistory';
import { PatternInsights } from './components/PatternInsights';
import { ResolutionModal } from './components/ResolutionModal';
import { OutcomeModal } from './components/OutcomeModal';
import { EncryptionVaultModal } from './components/EncryptionVaultModal';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'new' | 'arena' | 'history' | 'insights'>('new');
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [activeDecision, setActiveDecision] = useState<DecisionItem | null>(null);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('');
  
  // Modals state
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [outcomeTargetDecision, setOutcomeTargetDecision] = useState<DecisionItem | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // Loading & Alert states
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingDebate, setIsLoadingDebate] = useState(false);
  const [isDeletingDecisionId, setIsDeletingDecisionId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [cloudSyncWarning, setCloudSyncWarning] = useState<string | null>(null);
  const [pendingSaveDecisionItem, setPendingSaveDecisionItem] = useState<DecisionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Retry failed cloud Firestore write
  const handleRetryCloudSave = async () => {
    if (!user || !pendingSaveDecisionItem) return;
    try {
      const result = await saveDecision(user.uid, pendingSaveDecisionItem);
      if (result.firestoreSaved) {
        setCloudSyncWarning(null);
        setPendingSaveDecisionItem(null);
        showToast('Successfully synced encrypted decision to Cloud Firestore!');
      } else {
        showToast('Cloud sync still attempting reconnect. Data safe in local vault.', 'error');
      }
    } catch (err: any) {
      showToast('Cloud retry error. Local storage remains intact.', 'error');
    }
  };

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authUser) => {
      setUser(authUser);
      if (authUser) {
        loadDecisionsForUser(authUser.uid);
      } else {
        setDecisions([]);
        setActiveDecision(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadDecisionsForUser = async (uid: string) => {
    try {
      const userDecisions = await loadUserDecisions(uid);
      setDecisions(userDecisions);
    } catch (err) {
      console.error('Error loading decisions:', err);
    }
  };

  // Auth Handlers
  const handleSignInGoogle = async () => {
    setIsLoadingAuth(true);
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
      await loadDecisionsForUser(profile.uid);
      showToast(`Welcome back, ${profile.displayName || 'Strategist'}!`);
    } catch (err: any) {
      showToast(err?.message || 'Authentication encountered an issue.', 'error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignInGuest = async () => {
    setIsLoadingAuth(true);
    try {
      const profile = await signInAsGuest();
      setUser(profile);
      await loadDecisionsForUser(profile.uid);
      showToast('Entered as Guest Strategist. Private vault active.');
    } catch (err: any) {
      showToast(err?.message || 'Guest session initialization failed.', 'error');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setActiveDecision(null);
    setDecisions([]);
    setCurrentView('new');
    showToast('Signed out of Decision Room.');
  };

  // Start a brand new decision
  const handleCreateDecision = async (formData: {
    title: string;
    context: string;
    category: 'career' | 'finance' | 'personal' | 'business' | 'relationships' | 'other';
  }) => {
    if (!user) return;
    setIsLoadingDebate(true);
    setSubmissionError(null);

    const newDecisionId = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    try {
      // 1. Request 3-Persona initial debate from server/Gemini with fallback ladder
      const debateResult = await requestDebateTurn({
        decisionTitle: formData.title,
        context: formData.context,
        category: formData.category,
        history: [],
        targetPersona: 'all',
        timeoutMs: 45000,
      });

      setActiveModelUsed(debateResult.model || 'gemini-3.6-flash');

      // 2. Build conversation turns
      const turns: ConversationTurn[] = debateResult.responses.map((resp, i) => ({
        id: `turn_${Date.now()}_${i}`,
        sender: resp.persona,
        content: resp.content,
        headline: resp.headline,
        keyQuestionOrRisk: resp.keyQuestionOrRisk,
        timestamp: new Date(Date.now() + i * 500).toISOString(),
      }));

      const newDecision: DecisionItem = {
        id: newDecisionId,
        userId: user.uid,
        title: formData.title,
        context: formData.context,
        category: formData.category,
        status: 'active',
        turns: turns,
        createdAt: nowIso,
        updatedAt: nowIso,
        isEncrypted: true,
      };

      // 3. Save to Firestore (AES-256 encrypted) with zero silent failures
      const saveResult = await saveDecision(user.uid, newDecision);
      if (!saveResult.firestoreSaved && saveResult.error) {
        setCloudSyncWarning(saveResult.error);
        setPendingSaveDecisionItem(newDecision);
      }

      // 4. Update state
      setActiveDecision(newDecision);
      setDecisions((prev) => [newDecision, ...prev]);
      setCurrentView('arena');
      setSubmissionError(null);
      showToast('Decision council convened with 3 distinct perspectives.');
    } catch (err: any) {
      console.error('Error starting debate:', err);
      const errMsg = err?.message || 'The persona engine took too long to respond or encountered a connection error.';
      setSubmissionError(errMsg);
      showToast('Could not convene council within timeout. Please retry.', 'error');
    } finally {
      setIsLoadingDebate(false);
    }
  };

  // Push back or reply to personas in multi-turn conversation
  const handleSendPushback = async (userReply: string, targetPersona: PersonaType | 'all') => {
    if (!user || !activeDecision) return;
    setIsLoadingDebate(true);

    const nowIso = new Date().toISOString();

    // 1. Create User turn
    const userTurn: ConversationTurn = {
      id: `turn_user_${Date.now()}`,
      sender: 'user',
      targetPersona: targetPersona,
      content: userReply,
      timestamp: nowIso,
    };

    const updatedTurns = [...activeDecision.turns, userTurn];
    const optimisticDecision: DecisionItem = {
      ...activeDecision,
      turns: updatedTurns,
      updatedAt: nowIso,
    };

    setActiveDecision(optimisticDecision);

    try {
      // 2. Request persona rebuttal from Gemini API with timeout
      const debateResult = await requestDebateTurn({
        decisionTitle: activeDecision.title,
        context: activeDecision.context,
        category: activeDecision.category,
        history: updatedTurns,
        targetPersona: targetPersona,
        userReply: userReply,
        timeoutMs: 45000,
      });

      setActiveModelUsed(debateResult.model || 'gemini-3.6-flash');

      // 3. Append Persona turns
      const personaTurns: ConversationTurn[] = debateResult.responses.map((resp, i) => ({
        id: `turn_resp_${Date.now()}_${i}`,
        sender: resp.persona,
        content: resp.content,
        headline: resp.headline,
        keyQuestionOrRisk: resp.keyQuestionOrRisk,
        timestamp: new Date(Date.now() + (i + 1) * 400).toISOString(),
      }));

      const finalDecision: DecisionItem = {
        ...optimisticDecision,
        turns: [...updatedTurns, ...personaTurns],
        updatedAt: new Date().toISOString(),
      };

      // 4. Persist updated decision
      const saveResult = await saveDecision(user.uid, finalDecision);
      if (!saveResult.firestoreSaved && saveResult.error) {
        setCloudSyncWarning(saveResult.error);
        setPendingSaveDecisionItem(finalDecision);
      }

      setActiveDecision(finalDecision);
      setDecisions((prev) =>
        prev.map((d) => (d.id === finalDecision.id ? finalDecision : d))
      );
    } catch (err: any) {
      console.error('Error in pushback:', err);
      showToast('Could not process pushback. Preserved input in local state.', 'error');
    } finally {
      setIsLoadingDebate(false);
    }
  };

  // Mark decision as Resolved
  const handleConfirmResolve = async (
    chosenPersona: PersonaType | 'hybrid' | 'self',
    resolutionNote: string
  ) => {
    if (!user || !activeDecision) return;

    const nowIso = new Date().toISOString();
    const resolvedItem: DecisionItem = {
      ...activeDecision,
      status: 'resolved',
      chosenPersona,
      resolutionNote,
      resolvedAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await saveDecision(user.uid, resolvedItem);
      setActiveDecision(resolvedItem);
      setDecisions((prev) =>
        prev.map((d) => (d.id === resolvedItem.id ? resolvedItem : d))
      );
      setIsResolutionOpen(false);
      showToast(`Decision resolved in alignment with ${chosenPersona.toUpperCase()}.`);
    } catch (err: any) {
      showToast('Failed to save resolution. Please retry.', 'error');
    }
  };

  // Log real-world outcome
  const handleSaveOutcome = async (outcome: OutcomeType, reflection: string) => {
    const target = outcomeTargetDecision || activeDecision;
    if (!user || !target) return;

    const nowIso = new Date().toISOString();
    const updatedWithOutcome: DecisionItem = {
      ...target,
      outcome,
      outcomeReflection: reflection,
      outcomeLoggedAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await saveDecision(user.uid, updatedWithOutcome);
      if (activeDecision && activeDecision.id === target.id) {
        setActiveDecision(updatedWithOutcome);
      }
      setDecisions((prev) =>
        prev.map((d) => (d.id === updatedWithOutcome.id ? updatedWithOutcome : d))
      );
      setIsOutcomeOpen(false);
      setOutcomeTargetDecision(null);
      showToast('Real-world outcome logged successfully.');
    } catch (err) {
      showToast('Could not save outcome log.', 'error');
    }
  };

  // Delete decision (purely by document ID without requiring decryption)
  const handleDeleteDecision = async (decisionId: string) => {
    if (!user) {
      showToast('Please sign in to delete records.', 'error');
      return;
    }

    setIsDeletingDecisionId(decisionId);
    try {
      const result = await deleteDecision(user.uid, decisionId);
      
      // Update UI state immediately
      setDecisions((prev) => prev.filter((d) => d.id !== decisionId));
      
      if (activeDecision?.id === decisionId) {
        setActiveDecision(null);
        setCurrentView('history');
      }

      if (result.firestoreDeleted) {
        showToast('Decision permanently removed from Cloud Firestore and device vault.');
      } else if (result.localDeleted) {
        showToast('Decision removed from local encrypted vault.');
      } else if (result.error) {
        showToast(`Deletion note: ${result.error}`, 'error');
      } else {
        showToast('Decision removed from history list.');
      }
    } catch (err: any) {
      console.error('Delete error in App:', err);
      showToast(err?.message || 'Failed to delete decision record.', 'error');
    } finally {
      setIsDeletingDecisionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Cloud Sync Warning Banner */}
      {cloudSyncWarning && (
        <div 
          id="cloud-sync-warning-banner"
          className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3 sticky top-16 z-40 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-100">Cloud Sync Notice:</strong> Your decision is encrypted and saved safely to local device storage, but remote Firestore sync timed out.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-retry-cloud-save"
              onClick={handleRetryCloudSave}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold text-[11px] shadow-sm transition-colors"
            >
              Retry Cloud Save
            </button>
            <button
              onClick={() => setCloudSyncWarning(null)}
              className="p-1 text-amber-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'new') {
            setActiveDecision(null);
          }
          setCurrentView(view);
        }}
        onSignOut={handleSignOut}
        onOpenVault={() => setIsVaultOpen(true)}
        hasActiveDecision={Boolean(activeDecision)}
        historyCount={decisions.length}
      />

      {/* Main Application Flow */}
      <main className="flex-1">
        {!user ? (
          <LandingPage
            onSignInWithGoogle={handleSignInGoogle}
            onSignInAsGuest={handleSignInGuest}
            isLoading={isLoadingAuth}
          />
        ) : (
          <>
            {currentView === 'new' && (
              <NewDecisionForm
                onSubmit={handleCreateDecision}
                isLoading={isLoadingDebate}
                submissionError={submissionError}
                onClearError={() => setSubmissionError(null)}
              />
            )}

            {currentView === 'arena' && activeDecision && (
              <DebateArena
                decision={activeDecision}
                onSendPushback={handleSendPushback}
                onOpenResolutionModal={() => setIsResolutionOpen(true)}
                onOpenOutcomeModal={() => {
                  setOutcomeTargetDecision(activeDecision);
                  setIsOutcomeOpen(true);
                }}
                onDeleteDecision={handleDeleteDecision}
                isLoading={isLoadingDebate}
                activeModelUsed={activeModelUsed}
                isDeleting={isDeletingDecisionId === activeDecision.id}
              />
            )}

            {currentView === 'history' && (
              <DecisionHistory
                decisions={decisions}
                onSelectDecision={(dec) => {
                  setActiveDecision(dec);
                  setCurrentView('arena');
                }}
                onNewDecision={() => {
                  setActiveDecision(null);
                  setCurrentView('new');
                }}
                onDeleteDecision={handleDeleteDecision}
                isDeletingDecisionId={isDeletingDecisionId}
                onOpenOutcomeModal={(dec) => {
                  setOutcomeTargetDecision(dec);
                  setIsOutcomeOpen(true);
                }}
              />
            )}

            {currentView === 'insights' && (
              <PatternInsights decisions={decisions} />
            )}
          </>
        )}
      </main>

      {/* Resolution Modal */}
      {activeDecision && (
        <ResolutionModal
          decision={activeDecision}
          isOpen={isResolutionOpen}
          onClose={() => setIsResolutionOpen(false)}
          onConfirmResolve={handleConfirmResolve}
        />
      )}

      {/* Outcome Modal */}
      {(outcomeTargetDecision || activeDecision) && (
        <OutcomeModal
          decision={outcomeTargetDecision || activeDecision!}
          isOpen={isOutcomeOpen}
          onClose={() => {
            setIsOutcomeOpen(false);
            setOutcomeTargetDecision(null);
          }}
          onSaveOutcome={handleSaveOutcome}
        />
      )}

      {/* Encryption Vault Modal */}
      {user && (
        <EncryptionVaultModal
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
          userId={user.uid}
        />
      )}

    </div>
  );
}
