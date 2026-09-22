type Props = {
  className?: string;
};

export default function ThemeToggle({ className = '' }: Props) {
  const isDark =
    document.documentElement.getAttribute('data-theme') !== 'light';

  function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('noxBallot-theme', next);
  }

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
