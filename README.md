#  Huellitas Seguras - Plataforma SaaS Multi-Tenant

Plataforma orientada a fundaciones y refugios de animales para centralizar el historial clínico y formalizar adopciones. Este proyecto contiene la arquitectura completa (Frontend, Backend y Base de Datos) separada en módulos independientes.

---

##  1. Prerrequisitos del Sistema

Para poder levantar este proyecto en tu computadora local, es **estrictamente necesario** que tengas instalados los siguientes programas:

1. **[Node.js](https://nodejs.org/es/):** El motor principal para ejecutar el Backend y el Frontend. (Asegúrate de instalar la versión LTS).
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/):** Necesario para levantar la base de datos PostgreSQL de forma automatizada sin ensuciar tu sistema operativo. **Debes abrir este programa y esperar a que esté en verde ("Running") antes de seguir.**
3. **[Git](https://git-scm.com/):** Para clonar el repositorio.
4. **Visual Studio Code:** Recomendado como editor de código.

---

##  2. Guía de Instalación y Ejecución Paso a Paso

### Paso 1: Descargar el proyecto
Abre tu terminal, posiciónate donde deseas guardar el proyecto y ejecuta:

```bash
git clone <URL_DE_ESTE_REPOSITORIO>
cd <NOMBRE_DE_LA_CARPETA_CREADA>

```

## Paso 2: Levantar la Base de Datos (Docker)
Nuestro sistema utiliza un contenedor preconfigurado que automatiza la creación de las tablas (Multi-Tenant).


 En tu terminal, ingresa a la carpeta de la base de datos:
```bash

cd Base_Datos
```


# Ejecuta el siguiente comando para construir y encender la base de datos en segundo plano:
```bash
docker-compose up -d
```
(Nota: Docker leerá automáticamente el archivo init.sql y creará toda la estructura relacional).

## Paso 3: Configurar y Encender el Backend (Node.js)
Abre una nueva pestaña de terminal y navega a la carpeta del backend:
```bash
cd Aplicacion/backend
```
# Configuración vital: Crea un archivo llamado .env en esta carpeta y pega exactamente las siguientes variables de entorno(*ojo*: Solo si no se clona la caprteta .env):
```bash
DB_USER=admin_huellita
DB_PASSWORD=password123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=huellita_segura_db
PORT=3000
JWT_SECRET=super_secreto_huellitas_2026
```
# Instala todas las dependencias del servidor (Express, Bcrypt, JWT, etc.):
```bash
npm install
```
# Sembrar datos de prueba: Para no iniciar con un sistema vacío, ejecuta nuestro script automático que creará refugios, animales y usuarios de prueba:
```bash
node seeder.js
```
# Enciende el servidor backend:
```bash
npm run dev
```
(Verás un mensaje indicando: "Servidor ejecutándose en http://localhost:3000" y "Conexión exitosa a PostgreSQL").

## Paso 4: Configurar y Encender el Frontend (React/Vite)
Finalmente, levantaremos la interfaz visual para interactuar con el sistema.

Abre una tercera pestaña de terminal (no cierres la del backend) y navega a la carpeta del frontend:
```bash
cd Aplicacion/frontend
```
# Configuración vital: Crea un archivo llamado .env en esta carpeta y pega esta variable para enlazarlo con el backend(*ojo*: Solo si no se clona la caprteta .env):
```bash
VITE_API_URL=http://localhost:3000
```
# Instala las dependencias de la interfaz visual (Vite, Tailwind, React Router, etc.):
```bash
npm install
```
# Enciende el servidor visual:
```bash
npm run dev
```
(La terminal te dará una ruta local, generalmente http://localhost:5173. Ábrela en tu navegador).

## 3. Credenciales de Prueba (Testing)

Si ejecutaste el comando node seeder.js en el Paso 3, tu base de datos ya está poblada. Ve al navegador (al enlace del Frontend) e inicia sesión con cualquiera de estos dos perfiles Multi-Tenant:
##
Refugio 1 (Patitas):

Usuario: admin@patitas.cl

Clave: admin123
##
Refugio 2 (Pequeñas Huellas):

Usuario: admin@pequenas.cl

Clave: admin123
