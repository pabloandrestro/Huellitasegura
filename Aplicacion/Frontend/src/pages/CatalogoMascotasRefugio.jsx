import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, ArrowLeft, ShieldCheck, Info, MapPin, CheckCircle, Phone, Mail, Building2, Sparkles } from 'lucide-react';

export default function CatalogoMascotasRefugio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refugioId = searchParams.get('fundacion');

  const [refugio, setRefugio] = useState(null);
  const [animales, setAnimales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [fichaMedica, setFichaMedica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  // Cargar información de la fundación y sus mascotas conectando al backend de forma segura
  useEffect(() => {
    if (!refugioId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Usamos TU ruta especializada del backend
        const res = await fetch(`${apiBase}/animales/catalogo/${refugioId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Tu backend ya te entrega todo empaquetado y listo para usar
          setRefugio(data.fundacion);
          setAnimales(data.animales || []);
        } else {
          console.error("Error al cargar los datos de la fundación");
        }
      } catch (error) {
        console.error("Error de conexión al cargar catálogo:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [refugioId]);

  // Cargar ficha médica al abrir el modal de una mascota
  const abrirDetalles = async (animal) => {
    setAnimalSeleccionado(animal);
    setCargandoFicha(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/fichas-clinicas/animal/${animal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFichaMedica(data);
      } else {
        setFichaMedica(null);
      }
    } catch {
      setFichaMedica(null);
    } finally {
      setCargandoFicha(false);
    }
  };

  // Función para redirigir al formulario de adopción de forma segura
  const handleQuieroAdoptar = () => {
    if (!animalSeleccionado) return;
    
    // Soportar tanto 'id' como '_id' (por si tu BD es MongoDB)
    const idMascota = animalSeleccionado.id || animalSeleccionado._id;
    
    // Cerrar el modal antes de navegar
    setAnimalSeleccionado(null);
    
    // Redirigir a la vista del formulario
    navigate(`/formulario-adopcion?mascotaId=${idMascota}&mascotaNombre=${animalSeleccionado.nombre}`);
  };

  // 1. Filtrado dinámico mejorado y normalizado
  const animalesFiltrados = animales.filter(animal => {
    const coincideTexto = animal.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          animal.raza?.toLowerCase().includes(busqueda.toLowerCase());
    
    // Normalizamos las especies a minúsculas para evitar errores de coincidencia
    const especieAnimal = animal.especie?.trim().toLowerCase() || '';
    const especieFiltro = filtroEspecie === 'Todos' ? 'todos' : filtroEspecie.trim().toLowerCase();
    
    const coincideEspecie = filtroEspecie === 'Todos' || especieAnimal === especieFiltro;
    return coincideTexto && coincideEspecie;
  });

  const colorPrimario = refugio?.color_principal || '#F472B6';
  const colorSecundario = refugio?.color_secundario || '#FBCFE8';

  return (
    <div className="min-h-screen bg-pink-50/30 font-sans text-slate-700 pb-16">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => navigate('/fundaciones')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-100 text-pink-600 font-bold text-xs hover:bg-pink-200 transition shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Fundaciones
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/fundaciones')}>
            <span className="text-2xl">🐾</span>
            <h1 className="text-xl font-extrabold text-slate-800">Huellita Segura</h1>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO / INFORMACIÓN DE LA FUNDACIÓN */}
      <div 
        className="relative py-12 px-6 overflow-hidden shadow-md mb-10 transition-colors duration-500"
        style={{ background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-6 bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/40">
          
          {/* Logo de la Fundación */}
          <div className="w-28 h-28 rounded-3xl bg-white p-3 shadow-lg border-4 border-white flex items-center justify-center overflow-hidden shrink-0">
            {refugio?.logo_url || refugio?.logo ? (
              <img 
                src={refugio.logo_url || refugio.logo} 
                alt={refugio.nombre_organizacion} 
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-12 h-12 text-pink-400" />
            )}
          </div>

          {/* Información y Datos de Contacto */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-600 font-extrabold text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Refugio Aliado Verificado
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              {refugio?.nombre_organizacion || "Cargando fundación..."}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
              {refugio?.descripcion || "Somos una organización comprometida con el rescate, rehabilitación y búsqueda de hogares llenos de amor para perritos y gatitos rescatados."}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-xs font-semibold text-slate-600">
              {refugio?.direccion && (
                <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-4 h-4 text-pink-500" /> {refugio.direccion}
                </div>
              )}
              {refugio?.telefono && (
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-xl">
                  <Phone className="w-4 h-4 text-purple-500" /> {refugio.telefono}
                </div>
              )}
              {refugio?.email_contacto && (
                <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-xl">
                  <Mail className="w-4 h-4 text-sky-500" /> {refugio.email_contacto}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: BÚSQUEDA Y MASCOTAS */}
      <main className="max-w-6xl mx-auto px-6">
        
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">Peluditos en Adopción 🐾</h3>
            <p className="text-xs text-slate-400 font-medium">Encuentra a tu nuevo mejor amigo en este refugio.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar por nombre o raza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <select 
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            >
              <option value="Todos">Todas las especies</option>
              <option value="Perro">Perros 🐶</option>
              <option value="Gato">Gatos 🐱</option>
            </select>
          </div>
        </div>

        {/* GRID DE MASCOTAS */}
        {cargando ? (
          <div className="text-center py-20 text-pink-400 font-bold text-lg animate-pulse">
            Cargando el catálogo de mascotas... 🐾
          </div>
        ) : animalesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 shadow-sm max-w-md mx-auto p-8">
            <div className="text-5xl mb-3">😿</div>
            <h4 className="font-bold text-slate-700 text-lg">No hay mascotas disponibles</h4>
            <p className="text-xs text-slate-400 mt-1">Intenta con otra búsqueda o filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {animalesFiltrados.map((animal) => (
              <div 
                key={animal.id}
                onClick={() => abrirDetalles(animal)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-pink-100 flex flex-col cursor-pointer group"
              >
                {/* FOTO CON ETIQUETAS CORREGIDAS */}
                <div className="relative h-64 overflow-hidden bg-pink-50">
                  {animal.foto_url || animal.foto ? (
                    <img 
                      src={
                        (animal.foto_url || animal.foto).startsWith('http') 
                          ? (animal.foto_url || animal.foto) 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${animal.foto_url || animal.foto}`
                      } 
                      alt={animal.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 group-hover:scale-105 transition duration-500">
                      <span className="text-4xl mb-2">🐾</span>
                      <span className="font-bold text-sm">Foto no disponible</span>
                    </div>
                  )}
                  
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-pink-600 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                    {animal.estado || 'Disponible'}
                  </span>
                  <span className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl">
                    {animal.especie}
                  </span>
                </div>

                {/* INFORMACIÓN DE LA MASCOTA */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">{animal.nombre}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5 flex justify-between">
                      <span>{animal.raza || 'Raza mestiza'}</span>
                      <span className="text-pink-500 font-bold">{animal.edad ? animal.edad : 'N/D'}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ver ficha e historia</span>
                    <div 
                      className="w-9 h-9 rounded-2xl text-white flex items-center justify-center transition shadow-md"
                      style={{ backgroundColor: colorPrimario }}
                    >
                      <Heart className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* MODAL DE DETALLE DE LA MASCOTA */}
      {animalSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-pink-100 transform transition-all my-8 flex flex-col max-h-[90vh]">
            
            {/* CABECERA DEL MODAL */}
            <div className="relative h-72 bg-pink-100 shrink-0">
              {animalSeleccionado.foto_url || animalSeleccionado.foto ? (
                <img 
                  src={
                    (animalSeleccionado.foto_url || animalSeleccionado.foto).startsWith('http') 
                      ? (animalSeleccionado.foto_url || animalSeleccionado.foto) 
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${animalSeleccionado.foto_url || animalSeleccionado.foto}`
                  } 
                  alt={animalSeleccionado.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <span className="text-6xl mb-2">🐾</span>
                  <span className="font-bold text-lg">Foto no disponible</span>
                </div>
              )}

              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-slate-700 font-extrabold flex items-center justify-center hover:bg-white shadow-lg transition"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-extrabold text-slate-800">{animalSeleccionado.nombre}</h2>
                <p className="text-xs font-bold text-pink-600">{animalSeleccionado.especie} • {animalSeleccionado.raza || 'Mestizo'}</p>
              </div>
            </div>

            {/* CUERPO DEL MODAL (CON SCROLL) */}
            <div className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1">
              
              {/* Datos generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-pink-50/60 p-3 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 font-bold block">SEXO</span>
                  <span className="text-slate-700 font-extrabold text-sm">{animalSeleccionado.sexo || 'No especificado'}</span>
                </div>
                <div className="bg-pink-50/60 p-3 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 font-bold block">EDAD</span>
                  <span className="text-slate-700 font-extrabold text-sm">{animalSeleccionado.edad ? animalSeleccionado.edad : 'N/D'}</span>
                </div>
                <div className="bg-pink-50/60 p-3 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 font-bold block">MICROCHIP</span>
                  <span className="text-slate-700 font-extrabold text-xs truncate block">{animalSeleccionado.microchip || 'Sin microchip'}</span>
                </div>
                <div className="bg-pink-50/60 p-3 rounded-2xl text-center">
                  <span className="text-xs text-slate-400 font-bold block">ESTADO</span>
                  <span className="text-pink-600 font-extrabold text-xs">{animalSeleccionado.estado}</span>
                </div>
              </div>

              {/* Historia */}
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-pink-500" /> Historia y Comportamiento
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {animalSeleccionado.historia || "Este peludito aún no tiene una historia registrada, pero está lleno de amor y listo para encontrar un hogar cálido."}
                </p>
              </div>

              {/* Ficha Médica */}
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-pink-500" /> Historial Veterinario
                </h4>
                {cargandoFicha ? (
                  <p className="text-sm text-slate-400 animate-pulse">Cargando historial médico...</p>
                ) : fichaMedica ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <CheckCircle className="w-4 h-4" /> Ficha Médica Activa Encontrada
                    </div>
                    <p className="text-xs text-slate-600"><strong>Vacunas:</strong> {fichaMedica.vacunas || 'Al día'}</p>
                    <p className="text-xs text-slate-600"><strong>Esterilizado:</strong> {fichaMedica.esterilizado ? 'Sí' : 'No'}</p>
                    <p className="text-xs text-slate-600"><strong>Tratamientos / Observaciones:</strong> {fichaMedica.tratamientos || 'Ninguno'}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 font-medium">No hay registros médicos detallados en este momento para este animal.</p>
                  </div>
                )}
              </div>

            </div>

            {/* PIE DEL MODAL */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="px-6 py-3 rounded-2xl bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition"
              >
                Cerrar
              </button>
              <button 
                onClick={handleQuieroAdoptar}
                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-md transition"
              >
                <Heart className="w-5 h-5 fill-white" />
                ¡Quiero Adoptar!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}