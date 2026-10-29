import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Home, 
  ClipboardList, 
  Clock,
  Download,
  Phone,
  Mail,
  User,
  MessageCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function FichaSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [tabActiva, setTabActiva] = useState('formulario');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);

  // Tema de la fundación
  const [tema, setTema] = useState({ principal: '#F9A8D4', secundario: '#93C5FD' });

  useEffect(() => {
    const cargarFicha = async () => {
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

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const res = await fetch(`${apiBase}/postulaciones/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('No se pudo cargar la información de esta solicitud.');
        }

        const data = await res.json();
        const post = data.datos || data;

        setSolicitud({
          id: post.id,
          estado: post.estado_postulacion || 'En Revisión',
          postulante: {
            nombre: post.nombre_adoptante || 'Sin Nombre',
            rut: post.rut_adoptante || '',
            telefono: post.telefono_adoptante || '',
            correo: post.correo_adoptante || '',
            ciudad: post.direccion_adoptante || 'No especificada', 
            avatar: (post.nombre_adoptante || 'A').charAt(0).toUpperCase()
          },
          mascota: {
            nombre: post.nombre_animal || 'No especificada',
            especie: post.especie_animal || 'No especificada',
            foto: post.foto_animal || ''
          },
          respuestas: {
            tipo_vivienda: post.tipo_vivienda || 'No especificado',
            composicion_hogar: post.composicion_hogar || 'No especificado',
            otras_mascotas: post.otras_mascotas || 'No especificado',
            tiempo_solas: post.tiempo_solas || 'No especificado',
            motivacion: post.motivacion || 'No especificada'
          },
          documentos: post.foto_cedula_url ? [{ nombre: 'Cédula de Identidad', url: post.foto_cedula_url, fecha: 'Reciente' }] : [],
          historial: []
        });

      } catch (err) {
        console.error("Error al cargar ficha:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarFicha();
  }, [id, navigate]);

  // Función de avance de etapa con backend y notificación
  const avanzarEtapaBackend = async (nuevaEtapa, nombreEtapaTexto) => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${apiBase}/postulaciones/${solicitud.id}/etapa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: nombreEtapaTexto,
          etapa_num: nuevaEtapa
        })
      });

      if (res.ok) {
        setTabActiva(nuevaEtapa);
        setSolicitud(prev => ({ ...prev, estado: nombreEtapaTexto }));
        alert(`¡Proceso actualizado! Se envió un correo de notificación a ${solicitud.postulante.nombre}. 📩`);
      } else {
        alert('Ocurrió un error al actualizar la etapa en el servidor.');
      }
    } catch (err) {
      console.error("Error al avanzar etapa:", err);
      // Si aún no creas el endpoint en el backend, avanzamos la pestaña localmente para probar
      setTabActiva(nuevaEtapa);
    }
  };

  // Generador de enlace de WhatsApp
  const obtenerEnlaceWhatsApp = () => {
    if (!solicitud?.postulante?.telefono) return '#';
    const telefonoLimpio = solicitud.postulante.telefono.replace(/\D/g, '');
    const mensaje = encodeURIComponent(
      `Hola ${solicitud.postulante.nombre}, te contactamos desde la fundación de rescate animal por tu postulación para adoptar a ${solicitud.mascota.nombre}. ¿Cómo estás?`
    );
    return `https://wa.me/${telefonoLimpio}?text=${mensaje}`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50">
        Cargando ficha de la solicitud... 🐾
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-slate-600 bg-slate-50 gap-4">
        <p className="text-red-500 text-xl">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition">
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 flex flex-col">
      {/* HEADER PRINCIPAL */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm z-10">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5"/> Volver al panel principal
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Info del Postulante */}
            <div className="flex items-center gap-5">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-md"
                style={{ backgroundColor: tema.secundario }}
              >
                {solicitud.postulante.avatar}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-slate-800">{solicitud.postulante.nombre}</h1>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-wider">
                    {solicitud.estado}
                  </span>
                </div>
                <div className="text-slate-500 font-medium mt-2 flex gap-4 flex-wrap text-sm items-center">
                  {solicitud.postulante.rut && (
                    <span className="flex items-center gap-1"><User className="w-4 h-4"/> RUT: {solicitud.postulante.rut}</span>
                  )}
                  {solicitud.postulante.telefono && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {solicitud.postulante.telefono}</span>
                      <a 
                        href={obtenerEnlaceWhatsApp()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1"
                        title="Abrir chat de WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5"/> WhatsApp
                      </a>
                    </div>
                  )}
                  {solicitud.postulante.correo && (
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {solicitud.postulante.correo}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Mascota y Botones de Acción Global */}
            <div className="flex items-center gap-6 border-l border-slate-200 pl-6 w-full lg:w-auto">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                {solicitud.mascota.foto ? (
                  <img src={solicitud.mascota.foto} alt="Mascota" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">Sin foto</div>
                )}
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Postula por</p>
                  <p className="font-extrabold text-slate-700">{solicitud.mascota.nombre || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  className="px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition flex items-center gap-2 justify-center"
                  style={{ backgroundColor: tema.principal }}
                  onClick={() => alert('Función de aprobar en desarrollo')}
                >
                  <CheckCircle className="w-5 h-5"/> Aprobar
                </button>
                <button className="px-6 py-2.5 rounded-xl text-slate-500 bg-white border border-slate-200 font-bold hover:bg-slate-50 transition flex items-center gap-2 justify-center text-sm">
                  <XCircle className="w-4 h-4"/> Rechazar / Más info
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO Y PESTAÑAS */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
        
        {/* Navegación de Pestañas (Etapas secuenciales) */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {[
            { id: 'formulario', icon: Home, label: '1. Formulario' },
            { id: 'evaluacion', icon: ClipboardList, label: '2. Evaluación' },
            { id: 'documentos', icon: FileText, label: '3. Documentos' },
            { id: 'historial', icon: Clock, label: '4. Cierre y Contrato' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
                tabActiva === tab.id 
                  ? 'bg-slate-100 text-slate-800 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-5 h-5"/> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO DINÁMICO POR ETAPAS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          
          {/* ETAPA 1: FORMULARIO */}
          {tabActiva === 'formulario' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">Detalles del Hogar y Estilo de Vida</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Etapa 1: Verificación de información básica del postulante</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                  <ShieldCheck className="w-4 h-4"/> Datos protegidos (Ley 19.799)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Vivienda</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.tipo_vivienda}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Composición del Hogar</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.composicion_hogar}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Otras Mascotas</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.otras_mascotas}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tiempo a solas estimado</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.tiempo_solas}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Motivación para adoptar</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.motivacion}
                  </p>
                </div>
              </div>

              {/* Botón Siguiente Etapa con Conexión Backend */}
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  onClick={() => avanzarEtapaBackend('evaluacion', 'En Evaluación')}
                  className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: tema.principal }}
                >
                  Siguiente: Evaluación y Notas <ArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: EVALUACIÓN Y NOTAS */}
          {tabActiva === 'evaluacion' && (
            <div className="animate-fadeIn space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Evaluación y Pauta de Seguridad</h2>
                <p className="text-sm text-slate-400 mt-0.5">Etapa 2: Validación de filtros de la fundación (Ley Cholito)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-700 mb-4">Checklist de Verificación</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                      <span className="font-medium text-slate-700">Entrevista telefónica realizada</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                      <span className="font-medium text-slate-700">Visita domiciliaria aprobada</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                      <span className="font-medium text-slate-700">Aprobación del comité</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 mb-4">Notas Internas (Privado)</h3>
                  <textarea 
                    rows="5"
                    className="w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    placeholder="Escribe notas sobre la evaluación aquí..."
                  ></textarea>
                  <div className="flex justify-end mt-4">
                    <button className="px-6 py-2 bg-amber-200 text-amber-800 font-bold rounded-xl hover:bg-amber-300 transition">
                      Guardar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* Botones de Navegación de Etapa */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setTabActiva('formulario')}
                  className="px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 transition"
                >
                  ← Volver a Formulario
                </button>
                <button
                  onClick={() => avanzarEtapaBackend('documentos', 'Revisión de Documentos')}
                  className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: tema.principal }}
                >
                  Siguiente: Documentos <ArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: DOCUMENTOS */}
          {tabActiva === 'documentos' && (
            <div className="animate-fadeIn space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Verificación de Identidad</h2>
                <p className="text-sm text-slate-400 mt-0.5">Etapa 3: Revisión de cédula y certificados adjuntos</p>
              </div>

              {solicitud.documentos.length === 0 ? (
                <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 rounded-2xl">
                  No hay documentos adjuntos registrados para esta solicitud.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {solicitud.documentos.map((doc, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 bg-slate-50">
                      <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6"/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{doc.nombre}</p>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 w-full py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4"/> Descargar
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Botones de Navegación de Etapa */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setTabActiva('evaluacion')}
                  className="px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 transition"
                >
                  ← Volver a Evaluación
                </button>
                <button
                  onClick={() => avanzarEtapaBackend('historial', 'Cierre y Contrato')}
                  className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: tema.principal }}
                >
                  Siguiente: Cierre y Contrato <ArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 4: HISTORIAL Y CIERRE */}
          {tabActiva === 'historial' && (
            <div className="animate-fadeIn space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-800">Historial y Aprobación Final</h2>
                <p className="text-sm text-slate-400 mt-0.5">Etapa 4: Registro de actividad y emisión de contrato digital (Firma OTP)</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Clock className="w-5 h-5 text-slate-400"/> Registro de Actividad
                </div>
                <p className="text-slate-600 text-sm">
                  • Postulación recibida y en proceso de revisión de antecedentes.
                </p>
              </div>

              {/* Botones de Navegación de Etapa */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setTabActiva('documentos')}
                  className="px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 transition"
                >
                  ← Volver a Documentos
                </button>
                <button 
                  onClick={() => alert('¡Listo para aprobar y generar contrato!')}
                  className="px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: tema.principal }}
                >
                  <CheckCircle className="w-5 h-5"/> Aprobar Adopción y Generar Contrato
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}