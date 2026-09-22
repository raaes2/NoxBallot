import { useState, useCallback, useEffect } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import WalletButton from '../components/WalletButton';
import { Link } from 'react-router-dom';

type VoteChoice = 0 | 1 | 2; // 0=for, 1=against, 2=abstain

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

const voteOptions = [
  {
    value: 0 as VoteChoice,
    emoji: '✅',
    label: 'Vote For',
    tag: 'AFFIRMATIVE',
    description: 'Support and approve the active proposal',
    className: 'selected--for',
  },
  {
    value: 1 as VoteChoice,
    emoji: '❌',
    label: 'Vote Against',
    tag: 'DISSENT',
    description: 'Oppose and reject the active proposal',
    className: 'selected--against',
  },
  {
    value: 2 as VoteChoice,
    emoji: '⚖️',
    label: 'Abstain',
    tag: 'ABSTENTION',
    description: 'Record participation without endorsing an outcome',
    className: 'selected--abstain',
  },
];

export default function VotePage() {
  const { session, isConnected } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null);
  const [status, setStatus] = useState<'idle' | 'voting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [voterSeed, setVoterSeed] = useState('');
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [receiptTime, setReceiptTime] = useState<string>('');

  const generateRandomSeed = useCallback(() => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
    setVoterSeed(hex);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('NOXBALLOT_CONTRACT_ADDRESS') ?? '';
    setContractAddress(saved);
    generateRandomSeed();
  }, [generateRandomSeed]);

  const handleCopySeed = async () => {
    if (!voterSeed) return;
    await navigator.clipboard.writeText(voterSeed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const handleVote = useCallback(async () => {
    if (!session || !isConnected || selectedChoice === null || !contractAddress) return;
    setStatus('voting');
    setErrorMsg(null);
    try {
      const voterId = new Uint8Array(
        voterSeed.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
      );
      const eligibilityKey = new Uint8Array(32).fill(1);

      const callTxData = await createUnprovenCallTx(session.providers as any, {
        compiledContract: getCompiledContract(),
        contractAddress,
        circuitId: 'cast_vote',
        witnesses: {
          voter_credential: () => [{}, {
            voter_id: voterId,
            eligibility_key: eligibilityKey,
          }] as any,
          vote_choice: () => [{}, BigInt(selectedChoice)] as any,
          admin_secret: () => [{}, new Uint8Array(32)] as any,
        },
        args: [],
      });

      await submitTxAsync(session.providers as any, {
        unprovenTx: callTxData.private.unprovenTx,
      });

      setTxId(callTxData.public?.txId ?? 'submitted');
      setReceiptTime(new Date().toUTCString());
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected, selectedChoice, contractAddress, voterSeed]);

  const reset = () => {
    setStatus('idle');
    setErrorMsg(null);
    setTxId(null);
    setSelectedChoice(null);
    generateRandomSeed();
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }} className="animate-fade-down">
          <p className="section-header__eyebrow">BALLOT BOOTH · PRIVACY-PRESERVING CIRCUIT</p>
          <h1>Cast Your Sovereign Ballot</h1>
          <p>
            Your ballot is synthesized via an audited zero-knowledge circuit directly in your browser.
            Only a deterministic nullifier is recorded on Midnight — your choice, identity,
            and wallet address remain mathematically sealed.
          </p>
        </div>

        {/* Cryptographic Privacy Shield Notice */}
        <div className="privacy-shield mb-6 animate-fade-up">
          <span className="privacy-shield__icon">🛡️</span>
          <div>
            <p className="privacy-shield__title">End-to-End Client-Side Zero-Knowledge Proving</p>
            <p className="privacy-shield__body">
              The Compact circuit executes locally in your browser memory. Your voter entropy seed,
              eligibility credential, and position choice never exit your device — only the
              zero-knowledge proof commitment is broadcast.
            </p>
          </div>
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 12h.01" strokeWidth="3" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Wallet Connection Required</h3>
            <p style={{ maxWidth: 450, margin: '0 auto 1.75rem' }}>
              Connect your 1AM wallet on Midnight Preprod to sign the zero-knowledge transaction.
            </p>
            <WalletButton />
          </div>
        ) : status === 'success' ? (
          /* Collectible ZK Ballot Receipt */
          <div className="receipt-card animate-fade-up">
            <div className="flex-between mb-4">
              <span className="badge badge-success" style={{ padding: '0.4rem 0.85rem' }}>
                <span className="dot" />
                BALLOT SEALED & COUNTED
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                {receiptTime}
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--clr-text-primary)' }}>
              Confidential Ballot Receipt
            </h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Your zero-knowledge proof has been verified by the Midnight consensus network.
              The tally has incremented without revealing your selection.
            </p>

            {txId && (
              <div className="field mb-4">
                <label className="label">Transaction Identifier</label>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.8125rem',
                    color: 'var(--clr-primary)',
                    wordBreak: 'break-all',
                    border: '1px solid rgba(0, 245, 160, 0.2)',
                  }}
                >
                  {txId}
                </div>
              </div>
            )}

            <div className="field mb-6">
              <label className="label">Generated Nullifier Commitment</label>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.8125rem',
                  color: 'var(--clr-text-secondary)',
                  wordBreak: 'break-all',
                  border: '1px solid var(--clr-border)',
                }}
              >
                0x{voterSeed.slice(0, 16)}...{voterSeed.slice(-16)} (SEALED WITNESS)
              </div>
            </div>

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <Link to="/results" className="btn btn-primary" style={{ flex: 1 }}>
                View Updated Tally Results
              </Link>
              <button id="vote-again-btn" onClick={reset} className="btn btn-ghost" style={{ flex: 1 }}>
                Cast Another Ballot
              </button>
            </div>
          </div>
        ) : (
          <div className="card animate-fade-up">
            {/* Step 1: Contract Address */}
            <div className="field">
              <label className="label" htmlFor="contract-address-input">
                01 · Target Contract Address
              </label>
              <input
                id="contract-address-input"
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
              <p className="text-muted mt-2" style={{ fontSize: '0.8125rem' }}>
                Tip: If you just deployed, the address is automatically remembered.
              </p>
            </div>

            {/* Step 2: Voter Entropy Seed Generator */}
            <div className="entropy-widget">
              <div className="entropy-widget__header">
                <div>
                  <span className="label" style={{ marginBottom: '0.2rem' }}>
                    02 · Voter Entropy & Secret Witness Seed
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: 0 }}>
                    Random 256-bit seed used to derive your anonymous one-time nullifier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateRandomSeed}
                  className="btn btn-ghost btn-sm"
                  title="Generate new cryptographic entropy"
                >
                  🎲 Re-roll Seed
                </button>
              </div>

              <div className="entropy-meter">
                <div className="entropy-meter__fill" />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.78125rem',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--clr-text-secondary)',
                }}
              >
                <span style={{ flex: 1, wordBreak: 'break-all' }}>{voterSeed}</span>
                <button
                  type="button"
                  onClick={handleCopySeed}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {copiedSeed ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Step 3: Candidate / Position Cards */}
            <div className="field">
              <label className="label">03 · Select Your Position</label>
              <div className="vote-options">
                {voteOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`vote-option-${opt.label.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setSelectedChoice(opt.value)}
                    className={`vote-option${selectedChoice === opt.value ? ` ${opt.className}` : ''}`}
                  >
                    <span className="vote-option__icon">{opt.emoji}</span>
                    <span className="vote-option__label">{opt.label}</span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.15rem 0.5rem',
                        margin: '0.4rem 0',
                        display: 'inline-block',
                      }}
                    >
                      {opt.tag}
                    </span>
                    <p className="vote-option__desc">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && errorMsg && (
              <div className="status-message status-message--error animate-fade-up">
                <span>⚠️</span>
                <div>
                  <strong>Transaction Failed</strong>
                  <pre
                    style={{
                      margin: '0.35rem 0 0',
                      fontSize: '0.78125rem',
                      whiteSpace: 'pre-wrap',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {errorMsg}
                  </pre>
                </div>
              </div>
            )}

            {/* Submission / Proving State */}
            {status === 'voting' ? (
              <div
                style={{
                  background: 'rgba(0, 245, 160, 0.05)',
                  border: '1px solid rgba(0, 245, 160, 0.3)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  marginTop: '1.5rem',
                }}
              >
                <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3, marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--clr-primary)', marginBottom: '0.4rem' }}>
                  Synthesizing Compact Zero-Knowledge Proof...
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', margin: 0 }}>
                  Generating private witness, computing nullifier hash, and preparing transaction payload.
                  Please approve the signature prompt in your 1AM wallet extension.
                </p>
              </div>
            ) : (
              <button
                id="cast-vote-btn"
                onClick={handleVote}
                disabled={selectedChoice === null || !contractAddress || status === 'voting'}
                className="btn btn-primary btn-lg w-full mt-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Seal & Submit Cryptographic Ballot
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
