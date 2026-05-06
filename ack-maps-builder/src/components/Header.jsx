import ThemeToggle from './ThemeToggle';

export default function Header({ onAddItem }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="header-logo-accent">ACK</span> Maps Studio
      </div>
      <div className="header-dot" />

      <div className="header-spacer" />

      <ThemeToggle />

      <luzmo-divider
        vertical
        style={{ alignSelf: 'center', height: 20, opacity: 0.3 }}
      />

      <div className="header-toolbar">
        <luzmo-button size="s" variant="primary" onClick={onAddItem}>
          + Add Item
        </luzmo-button>
      </div>
    </header>
  );
}
