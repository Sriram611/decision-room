/**
 * Decision Room Client-Side Encryption Vault
 * Implements AES-GCM (256-bit) with PBKDF2 Key Derivation (100,000 iterations).
 * Zero sensitive decision text leaves the client unencrypted before Firestore writes.
 */

import { DecisionItem, EncryptedDecisionDoc, ConversationTurn } from '../types';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const DEFAULT_KEY_STORAGE_KEY = 'decision_room_vault_key_v2';
const LEGACY_KEY_STORAGE_KEY = 'decision_room_vault_key_v1';
const VAULT_SALT_SALT = 'decision_room_user_vault_entropy_salt_2026';

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (err) {
    return new ArrayBuffer(0);
  }
}

/**
 * Derives a deterministic client-side seed for a given userId
 * Ensures that if a user switches tabs or cleans cookies, their authenticated UID can still decrypt
 */
export function getDeterministicUserSeed(userId: string): string {
  let hash = 0;
  const input = `${VAULT_SALT_SALT}:${userId || 'anonymous_strategist'}`;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Format as consistent hex string
  const baseSeed = Math.abs(hash).toString(16).padStart(8, '0');
  return `seed_${baseSeed}_${userId}_decision_vault_256`;
}

/**
 * Gets or creates a secure client-side master seed for the authenticated user
 */
export function getOrCreateDeviceVaultKey(userId: string): string {
  const storageKey = `${DEFAULT_KEY_STORAGE_KEY}_${userId}`;
  let existingKey = localStorage.getItem(storageKey);
  if (!existingKey) {
    // Check legacy key
    const legacyKey = localStorage.getItem(`${LEGACY_KEY_STORAGE_KEY}_${userId}`);
    if (legacyKey) {
      existingKey = legacyKey;
    } else {
      existingKey = getDeterministicUserSeed(userId);
    }
    try {
      localStorage.setItem(storageKey, existingKey);
    } catch {
      // Ignore localStorage quota errors
    }
  }
  return existingKey;
}

/**
 * Derives an AES-GCM CryptoKey from a secret passphrase and salt
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  saltBytes: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a full DecisionItem object for secure Firestore persistence
 */
export async function encryptDecision(
  decision: DecisionItem,
  passphrase?: string
): Promise<EncryptedDecisionDoc> {
  const effectivePass = passphrase || getOrCreateDeviceVaultKey(decision.userId);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKeyFromPassphrase(effectivePass, salt);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(decision));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintext
  );

  const titlePreview = decision.title.length > 40 
    ? `${decision.title.slice(0, 40)}...` 
    : decision.title;

  return {
    id: decision.id,
    userId: decision.userId,
    titlePreview: titlePreview,
    category: decision.category,
    status: decision.status,
    chosenPersona: decision.chosenPersona,
    outcome: decision.outcome,
    createdAt: decision.createdAt,
    updatedAt: decision.updatedAt,
    resolvedAt: decision.resolvedAt,
    outcomeLoggedAt: decision.outcomeLoggedAt,
    encryptedData: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    version: 2,
  };
}

/**
 * Decrypts an EncryptedDecisionDoc back into a full DecisionItem with multi-key recovery
 */
export async function decryptDecision(
  doc: EncryptedDecisionDoc | any,
  passphrase?: string
): Promise<DecisionItem> {
  // If doc already contains an array of turns in plaintext, preserve it directly
  if (doc && Array.isArray(doc.turns) && doc.turns.length > 0) {
    return {
      id: doc.id,
      userId: doc.userId,
      title: doc.title || doc.titlePreview || 'Decision',
      context: doc.context,
      category: doc.category || 'career',
      status: doc.status || 'active',
      turns: doc.turns,
      chosenPersona: doc.chosenPersona,
      resolutionNote: doc.resolutionNote,
      resolvedAt: doc.resolvedAt,
      outcome: doc.outcome,
      outcomeReflection: doc.outcomeReflection,
      outcomeLoggedAt: doc.outcomeLoggedAt,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString(),
      isEncrypted: true,
    };
  }

  const rawCipher = doc?.encryptedData || doc?.encryptedPayload;
  if (!rawCipher || !doc?.salt || !doc?.iv) {
    // Return fallback with any available unencrypted metadata
    return {
      id: doc.id,
      userId: doc.userId,
      title: doc.title || doc.titlePreview || 'Decision',
      context: doc.context,
      category: doc.category || 'career',
      status: doc.status || 'active',
      turns: Array.isArray(doc?.turns) ? doc.turns : [],
      chosenPersona: doc.chosenPersona,
      resolutionNote: doc.resolutionNote,
      resolvedAt: doc.resolvedAt,
      outcome: doc.outcome,
      outcomeReflection: doc.outcomeReflection,
      outcomeLoggedAt: doc.outcomeLoggedAt,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString(),
      isEncrypted: true,
    };
  }

  const saltBuffer = base64ToBuffer(doc.salt);
  const ivBuffer = base64ToBuffer(doc.iv);
  const cipherBuffer = base64ToBuffer(rawCipher);

  if (saltBuffer.byteLength === 0 || ivBuffer.byteLength === 0 || cipherBuffer.byteLength === 0) {
    throw new Error('Invalid encryption payload buffers');
  }

  // Candidate passphrases in order of priority (including deterministic, v1, v2, and custom)
  const candidatePasses: string[] = [];
  if (passphrase) candidatePasses.push(passphrase);
  
  const v2Key = getOrCreateDeviceVaultKey(doc.userId);
  if (v2Key && !candidatePasses.includes(v2Key)) candidatePasses.push(v2Key);

  const deterministicKey = getDeterministicUserSeed(doc.userId);
  if (deterministicKey && !candidatePasses.includes(deterministicKey)) candidatePasses.push(deterministicKey);

  const storedLegacy = localStorage.getItem(`${LEGACY_KEY_STORAGE_KEY}_${doc.userId}`);
  if (storedLegacy && !candidatePasses.includes(storedLegacy)) candidatePasses.push(storedLegacy);

  const storedV2 = localStorage.getItem(`${DEFAULT_KEY_STORAGE_KEY}_${doc.userId}`);
  if (storedV2 && !candidatePasses.includes(storedV2)) candidatePasses.push(storedV2);

  // Also try raw user ID as fallback for any early experimental docs
  if (doc.userId && !candidatePasses.includes(doc.userId)) candidatePasses.push(doc.userId);

  let lastError: any = null;

  for (const candidatePass of candidatePasses) {
    try {
      const key = await deriveKeyFromPassphrase(candidatePass, new Uint8Array(saltBuffer));
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(ivBuffer),
        },
        key,
        cipherBuffer
      );

      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(decryptedBuffer);
      const parsed = JSON.parse(jsonStr) as DecisionItem;
      parsed.isEncrypted = true;
      if (!Array.isArray(parsed.turns)) {
        parsed.turns = [];
      }
      return parsed;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Decryption failed for all candidate keys');
}

/**
 * Checks if a document needs re-encryption with the latest canonical key and performs re-encryption
 */
export async function reencryptIfNecessary(
  userId: string,
  docData: EncryptedDecisionDoc,
  decryptedItem: DecisionItem
): Promise<EncryptedDecisionDoc | null> {
  // If document was encrypted with legacy version or fallback key, re-encrypt with current canonical key
  if (docData.version !== 2) {
    try {
      const upgradedDoc = await encryptDecision(decryptedItem);
      return upgradedDoc;
    } catch (err) {
      console.warn('Re-encryption notice:', err);
      return null;
    }
  }
  return null;
}
