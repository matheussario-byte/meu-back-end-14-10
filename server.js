const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { verificarToken, SECRET } = require('./auth');

const app = express();

// Configurações
app.use(cors());
// Limite aumentado para 50mb para permitir o upload de imagens e PDFs em Base64 pelo chat
app.use(express.json({ limit: '50mb' })); 

// ==========================================
// ROTA DE LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
    const { identificador, senha } = req.body;

    db.get("SELECT id, identificador, nome, perfil FROM usuarios WHERE identificador = ? AND senha = ?", [identificador, senha], (err, user) => {
        if (err) return res.status(500).json({ erro: 'Erro interno no servidor' });
        if (!user) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });

        // Gera o token válido por 12 horas
        const token = jwt.sign({ id: user.id, nome: user.nome, perfil: user.perfil }, SECRET, { expiresIn: '12h' });
        
        res.json({
            token,
            usuario: { id: user.id, nome: user.nome, perfil: user.perfil }
        });
    });
});

// ==========================================
// ROTAS DE CHAMADOS
// ==========================================

// Listar todos os chamados (incluindo as mensagens de cada um)
app.get('/api/chamados', verificarToken, (req, res) => {
    db.all("SELECT * FROM chamados", [], (err, chamados) => {
        if (err) return res.status(500).json({ erro: err.message });
        
        db.all("SELECT * FROM mensagens", [], (err, mensagens) => {
            if (err) return res.status(500).json({ erro: err.message });
            
            // Agrupa as mensagens dentro dos seus respectivos chamados
            const chamadosFormatados = chamados.map(chamado => {
                return {
                    ...chamado,
                    mensagens: mensagens.filter(m => m.chamadoId === chamado.id)
                };
            });
            
            res.json(chamadosFormatados);
        });
    });
});

// Criar novo chamado
app.post('/api/chamados', verificarToken, (req, res) => {
    const { titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, telefone, email, criador } = req.body;
    const dataCriacao = new Date().toISOString();

    const query = `INSERT INTO chamados (titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, telefone, email, criador, dataCriacao) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, telefone, email, criador, dataCriacao], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ id: this.lastID, titulo, dataCriacao });
    });
});

// ==========================================
// ROTA DE MENSAGENS E EVENTOS (CHAT)
// ==========================================
app.post('/api/chamados/:id/mensagens', verificarToken, (req, res) => {
    const chamadoId = req.params.id;
    const { autor, texto, data, tipo, acao, tecnico, tecnicoDestino, isFinalizacao, interativa, arquivoDados, arquivoTipo, arquivoNome } = req.body;

    const query = `INSERT INTO mensagens (chamadoId, autor, texto, data, tipo, acao, tecnico, tecnicoDestino, isFinalizacao, interativa, arquivoDados, arquivoTipo, arquivoNome) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, 
        [chamadoId, autor, texto, data, tipo, acao, tecnico, tecnicoDestino, isFinalizacao ? 1 : 0, interativa ? 1 : 0, arquivoDados, arquivoTipo, arquivoNome], 
        function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.status(201).json({ id: this.lastID });
    });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});