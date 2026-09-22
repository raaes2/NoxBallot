import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '⬡',
    title: 'Zero-Knowledge Ballots',
    body: 'Every vote is proven via a ZK circuit built in Compact. Your choice never touches the blockchain — only an anonymous cryptographic commitment does.',
  },
  {
    icon: '📊',
    title: 'Verifiable Public Tally',
    body: 'The aggregate result is fully on-chain and auditable by anyone. Nobody can tamper with the count — and nobody can read individual ballots.',
  },
  {
    icon: '⛔',
    title: 'Nullifier Anti-Double-Vote',
    body: 'A unique nullifier derived from your voter identity ensures each eligible participant casts exactly one ballot — enforced by the ZK proof.',
  },
  {
    icon: '🕶️',
    title: 'Selective Disclosure',
    body: 'You decide what is revealed. Wallet address, identity, and ballot choice are never written to the ledger — only the outcome matters.',
  },
  {
    icon: '🌐',
    title: 'Midnight Network',
    body: 'Built on the only L1 chain engineered from the ground up for data protection. Privacy is the protocol, not a plugin.',
  },
  {
    icon: '🔑',
    title: '1AM Wallet Integration',
    body: 'Seamlessly pairs with the 1AM wallet extension on Preprod and Preview networks for frictionless ZK proof generation.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container" style={{ position: 'relative' }}>
          {/* Orbit decoration */}
          <div className="orbit-container" aria-hidden="true">
            <div className="orbit orbit-1" />
            <div className="orbit orbit-2" />
            <div className="orbit orbit-3" />
          </div>

          <div className="hero__eyebrow" aria-label="Powered by Midnight Network">
            <span>⬡</span> Midnight Network · Zero-Knowledge Voting
          </div>

          <h1 className="hero__title">
            Cast in shadow.<br />
            Counted in light.
          </h1>

          <p className="hero__subtitle">
            NoxBallot lets you cast anonymous votes with cryptographic guarantees.
            Prove you voted — without revealing your choice, your identity, or your wallet address.
          </p>

          <div className="hero__actions">
            <button
              id="cta-vote-btn"
              onClick={() => navigate('/vote')}
              className="btn btn-primary btn-lg glow-pulse"
            >
              ⬡ Cast Your Ballot
            </button>
            <button
              id="cta-results-btn"
              onClick={() => navigate('/results')}
              className="btn btn-ghost btn-lg"
            >
              📊 View Tally
            </button>
          </div>
        </div>
      </section>

      {/* Privacy model summary */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="card card--accent animate-fade-up">
              <h3 style={{ color: 'var(--clr-success)', marginBottom: '0.75rem' }}>
                ✅ What observers CAN see
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {[
                  'That a vote was cast (circuit invoked)',
                  'Total number of ballots recorded',
                  'Aggregate tally: For / Against / Abstain',
                  'The anonymous nullifier commitment',
                  'Whether the voting session is open',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--clr-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--clr-success)' }}>›</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <h3 style={{ color: 'var(--clr-error)', marginBottom: '0.75rem' }}>
                🚫 What observers CANNOT see
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {[
                  'How any individual voted (For/Against/Abstain)',
                  "The voter's identity or wallet address",
                  "The voter's eligibility key",
                  'The nullifier preimage (voter ID)',
                  'Who controls or manages the contract',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--clr-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--clr-error)' }}>›</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-header__eyebrow">How it works</p>
            <h2>Privacy by cryptography, not by policy</h2>
            <p style={{ maxWidth: 560, margin: '1rem auto 0' }}>
              NoxBallot uses Compact — a zero-knowledge circuit language — to write voting rules
              that execute entirely in the proof. Your private data never leaves your device.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="card feature-card animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="feature-card__icon" aria-hidden="true">
                  {feat.icon}
                </div>
                <h4 className="feature-card__title">{feat.title}</h4>
                <p className="feature-card__body">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div
            className="card"
            style={{ textAlign: 'center', background: 'var(--clr-bg-glass)', padding: '3rem 2rem' }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Ready to cast your anonymous ballot?</h2>
            <p style={{ marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              Connect your 1AM wallet, choose your position, and let the ZK circuit handle the rest.
              Your ballot is mathematically sealed.
            </p>
            <button
              id="cta-bottom-vote-btn"
              onClick={() => navigate('/vote')}
              className="btn btn-accent btn-lg glow-pulse-cyan"
            >
              ⬡ Vote Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
