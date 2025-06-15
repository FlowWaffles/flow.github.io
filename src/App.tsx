import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import { obiWaniFy } from './utils/obi';
import { useEffect } from 'react';
import Settings from './components/settings/Settings';

function App() {

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

  return (
    <>
      <img
        id="obiWan"
        src="/assets/obiWan.png"
        alt="Obi-Wan"
        style={{ display: 'none' }}
      />

      <Settings isDark={isDark} onThemeChange={setIsDark} />

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
