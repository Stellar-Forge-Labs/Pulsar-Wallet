# Pulsar Wallet - Implementation Roadmap

**Status:** Active Development  
**Last Updated:** 2026-07-09

This document outlines the complete implementation roadmap for building the Pulsar Wallet from the ground up. Each phase builds upon the previous one, progressing from basic infrastructure to full production-ready features.

---

## Phase 1: Project Scaffolding & Tooling ✅ COMPLETE

**Goal:** Establish the project foundation with build tools, configuration, and development infrastructure.

### Completed Tasks
- ✅ Initialized Vite + React + TypeScript project in `frontend/`
- ✅ Configured Tailwind CSS with Pulsar brand colors (primary: `#3F51B5`, accent: `#FF4081`) and typography (Inter, JetBrains Mono)
- ✅ Set up Zustand stores for state management:
  - `stores/wallet.ts` — wallet state (address, balance, transactions)
  - `stores/network.ts` — network selection and connection state
  - `stores/ui.ts` — UI state (modal visibility, loading states)
  - `stores/connection.ts` — dapp connection state
- ✅ Scaffolded Chrome Manifest V3 extension structure:
  - `public/manifest.json` — extension metadata and permissions
  - `src/background/index.ts` — service worker entry point
  - `src/content/index.ts` — content script for dapp interaction
  - `src/popup/` — popup UI (React)
  - Generated extension icons (16×16, 32×32, 128×128)
- ✅ Configured ESLint 9 with flat config + Prettier for code quality
- ✅ Configured TypeScript with strict mode enabled
- ✅ Set up Vitest for unit tests and Playwright for e2e/extension tests
- ✅ Created CI pipeline with npm scripts:
  - `npm run ci:lint` — ESLint with zero warnings tolerance
  - `npm run ci:typecheck` — TypeScript --noEmit check
  - `npm run ci:test` — Vitest unit tests
  - `npm run ci:build` — Vite production build
- ✅ Configured build pipeline that outputs:
  - Unpacked extension in `dist/`
  - Packaged zip file `dist/pulsar-wallet-extension.zip`

### Key Files
- [frontend/vite.config.ts](frontend/vite.config.ts)
- [frontend/tailwind.config.ts](frontend/tailwind.config.ts)
- [frontend/eslint.config.js](frontend/eslint.config.js)
- [frontend/vitest.config.ts](frontend/vitest.config.ts)
- [frontend/package.json](frontend/package.json)
- [frontend/public/manifest.json](frontend/public/manifest.json)

---

## Phase 2: Cryptography & Key Management ✅ COMPLETE

**Goal:** Implement secure key generation, derivation, and storage using industry-standard cryptography.

### Completed Tasks
- ✅ Integrated `stellar-hd-wallet` package for:
  - BIP-39 mnemonic generation (24-word phrases)
  - Mnemonic validation
  - SLIP-0010 ed25519 key derivation (`m/44'/148'/0'` for Stellar)
- ✅ Implemented `src/crypto/crypto.ts` with:
  - `generateMnemonic()` — Creates random 24-word phrases
  - `validateMnemonic()` — Validates BIP-39 compliance
  - `deriveKeypair(mnemonic, index)` — Derives Stellar keypairs from mnemonics
  - `importSecret(secret)` — Imports raw secrets and validates
  - `encrypt(plaintext, password)` — PBKDF2 + AES-256-GCM encryption
  - `decrypt(ciphertext, password)` — Decryption with validation
  - `generateKeypair()` — Random keypair generation (no mnemonic)
- ✅ Implemented `src/crypto/storage.ts` for encrypted persistence:
  - `StorageManager` class wraps `chrome.storage.local`
  - Encrypts sensitive data before persistence
  - Decrypts on retrieval
  - Only stores encrypted blobs; never persists plaintext keys
- ✅ Implemented `src/crypto/session.ts` for in-memory key handling:
  - `SessionKeyManager` holds decrypted keys in memory only
  - Auto-clears on lock or reset
  - Provides temporary access to keys during signing operations
- ✅ Updated `stores/wallet.ts` with cryptographic actions:
  - `createWallet(password)` — Generates mnemonic + derives keypairs
  - `importWallet(mnemonic | secret, password)` — Imports existing wallet
  - `unlockWallet(password)` — Decrypts and loads session keys
  - `lockWallet()` — Clears session material and resets UI
  - `resetWallet()` — Erases all stored data
- ✅ Wrote comprehensive unit tests in `tests/unit/crypto.test.ts`:
  - Keypair creation and validation
  - Secret import and derivation
  - Mnemonic generation and validation
  - Encryption/decryption round-trips
  - Edge cases (invalid mnemonics, weak passwords, etc.)
- ✅ All CI checks pass with zero warnings

### Key Files
- [frontend/src/crypto/crypto.ts](frontend/src/crypto/crypto.ts)
- [frontend/src/crypto/storage.ts](frontend/src/crypto/storage.ts)
- [frontend/src/crypto/session.ts](frontend/src/crypto/session.ts)
- [frontend/src/stores/wallet.ts](frontend/src/stores/wallet.ts)
- [frontend/tests/unit/crypto.test.ts](frontend/tests/unit/crypto.test.ts)

### Dependencies
- `stellar-hd-wallet` — BIP-39 + SLIP-0010 derivation
- `@stellar/stellar-base` — Stellar SDK for keypair operations
- Web Crypto API (built-in) — PBKDF2 + AES-256-GCM

---

## Phase 3: Onboarding & Auto-Lock ✅ COMPLETE

**Goal:** Build first-time user flows and session security with auto-lock.

### Completed Tasks
- ✅ Password strength validation UI:
  - Weak (< 8 chars, low entropy) → Red
  - Medium (8-12 chars, mixed case/numbers) → Yellow
  - Strong (> 12 chars, uppercase + numbers + symbols) → Green
  - Applied on Create and Import flows
- ✅ Mnemonic backup confirmation quiz:
  - After viewing 24-word phrase, user must select correct word for random position
  - Repeats up to 3 incorrect attempts, then forces re-view
  - Prevents accidental wallet creation without backup confirmation
- ✅ Onboarding state persistence:
  - Flag `hasCompletedOnboarding` stored in encrypted storage
  - First-time users see Create/Import choice
  - Returning users skip to unlock screen
- ✅ Auto-lock implementation:
  - `chrome.alarms` triggers lock after configurable timeout (default: 15 min)
  - Background worker sends message to popup on alarm
  - Popup clears session and resets UI to lock screen
  - Manual lock action also available
- ✅ Wallet reset flow:
  - Clears all stored data (encrypted storage, session keys, UI state)
  - Resets to blank onboarding state
  - Confirms before proceeding
- ✅ All CI checks pass with zero warnings

### Key Files
- [frontend/src/popup/PopupApp.tsx](frontend/src/popup/PopupApp.tsx)
- [frontend/src/stores/wallet.ts](frontend/src/stores/wallet.ts) — Lock/Reset actions
- [frontend/src/background/index.ts](frontend/src/background/index.ts) — Auto-lock alarm

### Next Steps
- Display auto-lock timer and countdown
- Allow user to configure auto-lock duration
- Add biometric unlock (WebAuthn) option

---

## Phase 4: Transaction Building & Signing (PLANNED)

**Goal:** Enable users to construct and sign Stellar transactions securely.

### Tasks
- [ ] Create `src/services/TransactionBuilder.ts`:
  - Wrapper around `stellar-base` TransactionBuilder
  - Support native payments (XLM)
  - Support asset payments (issued assets)
  - Support multi-operations
  - Fee management and network fees
- [ ] Create transaction signing pipeline:
  - Extract keypair from session
  - Build transaction envelope
  - Sign with keypair
  - Clear key material after signing
- [ ] Create `src/stores/transaction.ts`:
  - Draft transaction state
  - Signing state (in-progress, signed, error)
  - Transaction history
- [ ] Create preview/confirmation UI:
  - Show transaction details (source, destination, amount, asset, fee)
  - Display memo if present
  - Allow user to review before signing
  - Show signed transaction envelope (hex)
- [ ] Write tests for transaction building and signing

### Dependencies
- `@stellar/stellar-base` — Already included

---

## Phase 5: Send & Receive Operations (PLANNED)

**Goal:** Implement user-facing send/receive flows in the popup UI.

### Tasks
- [ ] Build Send Flow:
  - Input: Destination address, amount, asset selection, memo (optional)
  - Validate destination (check if account exists on network)
  - Build payment transaction
  - Display preview/confirmation
  - Sign transaction
  - Submit to Horizon
  - Show confirmation with tx hash
- [ ] Build Receive Flow:
  - Display user's public key (address)
  - Generate QR code with address (optional)
  - Copy-to-clipboard action
- [ ] Create `src/services/HorizonService.ts`:
  - Keep singleton servers per network (testnet/mainnet)
  - `fetchAccount(network, address)` — Load account from Horizon
  - `submitTransaction(network, tx)` — Submit signed tx to Horizon
  - `pollAccount(network, address, callback)` — Poll for account updates
  - Handle 404 (account not yet created) gracefully
- [ ] Integrate Horizon service into popup and stores
- [ ] Add loading/error states to UI
- [ ] Write integration tests with mock Horizon

### Dependencies
- `stellar-sdk` — Horizon server API

---

## Phase 6: Network Management & Account Monitoring (PLANNED)

**Goal:** Track account balances, transactions, and network state.

### Tasks
- [ ] Extend `stores/network.ts`:
  - Support testnet/mainnet switching
  - Persist network selection
  - Update Horizon servers on network change
- [ ] Extend `stores/wallet.ts`:
  - Add `accountData` (balances, sequence, flags, signers)
  - Add `transactions` array (recent tx history)
- [ ] Create account polling:
  - Poll Horizon for account updates on interval (5-30 seconds)
  - Update balances in store
  - Trigger UI refresh
  - Handle network errors gracefully
- [ ] Create transaction history UI:
  - List recent transactions with amount, destination, date, status
  - Filter by asset
  - Show transaction status (pending, confirmed, failed)
- [ ] Add account details view:
  - Display balances (native + assets)
  - Show sequence number and flags
  - Display signers (if applicable)
  - Show federation address (if set)

### Dependencies
- Horizon service from Phase 5

---

## Phase 7: Asset Management & Trading (PLANNED)

**Goal:** Enable multi-asset support and trustline management.

### Tasks
- [ ] Trustline Management:
  - Display existing trustlines
  - Add new asset (create trustline)
  - Remove asset (delete trustline)
  - Manage trustline limits
- [ ] Asset Balances:
  - Group balances by asset
  - Display asset code and issuer
  - Show balance, limit, and available amount
- [ ] Asset Selection UI:
  - Dropdown or modal to select asset for send/receive
  - Search by code or issuer
  - Show balance in preview
- [ ] Exchange Rates (Optional):
  - Fetch XLM/USD rates from public API (e.g., Horizon, CoinGecko)
  - Display converted amounts in send/receive flow
  - Allow toggle between native and fiat display

### Dependencies
- Phase 6 (Network Management)

---

## Phase 8: Dapp Integration & Provider Injection (PLANNED)

**Goal:** Allow websites to connect to and interact with the wallet.

### Tasks
- [ ] Implement Stellar Wallet Standard:
  - Follow SEP-0005 (Universal Signatures) or SEP-0010 (Federated Authentication)
  - Or implement EIP-1193-style JSON-RPC provider (adapted for Stellar)
- [ ] Content Script Provider Injection:
  - Inject provider object into web pages (`window.stellar` or similar)
  - Support `connect()`, `disconnect()`, `getBalance()`, `signTransaction()`, etc.
- [ ] Dapp Connection UI in Popup:
  - Show connected dapps
  - Allow revoke connection
  - Prompt user on new dapp connection request
- [ ] Message Passing:
  - Background worker routes messages between content script and popup
  - Implement request/response protocol
  - Validate messages for security
- [ ] Transaction Approval Flow:
  - When dapp requests signature, show prompt to user
  - Display tx details
  - Allow approve/reject
  - Sign on approve, return error on reject
- [ ] Error Handling:
  - Clear error messages for user
  - Prevent dapp from accessing keys directly

### Dependencies
- Phase 4 (Transaction Building)
- Phase 5 (Send/Receive)

---

## Phase 9: Testing & Security Audit (PLANNED)

**Goal:** Ensure security, reliability, and coverage across all features.

### Tasks
- [ ] Expand Unit Test Coverage:
  - Aim for > 80% code coverage
  - Test all crypto functions with edge cases
  - Test all store actions
  - Test all UI components (unit + snapshot)
- [ ] Write Integration Tests:
  - Wallet creation → unlock → send → receive flows
  - Network switching
  - Auto-lock and session expiry
  - Dapp connection and signing
- [ ] Write E2E Tests with Playwright:
  - Full user journeys (create wallet → send payment → receive)
  - Extension UI interactions (popup, lock screen, etc.)
  - Dapp integration flows
- [ ] Security Review:
  - Code audit for crypto implementation
  - Key material handling (no logging, no console output)
  - Storage encryption validation
  - Session clearing on lock
  - Permission audit (manifest.json)
- [ ] Performance Testing:
  - Measure popup load time
  - Measure transaction signing time
  - Memory usage profiling
  - Large balance list rendering
- [ ] Vulnerability Scanning:
  - npm audit for dependency vulnerabilities
  - Security policy review
- [ ] Document Security Practices:
  - Key derivation explanation
  - Encryption methods used
  - Session handling
  - Storage security
  - Threat model

### CI Integration
- All tests run on every commit
- Coverage reports generated
- Build fails if coverage below threshold

---

## Phase 10: Deployment & Chrome Web Store (PLANNED)

**Goal:** Publish Pulsar Wallet to Chrome Web Store and production-ready infrastructure.

### Tasks
- [ ] Create production build:
  - Minify and optimize all bundles
  - Source maps for debugging
  - Package extension zip
  - Create release notes
- [ ] Prepare Chrome Web Store submission:
  - Create store listing with screenshots
  - Write description and privacy policy
  - Prepare 128×128 icon and promotional images
  - Create promotional video (optional)
- [ ] Privacy & Legal:
  - Write privacy policy
  - Document data collection (none expected for wallet)
  - Terms of service
  - Security disclosures
- [ ] Version Management:
  - Semantic versioning (v1.0.0, v1.0.1, etc.)
  - Automated version bumping
  - Release tagging in git
  - Changelog generation
- [ ] Monitoring & Analytics:
  - Error tracking (e.g., Sentry)
  - Usage analytics (anonymous)
  - Crash reporting
- [ ] Update Support:
  - Auto-update mechanism via Chrome Web Store
  - Changelog display on update
  - Migration guides for breaking changes
- [ ] Production Hardening:
  - Enable Content Security Policy (CSP)
  - Remove dev tools access in production
  - Add rate limiting for API calls
  - Implement request signing for dapp interactions
- [ ] Documentation:
  - User guide (how to create, send, receive)
  - Developer guide (how to integrate dapps)
  - API reference
  - Troubleshooting guide

### Deliverables
- Published extension on Chrome Web Store
- Documentatio site (GitHub Pages or similar)
- Bug bounty program setup (optional)

---

## Build Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Initial Setup
```bash
cd frontend
npm install
```

### Development
```bash
# Start dev server (HMR enabled for popup)
npm run dev

# Run tests in watch mode
npm run test

# Run linter in watch mode
npm run lint -- --fix

# Type check in watch mode
npm run typecheck -- --watch
```

### Production Build
```bash
# Full CI pipeline (lint, typecheck, test, build)
npm run ci:build

# Or individual commands:
npm run ci:lint        # Lint with zero warnings
npm run ci:typecheck   # TypeScript check
npm run ci:test        # Unit tests
npm run build          # Vite production build
npm run package        # Package into .zip

# Output: frontend/dist/pulsar-wallet-extension.zip
```

### Testing
```bash
# Unit tests
npm run test

# Unit tests (CI mode, no watch)
npm run ci:test

# E2E tests with Playwright
npm run test:e2e
```

### Loading the Extension Locally
1. Run `npm run build` in `frontend/`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select `frontend/dist/`
5. Extension appears in toolbar

---

## Architecture Overview

### Directory Structure
```
frontend/
├── public/
│   ├── manifest.json      ← Extension config (Manifest V3)
│   └── icon-*.png         ← Extension icons
├── src/
│   ├── App.tsx            ← Root React component
│   ├── main.tsx           ← React entry (popup)
│   ├── background/        ← Service worker
│   ├── content/           ← Content script
│   ├── crypto/            ← Cryptography (Phase 2)
│   │   ├── crypto.ts
│   │   ├── storage.ts
│   │   └── session.ts
│   ├── popup/             ← Popup UI (React)
│   ├── services/          ← External service wrappers
│   │   └── HorizonService.ts (Phase 5)
│   ├── stores/            ← Zustand stores
│   │   ├── wallet.ts
│   │   ├── network.ts
│   │   ├── ui.ts
│   │   ├── connection.ts
│   │   └── transaction.ts (Phase 4)
│   └── styles/            ← Tailwind CSS
├── tests/
│   ├── unit/              ← Unit tests (Vitest)
│   └── e2e/               ← E2E tests (Playwright)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── tailwind.config.ts
```

### Key Design Decisions
1. **Zustand for State Management:** Lightweight, no boilerplate, good for extension architecture
2. **Chrome Storage API:** Encrypted storage with Zustand persistence
3. **Stellar SDK:** Official library for Stellar operations and keypair management
4. **Manifest V3:** Latest Chrome extension standard (required for new extensions)
5. **Vite:** Fast HMR and production builds
6. **Tailwind CSS:** Rapid UI development with design consistency

---

## Testing Strategy

### Unit Tests (Vitest)
- Crypto functions (generation, encryption, derivation)
- Store actions and selectors
- Utility functions
- Component logic (if applicable)

### Integration Tests
- Wallet flows (create → unlock → send)
- Store interactions
- Service layer interactions

### E2E Tests (Playwright)
- Full user journeys from extension UI
- Popup interactions
- Network interactions (mocked/stubbed)
- Dapp integration flows

### Test Coverage Goals
- Phase 1-3: > 80% coverage
- Phase 4+: > 75% coverage (services more complex)

---

## Security Considerations

### Key Management
- Keys generated using `stellar-hd-wallet` (BIP-39/SLIP-0010)
- Keys encrypted with PBKDF2 (600k iterations) + AES-256-GCM
- Session keys held in memory only, cleared on lock
- No plaintext keys ever persisted or logged

### Storage
- All sensitive data encrypted before `chrome.storage.local` persistence
- Encryption key derived from user password
- Decryption happens only after user unlock

### Session Security
- 15-minute auto-lock timeout (configurable)
- Manual lock action available
- Session material cleared on lock/reset/timeout

### Permissions
- Manifest V3 restricts to: `storage`, `activeTab`, `alarms`
- No broad host permissions
- Content script only on pages that explicitly interact

### Code Quality
- Strict TypeScript (`noImplicitAny`, `strictNullChecks`, etc.)
- ESLint with security rules
- No eval or dynamic code execution
- CSP headers in production

---

## Maintenance & Support

### Regular Tasks
- Monthly dependency updates and security audits
- Quarterly user feedback review
- Bi-annual security audit with external firm
- Continuous monitoring of Chrome API changes

### Known Limitations
- Single account per wallet (phase 2 could extend to HD accounts)
- Testnet/mainnet only (can add custom networks in phase 6)
- No hardware wallet support (future phase)
- No transaction history on initial load (phase 6 adds polling)

### Future Enhancements
- Multiple accounts per mnemonic
- Custom RPC endpoints
- Hardware wallet integration (Ledger, Trezor)
- Mobile companion app
- Multi-signature support
- DEX integration
- Staking UI

---

## References

- [Stellar Developer Guide](https://developers.stellar.org)
- [Stellar SDK (TypeScript)](https://github.com/StellarCN/js-stellar-sdk)
- [BIP-39 Mnemonic Standard](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [SLIP-0010 Key Derivation](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**This roadmap is a living document and will be updated as phases are completed and new requirements emerge.**
