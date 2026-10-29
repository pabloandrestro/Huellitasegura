import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, Search, User, LogOut, Sparkles } from 'lucide-react';

export default function DirectorioFundaciones() {
  const navigate = useNavigate();
  const [fundaciones, setFundaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchFundaciones = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/refugios`);
        if (res.ok) {
          const data = await res.json();
          const lista = Array.isArray(data) ? data : (data.datos || data.refugios || data.data || []);
          setFundaciones(lista);
        } else {
          setFundaciones([]);
        }
      } catch (error) {
        console.error('Error al cargar fundaciones:', error);
        setFundaciones([]);
      } finally {
        setCargando(false);
      }
    };

    fetchFundaciones();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('preferencia_mascota');
    window.location.href = '/login';
  };

  const fundacionesFiltradas = Array.isArray(fundaciones) ? fundaciones.filter((f) =>
    f.nombre_organizacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.direccion?.toLowerCase().includes(busqueda.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 font-sans text-slate-700 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo cute */}
      <div className="absolute top-10 left-10 text-5xl opacity-15 pointer-events-none animate-bounce">🐾</div>
      <div className="absolute top-1/3 right-12 text-6xl opacity-15 pointer-events-none">✨</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-15 pointer-events-none">🦴</div>

      {/* Barra de Navegación del Adoptante */}
      <header className="bg-white/85 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => navigate('/fundaciones')}
          >
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              🐾
            </div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              Huellita Segura
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/perfil-adoptante')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-100 text-pink-600 font-bold text-xs hover:bg-pink-200 transition shadow-sm active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Encabezado */}
      <main className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-extrabold text-xs mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Red de Refugios Aliados</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Encuentra tu nuevo compañero 💖
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium">
            Explora las fundaciones registradas y descubre patitas esperando un hogar lleno de amor.
          </p>

          {/* Buscador Súper Cute */}
          <div className="relative mt-8 max-w-lg mx-auto">
            <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-pink-400" />
            <input
              type="text"
              placeholder="Busca por nombre de fundación o ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-3xl border-2 border-pink-100 bg-white shadow-lg shadow-pink-100/50 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Tarjetas de Fundaciones con Skeletons de Carga */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] border-2 border-pink-100 p-6 h-80 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-24 bg-pink-100 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-slate-200 rounded-xl w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
                  </div>
                </div>
                <div className="h-12 bg-pink-100 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : fundacionesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-pink-100 shadow-xl max-w-md mx-auto p-8">
            <div className="text-5xl mb-3">😿</div>
            <p className="font-bold text-slate-700 text-lg">No se encontraron fundaciones</p>
            <p className="text-xs text-slate-400 mt-1">Intenta buscando con otro término.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundacionesFiltradas.map((fundacion) => {
              const colorBase = fundacion.color_principal || '#F472B6';

              return (
                <div
                  key={fundacion.id || fundacion._id}
                  className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden flex flex-col justify-between group hover:-translate-y-2"
                  style={{ borderColor: `${colorBase}40` }}
                >
                  <div>
                    <div
                      className="h-28 p-5 relative flex items-center justify-between"
                      style={{ backgroundColor: colorBase }}
                    >
                      <div className="absolute inset-0 bg-black/5"></div>
                      <div className="w-20 h-20 rounded-3xl bg-white p-2.5 shadow-lg border-4 border-white flex items-center justify-center absolute -bottom-8 left-6 overflow-hidden group-hover:scale-105 transition-transform">
                        {fundacion.logo_url || fundacion.logo ? (
                          <img
                            src={fundacion.logo_url || fundacion.logo}
                            alt={fundacion.nombre_organizacion}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-9 h-9" style={{ color: colorBase }} />
                        )}
                      </div>
                    </div>

                    <div className="pt-10 px-7 pb-6">
                      <h3 className="text-xl font-extrabold text-slate-800 mb-3">
                        {fundacion.nombre_organizacion}
                      </h3>

                      <div className="space-y-2.5 text-xs font-medium text-slate-600 mb-6">
                        {fundacion.direccion && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <MapPin className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span className="truncate">{fundacion.direccion}</span>
                          </div>
                        )}
                        {fundacion.telefono && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <Phone className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span>{fundacion.telefono}</span>
                          </div>
                        )}
                        {fundacion.email_contacto && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <Mail className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span className="truncate">{fundacion.email_contacto}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-7 pt-0">
                    <button
                      onClick={() => navigate(`/catalogo-adoptante?fundacion=${fundacion.id || fundacion._id}`)}
                      className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-95 group-hover:shadow-lg"
                      style={{ backgroundColor: colorBase }}
                    >
                      <span>Ver Mascotas Disponibles</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}