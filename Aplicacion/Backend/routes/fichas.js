const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Fichas_Clinicas');
        res.json({ mensaje: "Fichas obtenidas", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar las fichas" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM Fichas_Clinicas WHERE id = $1', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Ficha no encontrada" });
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar la ficha" });
    }
});


router.post('/', async (req, res) => {
    try {
        const { animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso, observaciones_medicas } = req.body;
        const resultado = await db.query(
            `INSERT INTO Fichas_Clinicas (animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso, observaciones_medicas) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [animal_id, refugio_id, esterilizado, vacunas_al_dia, peso_kg, diagnostico_ingreso, observaciones_medicas]
        );
        res.status(201).json({ mensaje: "Ficha clínica creada", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al crear la ficha clínica" });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { esterilizado, vacunas_al_dia, peso_kg, observaciones_medicas } = req.body;
        
        const resultado = await db.query(
            `UPDATE Fichas_Clinicas 
             SET esterilizado = $1, vacunas_al_dia = $2, peso_kg = $3, observaciones_medicas = $4, fecha_ultima_actualizacion = CURRENT_TIMESTAMP 
             WHERE id = $5 RETURNING *`,
            [esterilizado, vacunas_al_dia, peso_kg, observaciones_medicas, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Ficha no encontrada" });
        res.json({ mensaje: "Ficha clínica actualizada", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la ficha clínica" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('DELETE FROM Fichas_Clinicas WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Ficha no encontrada" });
        res.json({ mensaje: "Ficha clínica eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la ficha clínica" });
    }
});

module.exports = router;