import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import GlobalLayout from './GlobalLayout'
import { useEffect } from 'react';
import { obiWaniFy } from './utils/obi';
import NotFound from './pages/not-found/NotFound'
import PrivacyPage from './pages/privacy/PrivacyPage.tsx';

function App() {
  useEffect(() => {
    obiWaniFy();
  }, []);

  return (
    <>
      <GlobalLayout>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Fail />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GlobalLayout>
    </>
  );
}

export default App;
