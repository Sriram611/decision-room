# Decision Room 🏛️
### Multi-Persona AI Decision Deliberation & Outcome Tracking

Decision Room is a full-stack, user-authenticated application powered by **Gemini 3.6 Flash**, **Google Cloud Firestore**, and **Firebase Authentication**.

Instead of a single generative answer, three distinct personas debate your crossroads live:
1. **The Realist**: Focuses on operational runway, downside mitigation, execution friction, and risk management.
2. **The Dreamer**: Focuses on asymmetric upside, creative compounding, transformative ambition, and avoiding the tragedy of regret.
3. **The Skeptic**: Pokes holes in unexamined assumptions, detects cognitive biases (e.g. boredom vs. purpose, optimism bias), and stress-tests both sides.

---

## 🔒 Security & Privacy Architecture

- **End-to-End Client-Side Encryption**: Sensitive decision text and reflections are encrypted in the browser using the **Web Crypto API (AES-GCM 256-bit with PBKDF2 key derivation, 100,000 iterations)** before any write to Cloud Firestore.
- **Strict User Partitioning**: Cloud Firestore database paths are strictly scoped to `/users/{userId}/decisions/{decisionId}` enforcing `request.auth.uid == userId`.
- **Zero Server-Side Secret Leakage**: The `GEMINI_API_KEY` is strictly preserved on the server-side Express backend.
- **Resilient AI Model Ladder**: Automated server-side fallback across `gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash` &rarr; `gemini-2.5-flash`.

---

## 🛡️ Agentic Threat Modeling Summary

| Threat Zone | Potential Vector | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious / oversized payload injection | Top-level body limits (10mb), defensive sanitization, strict schema parsing. |
| **Planning & Reasoning** | System prompt escape / persona jailbreak | Strict persona definitions with delimited context blocks and JSON schema enforcement. |
| **Tool Execution** | API key exposure / SSRF | Server-side proxy (`/api/debate`, `/api/pattern-summary`) with Google GenAI SDK. |
| **Memory & State** | Cross-user data leakage in Firestore | Native Web Crypto AES-256 client-side encryption + owner-isolated Firestore rules. |
| **Outcome Aggregation** | Biased / fabricated insights | Strict user-scoped history computation; `< 3` resolved decisions triggers an honest fallback. |

---

## 🚀 Google Cloud Run & Secret Manager Setup

### 1. Prerequisites
Ensure you have the [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed and configured with your GCP project:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com secretmanager.googleapis.com firestore.googleapis.com
```

### 2. Secret Manager Configuration
Store your Gemini API key in Google Cloud Secret Manager:
```bash
# 1. Create the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add the secret version with your API key
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Secret Accessor role to the default Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Database Security Configuration (Firestore Security Rules)
Deploy secure, owner-bound security rules in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /decisions/{decisionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /outcomes/{outcomeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 4. Cloud Run Deployment Flow
Build and deploy the containerized full-stack application directly to Google Cloud Run:
```bash
gcloud run deploy decision-room \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

### 5. Required Campaign Verification Binding
Verify or apply the mandatory resource label to register the service for automated challenge verification:
```bash
gcloud run services update decision-room \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Walkthrough & Test Suite

### Test Case 1: Authentication & Zero-Knowledge Vault Initialization
1. **Action**: Open the landing page and click **"Sign In with Google"** (or **"Enter as Guest Strategist"**).
2. **Expected Result**: Successfully transitions to the dashboard. The navbar displays user details and the green **"AES-256 Vault: Secured"** indicator.
3. **Verification**: Click the vault indicator; verify the Web Crypto AES-256 GCM specification and user UID isolation details.

### Test Case 2: Convening the Three-Persona Council
1. **Action**: Select the **"Career"** category, input the decision *"Should I quit my job to freelance?"*, provide context, and click **"Convene Decision Council"**.
2. **Expected Result**: Transitions to the **Live Arena**. Three distinct persona cards render in sequence:
   - **The Realist**: Analyzes runway, operational drag, and downside protections.
   - **The Dreamer**: Highlights asymmetric upside, autonomy, and compounded growth.
   - **The Skeptic**: Challenges unexamined assumptions (e.g. boredom vs. calling).
3. **Verification**: Verify that the text directly references specific parameters given in your prompt.

### Test Case 3: Targeted Multi-Turn Pushback
1. **Action**: Click **"Push back on Skeptic"** or select **"skeptic"** in the pushback bar. Type *"I already have 3 paying client retainers signed for next month."* and submit.
2. **Expected Result**: The Skeptic responds directly to your new evidence while preserving the full debate context.
3. **Verification**: Check the multi-turn timeline for accurate sender tags and timestamps.

### Test Case 4: Resolving the Decision
1. **Action**: Click **"Resolve Decision"** in the header.
2. **Expected Result**: Modal opens. Select **"The Dreamer"**, add a resolution note (e.g., *"Decided to give 2 weeks notice on October 1st"*), and confirm.
3. **Verification**: The decision status updates to **Resolved**, with a chosen persona badge.

### Test Case 5: Logging Real-World Outcomes
1. **Action**: Click **"Log Outcome"** (either in the Arena or Decision History).
2. **Expected Result**: Select **"Worked out well"**, enter reflection notes, and click **"Save Outcome Log"**.
3. **Verification**: The outcome badge updates with timestamp and saved reflection.

### Test Case 6: Decision History & On-the-Fly Decryption
1. **Action**: Navigate to **"Decisions"** in the navbar.
2. **Expected Result**: All active and resolved decisions are displayed, decrypted client-side. Filter by **"Resolved"** or by persona. Click on a decision to reopen it in the Live Arena.
3. **Verification**: Test deleting records; documents are deleted purely by ID from Cloud Firestore and the device vault.

### Test Case 7: Decision Signature & Pattern Insights
1. **Action**: Navigate to **"Pattern Insights"**.
2. **Expected Result**:
   - If `< 3` resolved decisions: Displays an honest progress bar explaining that 3 decisions are required before synthesizing cognitive patterns.
   - If `>= 3` resolved decisions: Displays calculated win rates (e.g. *"You've sided with the Dreamer X times, Y had positive logged outcomes"*) and Gemini-synthesized strengths, blindspots, and tailored heuristics.
