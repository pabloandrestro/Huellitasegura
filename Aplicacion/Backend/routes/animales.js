const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para la subida de fotos de los animales
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// GET: Obtener todos los animales del refugio logueado
router.get('/', async (req, res) => {
    try {
        const { refugio_id } = req.usuario; 
        const resultado = await db.query('SELECT * FROM Animales WHERE refugio_id = $1 ORDER BY fecha_ingreso DESC', [refugio_id]);
        res.json({
            mensaje: "Lista de animales obtenida",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al consultar los animales" });
    }
});

// GET: Obtener catálogo público de animales y datos de una fundación específica (Para vista de adoptantes)
router.get('/catalogo/:refugio_id', async (req, res) => {
    try {
        const { refugio_id } = req.params;

        // 1. Buscamos la identidad visual y datos de la fundación
        const refugioQuery = await db.query(
            `SELECT id, nombre_organizacion, direccion, telefono, email_contacto, color_principal, color_secundario, logo_url 
             FROM Refugios WHERE id = $1`, 
            [refugio_id]
        );

        if (refugioQuery.rowCount === 0) {
            return res.status(404).json({ error: "Fundación no encontrada" });
        }

        // 2. Buscamos SOLO los animales que estén disponibles para adopción en esa fundación
        const animalesQuery = await db.query(
            `SELECT * FROM Animales WHERE refugio_id = $1 AND estado = 'En adopción' ORDER BY fecha_ingreso DESC`,
            [refugio_id]
        );

        // 3. Empaquetamos todo para facilitar el armado de la vista en el frontend
        res.json({
            mensaje: "Catálogo obtenido con éxito",
            fundacion: refugioQuery.rows[0],
            cantidad_animales: animalesQuery.rowCount,
            animales: animalesQuery.rows
        });

    } catch (error) {
        console.error("Error al obtener catálogo:", error);
        res.status(500).json({ error: "Hubo un problema al consultar el catálogo" });
    }
});

// POST: Registrar un nuevo animal
router.post('/', upload.single('foto'), async (req, res) => {
    try {
        const { refugio_id } = req.usuario; 
        const { nombre, especie, raza, sexo, estado, edad, microchip, historia } = req.body;
        
        // Evitamos que un string vacío rompa la regla UNIQUE en PostgreSQL
        const microchipFinal = (microchip === "" || microchip === undefined || microchip === "null") ? null : microchip;
        
        const fotoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const nuevoAnimal = await db.query(
            `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, edad, microchip, foto, historia) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [refugio_id, nombre, especie, raza, sexo, estado, edad, microchipFinal, fotoUrl, historia]
        );

        res.status(201).json({
            mensaje: "¡Animal registrado exitosamente!",
            datos: nuevoAnimal.rows[0]
        });
    } catch (error) {
        console.error("Error al registrar animal:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el animal" });
    }
});

// PUT: Actualizar ficha del animal
router.put('/:id', upload.single('foto'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especie, raza, sexo, estado, edad, microchip, historia } = req.body;
        
        const microchipFinal = (microchip === "" || microchip === undefined || microchip === "null") ? null : microchip;
        const nuevaFotoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const animalActualizado = await db.query(
            `UPDATE Animales 
             SET nombre = $1, especie = $2, raza = $3, sexo = $4, estado = $5, edad = $6, microchip = $7, historia = $8, foto = COALESCE($9, foto) 
             WHERE id = $10 RETURNING *`,
            [nombre, especie, raza, sexo, estado, edad, microchipFinal, historia, nuevaFotoUrl, id]
        );

        if (animalActualizado.rowCount === 0) return res.status(404).json({ error: "Animal no encontrado" });

        res.json({
            mensaje: "Ficha clínica actualizada",
            datos: animalActualizado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar animal:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar el animal" });
    }
});

// DELETE: Eliminar animal
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const animalEliminado = await db.query(
            'DELETE FROM Animales WHERE id = $1 RETURNING *',
            [id]
        );

        if (animalEliminado.rowCount === 0) return res.status(404).json({ error: "Animal no encontrado" });

        res.json({
            mensaje: "Animal eliminado del sistema",
            datos: animalEliminado.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al eliminar el animal" });
    }
});

module.exports = router;