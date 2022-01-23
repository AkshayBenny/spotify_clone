import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';


const code = new URLSearchParams(window.location.search).get('code');

function App() {
  return <div>
    {code ? <Dashboard code={code} /> : <Login />}
  </div>;
}

export default App;

