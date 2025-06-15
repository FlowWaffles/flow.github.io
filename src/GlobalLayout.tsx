import React from 'react';
import Settings from './components/settings/Settings';
import { applyTheme } from './utils/ThemeHandler';

function GlobalLayout({ children }: { children: React.ReactNode }) {
  applyTheme();
  return (
    <>
      <Settings />
      {children}
    </>
  );
}

export default GlobalLayout;
