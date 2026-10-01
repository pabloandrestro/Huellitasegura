import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PanelGestion from './pages/PanelGestion';
import Registro from './pages/Registro';
import { Toaster } from 'react-hot-toast'; 

function App() {
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Actualiza el estado en memoria para dar paso al panel
  const handleLoginSuccess = (nuevoToken) => {
    setToken(nuevoToken);
  };

  // Centraliza la limpieza profunda de la sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
  };

  return (
    <Router>
      {/* El Toaster va justo dentro del Router, antes de las rutas */}
      <Toaster position="top-center" /> 
      
      <Routes>
        {/* 1. La ruta raíz redirige lógicamente */}
        <Route path="/" element={<Navigate to={token ? "/panel" : "/login"} replace />} />

        {/* 2. Ruta explícita de Login (Esto resuelve el Error 404/Bucle) */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/panel" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* 3. Ruta de Registro */}
        <Route 
          path="/registro" 
          element={token ? <Navigate to="/panel" replace /> : <Registro />} 
        />
        
        {/* 4. Ruta Protegida del Panel */}
        <Route 
          path="/panel" 
          element={token ? <PanelGestion onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        
        {/* 5. Comodín: Captura rutas rotas */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/panel" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;