import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import GlobalLayout from './GlobalLayout'
import { useEffect } from 'react';
import { obiWaniFy } from './utils/obi';
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
            <Route path="/test" element={<Test />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </BrowserRouter>
      </GlobalLayout>
    </>
  );
}

export default App;
