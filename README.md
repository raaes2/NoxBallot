# NoxBallot

**Privacy-Preserving Voting on the Midnight Network**


[![Midnight Network](https://img.shields.io/badge/Network-Midnight-blueviolet?style=for-the-badge)](https://midnight.network)
[![Language](https://img.shields.io/badge/Language-Compact-orange?style=for-the-badge)](https://midnight.network)
[![Tested With](https://img.shields.io/badge/Tested%20With-Vitest-yellow?style=for-the-badge)](https://vitest.dev)
[![State](https://img.shields.io/badge/Level-4%20Complete-success?style=for-the-badge)](#)
[![CI](https://github.com/raaes2/NoxBallot/actions/workflows/ci.yaml/badge.svg)](https://github.com/raaes2/NoxBallot/actions/workflows/ci.yaml)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/raaes2/NoxBallot&root=frontend)
[![X (Twitter) Follow](https://img.shields.io/twitter/follow/raeessj?style=for-the-badge)](https://x.com/raeessj)

---

## Abstract

NoxBallot is a decentralized application (dApp) engineered on the **Midnight Network** utilizing the **Compact** smart contract language. The platform serves as a Zero-Knowledge (ZK) private voting protocol. It allows voters to cryptographically prove that they are eligible and have cast a valid ballot without ever exposing their vote choice, identity, or raw sensitive data to centralized portals, voting boards, or the public blockchain ledger.

---

## Table of Contents

1. [Official Submission Links](#official-submission-links)
2. [Architectural Overview](#architectural-overview)
3. [Zero-Knowledge Privacy Model](#zero-knowledge-privacy-model)
4. [Smart Contract Implementation](#smart-contract-implementation)
5. [Hackathon Progression (Levels 1-4)](#hackathon-progression-levels-1-4)
6. [Project Showcase & Verification Proofs](#project-showcase--verification-proofs)
7. [Local Development & Setup Guide](#local-development--setup-guide)

---

## Official Submission Links

- **Live Application (Vercel):** [https://scholar-shield-ten.vercel.app/](https://scholar-shield-ten.vercel.app/)
- **Deployed Contract (Midnight Preprod):** [5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e](https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e)
- **Demo Video Presentation:** [Watch on Google Drive](https://drive.google.com/file/d/1YUe91VBOKsM_-cpF4jBO_dhbyJyNmcWX/view?usp=sharing)
- **Public Brand Presence (X Profile):** [https://x.com/raeessj](https://x.com/raeessj)

---

## Architectural Overview

NoxBallot bridges modern web infrastructure with cutting-edge cryptographic privacy networks.

- **Smart Contract Layer:** Written in Compact (`noxballot.compact`), compiled to WebAssembly (WASM) and Zero-Knowledge Intermediate Representation (ZKIR). Deployed on the Midnight Preprod network.
- **Frontend Application Layer:** Built with React, TypeScript, and Vite. Styled using a custom cyber-grid aesthetic via Tailwind CSS.
- **Wallet Infrastructure:** Integrated with the `@midnight-ntwrk/dapp-connector-api` to interface directly with the 1AM and Lace browser extension wallets for local proof generation and transaction signing.
- **Testing & CI/CD:** End-to-end testing utilizing Vitest and local Docker-based Midnight environments. Automated CI/CD pipelines via GitHub Actions.

---

## Zero-Knowledge Privacy Model

The core value proposition of NoxBallot is absolute data privacy for voters. 

### The Traditional Vulnerability
In legacy systems, voters must submit unencrypted votes and identities to centralized databases. These databases are prime targets for manipulation, intimidation, and breaches.

### The NoxBallot ZK Solution
NoxBallot eliminates the need for data transmission of vote choices. Verification is entirely mathematical.

1. **Public State (Ledger Data):** The contract maintains the active status, total votes, and public tally (`votes_for`, `votes_against`, `votes_abstain`). These values are fully transparent and verifiable by any observer.
2. **Private Witness (User Data):** The voter inputs their identity, eligibility key, and vote choice locally into their browser. These values are designated as "private witnesses" in the Compact circuit.
3. **Local Proof Generation:** The voter's browser wallet runs a localized Zero-Knowledge circuit. It checks if the voter is eligible and hasn't voted before.
4. **On-Chain Verification:** The wallet submits a cryptographic proof to the Midnight blockchain. The network validators verify the math, update the tally, and record an anonymous nullifier without ever seeing the underlying private inputs.

**Observer Matrix:**
- **Visible on-chain:** The vote tallies, total votes, anonymous nullifiers, and the fact that a valid proof was submitted.
- **Hidden permanently:** The voter's identity, their eligibility proof, and their actual vote choice.

---
## August Submission Updates

### Bug Fixes & Refactors

- **Wallet Connection Leaks**: Cleans up polling intervals on disconnect.
- **Footer Address Truncation**: Ensures contract addresses don't overflow on mobile.
- **Mobile Navbar**: Hide text on small screens, use flex gap.
- **Double-submit bugs**: Disabled verify button when processing.
- **Private State Password**: Securely loaded from environment variables.
- **Input Edge Cases**: Empty strings, negative values, overflow amounts now guarded.
- **Custom Hooks**: Extracted logic into `useVerifySubmit`.
- **Accessibility**: Added ARIA live regions and keyboard handlers.

### Test Additions

| Test | What it covers |
|------|----------------|
| `Passes voting when voter is fully eligible` | Verifies standard valid vote |
| `Prevents double voting` | Tests nullifier uniqueness checks |
| `Fails voting when session is closed` | Ensures deadline logic is respected |
| `Fails voting with invalid choice` | Validates choice boundary checks |
| `Client-Side Eligibility Pre-checker Tests` | Validates that client-side logic perfectly matches circuit thresholds |
| `Proof History Utility Tests` | Ensures proofs are properly serialized, saved, and loaded from localStorage |

### New Features (Mid-August Sprint)

- **Analytics Dashboard Page** (`frontend/src/pages/DashboardPage.tsx`)
  - Real-time statistics summary cards for total proofs, eligible proofs, and ineligible proofs
  - LocalStorage-based proof history tracking with timestamps and transaction links
  - SVG bar chart for visualizing pass/fail ratios
  - Clear history functionality with confirmation guard

- **Client-Side Eligibility Pre-checker** (`frontend/src/hooks/useEligibilityPrecheck.ts`)
  - Simulates the Zero-Knowledge circuit locally before triggering the wallet extension
  - Displays instant visual feedback (likely eligible, likely ineligible, invalid input)
  - Helps users avoid paying transaction fees for obviously invalid credentials

- **Live On-chain Criteria Reader** (`frontend/src/hooks/useLiveCriteria.ts`)
  - Fetches the active contract configurations directly from the Midnight ledger
  - Features a robust fallback mechanism to environment variables if the indexer is unavailable

- **UI & UX Improvements**
  - Added a lightweight Toast Notification system (`frontend/src/components/ToastNotification.tsx`) for transaction feedback
  - Added an admin network guard that visually warns deployers if their wallet is connected to a local node instead of Preprod
  - Implemented double-submit guards using React `useRef` to prevent concurrent wallet invocations
  - Added graceful error handling for wallet connection rejections

---

## Smart Contract Implementation

The Compact contract (`contracts/noxballot.compact`) is designed for maximum security and data minimization.

```compact
pragma language_version >= 0.22;
import CompactStandardLibrary;

export ledger admin: Bytes<32>;
export ledger is_active: Boolean;
export ledger deadline: Uint<64>;
export ledger total_votes: Uint<32>;
export ledger votes_for: Uint<32>;
export ledger votes_against: Uint<32>;
export ledger votes_abstain: Uint<32>;
export ledger max_voters: Uint<32>;
export ledger nullifiers: Set<Bytes<32>>;

// The constructor utilizes disclose() to explicitly make the parameters public.
constructor(admin_hash: Bytes<32>, expiry: Uint<64>, voter_cap: Uint<32>) {
  admin = disclose(admin_hash);
  deadline = disclose(expiry);
  max_voters = disclose(voter_cap);
  is_active = disclose(true);
  total_votes = disclose(0);
  votes_for = disclose(0);
  votes_against = disclose(0);
  votes_abstain = disclose(0);
}

// The verification circuit accepts private witnesses.
// Because disclose() is NOT used on the choice/credential, the inputs remain mathematically shielded.
export circuit cast_vote(): [] {
  assert(disclose(is_active), "Voting session is closed");
  assert(blockTimeLt(disclose(deadline)), "Voting deadline has passed");
  assert(disclose(total_votes) < disclose(max_voters), "Voter cap reached");

  const cred = voter_credential();
  const choice = vote_choice();

  const nul = make_vote_nullifier(cred.voter_id);
  assert(!nullifiers.member(disclose(nul)), "This voter has already cast a ballot");
  assert(choice <= 2, "Invalid vote choice");

  nullifiers.insert(disclose(nul));
  total_votes = disclose((total_votes + 1) as Uint<32>);

  if (disclose(choice == 0)) { votes_for = disclose((votes_for + 1) as Uint<32>); }
  if (disclose(choice == 1)) { votes_against = disclose((votes_against + 1) as Uint<32>); }
  if (disclose(choice == 2)) { votes_abstain = disclose((votes_abstain + 1) as Uint<32>); }
}
```

---

## Hackathon Progression (Levels 1-4)

This repository fulfills the strict progression requirements of the "New Moon to Full" Midnight Builder Journey.

### Level 1: Setup & First Contract
- **Objective:** Establish the WSL2/Docker toolchain, write the foundational Compact contract, and document the product proposal.
- **Status:** Complete. The contract successfully compiles, generating the required `zkir` and `bzkir` proving artifacts.

### Level 2: Frontend Integration
- **Objective:** Develop a robust frontend interface and establish wallet connectivity.
- **Status:** Complete. The application successfully interfaces with the 1AM wallet via the Midnight DApp Connector API.
- **Deployed Contract Address (Preprod):** 
  [5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e](https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e)

### Level 3: Production-Grade dApp
- **Objective:** Implement automated testing, Continuous Integration (CI/CD), and a polished user interface.
- **Status:** Complete. Vitest suites assert both successful verification and expected failure modes. GitHub Actions workflows automatically test the contract on every push.

### Level 4: MVP Goes Live
- **Objective:** Deploy the frontend to a production CDN, finalize documentation, and establish a public brand presence.
- **Status:** Complete.
  - **Live Application:** [https://scholar-shield-ten.vercel.app/](https://scholar-shield-ten.vercel.app/)
  - **Deployed Contract (Preprod):** [5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e](https://preprod.midnightexplorer.com/contracts/5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e)
  - **Demo Video Presentation:** [Watch on Google Drive](https://drive.google.com/file/d/1YUe91VBOKsM_-cpF4jBO_dhbyJyNmcWX/view?usp=sharing)
  - **Public Brand Presence (X Profile):** [https://x.com/raeessj](https://x.com/raeessj)

---

## Project Showcase & Verification Proofs

### User Interface 
![UI Screenshot 1](./sub%20assets/ui1.png)
![UI Screenshot 2](./sub%20assets/ui2.png)
![UI Screenshot 3](./sub%20assets/ui3.png)

### Contract Compilation Artifacts
![Successful Compilation](./sub%20assets/yarn%20compile%20ss.png)

---

## Local Development & Setup Guide

For developers and auditors wishing to verify the Zero-Knowledge circuits and run the application locally, please follow these instructions carefully.

### 1. System Requirements
- **OS:** Windows Subsystem for Linux 2 (WSL2 - Ubuntu 24.04/26.04) or native Linux/macOS.
- **Containerization:** Docker Desktop with WSL2 integration enabled.
- **Runtime:** Node.js (v22.0.0 or higher) and Yarn package manager.

### 2. Dependency Initialization
Clone the repository and install the workspace dependencies from the root directory:
```bash
git clone https://github.com/raaes2/NoxBallot.git
cd NoxBallot
yarn install
```

### 3. Smart Contract Compilation
Compile the Compact zero-knowledge circuits into intermediate representation and generate the strictly-typed TypeScript interfaces:
```bash
export PATH="$HOME/.local/bin:$PATH"
yarn compile
```
*Note: This command populates the `contracts/managed/noxballot/` directory with the necessary prover keys and API definitions.*

### 4. Running the Local Midnight Network and Test Suite
To run the automated tests, you must initialize the local Midnight Docker network (which spins up a local indexer, proof-server, and blockchain node):
```bash
yarn env:up
yarn test:local
```
Once testing is complete, gracefully terminate the Docker instances to free up system resources:
```bash
yarn env:down
```

### 5. Running the Frontend Application
To run the React frontend locally and interact with the smart contract:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`. You must have the **1AM wallet** browser extension installed and configured to the appropriate network (Local or Preprod) to interact with the application.

---

## Author & Acknowledgements

**NoxBallot** was developed by **raaes2** as part of the Midnight Network hackathon.

- **GitHub:** [@raaes2](https://github.com/raaes2)
- **X (Twitter):** [@raeessj](https://x.com/raeessj)

*Built with privacy and security in mind on the Midnight Network.*
