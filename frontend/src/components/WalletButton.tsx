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
      <div className={`flex gap-2 ${className}`}>
        <button
          id="wallet-address-btn"
          onClick={handleCopy}
          className="btn btn-ghost btn-sm flex gap-2"
          title="Click to copy address"
        >
          <span className="badge badge-success" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
            <span className="dot" />
            {walletType ? walletLabel[walletType] ?? walletType : 'Connected'}
          </span>
          <span className="wallet-btn__address">
            {address.slice(0, 8)}…{address.slice(-6)}
          </span>
          <span style={{ fontSize: '0.8rem' }}>{copied ? '✓' : '⎘'}</span>
        </button>
        <button
          id="wallet-disconnect-btn"
          onClick={disconnect}
          className="btn btn-ghost btn-sm btn-icon"
          title="Disconnect wallet"
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
        🔌 Install 1AM
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
        <>🔗 Connect Wallet</>
      )}
    </button>
  );
}
