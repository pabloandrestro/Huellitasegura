const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Obtener todos los contratos del refugio logueado (Con nombres para el frontend)
router.get('/', async (req, res) => {
    try {
        const { refugio_id } = req.usuario; // Extraído de forma segura desde el token JWT
        
        const query = `
            SELECT c.*, a.nombre AS nombre_animal, ad.nombre_completo AS nombre_adoptante 
            FROM Contratos_Adopcion c
            LEFT JOIN Animales a ON c.animal_id = a.id
            LEFT JOIN Adoptantes ad ON c.adoptante_id = ad.id
            WHERE c.refugio_id = $1
            ORDER BY c.fecha_firma DESC;
        `;
        const resultado = await db.query(query, [refugio_id]);
        
        res.json({ mensaje: "Contratos obtenidos", cantidad: resultado.rowCount, datos: resultado.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los contratos" });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        
        // Agregamos rut, telefono, email y datos de la mascota para alimentar la vista React
        const query = `
            SELECT 
                c.*, 
                a.nombre AS nombre_animal, 
                a.especie AS especie_animal,
                a.foto AS foto_animal,
                ad.nombre_completo AS nombre_adoptante,
                ad.rut AS rut_adoptante,
                ad.telefono AS telefono_adoptante,
                ad.email AS correo_adoptante
            FROM Contratos_Adopcion c
            LEFT JOIN Animales a ON c.animal_id = a.id
            LEFT JOIN Adoptantes ad ON c.adoptante_id = ad.id
            WHERE c.id = $1 AND c.refugio_id = $2;
        `;
        const resultado = await db.query(query, [id, refugio_id]);
        
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado o sin permisos" });
        
        // Enviamos el objeto directamente para que el frontend lo parsee sin problemas
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar el contrato" });
    }
});

// POST: Crear contrato base (El refugio_id se toma del token, no del body)
router.post('/', async (req, res) => {
    try {
        const { refugio_id } = req.usuario; 
        const { animal_id, adoptante_id } = req.body;
        
        const resultado = await db.query(
            `INSERT INTO Contratos_Adopcion (refugio_id, animal_id, adoptante_id, estado_firma) 
             VALUES ($1, $2, $3, 'Pendiente') RETURNING *`,
            [refugio_id, animal_id, adoptante_id]
        );
        res.status(201).json({ mensaje: "Contrato base creado", datos: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el contrato" });
    }
});

// PUT: Actualizar/Firmar contrato
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        const { pdf_url, codigo_otp_firma, ip_firma, estado_firma } = req.body;
        
        // El WHERE exige el refugio_id para que un usuario no pueda alterar contratos de otros
        const resultado = await db.query(
            `UPDATE Contratos_Adopcion 
             SET pdf_url = $1, codigo_otp_firma = $2, ip_firma = $3, estado_firma = $4, estampa_tiempo = CURRENT_TIMESTAMP 
             WHERE id = $5 AND refugio_id = $6 RETURNING *`,
            [pdf_url, codigo_otp_firma, ip_firma, estado_firma, id, refugio_id]
        );
        
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado o sin permisos" });
        res.json({ mensaje: "Contrato actualizado/firmado", datos: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el contrato" });
    }
});

// DELETE: Eliminar contrato
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { refugio_id } = req.usuario;
        
        const resultado = await db.query(
            'DELETE FROM Contratos_Adopcion WHERE id = $1 AND refugio_id = $2 RETURNING *', 
            [id, refugio_id]
        );
        
        if (resultado.rowCount === 0) return res.status(404).json({ error: "Contrato no encontrado o sin permisos" });
        res.json({ mensaje: "Contrato eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el contrato" });
    }
});

module.exports = router;