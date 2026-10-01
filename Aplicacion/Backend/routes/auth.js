const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let usuario = null;
        let tipoUsuario = null;
        let coloresTema = null; 

        let resultado = await db.query(`
            SELECT u.*, r.color_principal, r.color_secundario, r.nombre_organizacion
            FROM Usuarios u
            JOIN Refugios r ON u.refugio_id = r.id
            WHERE u.email = $1
        `, [email]);

        if (resultado.rowCount > 0) {
            usuario = resultado.rows[0];
            tipoUsuario = 'Staff';
            coloresTema = {
                principal: usuario.color_principal,
                secundario: usuario.color_secundario
            };
        } else {
            resultado = await db.query('SELECT * FROM Adoptantes WHERE email = $1', [email]);
            if (resultado.rowCount > 0) {
                usuario = resultado.rows[0];
                tipoUsuario = 'Adoptante';
            }
        }

        if (!usuario) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        const payloadToken = {
            id: usuario.id,
            rol: tipoUsuario === 'Staff' ? usuario.rol : 'Adoptante'
        };
        
        if (tipoUsuario === 'Staff') {
            payloadToken.refugio_id = usuario.refugio_id;
        }

        const token = jwt.sign(payloadToken, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token: token,
            usuario: {
                nombre: usuario.nombre_completo,
                organizacion: usuario.nombre_organizacion,
                rol: payloadToken.rol,
                refugio_id: payloadToken.refugio_id,
                tema: coloresTema 
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un problema al procesar el inicio de sesión" });
    }
});

module.exports = router;