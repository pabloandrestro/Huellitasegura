import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PanelGestion from './pages/PanelGestion';
import Registro from './pages/Registro';
import DirectorioAdoptantes from './pages/DirectorioAdoptantes';
import { Toaster } from 'react-hot-toast'; 
import PerfilFundacion from './pages/PerfilFundacion';
import FichaSolicitud from './pages/FichaSolicitud';
import PreferenciasAdoptante from './pages/PreferenciasAdoptante';
import PerfilAdoptante from './pages/PerfilAdoptante';
import DirectorioFundaciones from './pages/DirectorioFundaciones';
import CatalogoMascotasRefugio from './pages/CatalogoMascotasRefugio';
import FormularioAdopcion from './pages/FormularioAdopcion';

// Función auxiliar para determinar la ruta por defecto según el rol del usuario
const obtenerRutaPorRol = () => {
  const token = localStorage.getItem('token');
  if (!token) return '/login';
  
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const rol = usuario.rol ? usuario.rol.toLowerCase() : '';
    
    const esPersonalAdministrativo = 
      rol === 'admin' || 
      rol === 'administrador' || 
      rol === 'staff' || 
      rol === 'fundacion' || 
      usuario.refugio_id != null;

    return esPersonalAdministrativo ? '/panel' : '/fundaciones';
  } catch {
    return '/panel';
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Actualiza el estado en memoria para dar paso al panel o fundaciones
  const handleLoginSuccess = (nuevoToken) => {
    setToken(nuevoToken);
  };

  // Centraliza la limpieza profunda de la sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('preferencia_mascota');
    setToken(null); // 👈 Esto le avisa a React que ya no hay sesión activa
  };

  const rutaPorDefecto = obtenerRutaPorRol();

  return (
    <Router>
      {/* El Toaster va justo dentro del Router, antes de las rutas */}
      <Toaster position="top-center" /> 
      
      <Routes>
        {/* 1. La ruta raíz redirige lógicamente según el rol */}
        <Route path="/" element={<Navigate to={token ? rutaPorDefecto : "/login"} replace />} />

        {/* 2. Ruta explícita de Login */}
        <Route 
          path="/login" 
          element={token ? <Navigate to={rutaPorDefecto} replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* 3. Ruta de Registro */}
        <Route 
          path="/registro" 
          element={token ? <Navigate to={rutaPorDefecto} replace /> : <Registro />} 
        />
        
        {/* 4. Ruta Protegida del Panel */}
        <Route 
          path="/panel" 
          element={token ? <PanelGestion onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />

        {/* 5. Ruta Protegida del Directorio */}
        <Route 
          path="/directorio" 
          element={token ? <DirectorioAdoptantes onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        
        {/* 6. Ruta de Ajustes (Debe ir ANTES del comodín) */}
        <Route 
          path="/ajustes-perfil" 
          element={token ? <PerfilFundacion /> : <Navigate to="/login" replace />} 
        />

        {/* 7. NUEVA RUTA PARA LA FICHA COMPLETA (Debe ir ANTES del comodín) */}
        <Route 
          path="/solicitudes/:id" 
          element={token ? <FichaSolicitud /> : <Navigate to="/login" replace />} 
        />

        {/* 8. Comodín: Captura rutas rotas (SIEMPRE AL FINAL) */}
        <Route 
          path="*" 
          element={<Navigate to={token ? rutaPorDefecto : "/login"} replace />} 
        />
        <Route path="/preferencias-adoptante" element={<PreferenciasAdoptante />} 
        />

        <Route path="/perfil-adoptante" element={<PerfilAdoptante />} 
        />
        <Route path="/fundaciones" element={<DirectorioFundaciones />} /> 

        <Route path="/catalogo-adoptante" element={<CatalogoMascotasRefugio />} />

        <Route path="/fundaciones" element={<DirectorioFundaciones onLogout={handleLogout} />} />

        <Route path="/formulario-adopcion" element={<FormularioAdopcion />} />
      </Routes>
    </Router>
  );
}

export default App;