import { useCallback, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { waitForContractDeployment } from '../lib/midnight';
import WalletButton from '../components/WalletButton';

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
        <div className="container" style={{ maxWidth: 640, textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</p>
          <h2 style={{ marginBottom: '0.75rem' }}>Admin Portal</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Connect your 1AM wallet with admin privileges to deploy and manage the NoxBallot contract.
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: '2rem', animation: 'fadeInDown 0.5s ease both' }}>
          <p className="section-header__eyebrow">Administration</p>
          <h1>Admin Portal</h1>
          <p>
            Deploy a new voting contract or update an existing session's parameters.
            Admin operations authenticate via private key — the secret never leaves the ZK proof.
          </p>
        </div>

        {/* Deploy section */}
        <div className="card mb-6 animate-fade-up">
          <h3 style={{ marginBottom: '1.5rem' }}>🚀 Deploy New Voting Contract</h3>

          <div className="field">
            <label className="label" htmlFor="voter-cap-input">Maximum Voters</label>
            <input
              id="voter-cap-input"
              type="number"
              className="input"
              value={voterCap}
              onChange={(e) => setVoterCap(e.target.value)}
              min="1"
              max="100000"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="days-open-input">Days Voting Stays Open</label>
            <input
              id="days-open-input"
              type="number"
              className="input"
              value={daysOpen}
              onChange={(e) => setDaysOpen(e.target.value)}
              min="1"
              max="365"
            />
          </div>

          {status === 'deployed' && deployedAddress ? (
            <div className="animate-fade-up">
              <div className="status-message status-message--success mb-4">
                <span>✅</span>
                <strong>Contract deployed and indexed!</strong>
              </div>
              <p className="label">Contract Address</p>
              <div className="address-box mb-4">
                <span className="mono" style={{ flex: 1 }}>{deployedAddress}</span>
                <button
                  className="address-box__copy"
                  onClick={() => {
                    navigator.clipboard.writeText(deployedAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                >
                  {copied ? '✓' : '⎘'}
                </button>
              </div>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ textDecoration: 'none' }}
              >
                🔍 View on Midnight Explorer ↗
              </a>
            </div>
          ) : (
            <>
              {status === 'error' && errorMsg && (
                <div className="status-message status-message--error mb-4">
                  <span>⚠️</span>
                  <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>{errorMsg}</pre>
                </div>
              )}
              <button
                id="deploy-contract-btn"
                onClick={handleDeploy}
                disabled={status === 'deploying'}
                className="btn btn-primary w-full"
              >
                {status === 'deploying' ? (
                  <>
                    <span className="spinner" />
                    Deploying… Approve in your 1AM wallet
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
            <h3 style={{ marginBottom: '1.5rem' }}>⚙️ Update Voting Session</h3>

            <div className="field">
              <label className="label" htmlFor="admin-sk-input">Admin Secret Key (hex)</label>
              <input
                id="admin-sk-input"
                type="password"
                className="input"
                value={adminSk}
                onChange={(e) => setAdminSk(e.target.value)}
                placeholder="Your 64-char hex admin secret (never transmitted)"
              />
              <p className="text-muted mt-1" style={{ fontSize: '0.8125rem' }}>
                This stays inside the ZK circuit — never goes on-chain.
              </p>
            </div>

            <div className="field">
              <label className="label">Session Status</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  id="session-open-btn"
                  onClick={() => setSessionOpen(true)}
                  className={`btn ${sessionOpen ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                >
                  Open
                </button>
                <button
                  id="session-close-btn"
                  onClick={() => setSessionOpen(false)}
                  className={`btn ${!sessionOpen ? 'btn-danger' : 'btn-ghost'} btn-sm`}
                >
                  Close
                </button>
              </div>
            </div>

            {updateStatus === 'done' && (
              <div className="status-message status-message--success mb-4">
                <span>✅</span>
                <strong>Session updated successfully!</strong>
              </div>
            )}
            {updateStatus === 'error' && errorMsg && (
              <div className="status-message status-message--error mb-4">
                <span>⚠️</span>
                <span>{errorMsg}</span>
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
                  Updating… Approve in 1AM
                </>
              ) : (
                '⚙️ Update Session'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
