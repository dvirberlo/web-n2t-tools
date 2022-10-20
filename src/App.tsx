import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Link to="/">Home</Link>
      {" · "}
      <Link to="/p06">P06 homepage</Link>
      {" · "}
      <Link to="/foo">foo</Link>
      <Outlet />
    </div>
  );
}

export default App;
