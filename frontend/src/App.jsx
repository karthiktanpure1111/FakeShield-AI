import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="w-full h-full font-sans text-[#e8f5ee]">
      <div className="grid-bg fixed inset-0 pointer-events-none -z-10"></div>
      
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
