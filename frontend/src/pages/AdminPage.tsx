import { useCallback, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { waitForContractDeployment } from '../lib/midnight';
import WalletButton from '../components/WalletButton';
import { Link } from 'react-router-dom';

function getCompiledContract() {
  const dummyWitnesses = {
    voter_credential: () => [{}, { voter_id: new Uint8Array(32), eligibility_key: new Uint8Array(32) }],
    admin_secret: () => [{}, new Uint8Array(32)],
    vote_choice: () => [{}, 0n],
  } as any;

  class WrappedContract extends Contract {
    constructor() {
      super(dummyWitnesses);
    }
  }

  return CompiledContract.make('NoxBallot', WrappedContract).pipe(
    CompiledContract.withWitnesses(dummyWitnesses),
    CompiledContract.withCompiledFileAssets(
      new URL('/managed', window.location.origin).toString(),
    ),
  ) as any;
}

export default function AdminPage() {
  const { session, isConnected } = useWallet();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    () => localStorage.getItem('NOXBALLOT_CONTRACT_ADDRESS'),
  );
  const [copied, setCopied] = useState(false);

  // Deploy config
  const [voterCap, setVoterCap] = useState('500');
  const [daysOpen, setDaysOpen] = useState('30');

  // Admin key for update
  const [adminSk, setAdminSk] = useState('');
  const [sessionOpen, setSessionOpen] = useState(true);

  const handleDeploy = useCallback(async () => {
    if (!session || !isConnected) return;
    setStatus('deploying');
    setErrorMsg(null);
    try {
      const compiledContract = getCompiledContract();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(daysOpen) * 24 * 60 * 60);
      const cap = BigInt(voterCap || '500');

      // Compute the admin hash from a default secret key (all zeros for demo)
      const defaultSk = new Uint8Array(32);
      const adminHash = (pureCircuits as any).vault_admin_key(defaultSk);

      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract,
        args: [adminHash, deadline, cap],
        privateStateId: 'NoxBallotAdminState',
        initialPrivateState: {},
        signingKey: sampleSigningKey(),
      });

      const contractAddress = deployTxData.public.contractAddress;

      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      // Wait for indexer to pick up the deployed contract
      await waitForContractDeployment(session.providers.publicDataProvider, contractAddress);

      setDeployedAddress(contractAddress);
      localStorage.setItem('NOXBALLOT_CONTRACT_ADDRESS', contractAddress);
      setStatus('deployed');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected, daysOpen, voterCap]);

  const handleUpdateSession = useCallback(async () => {
    if (!session || !isConnected || !deployedAddress) return;
    setUpdateStatus('updating');
    try {
      const skBytes = new Uint8Array(
        (adminSk || '0'.repeat(64)).match(/.{2}/g)!.map((b: string) => parseInt(b, 16)),
      );
      const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(daysOpen) * 24 * 60 * 60);
      const cap = BigInt(voterCap || '500');

      const callTxData = await createUnprovenCallTx(session.providers as any, {
        compiledContract: getCompiledContract(),
        contractAddress: deployedAddress,
        circuitId: 'update_session',
        witnesses: {
          voter_credential: () => [{}, { voter_id: new Uint8Array(32), eligibility_key: new Uint8Array(32) }] as any,
          admin_secret: () => [{}, skBytes] as any,
          vote_choice: () => [{}, 0n] as any,
        },
        args: [deadline, cap, sessionOpen],
      });

      await submitTxAsync(session.providers as any, {
        unprovenTx: callTxData.private.unprovenTx,
      });

      setUpdateStatus('done');
    } catch (e: any) {
      setUpdateStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected, deployedAddress, adminSk, daysOpen, voterCap, sessionOpen]);

  if (!isConnected) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 640, textAlign: 'center', paddingTop: '3rem' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--clr-accent-light)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Governance Terminal</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--clr-text-secondary)' }}>
            Connect an authorized 1AM wallet on Midnight Preprod to deploy or adjust voting parameters.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 740 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }} className="animate-fade-down">
          <p className="section-header__eyebrow">ADMINISTRATION · PROTOCOL CONTROL</p>
          <h1>Governance Terminal</h1>
          <p>
            Deploy a sovereign NoxBallot contract or update existing session parameters.
            Admin keys authenticate via private ZK witness — secrets never leave the proof.
          </p>
        </div>

        {/* Deploy section */}
        <div className="card mb-6 animate-fade-up">
          <div className="flex-between mb-4">
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚀</span> Deploy Sovereign Ballot Contract
            </h3>
            <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
              Midnight Preprod L1
            </span>
          </div>

          {/* Voter Cap Preset Chips */}
          <div className="field">
            <div className="flex-between">
              <label className="label" htmlFor="voter-cap-input">Voter Capacity Limit</label>
              <div className="flex gap-2 mb-2">
                {['100', '500', '2500', '10000'].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setVoterCap(cap)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontFamily: "'IBM Plex Mono', monospace",
                      borderColor: voterCap === cap ? 'var(--clr-primary)' : 'var(--clr-border)',
                      color: voterCap === cap ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
                    }}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
            <input
              id="voter-cap-input"
              type="number"
              className="input"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              value={voterCap}
              onChange={(e) => setVoterCap(e.target.value)}
              min="1"
              max="100000"
            />
          </div>

          {/* Days Open Preset Chips */}
          <div className="field">
            <div className="flex-between">
              <label className="label" htmlFor="days-open-input">Voting Window Duration (Days)</label>
              <div className="flex gap-2 mb-2">
                {['1', '7', '14', '30', '90'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysOpen(d)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.72rem',
                      fontFamily: "'IBM Plex Mono', monospace",
                      borderColor: daysOpen === d ? 'var(--clr-primary)' : 'var(--clr-border)',
                      color: daysOpen === d ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
                    }}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <input
              id="days-open-input"
              type="number"
              className="input"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              value={daysOpen}
              onChange={(e) => setDaysOpen(e.target.value)}
              min="1"
              max="365"
            />
          </div>

          {status === 'deployed' && deployedAddress ? (
            <div className="animate-fade-up mt-4">
              <div className="status-message status-message--success mb-4">
                <span>✅</span>
                <div>
                  <strong>Contract deployed & indexed on Midnight!</strong>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem' }}>
                    The contract is immediately available for secret ballot casting.
                  </p>
                </div>
              </div>

              <label className="label">Deployed Contract Identifier</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(0, 245, 160, 0.3)',
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
                  {deployedAddress}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(deployedAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-4">
                <Link to="/vote" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Open Ballot Booth
                </Link>
                <a
                  href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View on Midnight Explorer ↗
                </a>
              </div>
            </div>
          ) : (
            <>
              {status === 'error' && errorMsg && (
                <div className="status-message status-message--error mb-4 animate-fade-up">
                  <span>⚠️</span>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {errorMsg}
                  </pre>
                </div>
              )}

              <button
                id="deploy-contract-btn"
                onClick={handleDeploy}
                disabled={status === 'deploying'}
                className="btn btn-primary w-full mt-2"
              >
                {status === 'deploying' ? (
                  <>
                    <span className="spinner" />
                    Deploying Contract… Approve in 1AM
                  </>
                ) : (
                  '🚀 Deploy NoxBallot Contract'
                )}
              </button>
            </>
          )}
        </div>

        {/* Update session section */}
        {deployedAddress && (
          <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚙️</span> Manage Session Parameters
            </h3>

            <div className="field">
              <label className="label" htmlFor="admin-sk-input">
                Admin Secret Key (Private Witness)
              </label>
              <input
                id="admin-sk-input"
                type="password"
                className="input"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                value={adminSk}
                onChange={(e) => setAdminSk(e.target.value)}
                placeholder="64-character hex secret key (defaults to demo zeros)"
              />
              <p className="text-muted mt-2" style={{ fontSize: '0.8125rem' }}>
                Executed inside the private ZK circuit — the raw secret key is never published on-chain.
              </p>
            </div>

            <div className="field">
              <label className="label">Session Status</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  id="session-open-btn"
                  onClick={() => setSessionOpen(true)}
                  className={`btn ${sessionOpen ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                >
                  ✓ Open Session
                </button>
                <button
                  type="button"
                  id="session-close-btn"
                  onClick={() => setSessionOpen(false)}
                  className={`btn ${!sessionOpen ? 'btn-danger' : 'btn-ghost'} btn-sm`}
                >
                  ✕ Close Session
                </button>
              </div>
            </div>

            {updateStatus === 'done' && (
              <div className="status-message status-message--success mb-4 animate-fade-up">
                <span>✅</span>
                <strong>Voting session parameters successfully updated on-chain!</strong>
              </div>
            )}
            {updateStatus === 'error' && errorMsg && (
              <div className="status-message status-message--error mb-4 animate-fade-up">
                <span>⚠️</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8rem' }}>{errorMsg}</span>
              </div>
            )}

            <button
              id="update-session-btn"
              onClick={handleUpdateSession}
              disabled={updateStatus === 'updating'}
              className="btn btn-accent w-full"
            >
              {updateStatus === 'updating' ? (
                <>
                  <span className="spinner" />
                  Updating On-Chain State… Approve in 1AM
                </>
              ) : (
                'Commit Session Changes'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
