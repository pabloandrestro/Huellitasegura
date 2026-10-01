const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const inyectarDatosMasivos = async () => {
    try {
        console.log(" Iniciando inyección MASIVA, ESTÁTICA y MULTI-TENANT...");

        // 1. CREAR REFUGIOS CON IDENTIDAD VISUAL ÚNICA
        const refugio1 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario, estado_verificacion)
             VALUES ('11.111.111-1', 'Patitas Felices', 'Calle Falsa 123', 'contacto@patitas.cl', '+56912345678', '#F9A8D4', '#93C5FD', 'aprobado') RETURNING id;`
        );
        const ref1_id = refugio1.rows[0].id;

        const refugio2 = await db.query(
            `INSERT INTO Refugios (rut, nombre_organizacion, direccion, email_contacto, telefono, color_principal, color_secundario, estado_verificacion)
             VALUES ('77.777.777-7', 'Fundación Esperanza', 'Av. Los Pinos 456', 'contacto@esperanza.cl', '+56998877665', '#34D399', '#FDE047', 'aprobado') RETURNING id;`
        );
        const ref2_id = refugio2.rows[0].id;
        console.log(" 2 Refugios creados (Identidad visual diferenciada)");

        // 2. CREAR ADMINISTRADORES
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '22.222.222-2', 'Admin Patitas', 'admin@patitas.cl', $2, 'Administrador');`,
            [ref1_id, hash]
        );
        await db.query(
            `INSERT INTO Usuarios (refugio_id, rut, nombre_completo, email, password_hash, rol)
             VALUES ($1, '88.888.888-8', 'Admin Esperanza', 'admin@esperanza.cl', $2, 'Administrador');`,
            [ref2_id, hash]
        );
        console.log(" 2 Usuarios administradores listos (Pass: admin123)");

        // 3. CREAR ADOPTANTES GLOBALES (Ciudadanos)
        const nombresAdoptantes = ['María González', 'Juan Pérez', 'Camila Rojas', 'Pedro Silva', 'Ana Soto', 'Luis Torres', 'Carlos Díaz', 'Marta Gómez'];
        const adoptantesIds = [];
        
        for (let i = 0; i < nombresAdoptantes.length; i++) {
            const adop = await db.query(
                `INSERT INTO Adoptantes (rut, nombre_completo, email, password_hash, telefono, direccion)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
                [`1${i}.000.000-${i}`, nombresAdoptantes[i], `adoptante${i}@gmail.com`, hash, `+5690000000${i}`, `Avenida Siempreviva ${i}`]
            );
            adoptantesIds.push(adop.rows[0].id);
        }
        console.log(" Adoptantes globales creados");

        // 4. CREAR ANIMALES TOTALMENTE SEPARADOS (Nombres limpios, sin números)
        const animalesIds = [];
        
        // --- 10 Animales estáticos para Patitas Felices ---
        const nombresPatitas = ['Firulais', 'Pelusa', 'Manchas', 'Duque', 'Princesa', 'Boby', 'Simba', 'Nala', 'Rocky', 'Mia'];
        for (let i = 0; i < nombresPatitas.length; i++) {
            const anim = await db.query(
                `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip)
                 VALUES ($1, $2, 'Perro', 'Mestizo', 'Macho', 'Disponible', $3) RETURNING id;`,
                [ref1_id, nombresPatitas[i], `9810200001234${i.toString().padStart(2, '0')}`]
            );
            animalesIds.push(anim.rows[0].id);
        }

        // --- 5 Animales estáticos para Fundación Esperanza ---
        const nombresEsperanza = ['Copito', 'Garfield', 'Rex', 'Laika', 'Snoopy'];
        for (let i = 0; i < nombresEsperanza.length; i++) {
            const anim = await db.query(
                `INSERT INTO Animales (refugio_id, nombre, especie, raza, sexo, estado, microchip)
                 VALUES ($1, $2, 'Gato', 'Mestizo', 'Hembra', 'Disponible', $3) RETURNING id;`,
                [ref2_id, nombresEsperanza[i], `9810200009999${i.toString().padStart(2, '0')}`]
            );
            animalesIds.push(anim.rows[0].id);
        }
        console.log(" Animales distribuidos correctamente (10 a Patitas, 5 a Esperanza)");

        // 5. INYECTAR POSTULACIONES SENSIBLES AISLADAS
        // Los primeros 3 adoptantes (María, Juan, Camila) postulan a Patitas Felices
        for (let i = 0; i < 3; i++) {
            await db.query(
                `INSERT INTO Postulaciones (adoptante_id, animal_id, refugio_id, estado_postulacion, acepta_tratamiento_datos, foto_cedula_url)
                 VALUES ($1, $2, $3, 'En Revisión', true, 'https://ejemplo.com/docs/cedula_mock.jpg');`,
                [adoptantesIds[i], animalesIds[i], ref1_id] 
            );
        }

        // Los siguientes 2 adoptantes (Pedro, Ana) postulan a Fundación Esperanza
        for (let i = 3; i < 5; i++) {
            await db.query(
                `INSERT INTO Postulaciones (adoptante_id, animal_id, refugio_id, estado_postulacion, acepta_tratamiento_datos, foto_cedula_url)
                 VALUES ($1, $2, $3, 'En Revisión', true, 'https://ejemplo.com/docs/cedula_mock.jpg');`,
                [adoptantesIds[i], animalesIds[10 + (i-3)], ref2_id] 
            );
        }
        console.log(" Postulaciones de adopción inyectadas de forma segura y aislada");

        console.log(" ¡PROCESO FINALIZADO! La base de datos está poblada y lista.");
        process.exit(0);
    } catch (error) {
        console.error(" Error al inyectar datos:", error);
        process.exit(1);
    }
};

inyectarDatosMasivos();