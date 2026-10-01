const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/', async (req, res) => {
    try {
        const { refugio_id, rut, nombre_completo, email, password, rol } = req.body;

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, refugio_id, nombre_completo, email, rol`,
            [refugio_id, rut, nombre_completo, email, password_hash, rol]
        );
        res.status(201).json({
            mensaje: "¡Usuario registrado con éxito!",
            datos: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al guardar el usuario en la base de datos" });
    }
});

router.get('/', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM Usuarios'); 
        
        res.json({
            mensaje: "Lista de usuarios obtenida con éxito",
            cantidad: resultado.rowCount,
            datos: resultado.rows
        });

    } catch (error) {
        console.error("Error al consultar usuarios:", error);
        res.status(500).json({ error: "Hubo un problema al consultar la base de datos" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, email, rol } = req.body;

        const usuarioActualizado = await db.query(
            `UPDATE Usuarios 
             SET nombre_completo = $1, email = $2, rol = $3 
             WHERE id = $4 RETURNING id, refugio_id, nombre_completo, email, rol`,
            [nombre_completo, email, rol, id]
        );

        if (usuarioActualizado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "¡Usuario actualizado con éxito!",
            datos: usuarioActualizado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al actualizar el usuario" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const usuarioEliminado = await db.query(
            'DELETE FROM Usuarios WHERE id = $1 RETURNING id, nombre_completo, email',
            [id]
        );

        if (usuarioEliminado.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            mensaje: "¡Usuario eliminado correctamente!",
            datos: usuarioEliminado.rows[0]
        });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Hubo un problema al eliminar el usuario" });
    }
});

module.exports = router;