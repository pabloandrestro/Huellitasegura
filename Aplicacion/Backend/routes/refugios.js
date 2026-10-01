const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const validarFormatoRUT = (rut) => {
    const rutRegex = /^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
};

router.get('/', async (req, res) => {
    try {
        const resultado = await db.query('SELECT id, rut, nombre_organizacion, direccion, email_contacto, telefono FROM Refugios');
        res.json({
            mensaje: "Lista de refugios obtenida con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (error) {
        console.error("Error al consultar refugios:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la base de datos" });
    }
});

router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const { rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario, password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: "La contraseña es obligatoria" });
        }

        if (!rut || !validarFormatoRUT(rut)) {
            return res.status(400).json({ error: "Formato de RUT inválido. Por favor, use el formato 12.345.678-9 o 12345678-9." });
        }

        const rutLimpio = rut.replace(/\./g, '');

        const logo_url = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const nuevoRefugio = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario, estado_verificacion) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente') RETURNING id`,
            [rutLimpio, nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario]
        );

        const refugio_id = nuevoRefugio.rows[0].id;

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Inyectamos rutLimpio en lugar de rut para el administrador
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4, $5, 'Administrador')`,
            [refugio_id, rutLimpio, `Admin ${nombre_organizacion}`, email_contacto, password_hash]
        );

        res.status(201).json({ mensaje: "Refugio y administrador creados con éxito (Pendiente de aprobación)" });
    } catch (error) {
        console.error("Error al registrar fundación:", error);
        
        if (error.code === '23505') {
            return res.status(400).json({ error: "Este RUT o correo electrónico ya se encuentran registrados en la plataforma." });
        }

        res.status(500).json({ error: "Hubo un problema al registrar la fundación" });
    }
});

router.put('/:id', upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario } = req.body;

        const logo_url = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        const refugioActualizado = await db.query(
            `UPDATE Refugios 
             SET nombre_organizacion = $1, direccion = $2, email_contacto = $3, telefono = $4, 
                 logo_url = COALESCE($5, logo_url), color_principal = $6, color_secundario = $7
             WHERE id = $8 RETURNING *`,
            [nombre_organizacion, direccion, email_contacto, telefono, logo_url, color_principal, color_secundario, id]
        );

        if (refugioActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Refugio no encontrado" });
        }

        res.json({
            mensaje: "¡Refugio actualizado con éxito!",
            datos: refugioActualizado.rows[0]
        });

    } catch (error) {
        console.error("Error al actualizar refugio:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar la base de datos" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const refugioEliminado = await db.query(
            'DELETE FROM Refugios WHERE id = $1 RETURNING *',
            [id]
        );

        if (refugioEliminado.rowCount === 0) {
            return res.status(404).json({ error: "Refugio no encontrado" });
        }

        res.json({
            mensaje: "¡Refugio eliminado correctamente del sistema!",
            datos: refugioEliminado.rows[0]
        });
    } catch (error) {
        console.error("Error al eliminar refugio:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar en la base de datos" });
    }
});

module.exports = router;