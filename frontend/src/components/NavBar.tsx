import { NavLink } from 'react-router-dom';
import WalletButton from './WalletButton';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <NavLink to="/" className="navbar__logo">
        <span className="navbar__logo-icon" aria-hidden="true">⬡</span>
        <span className="navbar__logo-text">
          <span className="brand-nox">Nox</span>
          <span className="brand-ballot">Ballot</span>
        </span>
      </NavLink>

      {/* Nav Links */}
      <div className="navbar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/vote"
          className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
        >
          Vote
        </NavLink>
        <NavLink
          to="/results"
          className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
        >
          Results
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
        >
          Admin
        </NavLink>
      </div>

      {/* Actions */}
      <div className="navbar__actions">
        <ThemeToggle />
        <WalletButton />
      </div>
    </nav>
  );
}
