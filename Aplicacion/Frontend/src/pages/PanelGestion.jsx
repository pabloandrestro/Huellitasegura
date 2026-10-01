import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Plus, Edit, X, Upload } from 'lucide-react';

export default function PanelGestion({ onLogout }) {
  const navigate = useNavigate();

  const [adoptantes, setAdoptantes] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [, setRefugios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de Interfaz
  const [vistaActiva, setVistaActiva] = useState('bandeja'); // 'bandeja' o 'catalogo'
  const [seleccionado, setSeleccionado] = useState(null); // Para adoptantes
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // Para modal de detalles
  const [fichaClinica, setFichaClinica] = useState(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  // Estados para Formulario y Modal de Crear / Editar Mascota
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' o 'editar'
  const [animalEditandoId, setAnimalEditandoId] = useState(null);
  const [guardandoAnimal, setGuardandoAnimal] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState('');

  const [formAnimal, setFormAnimal] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    sexo: 'Macho',
    edad: '',
    historia: '',
    estado: 'En adopción',
    microchip: '',
    foto_url: ''
  });

  const [tema, setTema] = useState({ principal: '#94a3b8', secundario: '#cbd5e1' });
  const [nombreOrganizacion, setNombreOrganizacion] = useState('Gestión de Refugio');

  // Función auxiliar para formatear la URL de la imagen que viene del backend
  const obtenerUrlImagen = (url) => {
    if (!url) return 'https://via.placeholder.com/300x200?text=Sin+Foto';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const serverBase = apiBase.replace(/\/api\/?$/, '');
    return `${serverBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

        if (!token) {
          localStorage.removeItem('usuario');
          if (typeof onLogout === 'function') onLogout();
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
          setNombreOrganizacion(usuarioGuardado.organizacion);
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const [resAdoptantes, resAnimales, resRefugios] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/animales`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/refugios`, { headers })
        ]);

        if (resAdoptantes.status === 401 || resAnimales.status === 401) {
          if (typeof onLogout === 'function') onLogout();
          return;
        }

        const datosAdoptantes = await resAdoptantes.json();
        const datosAnimales = await resAnimales.json();
        const datosRefugios = await resRefugios.json();

        const listaAdoptantes = Array.isArray(datosAdoptantes) ? datosAdoptantes : (datosAdoptantes.datos || datosAdoptantes.data || datosAdoptantes.adoptantes || []);
        const listaAnimales = Array.isArray(datosAnimales) ? datosAnimales : (datosAnimales.datos || datosAnimales.data || datosAnimales.animales || []);
        const listaRefugios = Array.isArray(datosRefugios) ? datosRefugios : (datosRefugios.datos || datosRefugios.data || datosRefugios.refugios || []);

        setAdoptantes(listaAdoptantes);
        setAnimales(listaAnimales);
        setRefugios(listaRefugios);

        if (usuarioGuardado && listaRefugios.length > 0) {
          const miRefugio = listaRefugios.find(r => r.id === usuarioGuardado.id || r.usuario_id === usuarioGuardado.id);
          const nombreAmostrar = miRefugio?.nombre_organizacion || miRefugio?.nombre || usuarioGuardado.nombre || 'Refugio';
          setNombreOrganizacion(nombreAmostrar);
        } else if (listaRefugios.length > 0) {
          setNombreOrganizacion(listaRefugios[0].nombre_organizacion || listaRefugios[0].nombre || 'Refugio');
        }

        if (listaAdoptantes.length > 0) {
          setSeleccionado(listaAdoptantes[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [navigate, onLogout]);

  const abrirModalAnimal = async (animal) => {
    setAnimalSeleccionado(animal);
    setCargandoFicha(true);
    setFichaClinica(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/fichas-clinicas/animal/${animal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFichaClinica(data);
      }
    } catch (error) {
      console.error("Error al obtener la ficha clínica:", error);
    } finally {
      setCargandoFicha(false);
    }
  };

  // MANEJO DE MODAL DE FORMULARIO (REGISTRO Y EDICIÓN)
  const abrirModalCrear = () => {
    setModoModal('crear');
    setAnimalEditandoId(null);
    setFormAnimal({
      nombre: '',
      especie: 'Perro',
      raza: '',
      sexo: 'Macho',
      edad: '',
      historia: '',
      estado: 'En adopción',
      microchip: '',
      foto_url: ''
    });
    setArchivoFoto(null);
    setVistaPreviaFoto('');
    setErrorForm('');
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (animal, e) => {
    if (e) e.stopPropagation();
    setModoModal('editar');
    setAnimalEditandoId(animal.id);
    const fotoActual = animal.foto || animal.foto_url || '';
    setFormAnimal({
      nombre: animal.nombre || '',
      especie: animal.especie || 'Perro',
      raza: animal.raza || '',
      sexo: animal.sexo || 'Macho',
      edad: animal.edad || '',
      historia: animal.historia || '',
      estado: animal.estado || 'En adopción',
      microchip: animal.microchip || '',
      foto_url: fotoActual
    });
    setArchivoFoto(null);
    setVistaPreviaFoto(obtenerUrlImagen(fotoActual));
    setErrorForm('');
    setModalFormAbierto(true);
  };

  const cerrarModalForm = () => {
    setModalFormAbierto(false);
    setErrorForm('');
    setArchivoFoto(null);
    setVistaPreviaFoto('');
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setVistaPreviaFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitAnimal = async (e) => {
    e.preventDefault();
    setGuardandoAnimal(true);
    setErrorForm('');

    try {
      const token = localStorage.getItem('token');
      const esCrear = modoModal === 'crear';
      const endpoint = esCrear
        ? `${import.meta.env.VITE_API_URL}/animales`
        : `${import.meta.env.VITE_API_URL}/animales/${animalEditandoId}`;
      const metodo = esCrear ? 'POST' : 'PUT';

      // Construcción exacta de FormData para cumplir con la ruta req.body de Express
      const formData = new FormData();
      formData.append('nombre', formAnimal.nombre || '');
      formData.append('especie', formAnimal.especie || 'Perro');
      formData.append('raza', formAnimal.raza || '');
      formData.append('sexo', formAnimal.sexo || 'Macho');
      formData.append('estado', formAnimal.estado || 'En adopción');
      formData.append('microchip', formAnimal.microchip || '');
      formData.append('historia', formAnimal.historia || '');
      formData.append('edad', formAnimal.edad || '');

      // Campo 'foto' esperado por multer en el backend
      if (archivoFoto) {
        formData.append('foto', archivoFoto);
      }

      const res = await fetch(endpoint, {
        method: metodo,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.mensaje || errorData.message || 'Error al procesar la solicitud');
      }

      const dataRespuesta = await res.json();
      const animalGuardado = dataRespuesta.datos || dataRespuesta.data || dataRespuesta.animal || dataRespuesta;

      const animalActualizado = {
        ...(modoModal === 'editar' ? animales.find(a => a.id === animalEditandoId) : {}),
        ...formAnimal,
        ...(typeof animalGuardado === 'object' ? animalGuardado : {})
      };

      if (esCrear) {
        setAnimales(prev => [animalActualizado, ...prev]);
      } else {
        setAnimales(prev => prev.map(a => a.id === animalEditandoId ? animalActualizado : a));
        if (animalSeleccionado && animalSeleccionado.id === animalEditandoId) {
          setAnimalSeleccionado(animalActualizado);
        }
      }

      cerrarModalForm();
    } catch (err) {
      setErrorForm(err.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setGuardandoAnimal(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando panel de gestión... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-sm z-10">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition" 
          style={{ backgroundColor: tema.principal }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        <nav className="flex flex-col gap-6 text-slate-400 h-full">
          <button 
            onClick={() => setVistaActiva('bandeja')}
            className={`p-3 rounded-2xl transition shadow-sm ${vistaActiva === 'bandeja' ? 'text-white' : 'hover:bg-slate-100'}`}
            style={{ backgroundColor: vistaActiva === 'bandeja' ? tema.secundario : 'transparent' }}
            title="Bandeja de Adoptantes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          
          <button 
            onClick={() => setVistaActiva('catalogo')}
            className={`p-3 rounded-2xl transition shadow-sm ${vistaActiva === 'catalogo' ? 'text-white' : 'hover:bg-slate-100'}`}
            style={{ backgroundColor: vistaActiva === 'catalogo' ? tema.secundario : 'transparent' }}
            title="Catálogo de Mascotas"
          >
            <Cat className="w-6 h-6" />
          </button>

          <button className="p-3 hover:bg-slate-100 rounded-2xl transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
          
          <div className="mt-auto pt-8">
            <button 
              onClick={onLogout}
              title="Cerrar sesión" 
              className="p-3 bg-white text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition border border-red-100 shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col p-8 lg:px-12 relative overflow-y-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {nombreOrganizacion} <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {vistaActiva === 'bandeja' ? 'Revisa las solicitudes y une familias.' : 'Administra y visualiza los animales registrados.'}
              <span className="ml-1 font-bold" style={{ color: tema.principal }}>
                ({animales.length} mascotas registradas)
              </span>
            </p>
          </div>
          
          {vistaActiva === 'catalogo' && (
            <button 
              onClick={abrirModalCrear}
              className="px-6 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 transform hover:-translate-y-0.5"
              style={{ backgroundColor: tema.principal, boxShadow: `0 8px 20px -4px ${tema.principal}60` }}
            >
              <Plus className="w-5 h-5" /> + Registrar Mascota
            </button>
          )}
        </header>

        {vistaActiva === 'bandeja' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            <section className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex justify-between items-center px-1 mb-2">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">Bandeja de Entrada 💌</h2>
                <span className="text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: tema.secundario }}>
                  {adoptantes.length} Nuevas
                </span>
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[70vh] custom-scrollbar">
                {adoptantes.map((adoptante) => (
                  <div 
                    key={adoptante.id || adoptante.rut} 
                    onClick={() => setSeleccionado(adoptante)}
                    style={{
                      borderColor: seleccionado?.id === adoptante.id ? tema.principal : 'transparent',
                      boxShadow: seleccionado?.id === adoptante.id ? `0 4px 15px -3px ${tema.principal}40` : ''
                    }}
                    className={`p-5 rounded-4xl border-2 cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
                      seleccionado?.id === adoptante.id ? 'transform scale-[1.02]' : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-slate-800 text-lg">{adoptante.nombre_completo || 'Sin Nombre'}</h3>
                      <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Pendiente</span>
                    </div>
                    <p className="text-sm font-medium flex items-center gap-1 mb-4" style={{ color: tema.principal }}>
                      ♡ Para adoptar a: <span className="text-slate-600">Mascota Vinculada</span>
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Hoy</span>
                      <span className="transition" style={{ color: tema.secundario }}>Ver ficha →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {seleccionado && (
              <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col h-full min-h-[70vh]">
                <div className="rounded-4xl p-6 flex justify-between items-center mb-8 bg-opacity-10 border" style={{ backgroundColor: `${tema.secundario}20`, borderColor: `${tema.secundario}40` }}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm" style={{ color: tema.principal }}>
                      {seleccionado?.nombre_completo ? seleccionado.nombre_completo.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800">{seleccionado?.nombre_completo || 'Sin Nombre'}</h2>
                      <p className="font-medium mt-1" style={{ color: tema.secundario }}>RUT: {seleccionado?.rut || 'Sin RUT'}</p>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2" style={{ color: tema.principal }}>
                    <span>🐾</span> Postula por Mascota
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer hover:opacity-80" style={{ borderColor: `${tema.principal}50`, backgroundColor: `${tema.principal}10`, color: tema.principal }}>
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      <span className="text-xs font-bold">Ver Foto {num}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-auto">
                  <h3 className="font-extrabold text-slate-700 text-lg mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: tema.secundario }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Documentación Legal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm" style={{ color: tema.secundario }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Comprobante Ingresos.pdf</p>
                          <p className="text-xs text-slate-400 mt-0.5">Verificado automáticamente</p>
                        </div>
                      </div>
                      <button className="text-slate-600 bg-white px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition">Revisar</button>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Firma Electrónica</p>
                        <p className="text-xs text-green-600 mt-0.5">Términos aceptados</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold border-2 border-slate-200 hover:bg-slate-50 transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Solicitar más info / Rechazar
                  </button>
                  <button className="px-8 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 transform hover:-translate-y-0.5" style={{ backgroundColor: tema.principal, boxShadow: `0 10px 15px -3px ${tema.principal}60` }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Aprobar Adopción 🐾
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : (
          /* VISTA CATÁLOGO DE MASCOTAS */
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar pb-8">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-lg transition-all duration-300 relative group">
                
                {/* BOTÓN EDITAR EN LA TARJETA */}
                <button
                  onClick={(e) => abrirModalEditar(animal, e)}
                  className="absolute top-7 right-7 p-2.5 bg-white/90 hover:bg-white text-slate-600 rounded-full shadow-md transition transform hover:scale-110 z-10"
                  title="Editar mascota"
                >
                  <Edit className="w-4 h-4 text-slate-700" />
                </button>

                {/* Imagen (se mapea tanto foto como foto_url) */}
                <div 
                  className="h-48 w-full rounded-3xl mb-4 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.01]" 
                  style={{ 
                    backgroundImage: `url(${obtenerUrlImagen(animal.foto || animal.foto_url)})`,
                    backgroundColor: `${tema.secundario}20` 
                  }}
                />
                <div className="flex justify-between items-start mb-2 pr-8">
                  <h3 className="text-xl font-extrabold text-slate-800">{animal.nombre}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                    animal.estado === 'En adopción' || animal.estado === 'Disponible' 
                      ? 'bg-green-100 text-green-600' 
                      : animal.estado === 'En tratamiento' 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {animal.estado}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{animal.especie} {animal.raza ? `• ${animal.raza}` : ''}</p>
                <p className="text-sm text-slate-400 mb-5">{animal.edad || 'Edad no especificada'} • {animal.sexo}</p>
                
                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => abrirModalAnimal(animal)}
                    className="flex-1 py-3 rounded-2xl text-white font-bold transition hover:opacity-90 shadow-md"
                    style={{ backgroundColor: tema.principal }}
                  >
                    Ver detalles
                  </button>
                  <button 
                    onClick={(e) => abrirModalEditar(animal, e)}
                    className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                    title="Editar datos"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

      </main>

      {/* MODAL DETALLES DE MASCOTA */}
      {animalSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <button 
                onClick={(e) => {
                  const anim = animalSeleccionado;
                  setAnimalSeleccionado(null);
                  abrirModalEditar(anim, e);
                }}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition flex items-center gap-1.5 px-4 font-bold text-xs"
              >
                <Edit className="w-4 h-4" /> Editar Mascota
              </button>
              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              
              {/* Columna Izquierda: Foto e Info General */}
              <div className="md:w-2/5 p-8 border-r border-slate-100" style={{ backgroundColor: `${tema.secundario}10` }}>
                <div 
                  className="w-full h-64 rounded-3xl bg-cover bg-center mb-6 shadow-sm border-4 border-white"
                  style={{ backgroundImage: `url(${obtenerUrlImagen(animalSeleccionado.foto || animalSeleccionado.foto_url)})` }}
                />
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{animalSeleccionado.nombre}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.especie}</span>
                  {animalSeleccionado.raza && <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.raza}</span>}
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.sexo}</span>
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.estado}</span>
                </div>
                
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span style={{ color: tema.principal }}>📖</span> Historia / Contexto
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {animalSeleccionado.historia || 'No hay información registrada sobre cómo llegó al refugio o su comportamiento actual.'}
                </p>
              </div>

              {/* Columna Derecha: Ficha Médica */}
              <div className="md:w-3/5 p-8 bg-white">
                <h3 className="text-xl font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 pr-28 md:pr-36 whitespace-normal flex-wrap">
                  <span style={{ color: tema.principal }}>⚕️</span> Ficha Médica e Historial Veterinario
                </h3>

                {cargandoFicha ? (
                  <div className="flex items-center justify-center h-40 text-slate-400 font-medium">Cargando ficha...</div>
                ) : fichaClinica ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Estado Reproductivo</p>
                        <p className="font-bold text-slate-700 flex items-center gap-2">
                          {fichaClinica.esterilizado ? '✅ Esterilizado/a' : '❌ Sin esterilizar'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vacunas</p>
                        <p className="font-bold text-slate-700 flex items-center gap-2">
                          {fichaClinica.vacunas_al_dia ? '✅ Al día' : '❌ Incompletas'}
                        </p>
                      </div>
                    </div>
                    {fichaClinica.observaciones && (
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Observaciones</p>
                        <p className="text-sm text-slate-600 font-medium">{fichaClinica.observaciones}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 font-medium">
                    No hay ficha clínica registrada para este animal.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULARIO REGISTRO / EDICIÓN MASCOTA */}
      {modalFormAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span>🐾</span> {modoModal === 'crear' ? 'Registrar Nueva Mascota' : 'Editar Datos de Mascota'}
              </h2>
              <button 
                onClick={cerrarModalForm}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-400 font-medium text-sm mb-6">
              {modoModal === 'crear' ? 'Completa los campos para registrar una nueva mascota.' : 'Modifica los campos necesarios.'}
            </p>

            {errorForm && (
              <div className="bg-red-50 text-red-500 border border-red-100 rounded-2xl p-4 mb-6 text-sm font-bold flex items-center gap-2">
                ⚠️ {errorForm}
              </div>
            )}

            <form onSubmit={handleSubmitAnimal} className="space-y-5">
              
              {/* NOMBRE */}
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">NOMBRE</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Toby"
                  value={formAnimal.nombre}
                  onChange={(e) => setFormAnimal({ ...formAnimal, nombre: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-400 transition"
                />
              </div>

              {/* ESPECIE Y SEXO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">ESPECIE</label>
                  <select 
                    value={formAnimal.especie}
                    onChange={(e) => setFormAnimal({ ...formAnimal, especie: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-400 transition"
                  >
                    <option value="Perro">🐶 Perro</option>
                    <option value="Gato">🐱 Gato</option>
                    <option value="Otro">🐾 Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">SEXO</label>
                  <select 
                    value={formAnimal.sexo}
                    onChange={(e) => setFormAnimal({ ...formAnimal, sexo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-400 transition"
                  >
                    <option value="Macho">♂ Macho</option>
                    <option value="Hembra">♀ Hembra</option>
                  </select>
                </div>
              </div>

              {/* EDAD Y ESTADO INICIAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">EDAD / F. NACIMIENTO ESTIMADA</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 2 años"
                    value={formAnimal.edad}
                    onChange={(e) => setFormAnimal({ ...formAnimal, edad: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-400 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">ESTADO INICIAL</label>
                  <select 
                    value={formAnimal.estado}
                    onChange={(e) => setFormAnimal({ ...formAnimal, estado: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-medium text-slate-700 outline-none focus:border-slate-400 transition"
                  >
                    <option value="En adopción">En adopción</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Adoptado">Adoptado</option>
                  </select>
                </div>
              </div>

              {/* FOTO DE LA MASCOTA */}
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">FOTO DE LA MASCOTA</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-between border-2 border-dashed border-slate-200 rounded-2xl p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-bold text-slate-500 truncate max-w-[200px]">
                        {archivoFoto ? archivoFoto.name : (formAnimal.foto_url ? 'Imagen cargada' : 'Seleccionar archivo...')}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFotoChange}
                    />
                  </label>
                  {vistaPreviaFoto && (
                    <img 
                      src={vistaPreviaFoto} 
                      alt="Vista previa" 
                      className="w-14 h-14 object-cover rounded-2xl border border-slate-200 shadow-sm"
                    />
                  )}
                </div>
              </div>

              {/* HISTORIA / CONTEXTO */}
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">HISTORIA / CONTEXTO DE RESCATE</label>
                <textarea 
                  rows="3"
                  placeholder="Describe el contexto del rescate..."
                  value={formAnimal.historia}
                  onChange={(e) => setFormAnimal({ ...formAnimal, historia: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-700 outline-none focus:border-slate-400 transition resize-none"
                />
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex justify-end gap-4 mt-8 pt-4">
                <button 
                  type="button"
                  onClick={cerrarModalForm}
                  className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={guardandoAnimal}
                  className="px-8 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: tema.principal, boxShadow: `0 8px 20px -4px ${tema.principal}60` }}
                >
                  {guardandoAnimal ? 'Guardando...' : (modoModal === 'crear' ? 'Registrar' : 'Guardar Cambios')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}