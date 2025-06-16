import React from 'react';
import { useLayoutEffect } from 'react';
import Settings from './components/settings/Settings';
import { applyTheme } from './utils/ThemeHandler';
import PrivacyLink from './components/privacy/PrivacyLink.tsx';

function GlobalLayout({ children }: { children: React.ReactNode }) {

  useLayoutEffect(() => {
    applyTheme();
  }, []);

  return (
    <>
      <Settings />
      {children}
      <PrivacyLink/>
    </>
  );
}

export default GlobalLayout;
