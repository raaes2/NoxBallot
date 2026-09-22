import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import { useEffect } from 'react';

// Apply saved theme preference immediately before first paint
function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem('noxBallot-theme') ?? 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <ThemeInitializer />
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--clr-primary)' }}>●</span>
              <span>NOXBALLOT</span>
              <span style={{ color: 'var(--clr-text-muted)' }}>— Confidential Governance</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>
              Built with zero-knowledge Compact circuits on{' '}
              <a
                href="https://midnight.network"
                target="_blank"
                rel="noopener noreferrer"
              >
                Midnight Network
              </a>{' '}
              · Cast in shadow. Counted in light.
            </p>
          </div>
        </footer>
      </WalletProvider>
    </BrowserRouter>
  );
}
