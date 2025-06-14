import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import Lights from './components/settings/lights/Lights';
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
    obiWaniFy();
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
