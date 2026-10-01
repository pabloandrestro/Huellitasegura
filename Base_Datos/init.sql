CREATE TABLE Refugios (
  id SERIAL PRIMARY KEY,
  rut VARCHAR(20) UNIQUE NOT NULL,
  nombre_organizacion VARCHAR(150) NOT NULL,
  direccion VARCHAR(255),
  email_contacto VARCHAR(150),
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logo_url VARCHAR(255),
  color_principal VARCHAR(7),
  color_secundario VARCHAR(7),
  estado_verificacion VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_verificacion IN ('pendiente', 'aprobado', 'rechazado'))
);

CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  refugio_id INTEGER REFERENCES Refugios(id) ON DELETE CASCADE,
  rut VARCHAR(20) UNIQUE NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'Voluntario'
);

CREATE TABLE Animales (
  id SERIAL PRIMARY KEY,
  refugio_id INTEGER REFERENCES Refugios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(50),
  raza VARCHAR(100),
  sexo VARCHAR(20),
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'Disponible',
  microchip VARCHAR(50) UNIQUE,
  foto varchar(255),
  historia text
);

CREATE TABLE Adoptantes (
  id SERIAL PRIMARY KEY,
  rut VARCHAR(20) UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, 
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  estado_verificacion_contacto BOOLEAN DEFAULT FALSE
);

CREATE TABLE Fichas_Clinicas (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES Animales(id) ON DELETE CASCADE,
  refugio_id INTEGER REFERENCES Refugios(id) ON DELETE CASCADE,
  esterilizado BOOLEAN DEFAULT FALSE,
  vacunas_al_dia BOOLEAN DEFAULT FALSE,
  peso_kg DECIMAL(5,2),
  diagnostico_ingreso TEXT,
  observaciones_medicas TEXT,
  fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Contratos_Adopcion (
  id SERIAL PRIMARY KEY,
  refugio_id INTEGER REFERENCES Refugios(id) ON DELETE CASCADE,
  animal_id INTEGER REFERENCES Animales(id) ON DELETE CASCADE,
  adoptante_id INTEGER REFERENCES Adoptantes(id) ON DELETE CASCADE,
  fecha_firma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pdf_url VARCHAR(255),
  codigo_otp_firma VARCHAR(10),
  ip_firma VARCHAR(50),
  estampa_tiempo TIMESTAMP,
  estado_firma VARCHAR(50) DEFAULT 'Pendiente'
);

CREATE TABLE Postulaciones (
  id SERIAL PRIMARY KEY,
  adoptante_id INTEGER REFERENCES Adoptantes(id) ON DELETE CASCADE,
  animal_id INTEGER REFERENCES Animales(id) ON DELETE CASCADE,
  refugio_id INTEGER REFERENCES Refugios(id) ON DELETE CASCADE,
  fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado_postulacion VARCHAR(50) DEFAULT 'En Revisión', -- Opciones: En Revisión, Aprobada, Rechazada
  
  foto_cedula_url VARCHAR(255),
  foto_domicilio_url VARCHAR(255),
  comprobante_ingresos_url VARCHAR(255),
  
  acepta_tratamiento_datos BOOLEAN NOT NULL DEFAULT FALSE
);