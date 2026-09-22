import { useCallback, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

type Props = {
  className?: string;
};

export default function WalletButton({ className = '' }: Props) {
  const { address, isConnected, isConnecting, walletStatus, walletType, connect, disconnect } =
    useWallet();
  const [copied, setCopied] = useState(false);

  const handleConnect = useCallback(async () => {
    await connect('preprod');
  }, [connect]);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [address]);

  const walletLabel: Record<string, string> = {
    '1am': '1AM',
    lace: 'Lace',
    nightly: 'Nightly',
  };

  if (isConnected && address) {
    return (
      <div className={`flex gap-2 items-center ${className}`}>
        <button
          id="wallet-address-btn"
          onClick={handleCopy}
          className="btn btn-ghost btn-sm flex gap-2"
          title="Click to copy Midnight address"
          style={{ padding: '0.4rem 0.85rem' }}
        >
          <span
            className="badge badge-success"
            style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', letterSpacing: '0.02em' }}
          >
            <span className="dot" />
            {walletType ? walletLabel[walletType] ?? walletType : '1AM'}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--clr-text-primary)',
            }}
          >
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <span style={{ fontSize: '0.75rem', color: copied ? 'var(--clr-primary)' : 'var(--clr-text-muted)' }}>
            {copied ? '✓' : '⧉'}
          </span>
        </button>
        <button
          id="wallet-disconnect-btn"
          onClick={disconnect}
          className="btn btn-ghost btn-sm btn-icon"
          title="Disconnect wallet"
          style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}
        >
          ✕
        </button>
      </div>
    );
  }

  if (walletStatus === 'checking') {
    return (
      <button className={`btn btn-ghost btn-sm ${className}`} disabled>
        <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        Detecting…
      </button>
    );
  }

  if (walletStatus === 'not-found') {
    return (
      <a
        id="install-wallet-link"
        href="https://docs.midnight.network/develop/tutorial/using/1am-wallet"
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-ghost btn-sm ${className}`}
      >
        Install 1AM
      </a>
    );
  }

  return (
    <button
      id="wallet-connect-btn"
      onClick={handleConnect}
      disabled={isConnecting}
      className={`btn btn-primary btn-sm ${className}`}
    >
      {isConnecting ? (
        <>
          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          Connecting…
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 12h.01" strokeWidth="3" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
