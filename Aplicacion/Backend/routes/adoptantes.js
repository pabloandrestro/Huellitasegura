// Archivo: routes/adoptantes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const verificarToken = require('../middlewares/verificarToken');

const validarFormatoRUT = (rut) => {
    const rutRegex = /^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
};

router.get('/', verificarToken, async (req, res) => {
    try {
        const { refugio_id } = req.usuario; 

        const consulta = `
            SELECT DISTINCT a.* 
            FROM Adoptantes a
            JOIN Postulaciones p ON a.id = p.adoptante_id
            WHERE p.refugio_id = $1
        `;
        
        const resultado = await db.query(consulta, [refugio_id]);
        res.json({ mensaje: "Lista obtenida de forma segura", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        res.status(500).json({ error: "Error al consultar adoptantes filtrados" });
    }
});

router.get('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('SELECT * FROM Adoptantes WHERE id = $1', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar adoptante" });
    }
});

router.post('/', async (req, res) => {
    try {
        const { rut, nombre_completo, email, telefono, direccion, password } = req.body;

        if (!nombre_completo || !email || !password) {
            return res.status(400).json({ error: "Faltan campos obligatorios para crear la cuenta básica" });
        }

        if (rut && !validarFormatoRUT(rut)) {
            return res.status(400).json({ error: "Formato de RUT inválido. Por favor, use el formato 12.345.678-9 o 12345678-9." });
        }

        const rutLimpio = rut ? rut.replace(/\./g, '') : null;

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoAdoptante = await db.query(
            `INSERT INTO Adoptantes (rut, nombre_completo, email, password_hash, telefono, direccion) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre_completo, email`,
            [rutLimpio, nombre_completo, email, password_hash, telefono || null, direccion || null]
        );

        res.status(201).json({
            mensaje: "Cuenta de adoptante creada exitosamente",
            adoptante: nuevoAdoptante.rows[0]
        });

    } catch (error) {
        console.error("Error en POST adoptantes:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Este correo electrónico ya está registrado" });
        }
        res.status(500).json({ error: "Hubo un problema al crear la cuenta" });
    }
});

router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, telefono, direccion, estado_verificacion_contacto } = req.body;
        const resultado = await db.query(
            `UPDATE Adoptantes 
             SET nombre_completo = $1, telefono = $2, direccion = $3, estado_verificacion_contacto = $4 
             WHERE id = $5 RETURNING *`,
            [nombre_completo, telefono, direccion, estado_verificacion_contacto, id]
        );
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json({ mensaje: "Adoptante actualizado", datos: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar adoptante" });
    }
});

router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await db.query('DELETE FROM Adoptantes WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Adoptante no encontrado" });
        res.json({ mensaje: "Adoptante eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar adoptante" });
    }
});

module.exports = router;