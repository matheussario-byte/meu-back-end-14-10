const jwt = require('jsonwebtoken');

// Senha secreta para assinar os tokens (em produção, use variáveis de ambiente)
const SECRET = process.env.JWT_SECRET || 'minha-chave-secreta-rs-servicos';

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        }
        req.user = user;
        next();
    });
}

module.exports = { verificarToken, SECRET };