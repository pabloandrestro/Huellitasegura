import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados para manejar la conexión y la interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Función para redirigir al registro de forma segura
  const irAlRegistro = () => {
    if (typeof onNavigateToRegister === 'function') {
      onNavigateToRegister();
    } else {
      navigate('/registro');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Credenciales incorrectas');
      }

      setSuccess('¡Inicio de sesión exitoso!');

      // Guardamos el token y el usuario devueltos por el backend
      if (datos.token) {
        localStorage.setItem('token', datos.token);
      }
      if (datos.usuario) {
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
      }

      // Redirección limpia (sin código duplicado)
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(datos.usuario);
      } else {
        navigate('/panel');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-12 left-12 text-6xl opacity-20 hidden md:block">🦴</div>
      <div className="absolute bottom-12 right-12 text-6xl opacity-20 hidden md:block">🧶</div>
      <div className="absolute top-24 right-24 text-5xl opacity-20 hidden md:block">🐾</div>

      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border-4 border-white">
        
        {/* Detalle superior */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow-[0_2px_10px_rgba(203,213,225,0.8)] rounded-t-[2.5rem]"></div>

        {/* Encabezado */}
        <div className="text-center mb-6 mt-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-2 drop-shadow-sm">
            ¡Hola de nuevo! 🐾
          </h1>
          <p className="text-sky-700 font-medium text-sm">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-xl text-center text-sm font-bold">
            {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sky-400 hover:text-pink-400 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full text-white font-extrabold text-lg py-4 px-4 rounded-2xl transition-all duration-300 mt-4 overflow-hidden ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-pink-300 hover:bg-pink-400 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(244,114,182,0.8)] hover:-translate-y-1'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Ingresando... ⏳' : 'Iniciar Sesión ✨'}
            </span>
          </button>
        </form>

        {/* Botón para cambiar a la pantalla de Registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-sky-700 font-medium mb-2">
            ¿Aún no tienes una cuenta?
          </p>
          <button
            type="button"
            onClick={irAlRegistro}
            disabled={loading}
            className="text-pink-400 hover:text-pink-500 font-extrabold transition-colors underline decoration-2 underline-offset-4 cursor-pointer"
          >
            Crear una cuenta nueva ✨
          </button>
        </div>

      </div>
    </div>
  );
}