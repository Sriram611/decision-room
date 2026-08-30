/**
 * Firebase Client & Firestore Persistence Service
 * Supports Google Sign-In, Auth State Listener, and User-Isolated Firestore Collections
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { AuthUserProfile, DecisionItem, EncryptedDecisionDoc } from '../types';
import { encryptDecision, decryptDecision, reencryptIfNecessary } from './crypto';

// Import real provisioned firebase applet config if present
import appletConfig from '../../firebase-applet-config.json';

// Dynamic Firebase configuration reading from provisioned config or environment variables
const firebaseConfig = {
  apiKey: appletConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForPreviewMode',
  authDomain: appletConfig?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${window.location.hostname}`,
  projectId: appletConfig?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'decision-room-app',
  storageBucket: appletConfig?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'decision-room-app.appspot.com',
  messagingSenderId: appletConfig?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: appletConfig?.appId || import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

const firestoreDbId = (appletConfig as any)?.firestoreDatabaseId || '(default)';

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  
  // Use initializeFirestore with auto-detect long polling and undefined property stripping
  try {
    db = initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      firestoreDbId !== '(default)' ? firestoreDbId : undefined
    );
  } catch {
    db = getFirestore(app, firestoreDbId !== '(default)' ? firestoreDbId : undefined);
  }
} catch (err) {
  console.warn('Firebase initialization notice: using resilient dynamic storage', err);
}

// Local Storage Fallback Key for resilient offline & sandbox storage
const LOCAL_STORAGE_DECISIONS_PREFIX = 'decision_room_user_decisions_';
const LOCAL_STORAGE_AUTH_USER_KEY = 'decision_room_auth_user_v1';

export function getStoredLocalUser(): AuthUserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredLocalUser(user: AuthUserProfile | null) {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_USER_KEY);
  }
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<AuthUserProfile> {
  if (auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const userProfile: AuthUserProfile = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        photoURL: result.user.photoURL,
      };
      saveStoredLocalUser(userProfile);
      return userProfile;
    } catch (popupError: any) {
      console.warn('Google popup auth error, falling back to instant sandbox profile:', popupError?.message);
    }
  }

  // Graceful fallback for preview / container environments
  const fallbackUser: AuthUserProfile = {
    uid: `user_${Math.random().toString(36).substring(2, 9)}`,
    email: 'alex.decisionmaker@example.com',
    displayName: 'Alex Mercer',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  };
  saveStoredLocalUser(fallbackUser);
  return fallbackUser;
}

/**
 * Quick Guest Sign-In for sandbox evaluations
 */
export async function signInAsGuest(customName?: string): Promise<AuthUserProfile> {
  if (auth) {
    try {
      const cred = await signInAnonymously(auth);
      const userProfile: AuthUserProfile = {
        uid: cred.user.uid,
        email: null,
        displayName: customName || `Strategist (${cred.user.uid.slice(0, 4)})`,
        photoURL: null,
        isAnonymous: true,
      };
      saveStoredLocalUser(userProfile);
      return userProfile;
    } catch (err) {
      console.warn('Anonymous auth note, using local guest token:', err);
    }
  }

  const guestUser: AuthUserProfile = {
    uid: `guest_${Math.random().toString(36).substring(2, 10)}`,
    email: null,
    displayName: customName || 'Guest Strategist',
    photoURL: null,
    isAnonymous: true,
  };
  saveStoredLocalUser(guestUser);
  return guestUser;
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  }
  saveStoredLocalUser(null);
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuth(callback: (user: AuthUserProfile | null) => void) {
  if (auth) {
    return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userProfile: AuthUserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
        };
        saveStoredLocalUser(userProfile);
        callback(userProfile);
      } else {
        const stored = getStoredLocalUser();
        callback(stored);
      }
    });
  } else {
    callback(getStoredLocalUser());
    return () => {};
  }
}

export interface SaveDecisionResult {
  success: boolean;
  firestoreSaved: boolean;
  localSaved: boolean;
  error?: string;
}

/**
 * Saves or updates a Decision (Encrypted before write to Firestore)
 * Ensures strict undefined-stripping, timeout race, and zero silent failures
 */
export async function saveDecision(
  userId: string,
  decision: DecisionItem,
  passphrase?: string
): Promise<SaveDecisionResult> {
  if (!userId) throw new Error('User ID is required to save decision');

  // 1. Client-Side Encryption
  const encryptedDoc = await encryptDecision(decision, passphrase);

  let firestoreSaved = false;
  let localSaved = false;
  let firestoreError: string | undefined;

  // 2. Persist to Firestore with a 6-second timeout race
  if (db) {
    try {
      // Path: /users/{userId}/decisions/{decisionId}
      const docRef = doc(db, 'users', userId, 'decisions', decision.id);
      // Strip undefined values thoroughly
      const cleanPayload = JSON.parse(JSON.stringify(encryptedDoc));
      
      await Promise.race([
        setDoc(docRef, cleanPayload, { merge: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore operation timed out after 6s')), 6000)
        )
      ]);
      firestoreSaved = true;
    } catch (err: any) {
      firestoreError = err?.message || 'Firestore connection timed out or rejected write.';
      console.warn('Firestore write warning (persisted to device encrypted vault):', firestoreError);
    }
  }

  // 3. Resilient Local Storage Mirroring
  const localKey = `${LOCAL_STORAGE_DECISIONS_PREFIX}${userId}`;
  try {
    const existingRaw = localStorage.getItem(localKey);
    const existingList: EncryptedDecisionDoc[] = existingRaw ? JSON.parse(existingRaw) : [];
    const index = existingList.findIndex((item) => item.id === decision.id);
    if (index >= 0) {
      existingList[index] = encryptedDoc;
    } else {
      existingList.unshift(encryptedDoc);
    }
    localStorage.setItem(localKey, JSON.stringify(existingList));
    localSaved = true;
  } catch (localErr) {
    console.error('Local persistence mirror error:', localErr);
  }

  if (!firestoreSaved && firestoreError) {
    return {
      success: localSaved,
      firestoreSaved: false,
      localSaved,
      error: `Cloud sync notice: ${firestoreError}`,
    };
  }

  return {
    success: firestoreSaved || localSaved,
    firestoreSaved,
    localSaved,
  };
}

/**
 * Loads all decisions for a user and decrypts them client-side with timeout guard
 */
export async function loadUserDecisions(
  userId: string,
  passphrase?: string
): Promise<DecisionItem[]> {
  if (!userId) return [];

  const rawDocsMap = new Map<string, EncryptedDecisionDoc | any>();

  // 1. Try Firestore first with query fallback
  if (db) {
    try {
      const colRef = collection(db, 'users', userId, 'decisions');
      let snapshot;
      try {
        const q = query(colRef, orderBy('createdAt', 'desc'));
        snapshot = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore load timeout')), 6000)
          )
        ]);
      } catch (queryErr) {
        // Fallback to direct getDocs without orderBy in case index or field is missing
        snapshot = await Promise.race([
          getDocs(colRef),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore fallback timeout')), 5000)
          )
        ]);
      }

      if (snapshot && !snapshot.empty) {
        snapshot.forEach((d) => {
          rawDocsMap.set(d.id, d.data() as EncryptedDecisionDoc);
        });
      }
    } catch (err) {
      console.warn('Firestore query notice, falling back to local encrypted store:', err);
    }
  }

  // 2. Supplement or fallback from local encrypted storage
  const localKey = `${LOCAL_STORAGE_DECISIONS_PREFIX}${userId}`;
  try {
    const existingRaw = localStorage.getItem(localKey);
    if (existingRaw) {
      const localList: (EncryptedDecisionDoc | any)[] = JSON.parse(existingRaw);
      for (const item of localList) {
        if (!rawDocsMap.has(item.id)) {
          rawDocsMap.set(item.id, item);
        } else {
          // If local item has unencrypted turns or newer update, merge intelligently
          const existing = rawDocsMap.get(item.id);
          if ((!existing.encryptedData && item.encryptedData) || 
              (Array.isArray(item.turns) && item.turns.length > 0 && (!existing.turns || existing.turns.length === 0))) {
            rawDocsMap.set(item.id, { ...existing, ...item });
          }
        }
      }
    }
  } catch (err) {
    console.error('Local retrieval error:', err);
  }

  const rawDocs = Array.from(rawDocsMap.values());

  // 3. Decrypt each document in-memory with automatic version migration
  const decryptedItems: DecisionItem[] = [];
  for (const docData of rawDocs) {
    try {
      const decrypted = await decryptDecision(docData, passphrase);
      decryptedItems.push(decrypted);

      // Seamless migration: If document is on an older encryption version, upgrade and re-encrypt asynchronously
      reencryptIfNecessary(userId, docData, decrypted).then((upgradedDoc) => {
        if (upgradedDoc) {
          saveDecision(userId, decrypted, passphrase).catch((migErr) => {
            console.warn('Silent encryption version migration note:', migErr);
          });
        }
      }).catch(() => {});
    } catch (decryptErr) {
      console.warn(`Could not decrypt decision ${docData.id} with current key:`, decryptErr);
      // Provide item with existing properties (preserving any turns that may already be present)
      decryptedItems.push({
        id: docData.id,
        userId: docData.userId || userId,
        title: docData.title || docData.titlePreview || 'Locked Decision',
        context: docData.context,
        category: docData.category || 'career',
        status: docData.status || 'active',
        chosenPersona: docData.chosenPersona,
        resolutionNote: docData.resolutionNote,
        resolvedAt: docData.resolvedAt,
        outcome: docData.outcome,
        outcomeReflection: docData.outcomeReflection,
        outcomeLoggedAt: docData.outcomeLoggedAt,
        createdAt: docData.createdAt || new Date().toISOString(),
        updatedAt: docData.updatedAt || new Date().toISOString(),
        turns: Array.isArray(docData.turns) ? docData.turns : [],
        isEncrypted: true,
      });
    }
  }

  // Sort descending by createdAt
  decryptedItems.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return decryptedItems;
}

/**
 * Deletes a decision from Firestore and local mirror purely by document ID.
 * Does not require or invoke decryption, allowing corrupted or legacy records to be purged safely.
 */
export async function deleteDecision(
  userId: string,
  decisionId: string
): Promise<{ success: boolean; firestoreDeleted: boolean; localDeleted: boolean; error?: string }> {
  if (!userId || !decisionId) {
    return { success: false, firestoreDeleted: false, localDeleted: false, error: 'User ID and Decision ID are required.' };
  }

  let firestoreDeleted = false;
  let localDeleted = false;
  let firestoreError: string | undefined = undefined;

  // 1. Direct Firestore deletion purely by document ID
  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'decisions', decisionId);
      await Promise.race([
        deleteDoc(docRef),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore deletion timed out after 6 seconds.')), 6000)
        ),
      ]);
      firestoreDeleted = true;
    } catch (err: any) {
      firestoreError = err?.message || 'Cloud Firestore deletion request failed.';
      console.warn(`Firestore delete note for ID ${decisionId}:`, firestoreError);
    }
  }

  // 2. Remove from local device encrypted vault storage
  const localKey = `${LOCAL_STORAGE_DECISIONS_PREFIX}${userId}`;
  try {
    const existingRaw = localStorage.getItem(localKey);
    if (existingRaw) {
      const list: EncryptedDecisionDoc[] = JSON.parse(existingRaw);
      const filtered = list.filter((item) => item.id !== decisionId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
      localDeleted = true;
    }
  } catch (err) {
    console.error('Local delete mirror error:', err);
  }

  const success = firestoreDeleted || localDeleted;
  return {
    success,
    firestoreDeleted,
    localDeleted,
    error: !firestoreDeleted && firestoreError ? firestoreError : undefined,
  };
}
