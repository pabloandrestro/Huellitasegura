const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


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


router.post('/', upload.single('foto'), async (req, res) => {
    try {
        const { refugio_id } = req.usuario; 
        const { nombre, especie, raza, sexo, estado, microchip, historia } = req.body;
        
       
        const fotoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const nuevoAnimal = await db.query(
            `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip, foto, historia) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [refugio_id, nombre, especie, raza, sexo, estado, microchip, fotoUrl, historia]
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


router.put('/:id', upload.single('foto'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, especie, raza, sexo, estado, microchip, historia } = req.body;
        
        const nuevaFotoUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

      
        const animalActualizado = await db.query(
            `UPDATE Animales 
             SET nombre = $1, especie = $2, raza = $3, sexo = $4, estado = $5, microchip = $6, historia = $7, foto = COALESCE($8, foto) 
             WHERE id = $9 RETURNING *`,
            [nombre, especie, raza, sexo, estado, microchip, historia, nuevaFotoUrl, id]
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