import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import { obiWaniFy } from './utils/obi';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    obiWaniFy();
  }, []);

  return (
    <>
      <img
        id="obiWan"
        src="/assets/obiWan.png"
        alt="Obi-Wan"
        style={{ display: 'none' }}
      />
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
