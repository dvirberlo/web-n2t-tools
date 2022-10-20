import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import AsmComparer from "./pages/asm-comparer";
import Home from "./pages/home";
import NotFound from "./pages/not-found";

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/p06" element={<AsmComparer />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
