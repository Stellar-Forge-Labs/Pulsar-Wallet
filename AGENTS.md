# AGENTS.md - Pulsar Wallet

This file contains context for Pulsar Wallet to avoid losing project context during sessions.

## ⚠️ IMPORTANT AGENT INSTRUCTION

**DO NOT UPDATE OR MODIFY IMPLEMENTATION.md AFTER INITIAL COMPLETION**

The `IMPLEMENTATION.md` file is the authoritative single-source-of-truth for the project roadmap and architecture. It is maintained and updated **only by the user** through explicit requests. Agents must:

- ✅ **READ** IMPLEMENTATION.md to understand the roadmap and completed phases
- ✅ **REFERENCE** IMPLEMENTATION.md when asked about project status
- ❌ **NEVER** automatically update IMPLEMENTATION.md based on code changes
- ❌ **NEVER** modify sections marked as "COMPLETE"
- ❌ **NEVER** change phase descriptions or task lists without explicit user instruction

If the roadmap needs updating, the user will explicitly request it. When referencing phases, always link to the current [IMPLEMENTATION.md](IMPLEMENTATION.md) file.

## Brand

**Project Name:** Pulsar Wallet  
**Tagline:** Your Gateway to Stellar  
**Positioning:** The MetaMask for Stellar  

## Brand Personality

- Modern
- Clean
- Fast
- Trustworthy
- Developer-friendly
- Security-first

## Technical Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Browser Extension:** Manifest V3
- **Blockchain SDK:** Stellar SDK
- **Wallet Standard:** Stellar Wallet Kit
- **Storage:** Chrome Storage API + encrypted local storage
- **Cryptography:** Web Crypto API
- **Testing:** Vitest + Playwright
- **Linting:** ESLint 9 (flat config) + Prettier

## Current Project Structure

```
Pulsar-Wallet/
├── frontend/
│   ├── public/
│   │   ├── manifest.json
│   │   └── icon-{16,32,128}.png
│   ├── scripts/
│   │   ├── generate-icons.js
│   │   └── package.js
│   ├── src/
│   │   ├── background/
│   │   │   └── index.ts
│   │   ├── content/
│   │   │   └── index.ts
│   │   ├── popup/
│   │   │   ├── index.tsx
│   │   │   └── PopupApp.tsx
│   │   ├── stores/
│   │   │   ├── wallet.ts
│   │   │   ├── network.ts
│   │   │   ├── ui.ts
│   │   │   └── connection.ts
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── crypto/
│   │   │   ├── crypto.ts
│   │   │   ├── storage.ts
│   │   │   └── session.ts
│   │   ├── test/
│   │   │   └── setup.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── wallet.test.ts
│   │   │   └── crypto.test.ts
│   │   └── e2e/
│   │       └── playwright.setup.ts
│   ├── dist/
│   └── package.json
├── contracts/
├── backend/
├── tests/
├── README.md
└── AGENTS.md
```

## Build Artifacts

After `npm run build` in `frontend/`:
- `dist/popup.html` — Extension popup entry
- `dist/popup.js` — Popup JS bundle (React app)
- `dist/popup.css` — Bundled Tailwind styles
- `dist/background.js` — Service worker
- `dist/content.js` — Content script
- `dist/manifest.json` — MV3 manifest
- `dist/icon-{16,32,128}.png` — Extension icons
- `dist/pulsar-wallet-extension.zip` — Packaged build

## CI Scripts

From `frontend/`:
- `npm run ci:lint` — ESLint with zero warnings
- `npm run ci:typecheck` — TypeScript --noEmit
- `npm run ci:test` — Vitest unit tests
- `npm run ci:build` — Vite production build

## Extension Shell (Phase 1 Complete)

- Popup renders a lock/unlock UI with network badge, send/receive placeholders, auto-lock timer, and wallet reset.
- Background service worker handles auto-lock alarms and forwards messages.
- Content script loads on all pages (placeholder for future provider injection).
- Manifest V3 restricts permissions to `storage`, `activeTab`, and `alarms`.

## Cryptography & Key Management (Phase 2 Complete)

- Implemented BIP-39 mnemonic generation and validation via `stellar-hd-wallet`.
- Implemented SLIP-0010 ed25519 key derivation for Stellar keypairs (`m/44'/148'/n'`).
- Implemented StrKey encode/decode using `@stellar/stellar-base`.
- Implemented password-based encryption using Web Crypto API (PBKDF2 + AES-256-GCM).
- Implemented secure `chrome.storage.local` wrapper that only persists encrypted blobs.
- Implemented in-memory `SessionKeyManager` that clears key material on lock/reset.
- Added unit tests for keypair creation, secret import, and mnemonic validation.

## Popup Flows (Phase 2 Complete)

- Unlock screen with password prompt.
- Create Wallet flow: generates 24-word mnemonic, enforces password strength, shows backup phrase.
- Import Wallet flow: accepts mnemonic or raw secret key, validates input.
- Lock and Reset Wallet actions wired to session clearing and storage cleanup.

## Onboarding & Auto-Lock (Phase 3 Complete)

- Password strength meter with Weak/Medium/Strong labels on create/import screens.
- Mnemonic backup confirmation quiz: after viewing the 24-word phrase, user must select the correct word for a random position before proceeding.
- Onboarding completion flag persisted in encrypted storage; returning users skip straight to unlock.
- Auto-lock alarm wired from background service worker to popup: on expiry, wallet locks and session clears.
- Manual lock/reset actions clear in-memory session material and reset UI state.

## Change History

### 2026-07-06
- Initialized README.md with Pulsar Wallet branding, taglines, color palette, typography, logo concept, tech stack, and roadmap.
- Created AGENTS.md with project context for future session reference.
- Completed Phase 1: Project Scaffolding & Tooling
  - Initialized Vite + React + TypeScript project in `frontend/`
  - Configured Tailwind CSS with Pulsar brand colors and typography (Inter, JetBrains Mono)
  - Set up Zustand stores (wallet, network, UI state, connection)
  - Scaffolded Chrome Manifest V3 structure
  - Configured ESLint 9 (flat config) + Prettier + strict TypeScript
  - Set up Vitest for unit tests and Playwright for e2e/extension tests
  - Configured CI pipeline (lint, typecheck, unit tests, build)
  - Set up build pipeline that outputs an unpacked extension and zip package
  - Generated extension icons (16×16, 32×32, 128×128)
  - Verified `npm run build`, `npm run test`, `npm run lint`, and `npm run package` all work
- Completed Phase 2: Cryptography & Key Management
  - Added `stellar-hd-wallet` for BIP-39/SEP-0005 mnemonic generation, validation, and SLIP-0010 ed25519 derivation
  - Implemented `src/crypto/crypto.ts` with encrypt/decrypt, mnemonic utilities, and keypair helpers
  - Implemented `src/crypto/storage.ts` with encrypted Chrome Storage wrapper
  - Implemented `src/crypto/session.ts` with in-memory session key handling
  - Updated wallet store to support create/import/unlock/lock/reset with encrypted persistence
  - Rebuilt popup with real lock/unlock/create/import/mnemonic-backup flows
  - Added `tests/unit/crypto.test.ts` covering keypair creation, secret derivation, and mnemonic validation
  - Verified `npm run ci:lint`, `npm run ci:typecheck`, `npm run ci:test`, and `npm run ci:build` all pass
- Completed Phase 3: Onboarding & Auto-Lock
  - Added password strength validation UI to create/import flows
  - Added mnemonic backup confirmation quiz before wallet unlock
  - Persisted onboarding completion state so returning users skip straight to unlock
  - Wired auto-lock alarm from background worker to popup lock action
  - Verified `npm run ci:lint`, `npm run ci:typecheck`, `npm run ci:test`, and `npm run ci:build` all pass
