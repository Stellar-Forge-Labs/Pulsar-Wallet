# stellar-payment-links

stellar-payment-links is an open-source toolkit for generating shareable blockchain payment links within the Stellar ecosystem.

Instead of requiring users to manually copy wallet addresses and transaction parameters, developers can generate simple payment URLs that open a wallet transaction flow instantly.

This project is useful for applications such as:

- Web3 checkout pages
- Donation platforms
- Tipping systems
- Creator payments
- NFT mint payments

The toolkit combines frontend payment interfaces with smart contract validation using Soroban.

## Technical Architecture

### Frontend
- Next.js payment interface
- Tailwind CSS UI
- Wallet interaction hooks

### Contracts
- Soroban payment request contract
- Signature validation

### Backend
- Node.js payment link generator
- Payment verification service

---

## 🌊 Drips Wave Program

This repository participates in the Drips Network Wave Program, which rewards open-source contributors for solving development tasks.

### How to Participate
1. Register on the Drips platform.
2. Connect your GitHub account.
3. Browse issues in this repository.
4. Issues are labeled by complexity:
   - **Trivial** – documentation updates or small fixes
   - **Medium** – new payment UI components
   - **High** – backend services or contract modules
5. Comment on an issue to claim it.
6. Fork the repository and implement the feature.
7. Submit a pull request.
8. After the PR is reviewed and merged, rewards are distributed through the Drips Wave Program.

## Project Structure

```
stellar-payment-links
│
├── frontend
│   Payment UI
│   Wallet interaction components
│
├── contracts
│   Soroban payment contracts
│
├── backend
│   └── scripts
│       Link generator
│       Payment verification
│
└── tests
    Payment flow tests
```
