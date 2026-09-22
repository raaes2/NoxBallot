import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Compact ZK Circuits',
    body: 'Every ballot is synthesized via an audited zero-knowledge circuit written in Midnight’s Compact language. Your vote choice never touches the blockchain.',
    tag: 'Zero-Knowledge',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Public Verifiable Tally',
    body: 'The aggregate result is recorded directly on-chain and auditable by any network participant in real time. Nobody can alter the final count.',
    tag: 'Immutable',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    title: 'Cryptographic Nullifiers',
    body: 'Anti-double-voting is enforced cryptographically. A deterministic nullifier derived from your secret voter ID guarantees exactly one ballot per participant.',
    tag: 'Anti-Double-Vote',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Zero Identity Leakage',
    body: 'Selective disclosure allows voters to prove entitlement without revealing wallet balances, public keys, or individual voting history to observers.',
    tag: 'Anonymity',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    title: 'Engineered on Midnight L1',
    body: 'Deployed on Midnight Network — the pioneering layer-1 blockchain built specifically for programmable data protection and compliant privacy.',
    tag: 'Midnight Network',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: '1AM Wallet Native Proving',
    body: 'Flawlessly executes client-side WebAssembly ZK proofs inside the 1AM wallet extension on Preprod and Preview networks.',
    tag: 'WASM Prover',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [simChoice, setSimChoice] = useState<'for' | 'against' | 'abstain'>('for');

  // Simulated live cryptographic values for the interactive terminal
  const simHashes = {
    for: {
      choiceCode: '0x00 (AFFIRMATIVE)',
      commitment: '0x3a9f7e81...2b8c91d4',
      nullifier: '0x88e1a47b...99f01c23',
      proofStatus: 'SYNTHESIS_COMPLETE (Circuit verified)',
    },
    against: {
      choiceCode: '0x01 (DISSENT)',
      commitment: '0x5c1d89b2...4f0e67a1',
      nullifier: '0x88e1a47b...99f01c23',
      proofStatus: 'SYNTHESIS_COMPLETE (Circuit verified)',
    },
    abstain: {
      choiceCode: '0x02 (ABSTAIN)',
      commitment: '0x99a4c7e3...11d85b7e',
      nullifier: '0x88e1a47b...99f01c23',
      proofStatus: 'SYNTHESIS_COMPLETE (Circuit verified)',
    },
  };

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container text-center">
          <div className="hero__eyebrow" aria-label="Powered by Midnight Network">
            <span style={{ color: 'var(--clr-primary)' }}>●</span> MIDNIGHT L1 · CONFIDENTIAL GOVERNANCE
          </div>

          <h1 className="hero__title">
            Sovereign Ballots.<br />
            Counted in Pure Light.
          </h1>

          <p className="hero__subtitle">
            NoxBallot enables anonymous voting with zero-knowledge mathematical guarantees.
            Verify that your ballot is counted in the official tally without ever revealing
            your choice, identity, or wallet address.
          </p>

          <div className="hero__actions">
            <button
              id="cta-vote-btn"
              onClick={() => navigate('/vote')}
              className="btn btn-primary btn-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Enter Voting Booth
            </button>
            <button
              id="cta-results-btn"
              onClick={() => navigate('/results')}
              className="btn btn-ghost btn-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Audit Public Tally
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="stats-strip animate-fade-up">
            <div className="stat-pill">
              <div className="stat-pill__value">100% Client-Side</div>
              <div className="stat-pill__label">ZK Proofs Generated Locally</div>
            </div>
            <div className="stat-pill">
              <div className="stat-pill__value">0 Traces</div>
              <div className="stat-pill__label">Ballot Choice Never Stored</div>
            </div>
            <div className="stat-pill">
              <div className="stat-pill__value">1-Voter-1-Vote</div>
              <div className="stat-pill__label">Enforced by Compact Nullifiers</div>
            </div>
          </div>

          {/* Interactive ZK Ballot Terminal Simulator */}
          <div className="zk-terminal animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="zk-terminal__header">
              <div className="zk-terminal__dots">
                <div className="zk-terminal__dot zk-terminal__dot--red" />
                <div className="zk-terminal__dot zk-terminal__dot--amber" />
                <div className="zk-terminal__dot zk-terminal__dot--green" />
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                zk-circuit-simulator: NoxBallot.compact
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                LIVE SIMULATION
              </span>
            </div>

            <div className="zk-terminal__body">
              {/* Left Panel: Voter Selection */}
              <div className="zk-terminal__panel">
                <div className="zk-terminal__panel-title">
                  <span style={{ color: 'var(--clr-primary)' }}>01</span>
                  <span>Select Simulated Vote Choice</span>
                </div>
                <div className="zk-terminal__selector">
                  <button
                    type="button"
                    onClick={() => setSimChoice('for')}
                    className={`zk-terminal__choice-btn${simChoice === 'for' ? ' active' : ''}`}
                  >
                    <span>✅</span>
                    <span>Vote For</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimChoice('against')}
                    className={`zk-terminal__choice-btn${simChoice === 'against' ? ' active' : ''}`}
                  >
                    <span>❌</span>
                    <span>Vote Against</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimChoice('abstain')}
                    className={`zk-terminal__choice-btn${simChoice === 'abstain' ? ' active' : ''}`}
                  >
                    <span>⚖️</span>
                    <span>Abstain</span>
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', margin: 0 }}>
                  Witness input: <code className="mono">{simHashes[simChoice].choiceCode}</code> is passed into private witness memory. Observers never see this value.
                </p>
              </div>

              {/* Right Panel: Cryptographic Output */}
              <div className="zk-terminal__panel">
                <div className="zk-terminal__panel-title">
                  <span style={{ color: 'var(--clr-accent-light)' }}>02</span>
                  <span>Ledger State Transformation</span>
                </div>
                <div className="zk-code-stream">
                  <div>// 1. Deterministic Nullifier (Anti-Double-Vote)</div>
                  <div className="highlight mb-2">nullifier: {simHashes[simChoice].nullifier}</div>
                  <div>// 2. Secret Ballot Commitment</div>
                  <div className="accent mb-2">commitment: {simHashes[simChoice].commitment}</div>
                  <div>// 3. Compact Proof Output</div>
                  <div style={{ color: 'var(--clr-success)' }}>status: {simHashes[simChoice].proofStatus}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cryptographic Privacy Matrix */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-header__eyebrow">Cryptographic Matrix</p>
            <h2>Verifiable Consensus vs Confidentiality</h2>
            <p style={{ maxWidth: 580, margin: '0.75rem auto 0' }}>
              NoxBallot uses zero-knowledge proofs to guarantee complete transparency of results
              while mathematically protecting individual voting secrecy.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Can see */}
            <div className="card animate-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--clr-success-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-success)',
                    fontSize: '1.1rem',
                  }}
                >
                  ✓
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Public On-Chain Ledger</h3>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {[
                  'Aggregate tally counts (For / Against / Abstain)',
                  'Total verified ballots submitted to the session',
                  'Anonymous nullifier commitments on the Midnight ledger',
                  'Session parameters: deadline timestamp and voter quota',
                  'Proof of valid circuit execution verified by Midnight consensus',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--clr-text-secondary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                    }}
                  >
                    <span style={{ color: 'var(--clr-success)', fontWeight: 700 }}>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cannot see */}
            <div className="card card--accent animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--clr-accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-accent-light)',
                    fontSize: '1.1rem',
                  }}
                >
                  🔒
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Cryptographically Concealed</h3>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {[
                  'Which option any individual participant chose',
                  'Voter wallet address, public key, or IP footprint',
                  'Voter private eligibility credential and seed key',
                  'Pre-image data linking a nullifier to a specific voter',
                  'Any backdoor or administrative power to rewrite cast votes',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--clr-text-secondary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                    }}
                  >
                    <span style={{ color: 'var(--clr-accent-light)', fontWeight: 700 }}>›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-header__eyebrow">Architecture</p>
            <h2>Governance Without Surveillance</h2>
            <p style={{ maxWidth: 580, margin: '0.75rem auto 0' }}>
              Built from first principles on Midnight Network to provide institutional-grade
              confidential governance.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feat) => (
              <div key={feat.title} className="card feature-card animate-fade-up">
                <div>
                  <div className="flex-between mb-4">
                    <div className="feature-card__icon" aria-hidden="true">
                      {feat.icon}
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {feat.tag}
                    </span>
                  </div>
                  <h4 className="feature-card__title">{feat.title}</h4>
                  <p className="feature-card__body">{feat.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              background: 'radial-gradient(circle at 50% 0%, rgba(0, 245, 160, 0.1) 0%, rgba(13, 19, 32, 0.9) 70%)',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Cast Your Sovereign Vote Today</h2>
            <p style={{ maxWidth: 520, margin: '0 auto 2rem' }}>
              Connect your 1AM wallet, load the active proposal contract, and let the zero-knowledge
              prover seal your democratic choice.
            </p>
            <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
              <button
                id="cta-bottom-vote-btn"
                onClick={() => navigate('/vote')}
                className="btn btn-primary btn-lg"
              >
                Go to Ballot Booth
              </button>
              <button
                id="cta-bottom-admin-btn"
                onClick={() => navigate('/admin')}
                className="btn btn-ghost btn-lg"
              >
                Contract Administration
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
