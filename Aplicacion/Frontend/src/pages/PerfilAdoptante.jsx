import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Dog, Cat, Heart, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerfilAdoptante() {
  const navigate = useNavigate();
  
  // Inicialización perezosa para leer de localStorage de forma segura sin useEffect
  const [nombre, setNombre] = useState(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      return usuarioGuardado.nombre_completo || '';
    } catch (err) {
      console.error("Error al leer usuario:", err);
      return '';
    }
  });

  const [telefono, setTelefono] = useState(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      return usuarioGuardado.telefono || '';
    } catch (err) {
      console.error("Error al leer teléfono:", err);
      return '';
    }
  });

  const [preferencia, setPreferencia] = useState(() => {
    return localStorage.getItem('preferencia_mascota') || 'ambos';
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Guardando cambios...');

    try {
      localStorage.setItem('preferencia_mascota', preferencia);

      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      usuarioGuardado.nombre_completo = nombre;
      usuarioGuardado.telefono = telefono;
      localStorage.setItem('usuario', JSON.stringify(usuarioGuardado));

      toast.success('¡Perfil e intereses actualizados! Redirigiendo...', { id: toastId });

      // 🎯 Redirigir a la lista de fundaciones disponibles
      setTimeout(() => {
        navigate('/fundaciones');
      }, 1200);

    } catch (error) {
      console.error(error);
      toast.error('No se pudo actualizar el perfil', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-700">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 border border-slate-100">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <button 
            onClick={() => navigate('/fundaciones')} 
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-pink-500 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a fundaciones
          </button>
          <h1 className="text-xl font-bold text-slate-800">Mi Cuenta y Preferencias</h1>
        </div>

        <form onSubmit={handleGuardarPerfil} className="space-y-8">
          
          {/* Sección de Foto de Perfil */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 rounded-full border-4 border-pink-100 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner group">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Cambiar</span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-2">Haz clic para subir o cambiar tu foto de perfil</p>
          </div>

          {/* Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono de Contacto</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm"
              />
            </div>
          </div>

          {/* Selector Dinámico de Interés */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              ¿Qué tipo de mascota te interesa adoptar actualmente?
            </h3>
            <p className="text-xs text-slate-400 mb-4">Puedes cambiar esta preferencia cuando quieras para modificar las sugerencias.</p>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPreferencia('perro')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  preferencia === 'perro' 
                    ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm scale-105' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Dog className="w-6 h-6 mb-1 text-blue-500" />
                <span className="text-xs font-bold">Perros</span>
              </button>

              <button
                type="button"
                onClick={() => setPreferencia('gato')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  preferencia === 'gato' 
                    ? 'border-pink-500 bg-pink-50/80 text-pink-700 shadow-sm scale-105' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Cat className="w-6 h-6 mb-1 text-pink-500" />
                <span className="text-xs font-bold">Gatos</span>
              </button>

              <button
                type="button"
                onClick={() => setPreferencia('ambos')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  preferencia === 'ambos' 
                    ? 'border-purple-500 bg-purple-50/80 text-purple-700 shadow-sm scale-105' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex -space-x-2 mb-1">
                  <Dog className="w-5 h-5 text-blue-500 z-10" />
                  <Cat className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-xs font-bold">Ambos</span>
              </button>
            </div>
          </div>

          {/* Botón de Guardar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>

        </form>
      </div>
    </div>
  );
}