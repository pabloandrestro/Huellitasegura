const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Contratos_Adopcion');
        res.json({ mensaje: "Contratos obtenidos", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar los contratos" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM Contratos_Adopcion WHERE id = $1', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado" });
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar el contrato" });
    }
});


router.post('/', async (req, res) => {
    try {
        const { refugio_id, animal_id, adoptante_id } = req.body;
        const resultado = await db.query(
            `INSERT INTO Contratos_Adopcion (refugio_id, animal_id, adoptante_id, estado_firma) 
             VALUES ($1, $2, $3, 'Pendiente') RETURNING *`,
            [refugio_id, animal_id, adoptante_id]
        );
        res.status(201).json({ mensaje: "Contrato base creado", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el contrato" });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { pdf_url, codigo_otp_firma, ip_firma, estado_firma } = req.body;
        
        const resultado = await db.query(
            `UPDATE Contratos_Adopcion 
             SET pdf_url = $1, codigo_otp_firma = $2, ip_firma = $3, estado_firma = $4, estampa_tiempo = CURRENT_TIMESTAMP 
             WHERE id = $5 RETURNING *`,
            [pdf_url, codigo_otp_firma, ip_firma, estado_firma, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado" });
        res.json({ mensaje: "Contrato actualizado/firmado", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el contrato" });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('DELETE FROM Contratos_Adopcion WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado" });
        res.json({ mensaje: "Contrato eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el contrato" });
    }
});

module.exports = router;