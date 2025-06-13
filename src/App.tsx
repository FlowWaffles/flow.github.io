import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fail from './pages/Fail';
import Test from './pages/test/Test';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Fail />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
