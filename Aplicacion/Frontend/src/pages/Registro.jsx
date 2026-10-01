import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 

export default function Registro() {
  const navigate = useNavigate();
  
  // Tipo de cuenta: 'adoptante' o 'fundacion'
  const [tipoCuenta, setTipoCuenta] = useState('adoptante');

  // Datos Compartidos
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Datos Adoptante
  const [nombreAdoptante, setNombreAdoptante] = useState('');
  const [apellidoAdoptante, setApellidoAdoptante] = useState('');

  // Datos Fundación
  const [nombreOrg, setNombreOrg] = useState('');
  const [rut, setRut] = useState('');
  const [rutError, setRutError] = useState('');
  const [direccion, setDireccion] = useState('');

  // Personalización Fundación
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorPrincipal, setColorPrincipal] = useState('#F9A8D4');
  const [colorSecundario, setColorSecundario] = useState('#93C5FD');

  const [loading, setLoading] = useState(false);

  // Formateador de RUT automático
  const handleRutChange = (e) => {
    let value = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
    
    if (value.length === 0) {
      setRut('');
      setRutError('');
      return;
    }

    // Limitar a un máximo de 9 caracteres alfanuméricos (8 dígitos + 1 verificador)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    if (value.length > 1) {
      let body = value.slice(0, -1);
      let dv = value.slice(-1);
      // Agregar puntos a los miles
      body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setRut(`${body}-${dv}`);
    } else {
      setRut(value);
    }
    
    setRutError(''); // Limpiar el error al escribir
  };

  // Validación Módulo 11 (Matemática estricta para RUT chileno)
  const validateRUT = (rutInput) => {
    if (!rutInput) return false;
    const cleanRUT = rutInput.replace(/[^0-9K]/ig, '').toUpperCase();
    if (cleanRUT.length < 8) return false;

    const body = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1);
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i), 10) * multiplier;
      multiplier = multiplier < 7 ? multiplier + 1 : 2;
    }
    
    const expectedDv = 11 - (sum % 11);
    const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
    
    return dv === calculatedDv;
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación estricta de contraseñas antes de procesar
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Validación estricta de RUT obligatoria ÚNICAMENTE para Fundaciones
    if (tipoCuenta === 'fundacion') {
      if (!validateRUT(rut)) {
        setRutError('RUT inválido. Verifica el formato y dígito verificador.');
        return;
      }
    }

    setLoading(true);

    // 1. Iniciamos una notificación visual de carga
    const toastId = toast.loading('Procesando registro...');

    try {
      if (tipoCuenta === 'fundacion') {
        const formData = new FormData();
        formData.append('nombre_organizacion', nombreOrg);
        formData.append('rut', rut);
        formData.append('email_contacto', correo);
        formData.append('password', password);
        formData.append('telefono', telefono);
        formData.append('direccion', direccion);
        formData.append('color_principal', colorPrincipal);
        formData.append('color_secundario', colorSecundario);
        if (logo) formData.append('logo', logo);

        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/refugios`, { 
          method: 'POST', 
          body: formData 
        });

        const data = await respuesta.json();
        
        if (!respuesta.ok) {
           throw new Error(data.error || 'Error al registrar fundación');
        }

        // 2. Éxito: Actualizamos la notificación de carga a éxito
        toast.success('¡Fundación y Administrador creados con éxito! Redirigiendo...', { id: toastId });

      } else {
        const adoptanteData = {
          nombre_completo: `${nombreAdoptante} ${apellidoAdoptante}`,
          email: correo,
          password: password,
          telefono: telefono
        };

        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adoptanteData) 
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
           throw new Error(data.error || 'Hubo un error al registrar el adoptante');
        }
        
        // 2. Éxito: Actualizamos la notificación de carga a éxito
        toast.success('¡Cuenta de adoptante creada con éxito! Redirigiendo...', { id: toastId });
      }
      
      // 3. Esperamos 1.5 segundos para que el usuario lea el mensaje antes de cambiar de página
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Error al registrar:', error);
      // 4. Error: Actualizamos la notificación de carga a error
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-700">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-150">
        
        <div className="w-full lg:w-3/5 p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 text-2xl">🐾</span>
              <h1 className="text-2xl font-bold text-slate-800">Huellita Segura</h1>
            </div>
            <Link to="/login" className="text-sm text-pink-400 hover:underline font-medium">
              Ya tengo cuenta
            </Link>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              type="button"
              onClick={() => { setTipoCuenta('adoptante'); setPasswordError(''); setRutError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                tipoCuenta === 'adoptante' 
                  ? 'bg-white shadow-sm text-pink-500' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quiero Adoptar
            </button>
            <button 
              type="button"
              onClick={() => { setTipoCuenta('fundacion'); setPasswordError(''); setRutError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                tipoCuenta === 'fundacion' 
                  ? 'bg-white shadow-sm text-pink-500' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Soy una Fundación
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {tipoCuenta === 'adoptante' && (
              <div className="animate-fadeIn">
                <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Tus Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="👤 Nombre" 
                    value={nombreAdoptante} onChange={(e) => setNombreAdoptante(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                  />
                  <input 
                    type="text" placeholder="👤 Apellido" 
                    value={apellidoAdoptante} onChange={(e) => setApellidoAdoptante(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                  />
                  <input 
                    type="email" placeholder="✉️ Correo Electrónico" 
                    value={correo} onChange={(e) => setCorreo(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2" required
                  />
                  
                  {/* Contraseña Adoptante con Ojo */}
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"} placeholder="🔒 Contraseña" 
                      value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full p-3 border ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-pink-300'} rounded-xl outline-none text-sm`} required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-pink-400 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>

                  {/* Confirmar Contraseña Adoptante con Ojo */}
                  <div className="relative w-full">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} placeholder="🔒 Confirmar Contraseña" 
                      value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      className={`w-full p-3 border ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-pink-300'} rounded-xl outline-none text-sm`} required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-pink-400 focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>

                  {/* Mensaje de error de contraseñas */}
                  {passwordError && (
                    <div className="md:col-span-2 -mt-2">
                      <p className="text-red-500 text-xs ml-1 font-medium">{passwordError}</p>
                    </div>
                  )}

                  <input 
                    type="text" placeholder="📱 Teléfono (Opcional)" 
                    value={telefono} onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2"
                  />
                </div>
              </div>
            )}

            {tipoCuenta === 'fundacion' && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">1. Datos de la Organización</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="🏢 Nombre (Ej. Refugio Esperanza)" 
                      value={nombreOrg} onChange={(e) => setNombreOrg(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    
                    {/* Campo RUT Formateado con Validación (Obligatorio únicamente para Fundación) */}
                    <div className="w-full">
                      <input 
                        type="text" placeholder="📄 RUT Organización" 
                        value={rut} onChange={handleRutChange}
                        className={`w-full p-3 border ${rutError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-pink-300'} rounded-xl outline-none text-sm transition-colors`} required
                      />
                      {rutError && (
                        <p className="text-red-500 text-xs ml-1 mt-1 font-medium">{rutError}</p>
                      )}
                    </div>

                    <input 
                      type="email" placeholder="✉️ Correo del Administrador" 
                      value={correo} onChange={(e) => setCorreo(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2" required
                    />
                    
                    {/* Contraseña Fundación con Ojo */}
                    <div className="relative w-full">
                      <input 
                        type={showPassword ? "text" : "password"} placeholder="🔒 Contraseña Segura" 
                        value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        className={`w-full p-3 border ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-pink-300'} rounded-xl outline-none text-sm`} required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-pink-400 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Confirmar Contraseña Fundación con Ojo */}
                    <div className="relative w-full">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} placeholder="🔒 Confirmar Contraseña" 
                        value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                        className={`w-full p-3 border ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-pink-300'} rounded-xl outline-none text-sm`} required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-pink-400 focus:outline-none transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Mensaje de error de contraseñas */}
                    {passwordError && (
                      <div className="md:col-span-2 -mt-2">
                        <p className="text-red-500 text-xs ml-1 font-medium">{passwordError}</p>
                      </div>
                    )}

                    <input 
                      type="text" placeholder="📞 Teléfono de Contacto" 
                      value={telefono} onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="text" placeholder="📍 Dirección Física" 
                      value={direccion} onChange={(e) => setDireccion(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2" required
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">🎨 2. Personalización de Marca</h2>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">Logo Corporativo</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative overflow-hidden flex flex-col items-center justify-center min-h-[120px]">
                      <input 
                        type="file" accept="image/*" onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {logoPreview ? (
                        <div className="flex flex-col items-center animate-fadeIn">
                          <img src={logoPreview} alt="Preview" className="h-16 object-contain mb-2 rounded-md shadow-sm border border-slate-100" />
                          <p className="text-sm font-bold text-emerald-500">¡Logo cargado con éxito! ✓</p>
                          <p className="text-xs text-slate-400 mt-1">Haz clic o arrastra otra imagen para cambiarlo</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="text-4xl text-slate-400 mb-2">☁️</div>
                          <p className="text-sm font-medium text-slate-600">Arrastra tu logo aquí o haz clic para subir</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 2MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Color Principal</label>
                      <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2">
                        <input type="color" value={colorPrincipal} onChange={(e) => setColorPrincipal(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm text-slate-500 uppercase">{colorPrincipal}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Color Secundario</label>
                      <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2">
                        <input type="color" value={colorSecundario} onChange={(e) => setColorSecundario(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm text-slate-500 uppercase">{colorSecundario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg shadow-pink-200"
            >
              {loading ? 'Procesando...' : (tipoCuenta === 'adoptante' ? 'Crear Cuenta' : 'Registrar Fundación')}
            </button>
          </form>
        </div>

        <div className="hidden lg:flex w-2/5 bg-slate-100 p-8 flex-col items-center justify-center relative border-l border-slate-200">
          {tipoCuenta === 'adoptante' ? (
            <div className="text-center flex flex-col items-center justify-center space-y-6 animate-fadeIn">
              <div className="text-8xl">🐶❤️🐱</div>
              <h3 className="text-2xl font-bold text-slate-700">Encuentra a tu mejor amigo</h3>
              <p className="text-slate-500 max-w-xs text-sm">
                Crea tu cuenta para guardar tus mascotas favoritas, agendar visitas y comenzar un proceso de adopción responsable.
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn w-full flex flex-col items-center">
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-600">PREVISUALIZACIÓN EN VIVO</h3>
                <p className="text-xs text-slate-400">Así verán tu plataforma los usuarios</p>
              </div>

              <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg flex overflow-hidden h-96 transform scale-95 border border-slate-100">
                <div className="w-1/3 p-4 flex flex-col gap-4 text-white text-xs font-medium transition-colors" style={{ backgroundColor: colorPrincipal }}>
                  <div className="h-10 bg-white/20 rounded-lg flex items-center justify-center p-1">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px]">Tu Logo</span>
                    )}
                  </div>
                  <div className="bg-white/20 p-2 rounded-md">🏠 Inicio</div>
                  <div className="p-2 opacity-80">🐾 Mascotas</div>
                  <div className="p-2 opacity-80">👥 Adoptantes</div>
                </div>
                
                <div className="w-2/3 p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center text-white text-xl transition-colors" style={{ backgroundColor: colorSecundario }}>🐾</div>
                    <p className="text-xs font-bold text-slate-700">Nueva Adopción</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-3">Gestiona un nuevo proceso para tu organización.</p>
                    <div className="px-4 py-2 rounded-lg text-white text-[10px] transition-colors" style={{ backgroundColor: colorPrincipal }}>
                      Iniciar Proceso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}