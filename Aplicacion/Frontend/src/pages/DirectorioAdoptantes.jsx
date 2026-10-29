import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Search } from 'lucide-react';

export default function DirectorioAdoptantes({ onLogout }) {
  const navigate = useNavigate();
  const [adoptantes, setAdoptantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para mantener la misma estética del panel
  const [tema, setTema] = useState({ principal: '#94a3b8', secundario: '#cbd5e1' });
  const [nombreOrganizacion, setNombreOrganizacion] = useState('Gestión de Refugio');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

        if (!token) {
          navigate('/login');
          return;
        }

        // 1. Restaurar los colores y nombre tal como en el panel
        if (usuarioGuardado.tema) {
          setTema({
            principal: usuarioGuardado.tema.principal || '#F9A8D4',
            secundario: usuarioGuardado.tema.secundario || '#93C5FD'
          });
        }
        if (usuarioGuardado.organizacion) {
          setNombreOrganizacion(usuarioGuardado.organizacion);
        }

        // 2. Hacer el Fetch solo de los adoptantes
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const data = await respuesta.json();
        const listaAdoptantes = Array.isArray(data) ? data : (data.datos || data.data || []);
        
        setAdoptantes(listaAdoptantes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [navigate]);

  // Filtrado dinámico según lo que se escriba en el buscador
  const adoptantesFiltrados = adoptantes.filter(item => {
    const termino = busqueda.toLowerCase();
    const nombre = (item.nombre_completo || item.nombre || '').toLowerCase();
    const rut = (item.rut || '').toLowerCase();
    const email = (item.email || item.correo || '').toLowerCase();
    return nombre.includes(termino) || rut.includes(termino) || email.includes(termino);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando directorio... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-sm z-10 shrink-0">
        
        {/* Ícono 1: Inicio / Dashboard */}
        <div 
          onClick={() => navigate('/panel', { state: { vista: 'inicio' } })}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition cursor-pointer hover:opacity-90 hover:scale-105" 
          style={{ backgroundColor: tema.principal }}
          title="Ir a Inicio"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>

        <nav className="flex flex-col gap-6 text-slate-400 h-full">
          
          {/* Ícono 2: Bandeja */}
          <button 
            onClick={() => navigate('/panel', { state: { vista: 'bandeja' } })}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 hover:scale-105"
            title="Ir a Bandeja"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          
          {/* Ícono 3: Catálogo */}
          <button 
            onClick={() => navigate('/panel', { state: { vista: 'catalogo' } })}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 hover:scale-105"
            title="Ir a Catálogo"
          >
            <Cat className="w-6 h-6" />
          </button>

          {/* Ícono 4: Directorio de Adoptantes (Activo) */}
          <button 
            className="p-3 rounded-2xl transition shadow-sm text-white hover:scale-105"
            style={{ backgroundColor: tema.secundario }}
            title="Directorio de Adoptantes (Activo)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
          
          {/* Ícono 5: Ajustes de la Fundación */}
          <button 
            onClick={() => navigate('/ajustes-perfil')}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 hover:scale-105"
            title="Ajustes de la Fundación"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>

          {/* Cerrar Sesión */}
          <div className="mt-auto pt-8">
            <button 
              onClick={() => {
                if (typeof onLogout === 'function') onLogout();
                else {
                  localStorage.removeItem('token');
                  navigate('/login');
                }
              }}
              title="Cerrar sesión" 
              className="p-3 bg-white text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition border border-red-100 shadow-sm hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL DEL DIRECTORIO */}
      <main className="flex-1 flex flex-col p-8 lg:px-12 relative overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {nombreOrganizacion} <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Directorio completo de familias postulantes.
              <span className="ml-1 font-bold" style={{ color: tema.principal }}>
                ({adoptantes.length} registros)
              </span>
            </p>
          </div>
        </header>

        {/* BARRA DE BÚSQUEDA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, RUT o email..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ '--tw-ring-color': tema.principal }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex-1">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: tema.principal }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Directorio General</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: `${tema.secundario}15` }}>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">RUT</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Nombre Completo</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Email</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Teléfono</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Dirección</th>
                </tr>
              </thead>
              <tbody>
                {adoptantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                      {busqueda ? 'No se encontraron adoptantes que coincidan con la búsqueda.' : 'No hay adoptantes registrados aún.'}
                    </td>
                  </tr>
                ) : (
                  adoptantesFiltrados.map((persona) => (
                    <tr key={persona.id || persona.rut} className="border-b border-slate-50 hover:bg-slate-50 transition cursor-default">
                      <td className="p-4 font-medium text-slate-500">{persona.rut || 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-700">{persona.nombre_completo}</td>
                      <td className="p-4 text-slate-500 text-sm">{persona.email}</td>
                      <td className="p-4 text-slate-500 text-sm">{persona.telefono || 'No registrado'}</td>
                      <td className="p-4 text-slate-500 text-sm">{persona.direccion || 'No registrada'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}