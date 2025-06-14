import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import { obiWaniFy } from './utils/obi';
import { useEffect, useState } from 'react';
import Settings from './components/settings/Settings';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }, [theme]);

useEffect(() => {
  const img = document.getElementById('obiWan') as HTMLImageElement | null;
  if (!img) return;

  if (img.complete && img.naturalWidth !== 0) {
    obiWaniFy();
  } else {
    img.addEventListener('load', obiWaniFy);
    return () => img.removeEventListener('load', obiWaniFy);
  }
}, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <img
        id="obiWan"
        src="/assets/obiWan.png"
        alt="Obi-Wan"
        style={{ display: 'none' }}
      />

      <Settings isDark={theme === 'dark'} onThemeChange={toggleTheme} />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Fail />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
