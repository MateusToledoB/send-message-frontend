import { useState } from 'react';
import Login from './pages/login/login';
import IndexPage from './pages/index/index';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <IndexPage />;
}

export default App;
