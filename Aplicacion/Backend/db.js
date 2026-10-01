const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del archivo .env

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Verificación de conexión
pool.connect()
    .then(() => console.log(' Conexión exitosa a PostgreSQL (Docker)'))
    .catch(err => console.error(' Error al conectar a la Base de Datos', err.stack));

module.exports = pool;