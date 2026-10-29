import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Home, Users, Heart, Clock, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FormularioAdopcion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mascotaId = searchParams.get('mascotaId');
  const nombreMascota = searchParams.get('mascotaNombre') || 'la mascota';
  const refugioId = searchParams.get('fundacion');

  const [refugio, setRefugio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_vivienda: '',
    composicion_hogar: '',
    otras_mascotas: '',
    tiempo_solas: '',
    motivacion: ''
  });

  // Cargar colores y datos de la fundación para personalizar el formulario
  useEffect(() => {
    const fetchRefugio = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiBase}/refugios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const listaRefugios = Array.isArray(data) ? data : (data.datos || data.refugios || data.data || []);
          // Si tenemos un refugioId lo buscamos, sino tomamos el primero como fallback
          const encontrada = listaRefugios.find(f => String(f.id || f._id) === String(refugioId)) || listaRefugios[0];
          if (encontrada) setRefugio(encontrada);
        }
      } catch (error) {
        console.error("Error al cargar colores de la fundación", error);
      }
    };
    fetchRefugio();
  }, [refugioId]);

  const colorPrimario = refugio?.color_principal || '#F472B6'; // Rosa por defecto
  const colorSecundario = refugio?.color_secundario || '#FBCFE8';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Enviando postulación al refugio...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/postulaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mascota_id: mascotaId,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Error al enviar la solicitud');

      toast.success('¡Postulación enviada con éxito! El refugio la revisará pronto 🐾', { id: toastId });
      
      setTimeout(() => {
        navigate('/fundaciones');
      }, 1800);

    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al enviar el formulario', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-12 text-slate-700 font-sans transition-colors duration-500"
      style={{ background: `linear-gradient(135deg, ${colorSecundario}40, ${colorPrimario}25)` }}
    >
      <div className="max-w-3xl mx-auto">
        
        {/* Botón Volver estilizado */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm text-slate-600 hover:text-pink-600 transition mb-6 font-bold text-xs border border-white/50 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>

        {/* Tarjeta Contenedora Principal */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 md:p-12 relative">
          
          {/* Círculo decorativo superior dinámico */}
          <div 
            className="absolute top-0 left-0 right-0 h-3 transition-all duration-500"
            style={{ background: `linear-gradient(90deg, ${colorPrimario}, ${colorSecundario})` }}
          ></div>

          {/* Encabezado */}
          <div className="border-b border-slate-100 pb-6 mb-8 mt-2">
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-xs mb-3 shadow-xs"
              style={{ backgroundColor: `${colorSecundario}80`, color: colorPrimario }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Proceso de Adopción Responsable
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Postulando para adoptar a <span style={{ color: colorPrimario }}>{nombreMascota}</span> 🐶🐱
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Completa cada sección con cuidado. Estos datos son los que evaluará la fundación en su panel de control para asegurar el hogar perfecto.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tipo de Vivienda */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:border-pink-200 transition">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4" style={{ color: colorPrimario }} /> 1. Tipo de Vivienda
              </label>
              <select
                name="tipo_vivienda"
                value={formData.tipo_vivienda}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-800 text-sm font-medium transition"
                style={{ '--tw-ring-color': colorPrimario }}
              >
                <option value="">Selecciona tu tipo de vivienda...</option>
                <option value="Casa con patio cerrado">Casa con patio cerrado 🏡</option>
                <option value="Casa sin patio">Casa sin patio 🏠</option>
                <option value="Departamento con malla de seguridad">Departamento con malla de seguridad 🏢</option>
                <option value="Departamento sin malla">Departamento sin malla 🏢</option>
              </select>
            </div>

            {/* Composición del Hogar */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:border-pink-200 transition">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: colorPrimario }} /> 2. Composición del Hogar
              </label>
              <input
                type="text"
                name="composicion_hogar"
                placeholder="Ej: 2 adultos y 1 niño (8 años)"
                value={formData.composicion_hogar}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-800 text-sm font-medium transition"
                style={{ '--tw-ring-color': colorPrimario }}
              />
            </div>

            {/* Otras Mascotas */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:border-pink-200 transition">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" style={{ color: colorPrimario }} /> 3. Otras Mascotas en el Hogar
              </label>
              <input
                type="text"
                name="otras_mascotas"
                placeholder="Ej: 1 gato castrado de 3 años / Ninguna"
                value={formData.otras_mascotas}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-800 text-sm font-medium transition"
                style={{ '--tw-ring-color': colorPrimario }}
              />
            </div>

            {/* Tiempo a Solas Estimado */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:border-pink-200 transition">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: colorPrimario }} /> 4. Tiempo a solas estimado de la mascota
              </label>
              <input
                type="text"
                name="tiempo_solas"
                placeholder="Ej: 4 a 6 horas diarias (trabajo presencial)"
                value={formData.tiempo_solas}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-800 text-sm font-medium transition"
                style={{ '--tw-ring-color': colorPrimario }}
              />
            </div>

            {/* Motivación para Adoptar */}
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 hover:border-pink-200 transition">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: colorPrimario }} /> 5. Motivación para adoptar
              </label>
              <textarea
                name="motivacion"
                rows="4"
                placeholder="Cuéntanos por qué deseas integrar a esta mascota a tu vida y qué espacio le ofrecerás..."
                value={formData.motivacion}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 bg-white text-slate-800 text-sm font-medium transition resize-none"
                style={{ '--tw-ring-color': colorPrimario }}
              ></textarea>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm">
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-pink-500 focus:ring-pink-500" />
      <span className="text-slate-600">
        Declaro que los datos proporcionados son fidedignos y autorizo su tratamiento conforme a la <strong>Ley 19.799 sobre Documentos Electrónicos y Firma Electrónica</strong>.
      </span>
    </label>
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-pink-500 focus:ring-pink-500" />
      <span className="text-slate-600">
        Me comprometo a cumplir con las normativas de tenencia responsable de mascotas exigidas por la <strong>Ley 21.020 (Ley Cholito)</strong> y los protocolos de la fundación.
      </span>
    </label>
  </div>

            {/* Botón Enviar con los colores de la fundación */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-extrabold rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 mt-8 text-base cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${colorPrimario}, #34D399)` }}
            >
              <Send className="w-5 h-5" />
              {loading ? 'Enviando postulación...' : `¡Enviar Postulación para ${nombreMascota}!`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tus datos están seguros y serán enviados directamente al refugio.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}