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
      if (!raw) throw new Error('Contract not found. Is the address correct?');
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

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: '2rem', animation: 'fadeInDown 0.5s ease both' }}>
          <p className="section-header__eyebrow">Public Tally</p>
          <h1>Live Voting Results</h1>
          <p>
            The tally is fully public and verifiable on-chain. Every ballot remains sealed.
          </p>
        </div>

        {!isConnected ? (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
            <h3 style={{ marginBottom: '0.75rem' }}>Connect to View Tally</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Connect your wallet to query the on-chain voting state.
            </p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* Query controls */}
            <div className="card mb-6 animate-fade-up">
              <div className="field">
                <label className="label" htmlFor="results-contract-input">
                  Contract Address
                </label>
                <input
                  id="results-contract-input"
                  type="text"
                  className="input"
                  placeholder="Paste the NoxBallot contract address"
                  value={contractAddress}
                  onChange={(e) => {
                    setContractAddress(e.target.value);
                    localStorage.setItem('NOXBALLOT_CONTRACT_ADDRESS', e.target.value);
                  }}
                />
              </div>
              <button
                id="fetch-results-btn"
                onClick={fetchTally}
                disabled={loading || !contractAddress}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Querying on-chain state…
                  </>
                ) : (
                  '📊 Fetch Results'
                )}
              </button>
              {lastRefreshed && (
                <p className="text-muted text-center mt-2" style={{ fontSize: '0.8125rem' }}>
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </p>
              )}
            </div>

            {error && (
              <div className="status-message status-message--error mb-4">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {tally && (
              <div className="animate-fade-up">
                {/* Session status */}
                <div className="flex-between mb-6">
                  <h2>Voting Results</h2>
                  <span className={`badge ${tally.isActive ? 'badge-success' : 'badge-error'}`}>
                    {tally.isActive && <span className="dot" />}
                    {tally.isActive ? 'Session Open' : 'Session Closed'}
                  </span>
                </div>

                {/* Stats */}
                <div className="stats-grid mb-6">
                  <div className="card stat-card">
                    <div className="stat-card__value">{tally.totalVotes.toString()}</div>
                    <div className="stat-card__label">Total Votes</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-card__value">{tally.maxVoters.toString()}</div>
                    <div className="stat-card__label">Max Voters</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-card__value">
                      {tally.totalVotes > 0n
                        ? `${pct(tally.totalVotes, tally.maxVoters).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <div className="stat-card__label">Turnout</div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-card__value" style={{ fontSize: '1rem', paddingTop: '0.25rem' }}>
                      {tally.deadline > 0n ? formatDeadline(tally.deadline) : '—'}
                    </div>
                    <div className="stat-card__label" style={{ fontSize: '0.65rem' }}>Deadline</div>
                  </div>
                </div>

                {/* Vote bars */}
                <div className="card">
                  <h3 style={{ marginBottom: '1.5rem' }}>Ballot Breakdown</h3>

                  {/* FOR */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className="flex-between mb-4" style={{ marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--clr-success)' }}>
                        ✅ For
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
                        {tally.votesFor.toString()} votes ({pct(tally.votesFor, tally.totalVotes).toFixed(1)}%)
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
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className="flex-between mb-4" style={{ marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--clr-error)' }}>
                        ❌ Against
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
                        {tally.votesAgainst.toString()} votes ({pct(tally.votesAgainst, tally.totalVotes).toFixed(1)}%)
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
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className="flex-between mb-4" style={{ marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--clr-text-muted)' }}>
                        ⬛ Abstain
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>
                        {tally.votesAbstain.toString()} votes ({pct(tally.votesAbstain, tally.totalVotes).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="vote-bar">
                      <div
                        className="vote-bar__fill vote-bar__fill--abstain"
                        style={{ width: `${pct(tally.votesAbstain, tally.totalVotes)}%` }}
                      />
                    </div>
                  </div>

                  <hr className="divider" />

                  {/* Privacy reminder */}
                  <div className="privacy-shield">
                    <span className="privacy-shield__icon">🛡️</span>
                    <div>
                      <p className="privacy-shield__title">Privacy Model Active</p>
                      <p className="privacy-shield__body">
                        These numbers are 100% verifiable on-chain. It is cryptographically
                        impossible to determine which voter cast which ballot. The ZK proof
                        ensures the tally is correct without disclosing individual choices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract address display */}
                <div className="card mt-4">
                  <p className="label">Contract Address (Preprod)</p>
                  <div className="address-box">
                    <span style={{ flex: 1 }} className="mono">{contractAddress}</span>
                    <button
                      className="address-box__copy"
                      onClick={() => navigator.clipboard.writeText(contractAddress)}
                      title="Copy address"
                    >
                      ⎘
                    </button>
                  </div>
                  <a
                    href={`https://preprod.midnightexplorer.com/contracts/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm mt-2"
                    style={{ textDecoration: 'none' }}
                  >
                    🔍 View on Midnight Explorer ↗
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
