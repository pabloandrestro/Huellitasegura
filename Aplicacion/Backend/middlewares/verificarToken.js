const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {
   
    const token = req.header('Authorization');


    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay token de seguridad." });
    }

    try {
        const tokenLimpio = token.replace('Bearer ', '');

       
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
   
        req.usuario = verificado;
        next(); 

    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};

module.exports = verificarToken;