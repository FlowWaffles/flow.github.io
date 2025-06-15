import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';
import GlobalLayout from './GlobalLayout'

function App() {
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
