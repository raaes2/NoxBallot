# NoxBallot

[![NoxBallot CI](https://github.com/raaes2/NoxBallot/actions/workflows/ci.yaml/badge.svg)](https://github.com/raaes2/NoxBallot/actions/workflows/ci.yaml)

> **Cast in shadow. Counted in light.**

NoxBallot is a privacy-first voting dApp built on [Midnight Network](https://midnight.network). Cast anonymous ballots with cryptographic guarantees — your vote choice, identity, and wallet address **never appear on-chain**. Only a verifiable tally does.

---

## 🗳️ Product Idea

NoxBallot addresses the fundamental paradox of on-chain governance: **transparent blockchains make private voting structurally impossible**. Every conventional chain exposes who voted for what. NoxBallot solves this using Midnight's zero-knowledge proof system to implement **Private Voting** — users prove they are eligible and cast a ballot, but the choice itself is protected inside a ZK circuit. Only an anonymous nullifier (a cryptographic commitment) and the aggregate tally are written to the ledger. This enables trustless, verifiable elections where the outcome is public and tamper-proof, but every individual ballot is mathematically sealed.

---

## 🔐 Privacy Model

NoxBallot's privacy guarantee is enforced at the cryptographic level — not by policy.

### What an observer **CAN** see (public ledger state)

| Observable | Description |
|---|---|
| `total_votes` | How many ballots have been cast |
| `votes_for` | Count of "For" votes |
| `votes_against` | Count of "Against" votes |
| `votes_abstain` | Count of abstentions |
| `max_voters` | Voter cap set by admin |
| `is_active` | Whether voting is open |
| `nullifiers` | Set of anonymous voter commitments |
| `deadline` | When voting ends |

### What an observer **CANNOT** see (private witnesses)

| Hidden | Description |
|---|---|
| `voter_id` | The voter's unique identity |
| `eligibility_key` | The voter's proof of eligibility |
| `vote_choice` | Whether the voter chose For/Against/Abstain |
| Admin secret key | The key used to authenticate admin operations |

The ZK proof guarantees — without revealing any private input:
1. The voter is eligible (knows a valid credential)
2. The voter has not voted before (nullifier uniqueness enforced)
3. The vote choice is valid (0, 1, or 2)
4. The correct tally counter is incremented

---

## 💻 Tech Stack

NoxBallot is architected across multiple layers for client-side zero-knowledge execution, privacy-preserving state management, and modern responsive UI:

### 🛡️ Cryptography & Blockchain Core
- **[Midnight Network](https://midnight.network/)**: Data-protection layer-1 blockchain (Preprod & Preview networks) providing native programmable data privacy.
- **[Compact Language (v0.31.0)](https://github.com/midnightntwrk/compactc)**: Domain-specific smart contract & ZK circuit language compiling confidential verification logic into zero-knowledge proving keys.
- **Midnight JS SDK v4.x**: `@midnight-ntwrk/compact-js`, `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/midnight-js-contracts`, `@midnight-ntwrk/ledger-v8`.
- **WebAssembly (WASM)**: Client-side cryptographic proof generation running directly inside the user's browser runtime.

### 🎨 Frontend & Design System
- **[React 19](https://react.dev/)**: Modern declarative component architecture.
- **[TypeScript 5.7](https://www.typescriptlang.org/)**: Strict static typing across contract bindings, witnesses, and UI states.
- **[Vite 5.4](https://vite.dev/)**: High-performance bundler and dev server equipped with `vite-plugin-wasm` and `vite-plugin-top-level-await`.
- **[React Router v7](https://reactrouter.com/)**: Client-side single-page application navigation.
- **Custom Vanilla CSS Design System**: Bespoke Obsidian & Luminescent Mint/Emerald aesthetic with custom glassmorphism, responsive tactile components, and fluid micro-animations (pure CSS3, zero external CSS runtime overhead).
- **Typography**: Google Fonts — **Space Grotesk** (Display/Headings), **Plus Jakarta Sans** (Interface/Body), and **IBM Plex Mono** (Cryptographic Hashes & Nullifiers).

### 🔑 Wallet & Connectivity
- **1AM Wallet Extension**: Primary Midnight DApp connector for secure browser-side key management and transaction approval.
- **Pluggable DApp Connector API**: Multi-wallet detection supporting 1AM, Lace, and Nightly wallet extensions.

### 🧪 Tooling, DevOps & Infrastructure
- **[Vitest](https://vitest.dev/) & Node.js**: Integration test suites verifying contract deployment, ballot casting, and anti-double-vote nullifiers.
- **Docker & Docker Compose**: Local development sandbox orchestrating `midnight-node`, `proof-server`, and `indexer`.
- **GitHub Actions**: Continuous integration running contract compilation, automated tests, and production build checks.
- **Vercel**: Global edge hosting configured with custom SPA routing and Cross-Origin headers for WebAssembly execution.

---

## 🚀 Live Demo

- **App:** [https://nox-ballot.vercel.app/](https://nox-ballot.vercel.app/)
- **Contract (Preprod):** `mn_addr_preprod1fjw64hh5veuayhl782sxggpq8jfp0vq0zvv3cvz94nv7cnzu9clqp3zk9e`
- **Explorer:** [Midnight Explorer Link](https://preprod.midnightexplorer.com/contracts/mn_addr_preprod1fjw64hh5veuayhl782sxggpq8jfp0vq0zvv3cvz94nv7cnzu9clqp3zk9e)

---

## 🛠️ Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 22.0.0 | https://nodejs.org |
| Yarn | 1.22.22 | `npm install -g yarn` |
| Docker Desktop | Latest | https://docker.com |
| Compact Compiler | 0.31.0 | [GitHub releases](https://github.com/midnightntwrk/compactc/releases) |
| 1AM Wallet | Latest | Chrome Web Store |

### Install Compact Compiler (Windows)

1. Download the Windows binary from https://github.com/midnightntwrk/compactc/releases (v0.31.0)
2. Extract to `C:\compact`
3. Add `C:\compact` to your Windows system PATH
4. Restart your terminal
5. Verify: `compact --version` → `compact 0.31.0`

### Install & Run

```bash
# Install root dependencies
yarn install

# Compile the Compact contract (generates contracts/managed/)
yarn compile

# Copy managed artifacts to frontend
yarn copy:managed

# Start local Docker network (proof-server + indexer + midnight-node)
yarn env:up

# In another terminal — start the frontend dev server
cd frontend
yarn install
yarn dev
```

App runs at: `http://localhost:5173`

### Environment Variables (Preprod/Preview)

```bash
cp .env.preprod.example .env.preprod
# Edit .env.preprod with your wallet mnemonic
```

---

## 🧪 Testing

### Local (Docker) — requires `yarn env:up` running

```bash
# Wait for DUST tokens to accrue in the local wallet
npx vite-node scripts/wait-for-dust.ts

# Run the full NoxBallot test suite
yarn test:local
```

### Preprod

```bash
yarn test:preprod  # requires MIDNIGHT_PREPROD_MNEMONIC in .env.preprod
```

### Test Coverage

| Test | Description |
|---|---|
| `deploys the NoxBallot voting contract` | Contract deploys, all ledger state initialized correctly |
| `allows a valid voter to cast a ballot privately` | ZK proof generated, tally incremented, individual choice hidden |
| `prevents double voting using the nullifier mechanism` | Second vote from same voter_id is rejected by the ZK circuit |
| `allows admin to close the voting session` | Admin circuit authenticates via private key hash |

---

## 🏗️ Architecture

```
NoxBallot/
├── contracts/
│   ├── noxballot.compact       ← Compact source (the ONLY file you write)
│   ├── index.ts                ← Contract entry point for Node.js
│   └── managed/                ← AUTO-GENERATED by compact compile
│       └── noxballot/
│           ├── contract/       ← TypeScript types + JS module
│           └── keys/           ← ZK proving/verifying keys
├── frontend/
│   ├── src/
│   │   ├── lib/midnight.ts     ← SDK utilities, session factory
│   │   ├── contexts/           ← WalletContext (1AM/Lace/Nightly)
│   │   ├── pages/              ← Home, Vote, Results, Admin
│   │   └── components/         ← NavBar, WalletButton, ThemeToggle
│   ├── public/managed/         ← ZK keys served at /managed/ by Vite
│   └── vercel.json             ← SPA routing + WASM CORS headers
├── src/
│   ├── config.ts               ← Network configs (local/preview/preprod)
│   ├── providers.ts            ← Provider builder for Node.js tests
│   └── test/noxballot.test.ts
├── scripts/wait-for-dust.ts    ← Pre-test DUST accrual check
├── .github/workflows/ci.yaml   ← CI/CD pipeline
└── compose.yml                 ← Local Docker network
```

### Compact Contract Circuits

| Circuit | Type | Privacy |
|---|---|---|
| `constructor` | Impure | Initializes public ledger state |
| `cast_vote` | Impure ZK | Vote choice is PRIVATE — only tally updates on-chain |
| `update_session` | Impure ZK | Admin key is PRIVATE — hash compared on-chain |
| `nox_admin_key` | Pure | Derives admin hash from secret key |
| `make_vote_nullifier` | Pure | Derives anonymous voter commitment |

---

## 🔐 Public State vs Private Witnesses

In Midnight's Compact language:

**Public (`ledger` variables)** — stored on-chain, anyone can read:
```compact
export ledger total_votes: Uint<32>;      // publicly auditable
export ledger votes_for: Uint<32>;        // publicly auditable
export ledger nullifiers: Set<Bytes<32>>; // anonymous commitments only
```

**Private (`witness` functions)** — supplied at transaction time, run only in the ZK circuit:
```compact
witness voter_credential(): VoterCredential;  // voter_id + eligibility_key — NEVER on-chain
witness vote_choice(): Uint<32>;              // the actual ballot — NEVER on-chain
```

The `cast_vote` circuit uses `disclose()` only to update the tally counters — never to reveal the individual choice. The ZK proof cryptographically certifies the computation is correct without revealing the inputs.

---

## 🌐 Networks

| Network | Indexer | Explorer |
|---|---|---|
| Local | http://localhost:8088/api/v4/graphql | None |
| Preprod | https://indexer.preprod.midnight.network/api/v4/graphql | https://preprod.midnightexplorer.com |
| Preview | https://indexer.preview.midnight.network/api/v4/graphql | https://preview.midnightexplorer.com |

**Get DUST (fee tokens):** https://faucet.preprod.midnight.network/api/drips

---

## 🚢 Deploy to Vercel

```bash
cd frontend
yarn build
# Upload dist/ to Vercel — or connect GitHub repo for auto-deploy
```

The `vercel.json` handles SPA routing and sets CORS headers required for WASM.

---

## ⚙️ CI/CD

The `.github/workflows/ci.yaml` pipeline runs on every push to `main`:

1. **install-and-test**: Installs deps → compiles contract → starts Docker network → waits for DUST → runs test suite
2. **build-frontend**: Installs frontend deps → runs Vite build

---

*Built for the Midnight Network Hackathon, September 2026.*  
*Privacy model: Zero-knowledge proofs via Compact 0.31.0 on Midnight Preprod.*  
*"Cast in shadow. Counted in light."*
