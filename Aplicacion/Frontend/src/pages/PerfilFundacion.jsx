import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  Cat
} from 'lucide-react';

function PerfilFundacion() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estados del perfil
  const [perfil, setPerfil] = useState({
    nombre_organizacion: '',
    historia: '',
    telefono: '',
    direccion: ''
  });

  const [tema, setTema] = useState({ principal: '#F9A8D4', secundario: '#93C5FD' });
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

        if (!token) {
          navigate('/login');
          return;
        }

        if (usuarioGuardado.tema) {
          setTema({
            principal: usuarioGuardado.tema.principal || '#F9A8D4',
            secundario: usuarioGuardado.tema.secundario || '#93C5FD'
          });
        }

        if (usuarioGuardado.organizacion) {
          setPerfil(prev => ({
            ...prev,
            nombre_organizacion: usuarioGuardado.organizacion
          }));
        }

        if (usuarioGuardado.foto_perfil) {
          setVistaPreviaFoto(usuarioGuardado.foto_perfil);
        }

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/refugios/${usuarioGuardado.refugio_id || usuarioGuardado.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            setPerfil({
              nombre_organizacion: data.nombre_organizacion || data.nombre || usuarioGuardado.organizacion || '',
              historia: data.historia || '',
              telefono: data.telefono || '',
              direccion: data.direccion || ''
            });
            
            if (data.tema) {
              setTema({ 
                principal: data.tema.principal || '#F9A8D4', 
                secundario: data.tema.secundario || '#93C5FD' 
              });
            }
            if (data.foto_url) {
              setVistaPreviaFoto(data.foto_url);
            }
          }
        } catch (error) {
          console.log('Backend no disponible o usando datos locales:', error);
        }

      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setVistaPreviaFoto(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const token = localStorage.getItem('token');
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      const formData = new FormData();
      formData.append('nombre_organizacion', perfil.nombre_organizacion);
      formData.append('historia', perfil.historia);
      formData.append('telefono', perfil.telefono);
      formData.append('direccion', perfil.direccion);
      formData.append('tema', JSON.stringify(tema));
      
      if (archivoFoto) {
        formData.append('logo', archivoFoto);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/refugios/${usuarioGuardado.refugio_id || usuarioGuardado.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Error al actualizar el perfil');

      const nuevoUsuario = { 
        ...usuarioGuardado, 
        tema: tema, 
        organizacion: perfil.nombre_organizacion,
        foto_perfil: vistaPreviaFoto
      };
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

      setMensaje({ texto: '¡Perfil actualizado exitosamente!', tipo: 'exito' });
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Cargando perfil... 🐾
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-700">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-sm z-10 shrink-0">
        <div 
          onClick={() => navigate('/panel')}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition cursor-pointer hover:opacity-90" 
          style={{ backgroundColor: tema.principal }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        <nav className="flex flex-col gap-6 text-slate-400 h-full">
          <button 
            onClick={() => navigate('/panel')}
            className="p-3 rounded-2xl transition shadow-sm hover:bg-slate-100"
            title="Bandeja de Adoptantes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          
          <button 
            onClick={() => navigate('/panel', { state: { vista: 'catalogo' } })}
            className="p-3 rounded-2xl transition shadow-sm hover:bg-slate-100"
            title="Catálogo de Mascotas"
          >
            <Cat className="w-6 h-6" />
          </button>

          {/* Botón del Directorio de Personas */}
          <button 
            onClick={() => navigate('/directorio')}
            className="p-3 bg-white rounded-2xl transition shadow-sm border border-slate-100 hover:bg-slate-100 hover:text-slate-600 hover:scale-105"
            title="Ir a Directorio"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>

          <button 
            onClick={() => navigate('/ajustes-perfil')}
            className="p-3 rounded-2xl transition shadow-sm text-white hover:scale-105"
            style={{ backgroundColor: tema.secundario }}
            title="Ajustes de la Fundación"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          
          <div className="mt-auto pt-8">
            <button 
              onClick={handleLogout}
              title="Cerrar sesión" 
              className="p-3 bg-white text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition border border-red-100 shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl shadow-sm transition border border-slate-100"
            >
              <ArrowLeft className="w-6 h-6"/>
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Ajustes de la Fundación</h1>
              <p className="text-slate-500">Personaliza la información y colores que verán los adoptantes</p>
            </div>
          </div>
        </div>

        {mensaje.texto && (
          <div className={`max-w-5xl mx-auto w-full p-4 mb-6 rounded-xl font-medium ${
            mensaje.tipo === 'exito' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Foto y Colores */}
          <div className="col-span-1 flex flex-col gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4">Foto de Perfil Público</label>
              <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div 
                  className="w-32 h-32 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center bg-white"
                  style={{ borderColor: tema.principal }}
                >
                  {vistaPreviaFoto ? (
                    <img src={vistaPreviaFoto} alt="Previa" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300"/>
                  )}
                </div>
                <label className="cursor-pointer bg-white px-4 py-2 border border-slate-200 shadow-sm rounded-xl text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2">
                  <Upload className="w-4 h-4"/> Subir Foto
                  <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4">Colores del Tema</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-slate-500 mb-2">Color Principal</span>
                  <input 
                    type="color" 
                    value={tema.principal} 
                    onChange={(e) => setTema({ ...tema, principal: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer border-0 p-0"
                  />
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 mb-2">Color Secundario</span>
                  <input 
                    type="color" 
                    value={tema.secundario} 
                    onChange={(e) => setTema({ ...tema, secundario: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campos de Información */}
          <div className="col-span-1 lg:col-span-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Fundación</label>
                <input 
                  type="text" 
                  required
                  value={perfil.nombre_organizacion}
                  onChange={(e) => setPerfil({ ...perfil, nombre_organizacion: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nuestra Historia / Misión</label>
                <textarea 
                  rows="5"
                  placeholder="Cuenta brevemente la historia de tu fundación..."
                  value={perfil.historia}
                  onChange={(e) => setPerfil({ ...perfil, historia: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    value={perfil.telefono}
                    onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Física</label>
                  <input 
                    type="text" 
                    value={perfil.direccion}
                    onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={guardando}
                  className="px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: tema.principal }}
                >
                  {guardando ? 'Guardando...' : <><Save className="w-5 h-5"/> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PerfilFundacion;