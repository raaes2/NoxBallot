import { NavLink } from 'react-router-dom';
import WalletButton from './WalletButton';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  return (
    <header className="container" style={{ padding: '0 1rem' }}>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* Logo with Sealed Ballot Shield Emblem */}
        <NavLink to="/" className="navbar__logo">
          <span className="navbar__logo-icon" aria-hidden="true">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00F5A0" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="innerGlow" x1="18" y1="4" x2="18" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00F5A0" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Shield Base */}
              <path
                d="M18 3L4 9V17C4 25.5 10 32 18 34C26 32 32 25.5 32 17V9L18 3Z"
                fill="url(#innerGlow)"
                stroke="url(#shieldGrad)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Ballot Slot */}
              <path d="M12 13H24" stroke="#00F5A0" strokeWidth="2" strokeLinecap="round" />
              {/* Sealed ballot paper entering slot */}
              <rect x="15" y="8" width="6" height="6.5" rx="1" fill="#00F5A0" fillOpacity="0.9" />
              {/* Central Keyhole Core */}
              <circle cx="18" cy="21.5" r="2.8" stroke="#F8FAFC" strokeWidth="1.8" />
              <path d="M18 24.3V27.2" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="navbar__logo-text">
            <span className="brand-nox">NOX</span>
            <span className="brand-ballot">BALLOT</span>
          </span>
        </NavLink>

        {/* Nav Links */}
        <div className="navbar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
          >
            Overview
          </NavLink>
          <NavLink
            to="/vote"
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
          >
            Ballot Booth
          </NavLink>
          <NavLink
            to="/results"
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
          >
            Public Tally
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
          >
            Governance
          </NavLink>
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <div className="network-status-pill" title="Connected to Midnight Preprod Network">
            <span className="dot" />
            <span>Midnight Preprod</span>
          </div>
          <ThemeToggle />
          <WalletButton />
        </div>
      </nav>
    </header>
  );
}
