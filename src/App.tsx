import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import './App.css';

export default function App() {
  return (
    <div className="App">
      <Link to="/">Home</Link>
      {' · '}
      <Link to="/p01">P01/2 hdl tester</Link>
      {' · '}
      <Link to="/p06">P06 assembler</Link>
      {' · '}
      <Link to="/foo">foo (404)</Link>
      <Outlet />
    </div>
  );
}
