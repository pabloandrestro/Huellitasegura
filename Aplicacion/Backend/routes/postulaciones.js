const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        if (req.usuario.rol === 'Adoptante') {
            const query = `
                SELECT p.*, a.nombre AS nombre_animal, r.nombre_organizacion AS nombre_refugio
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Refugios r ON p.refugio_id = r.id
                WHERE p.adoptante_id = $1
                ORDER BY p.fecha_postulacion DESC;
            `;
            const resultado = await db.query(query, [req.usuario.id]);
            return res.json({ mensaje: "Mis postulaciones", cantidad: resultado.rowCount, datos: resultado.rows });
        }

       
        const refugio_id = req.usuario.refugio_id; 
        const { animal_id } = req.query; 
        let query = `
            SELECT p.*, 
                   a.nombre AS nombre_animal, 
                   a.foto AS foto_animal,
                   ad.nombre_completo AS nombre_adoptante, 
                   ad.email AS correo_adoptante, 
                   ad.telefono AS telefono_adoptante
            FROM Postulaciones p
            LEFT JOIN Animales a ON p.animal_id = a.id
            LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
            WHERE p.refugio_id = $1
        `;
        const params = [refugio_id];

        if (animal_id) {
            query += ` AND p.animal_id = $2`;
            params.push(animal_id);
        }
        
        query += ` ORDER BY p.fecha_postulacion DESC;`;

        const resultado = await db.query(query, params);
        res.json({ mensaje: "Postulaciones obtenidas", cantidad: resultado.rowCount, datos: resultado.rows });

    } catch (error) {
        console.error("Error al obtener postulaciones:", error);
        res.status(500).json({ error: "Error interno al consultar las postulaciones" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id) || id === 'undefined') {
            return res.status(400).json({ error: "ID de postulación no válido o ausente" });
        }

        let query = "";
        let params = [];

        if (req.usuario.rol === 'Adoptante') {
            query = `
                SELECT p.*, 
                       a.nombre AS nombre_animal, a.especie AS especie_animal, a.foto AS foto_animal,
                       r.nombre_organizacion AS nombre_refugio
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Refugios r ON p.refugio_id = r.id
                WHERE p.id = $1 AND p.adoptante_id = $2;
            `;
            params = [id, req.usuario.id];
        } else {
            query = `
                SELECT p.*, 
                       a.nombre AS nombre_animal, a.especie AS especie_animal, a.foto AS foto_animal,
                       ad.nombre_completo AS nombre_adoptante, ad.rut AS rut_adoptante,
                       ad.email AS correo_adoptante, ad.telefono AS telefono_adoptante, ad.direccion AS direccion_adoptante
                FROM Postulaciones p
                LEFT JOIN Animales a ON p.animal_id = a.id
                LEFT JOIN Adoptantes ad ON p.adoptante_id = ad.id
                WHERE p.id = $1 AND p.refugio_id = $2;
            `;
            params = [id, req.usuario.refugio_id];
        }

        const resultado = await db.query(query, params);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o no tienes permisos para verla" });
        }

        res.json({ mensaje: "Detalle de postulación obtenido", datos: resultado.rows[0] });
    } catch (error) {
        console.error("Error al obtener la postulación por ID:", error);
        res.status(500).json({ error: "Error interno al consultar la postulación" });
    }
});


router.post('/', async (req, res) => {
    try {
        const { mascota_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion } = req.body;
        const adoptante_id = req.usuario.id; // El ID se saca del token JWT del ciudadano

        const animalQuery = await db.query('SELECT refugio_id FROM Animales WHERE id = $1', [mascota_id]);
        if (animalQuery.rowCount === 0) {
            return res.status(404).json({ error: "La mascota seleccionada no existe" });
        }
        const refugio_id = animalQuery.rows[0].refugio_id;

        const nuevaPostulacion = await db.query(
            `INSERT INTO Postulaciones 
             (adoptante_id, animal_id, refugio_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion, estado_postulacion, acepta_tratamiento_datos) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'En Revisión', TRUE) 
             RETURNING *`,
            [adoptante_id, mascota_id, refugio_id, tipo_vivienda, composicion_hogar, otras_mascotas, tiempo_solas, motivacion]
        );

        res.status(201).json({ mensaje: "Postulación enviada con éxito", datos: nuevaPostulacion.rows[0] });
    } catch (error) {
        console.error("Error al registrar postulación:", error);
        res.status(500).json({ error: "Error interno al procesar la postulación" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_postulacion } = req.body; 
        const refugio_id = req.usuario.refugio_id;

        const postulacionActualizada = await db.query(
            `UPDATE Postulaciones 
             SET estado_postulacion = $1 
             WHERE id = $2 AND refugio_id = $3 
             RETURNING *`,
            [estado_postulacion, id, refugio_id]
        );

        if (postulacionActualizada.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
        }

        res.json({ mensaje: "Estado de la postulación actualizado", datos: postulacionActualizada.rows[0] });
    } catch (error) {
        console.error("Error al actualizar postulación:", error);
        res.status(500).json({ error: "Error interno al actualizar la postulación" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const refugio_id = req.usuario.refugio_id;

        const postulacionEliminada = await db.query(
            'DELETE FROM Postulaciones WHERE id = $1 AND refugio_id = $2 RETURNING *',
            [id, refugio_id]
        );

        if (postulacionEliminada.rowCount === 0) {
            return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
        }

        res.json({ mensaje: "Postulación eliminada exitosamente", datos: postulacionEliminada.rows[0] });
    } catch (error) {
        console.error("Error al eliminar postulación:", error);
        res.status(500).json({ error: "Error interno al eliminar la postulación" });
    }
});

module.exports = router;