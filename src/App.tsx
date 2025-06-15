import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import { obiWaniFy } from './utils/obi';
import { useEffect } from 'react';
import GlobalLayout from './GlobalLayout'

function App() {

  useEffect(() => {
    const img = document.getElementById('obiWan') as HTMLImageElement | null;
    img?.addEventListener('load', obiWaniFy);
  }, []);

  return (
    <>
      <GlobalLayout>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Fail />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </BrowserRouter>
      </GlobalLayout>
    </>
  );
}

export default App;
