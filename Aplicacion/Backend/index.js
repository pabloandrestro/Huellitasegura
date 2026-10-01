
const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json()); 
app.use('/uploads', express.static('uploads')); 


// 1. IMPORTAR MIDDLEWARE DE SEGURIDAD
const verificarToken = require('./middlewares/verificarToken');


// 2. IMPORTAR RUTAS MODULARIZADAS
const rutaAuth = require('./routes/auth');
const rutasAdoptantes = require('./routes/adoptantes');
const rutasFichas = require('./routes/fichas');
const rutasContratos = require('./routes/contratos');
const rutasAnimales = require('./routes/animales');
const rutasRefugios = require('./routes/refugios');
const rutasUsuarios = require('./routes/usuarios');


// 3. CONECTAR ENDPOINTS (RUTAS)

app.get('/', (req, res) => {
    res.json({ 
        mensaje: "¡Servidor Backend de Huellita Segura corriendo exitosamente!",
        estado: "Activo"
    });
});

// Rutas Públicas
app.use('/', rutaAuth); // Contiene el POST /login
app.use('/refugios', rutasRefugios);
app.use('/adoptantes', rutasAdoptantes);

// Rutas Privadas (Protegidas por el Middleware)
app.use('/fichas-clinicas', verificarToken, rutasFichas);
app.use('/contratos', verificarToken, rutasContratos);
app.use('/animales', verificarToken, rutasAnimales);

app.use('/usuarios', verificarToken, rutasUsuarios);


app.listen(PORT, () => {
    console.log(` Servidor ejecutándose en http://localhost:${PORT}`);
});