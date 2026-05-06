import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import '@luzmo/lucero/switch';
import '@luzmo/lucero/icon';
import { luzmoSun, luzmoMoon } from '@luzmo/icons';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const switchRef = useRef(null);

  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;
    el.checked = theme === 'dark';
    el.size = 's';
  }, [theme]);

  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;
    const handler = () => toggleTheme();
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [toggleTheme]);

  return (
    <div className="theme-toggle">
      <luzmo-icon icon={luzmoSun} size="s" />
      <luzmo-switch ref={switchRef} />
      <luzmo-icon icon={luzmoMoon} size="s" />
    </div>
  );
}
