import { useCallback, useEffect, useState } from 'react';
import { createPatchedPublicDataProvider } from '../lib/midnight';
import { ledger } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import WalletButton from '../components/WalletButton';

type TallyState = {
  totalVotes: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  maxVoters: bigint;
  isActive: boolean;
  deadline: bigint;
};

function pct(part: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((part * 10000n) / total) / 100;
}

function formatDeadline(ts: bigint): string {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ResultsPage() {
  const { session, isConnected } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [tally, setTally] = useState<TallyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('NOXBALLOT_CONTRACT_ADDRESS') ?? '';
    setContractAddress(saved);
  }, []);

  const fetchTally = useCallback(async () => {
    if (!session || !contractAddress) return;
    setLoading(true);
    setError(null);
    try {
      const provider = createPatchedPublicDataProvider(
        session.config.indexerUri,
        session.config.indexerWsUri,
      );
      const raw = await provider.queryContractState(contractAddress);
      if (!raw) throw new Error('Contract not found. Please verify the contract address.');
      const state = ledger(raw.data);
      setTally({
        totalVotes:   state.total_votes,
        votesFor:     state.votes_for,
        votesAgainst: state.votes_against,
        votesAbstain: state.votes_abstain,
        maxVoters:    state.max_voters,
        isActive:     state.is_active,
        deadline:     state.deadline,
      });
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [session, contractAddress]);

  const copyAddress = async () => {
    if (!contractAddress) return;
    await navigator.clipboard.writeText(contractAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }} className="animate-fade-down">
          <p className="section-header__eyebrow">ON-CHAIN AUDIT · IMMUTABLE TALLY</p>
          <h1>Live Governance Analytics</h1>
          <p>
            Audit official ballot totals directly from the Midnight ledger.
            Results are authenticated by cryptographic consensus while every individual choice remains sealed.
          </p>
        </div>

        {!isConnected ? (
          <div className="card text-center animate-fade-up" style={{ padding: '3.5rem 2rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(0, 245, 160, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--clr-primary)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Connect to Audit Results</h3>
            <p style={{ maxWidth: 450, margin: '0 auto 1.75rem' }}>
              Connect your wallet to query on-chain state via the Midnight indexer.
            </p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* Query Control Box */}
            <div className="card mb-6 animate-fade-up">
              <div className="field">
                <label className="label" htmlFor="results-contract-input">
                  Contract Identifier
                </label>
                <input
                  id="results-contract-input"
                  type="text"
                  className="input"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem' }}
                  placeholder="Paste the NoxBallot contract address (64 hex characters)"
                  value={contractAddress}
                  onChange={(e) => {
                    setContractAddress(e.target.value);
                    localStorage.setItem('NOXBALLOT_CONTRACT_ADDRESS', e.target.value);
                  }}
                />
              </div>
              <div className="flex gap-4">
                <button
                  id="fetch-results-btn"
                  onClick={fetchTally}
                  disabled={loading || !contractAddress}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Querying Midnight Indexer…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Fetch On-Chain Results
                    </>
                  )}
                </button>
              </div>

              {lastRefreshed && (
                <p className="text-muted text-center mt-3" style={{ fontSize: '0.8125rem', margin: '0.75rem 0 0' }}>
                  State confirmed at {lastRefreshed.toLocaleTimeString()} · Indexed on Midnight Preprod
                </p>
              )}
            </div>

            {error && (
              <div className="status-message status-message--error mb-4 animate-fade-up">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {tally && (
              <div className="animate-fade-up">
                {/* Session Status Ribbon */}
                <div className="flex-between mb-4">
                  <h2 style={{ fontSize: '1.4rem' }}>Ballot Consensus Overview</h2>
                  <span className={`badge ${tally.isActive ? 'badge-success' : 'badge-error'}`}>
                    <span className="dot" />
                    {tally.isActive ? 'Voting Session Active' : 'Voting Session Concluded'}
                  </span>
                </div>

                {/* Metrics Matrix */}
                <div className="stats-strip mb-6" style={{ maxWidth: '100%' }}>
                  <div className="stat-pill">
                    <div className="stat-pill__value">{tally.totalVotes.toString()}</div>
                    <div className="stat-pill__label">Ballots Cast</div>
                  </div>
                  <div className="stat-pill">
                    <div className="stat-pill__value">{tally.maxVoters.toString()}</div>
                    <div className="stat-pill__label">Voter Capacity</div>
                  </div>
                  <div className="stat-pill">
                    <div className="stat-pill__value">
                      {tally.maxVoters > 0n
                        ? `${pct(tally.totalVotes, tally.maxVoters).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <div className="stat-pill__label">Quorum Reached</div>
                  </div>
                </div>

                {/* Ballot Breakdown Visualizer */}
                <div className="card mb-6">
                  <div className="flex-between mb-6">
                    <h3 style={{ margin: 0 }}>Distribution of Verified Ballots</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                      Total Valid: <strong style={{ color: 'var(--clr-text-primary)' }}>{tally.totalVotes.toString()}</strong>
                    </span>
                  </div>

                  {/* FOR */}
                  <div className="mb-6">
                    <div className="flex-between mb-2">
                      <span style={{ fontWeight: 700, color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>✅</span> Affirmative (For)
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        <strong>{tally.votesFor.toString()}</strong> ({pct(tally.votesFor, tally.totalVotes).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="vote-bar">
                      <div
                        className="vote-bar__fill vote-bar__fill--for"
                        style={{ width: `${pct(tally.votesFor, tally.totalVotes)}%` }}
                      />
                    </div>
                  </div>

                  {/* AGAINST */}
                  <div className="mb-6">
                    <div className="flex-between mb-2">
                      <span style={{ fontWeight: 700, color: 'var(--clr-error)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>❌</span> Dissent (Against)
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        <strong>{tally.votesAgainst.toString()}</strong> ({pct(tally.votesAgainst, tally.totalVotes).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="vote-bar">
                      <div
                        className="vote-bar__fill vote-bar__fill--against"
                        style={{ width: `${pct(tally.votesAgainst, tally.totalVotes)}%` }}
                      />
                    </div>
                  </div>

                  {/* ABSTAIN */}
                  <div className="mb-6">
                    <div className="flex-between mb-2">
                      <span style={{ fontWeight: 700, color: 'var(--clr-accent-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>⚖️</span> Abstention
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem' }}>
                        <strong>{tally.votesAbstain.toString()}</strong> ({pct(tally.votesAbstain, tally.totalVotes).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="vote-bar">
                      <div
                        className="vote-bar__fill vote-bar__fill--abstain"
                        style={{ width: `${pct(tally.votesAbstain, tally.totalVotes)}%` }}
                      />
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '1.5rem 0' }} />

                  {/* Session Timing */}
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--clr-text-secondary)' }}>
                      Deadline: <strong style={{ color: 'var(--clr-text-primary)' }}>{tally.deadline > 0n ? formatDeadline(tally.deadline) : 'Unlimited'}</strong>
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      ZK CIRCUIT STATUS: AUDITED
                    </span>
                  </div>
                </div>

                {/* Explorer & Address Card */}
                <div className="card">
                  <label className="label">Audited Contract Address</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--clr-border)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.8125rem',
                        color: 'var(--clr-primary)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {contractAddress}
                    </span>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78125rem' }}
                    >
                      {copiedAddr ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  <a
                    href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    🔍 Inspect in Midnight Block Explorer ↗
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
