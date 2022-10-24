import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import AsmComparer from './pages/asm-comparer';
import HdlTester from './pages/hdl-tester';
import Home from './pages/home';
import NotFound from './pages/not-found';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/hdl-tester" element={<HdlTester />} />
          <Route path="/asm-comparer" element={<AsmComparer />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
