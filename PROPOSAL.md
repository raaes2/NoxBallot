# NoxBallot: Product Idea & Architecture Proposal

> **Privacy-Preserving Decentralized Voting on the Midnight Network**  
> *"Cast in Shadow. Counted in Light."*

---

## Executive Summary

| Attribute | Details |
| :--- | :--- |
| **Project Name** | **NoxBallot** |
| **Target Network** | Midnight (Preprod Deployed & Verified → Mainnet Bound) |
| **Smart Contract Address (Preprod)** | `5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e` |
| **Live Web Application** | [https://nox-ballot.vercel.app/](https://nox-ballot.vercel.app/) |
| **Source Repository** | [https://github.com/raaes2/NoxBallot](https://github.com/raaes2/NoxBallot) |
| **Lead Developer / Contact** | [@raeessj](https://x.com/raeessj) |

---

## 1. What is NoxBallot and Who is it for?

### 1.1 The Core Problem in Modern Governance
Democratic governance across both Web2 institutions and Web3 decentralized autonomous organizations (DAOs) suffers from a fundamental paradox: **the tension between public verifiability and individual privacy.**

* **Transparent Blockchains (Ethereum, Cardano, Polygon, Solana):** Every transaction payload, voter address, and token balance is permanently visible on public ledgers. Transparent voting exposes participants to:
  * **Vote Buying and Bribery:** Because voters can prove on-chain which candidate or proposal they voted for, malicious actors can implement automated smart-contract bribes (bribe markets).
  * **Voter Coercion and Retaliation:** Whales, employers, venture capitalists, and vocal community members can observe dissenting votes and retaliate against contributors.
  * **Herd Mentality & Strategic Abstention:** Early voters influence the choices of late voters when tallies are visible in real time, distorting genuine consensus.
* **Centralized & Off-Chain Systems (Snapshot, Google Forms, Centralized Portals):** Off-chain signing schemes and centralized servers rely entirely on trust. Administrators can manipulate database tallies, censor transactions, or privately deanonymize participants without cryptographic accountability.

### 1.2 The NoxBallot Solution
**NoxBallot** is a zero-knowledge private voting protocol engineered natively on the **Midnight Network**. Utilizing Midnight’s **Compact** smart contract language, NoxBallot separates vote verification from vote exposure. 

Voters generate Zero-Knowledge proofs directly inside their browser using the 1AM wallet. The smart contract validates voter eligibility, enforces a cryptographic nullifier to prevent double-voting, and updates aggregate results—**without ever learning or recording who the voter is, their wallet address, or which ballot choice they made.**

### 1.3 Target Audience and Use Cases
1. **Decentralized Autonomous Organizations (DAOs):**
   * High-stakes governance decisions (treasury disbursements, protocol upgrades, grant awards).
   * Contributor sentiment polling where contributors want to give honest feedback without risking grant cancellation or reputational damage.
2. **Corporate & Shareholder Governance:**
   * Enterprise board of directors elections and shareholder resolution ballots requiring auditable quorums with legally protected secret ballots.
3. **Grant Committees & Peer Review:**
   * Anonymous peer review and funding allocation rounds where evaluators rank proposals without interpersonal bias or fear of retaliation.
4. **Whistleblower & Union Polling:**
   * Sensitive workplace ballots, collective bargaining, and organizational temperature checks requiring cryptographic guarantees against retaliation.

---

## 2. Why Midnight?

Traditional layer-1 and layer-2 blockchains cannot natively solve the private governance dilemma because their execution environments operate entirely on public state:

```
[ Traditional Blockchain Voting ]
Voter Wallet ──(Public Tx: Voter Address + Choice + Signature)──> Public Mempool / Ledger
Result: Complete loss of privacy. Bribes and coercion are trivial.
```

### 2.1 The Midnight Advantage: Dual-State Architecture
Midnight is uniquely built around a **dual-state computational model**:
* **Private State (Client-Side):** Sensitive data (voter credentials, private keys, ballot selections) lives strictly on the user's client machine and is evaluated inside client-side WASM circuits.
* **Public Ledger State (On-Chain):** Cryptographic commitments, aggregate counts, and nullifiers are managed on the distributed ledger.

```
[ NoxBallot on Midnight ]
Voter Machine (Private State)
  ├── voter_id (Secret)
  ├── eligibility_key (Secret)
  └── vote_choice (Secret)
           │
           ▼
    [Local ZK Prover]
           │
           ▼ (ZK Proof + Anonymous Nullifier)
    Midnight Network
  ├── Verifies ZK Proof on-chain
  ├── Checks & inserts Nullifier into Spent Set
  └── Increments Public Aggregate Tallies (FOR / AGAINST / ABSTAIN)
Result: Cryptographically verifiable outcome. Zero leak of voter identity or choice.
```

### 2.2 Key Midnight Capabilities Leveraged by NoxBallot
1. **Compact Smart Contract Language:** Compact enables expressing cryptographic zero-knowledge circuits with standard declarative logic. Circuits like `cast_vote()` cleanly distinguish between private witnesses and disclosed ledger updates.
2. **Client-Side Proving via Midnight DApp Connector:** With the `@midnight-ntwrk/dapp-connector-api` and 1AM wallet, ZK proofs are compiled and proven entirely inside the voter's browser. Raw identity secrets never touch any network wire.
3. **Deterministic Nullifier Derivation:** Midnight's `persistentHash` primitives allow computing domain-separated, one-way nullifiers (`make_vote_nullifier(voter_id)`), ensuring sybil protection and strictly single-use voting without linking to identity.
4. **Decoupled Identity & Native Fees (DUST):** Shielded transactions decouple the transaction submitter from the voting credential, neutralizing metadata and network-level timing analysis.

---

## 3. Data Model: Public, Private, and Disclosure

NoxBallot's data architecture is codified in [`contracts/noxballot.compact`](contracts/noxballot.compact). Every data element has an explicit security perimeter:

### 3.1 Public Ledger State (On-Chain)
The public state is visible to any blockchain explorer or network participant, providing transparent and verifiable auditability:

```compact
export ledger admin: Bytes<32>;           // Domain-separated cryptographic hash of admin secret key
export ledger is_active: Boolean;         // Lifecycle flag: true if voting is actively accepting ballots
export ledger deadline: Uint<64>;         // Unix timestamp indicating when voting expires
export ledger total_votes: Uint<32>;      // Total number of valid ballots cast
export ledger votes_for: Uint<32>;        // Public aggregate tally: votes in favor
export ledger votes_against: Uint<32>;    // Public aggregate tally: votes against
export ledger votes_abstain: Uint<32>;    // Public aggregate tally: abstentions
export ledger max_voters: Uint<32>;       // Hard cap on total eligible voters allowed to vote
export ledger nullifiers: Set<Bytes<32>>; // Cryptographic set of spent ballot nullifiers
```

### 3.2 Private Witness State (Client-Side Only)
Private witnesses are supplied by the voter at transaction construction time. They are consumed locally by the prover and **never leave the user's browser**:

```compact
struct VoterCredential {
  voter_id: Bytes<32>,          // Unique voter identifier secret
  eligibility_key: Bytes<32>    // Cryptographic authorization secret confirming eligibility
}

witness voter_credential(): VoterCredential;
witness admin_secret(): Bytes<32>;
witness vote_choice(): Uint<32>; // 0 = FOR, 1 = AGAINST, 2 = ABSTAIN
```

### 3.3 Disclosure Mechanisms & Privacy Boundaries
The `disclose()` operator in Compact marks the explicit boundary between the private zero-knowledge circuit and the public blockchain:

1. **Vote Choice Privacy:**
   * The `vote_choice` is an un-disclosed witness value.
   * The circuit verifies that `choice <= 2`.
   * When updating tallies:
     ```compact
     if (disclose(choice == 0)) { votes_for = disclose((votes_for + 1) as Uint<32>); }
     if (disclose(choice == 1)) { votes_against = disclose((votes_against + 1) as Uint<32>); }
     if (disclose(choice == 2)) { votes_abstain = disclose((votes_abstain + 1) as Uint<32>); }
     ```
   * While the conditional branch increments an aggregate counter, the link connecting the voter's identity/wallet to that branch is broken because the transaction contains only a zero-knowledge proof and a deterministic nullifier.
2. **Double-Voting Prevention (The Nullifier):**
   * The circuit derives:
     ```compact
     export pure circuit make_vote_nullifier(voter_id: Bytes<32>): Bytes<32> {
       return persistentHash<Vector<2, Bytes<32>>>([pad(32, "noxBallot:vote:nullifier:v1"), voter_id]);
     }
     ```
   * The nullifier is recorded in `nullifiers.insert(disclose(nul))`.
   * Because `persistentHash` is a one-way cryptographic hash with a dedicated domain separator, an observer cannot derive `voter_id` from `nul`. If the voter attempts to submit a second ballot, `nullifiers.member(nul)` asserts false and the transaction is rejected.
3. **Admin Authentication:**
   * The admin secret key `admin_secret` is never published.
   * The contract checks: `assert(admin == nox_admin_key(sk), "Not authorized: invalid admin key");`. Only knowledge of the pre-image allows updating deadline or max voter caps.

### 3.4 The Observer Matrix

| Information Item | Visible to Voter | Visible to Contract Admin | Visible to Public Observer |
| :--- | :---: | :---: | :---: |
| **Voter Secret Identity (`voter_id`)** |  YES | ❌ NO | ❌ NO |
| **Voter Eligibility Key (`eligibility_key`)** |  YES | ❌ NO | ❌ NO |
| **Individual Ballot Selection (`vote_choice`)** |  YES | ❌ NO | ❌ NO |
| **Voter's Public Wallet Address** |  YES | ❌ NO (Decoupled) | ❌ NO (Decoupled) |
| **Ballot Nullifier Hash (`Bytes<32>`)** |  YES |  YES |  YES |
| **Aggregate Tallies (`total`, `for`, `against`, `abstain`)** |  YES |  YES |  YES |
| **Session Status & Deadline** |  YES |  YES |  YES |
| **Proof of Valid Execution** |  YES |  YES |  YES |

---

## 4. Scope & Roadmap to Mainnet by Level 6

NoxBallot is structured with an incremental, production-grade roadmap designed to scale smoothly from hackathon prototype to a fully audited Midnight Mainnet release.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  LEVELS 1 - 3   │ ──> │     LEVEL 4     │ ──> │     LEVEL 5     │ ──> │     LEVEL 6     │
│ Foundation & CI │     │   Live MVP & UX │     │ Advanced Feat.  │     │ Mainnet Launch  │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 4.1 Completed Milestones (Levels 1 – 3)
* [x] **Compact Circuit & Logic:** Developed `noxballot.compact` with private witnesses, domain-separated nullifiers, and admin session management.
* [x] **Full Automated Test Suite:** Implemented 4 comprehensive Vitest tests verifying:
  1. Contract deployment and initial ledger state assertions.
  2. Successful private ballot casting (`cast_vote` with aggregate increment).
  3. Nullifier collision rejection (asserting double-vote rejection).
  4. Admin-authenticated session closure (`update_session`).
* [x] **CI/CD Automation:** Configured `.github/workflows/ci.yaml` running `yarn compile`, Docker Compose local node/indexer startup, DUST accrual check, and automated tests.
* [x] **Preprod Contract Deployment:** Verified contract deployed to Midnight Preprod at `5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e`.
* [x] **Interactive Frontend:** Built React 19 + TypeScript + Vite dApp with Midnight DApp Connector integration.

### 4.2 Level 4: Live MVP & Public Exposure (Current Milestone)
* [x] **Production Web Hosting:** Deployed to Vercel at [https://nox-ballot.vercel.app/](https://nox-ballot.vercel.app/).
* [x] **1AM Wallet Connectivity:** Live connection to Preprod wallet, displaying balance, addresses, and contract synchronization.
* [x] **Public Brand Identity:** Active X profile [@raeessj](https://x.com/raeessj) with project updates.
* [x] **Video Presentation:** Walkthrough demonstration displaying contract deployment, client-side proof generation, and real-time state sync.

### 4.3 Level 5: Governance Scaling & Feature Expansion
* **Merkle Tree Whitelist Integration:**
  * Transition from single eligibility keys to Merkle Tree voter inclusion proofs.
  * Allows DAO admins to whitelist millions of token holders or addresses by publishing a single 32-byte Merkle root on-chain.
  * Voters prove membership (`merkle_path`) inside the ZK circuit without revealing their position in the tree.
* **Multi-Proposal Governance Hub:**
  * Support multiple concurrent voting proposals within a unified contract registry.
* **Weighted & Quadratic Voting Circuits:**
  * Support token-weighted voting where token balances are proven within ranges (e.g. proof that balance $\ge X$) without exposing exact wallet holdings.
* **Circuit & Proving Optimization:**
  * Profile and optimize WASM proof generation times to achieve sub-3-second proof generation on standard mobile and desktop browsers.

### 4.4 Level 6: Mainnet Production Deployment & Hardening
* **Third-Party Security & Cryptographic Audit:**
  * Formal audit of Compact circuits, witness safety, and smart contract state transitions.
* **Multi-Wallet Support:**
  * Support for Lace Midnight wallet, 1AM wallet, and future mobile wallet extensions.
* **Midnight Mainnet Deployment:**
  * Deployment of audited NoxBallot factory and governance contracts to Midnight Mainnet.
* **Cross-Chain Governance Relayer (Cardano / EVM):**
  * Automated cryptographic oracle / relayer capable of executing on-chain actions (treasury payouts, parameter changes) on Cardano or EVM chains once a NoxBallot confidential vote passes.

---

## 5. Summary & Evaluation Alignment

NoxBallot directly addresses the core mission of the Midnight Network: delivering practical, zero-knowledge confidentiality to high-stakes decentralized applications. By preserving voter anonymity while guaranteeing mathematical correctness and auditability, NoxBallot delivers a new standard for decentralized governance.
