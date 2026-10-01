import { useState, useEffect } from 'react';
import { Search, UserCheck, Eye, X, Phone, Mail, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Directorio({ tema = { principal: '#F9A8D4', secundario: '#93C5FD' } }) {
  const [adoptantes, setAdoptantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [adoptanteSeleccionado, setAdoptanteSeleccionado] = useState(null);

  useEffect(() => {
    const cargarAdoptantes = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiBase}/adoptantes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Error al obtener la lista de adoptantes');
        }

        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.datos || data.data || data.adoptantes || []);
        setAdoptantes(lista);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarAdoptantes();
  }, []);

  const adoptantesFiltrados = adoptantes.filter(item => {
    const termino = busqueda.toLowerCase();
    const nombre = (item.nombre_completo || item.nombre || '').toLowerCase();
    const rut = (item.rut || '').toLowerCase();
    const email = (item.email || item.correo || '').toLowerCase();
    return nombre.includes(termino) || rut.includes(termino) || email.includes(termino);
  });

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Cargando directorio de adoptantes... 🐾</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Barra de búsqueda y contadores */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, RUT o email..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2"
            style={{ focusRingColor: tema.principal }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600">Total registrados:</span>
          <span 
            className="text-sm font-extrabold text-white px-4 py-1.5 rounded-full shadow-sm"
            style={{ backgroundColor: tema.principal }}
          >
            {adoptantes.length} adoptantes
          </span>
        </div>
      </div>

      {/* Tabla de Adoptantes */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Adoptante</th>
                <th className="py-4 px-6">RUT</th>
                <th className="py-4 px-6">Contacto</th>
                <th className="py-4 px-6">Estado / Verificación</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {adoptantesFiltrados.length > 0 ? (
                adoptantesFiltrados.map((item) => (
                  <tr key={item.id || item.rut} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm shadow-sm"
                        style={{ backgroundColor: tema.secundario }}
                      >
                        {(item.nombre_completo || item.nombre || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{item.nombre_completo || item.nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-slate-400 font-medium">Registrado</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">
                      {item.rut || 'No especificado'}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      <p className="text-xs flex items-center gap-1 text-slate-700 font-semibold">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {item.email || item.correo || 'Sin correo'}
                      </p>
                      <p className="text-xs flex items-center gap-1 text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {item.telefono || item.fono || 'Sin teléfono'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: `${tema.principal}20`, color: tema.principal }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Datos Verificados
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setAdoptanteSeleccionado(item)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm hover:opacity-90 flex items-center gap-1 ml-auto"
                        style={{ backgroundColor: tema.principal }}
                      >
                        <Eye className="w-4 h-4" /> Ver Historial
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron adoptantes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Historial y Verificación de Datos */}
      {adoptanteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-md"
                  style={{ backgroundColor: tema.principal }}
                >
                  {(adoptanteSeleccionado.nombre_completo || adoptanteSeleccionado.nombre || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">
                    {adoptanteSeleccionado.nombre_completo || adoptanteSeleccionado.nombre}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">RUT: {adoptanteSeleccionado.rut || 'N/A'}</p>
                </div>
              </div>
              <button 
                onClick={() => setAdoptanteSeleccionado(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Correo Electrónico</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {adoptanteSeleccionado.email || adoptanteSeleccionado.correo || 'No informado'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Teléfono</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {adoptanteSeleccionado.telefono || adoptanteSeleccionado.fono || 'No informado'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Dirección</p>
                  <p className="text-sm font-bold text-slate-700">
                    {adoptanteSeleccionado.direccion || 'Sin dirección registrada'}
                  </p>
                </div>
              </div>

              {/* Historial de Postulaciones */}
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: tema.principal }} /> Historial de Actividad
                </h4>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-50 text-pink-500">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-700">Solicitud de Adopción Registrada</p>
                        <p className="text-[11px] text-slate-400">Verificando antecedentes y documentación</p>
                      </div>
                    </div>
                    <span 
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: tema.secundario }}
                    >
                      En proceso
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado de Validación */}
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: `${tema.principal}10`, borderColor: `${tema.principal}30` }}>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6" style={{ color: tema.principal }} />
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-800">Verificación de Adoptante</h5>
                    <p className="text-xs text-slate-600 mt-0.5">El perfil cuenta con datos de contacto verificados para vincular nuevos procesos de adopción.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setAdoptanteSeleccionado(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-sm"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}