import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dog, Cat, Heart, ArrowRight, Sparkles } from 'lucide-react';

export default function PreferenciasAdoptante() {
  const navigate = useNavigate();
  const [interes, setInteres] = useState(''); // 'perro', 'gato', 'ambos'
  const [cargando, setCargando] = useState(false);

  const opciones = [
    {
      id: 'perro',
      titulo: 'Quiero un Perro',
      subtitulo: 'Compañeros fieles y llenos de energía',
      icono: <Dog className="w-12 h-12 text-blue-500" />,
      bgGradient: 'from-blue-50 to-indigo-50 hover:border-blue-400',
      borderSelected: 'border-blue-500 bg-blue-50/60 shadow-lg scale-105'
    },
    {
      id: 'gato',
      titulo: 'Quiero un Gato',
      subtitulo: 'Felinos independientes y cariñosos',
      icono: <Cat className="w-12 h-12 text-pink-500" />,
      bgGradient: 'from-pink-50 to-rose-50 hover:border-pink-400',
      borderSelected: 'border-pink-500 bg-pink-50/60 shadow-lg scale-105'
    },
    {
      id: 'ambos',
      titulo: '¡Amo a Ambos!',
      subtitulo: 'Abierto a recibir perros o gatos en el hogar',
      icono: (
        <div className="flex -space-x-3">
          <Dog className="w-10 h-10 text-blue-500 z-10" />
          <Cat className="w-10 h-10 text-pink-500" />
        </div>
      ),
      bgGradient: 'from-purple-50 to-pink-50 hover:border-purple-400',
      borderSelected: 'border-purple-500 bg-purple-50/60 shadow-lg scale-105'
    }
  ];

  const handleGuardarPreferencia = async () => {
    if (!interes) return;
    setCargando(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/adoptantes/preferencias`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ preferencia_mascota: interes })
        });
      }

      // Guardar preferencia localmente y redirigir al perfil del adoptante
      localStorage.setItem('preferencia_mascota', interes);
      navigate('/perfil-adoptante'); // 🎯 Redirige a la cuenta/perfil
    } catch (err) {
      console.error('Error al guardar preferencia:', err);
      navigate('/perfil-adoptante');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/30 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-white/60 text-center">
        
        {/* Encabezado */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/80 text-pink-600 font-semibold text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>¡Tu registro se completó con éxito!</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
          ¿A quién buscas integrar a tu familia?
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">
          Selecciona una opción para personalizar los animales que te mostraremos primero.
        </p>

        {/* Tarjetas Seleccionables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {opciones.map((item) => {
            const estaSeleccionado = interes === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setInteres(item.id)}
                className={`relative group rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col items-center text-center cursor-pointer bg-gradient-to-b ${item.bgGradient} ${
                  estaSeleccionado ? item.borderSelected : 'border-slate-100 hover:shadow-md'
                }`}
              >
                {/* Indicador de selección */}
                {estaSeleccionado && (
                  <span className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  </span>
                )}

                <div className="mb-4 transform group-hover:scale-110 transition duration-300">
                  {item.icono}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {item.titulo}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.subtitulo}
                </p>
              </button>
            );
          })}
        </div>

        {/* Botón de Continuar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleGuardarPreferencia}
            disabled={!interes || cargando}
            className={`w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${
              interes && !cargando
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 hover:shadow-pink-500/25 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {cargando ? 'Guardando...' : 'Comenzar a explorar'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/perfil-adoptante')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition pt-2"
          >
            Omitir por ahora
          </button>
        </div>

      </div>
    </div>
  );
}