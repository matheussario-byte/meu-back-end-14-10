const sqlite3 = require('sqlite3').verbose();

// Cria o banco de dados na raiz do projeto
const db = new sqlite3.Database('./helpdesk.db', (err) => {
    if (err) console.error('Erro ao abrir o banco de dados:', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE,
        senha TEXT,
        nome TEXT,
        perfil TEXT
    )`);

    // Tabela de Chamados
    db.run(`CREATE TABLE IF NOT EXISTS chamados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        categoria TEXT,
        urgencia TEXT,
        descricaoInicial TEXT,
        nomeSolicitante TEXT,
        telefone TEXT,
        email TEXT,
        criador TEXT,
        dataCriacao TEXT
    )`);

    // Tabela de Mensagens e Eventos
    db.run(`CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chamadoId INTEGER,
        autor TEXT,
        texto TEXT,
        data TEXT,
        tipo TEXT,
        acao TEXT,
        tecnico TEXT,
        tecnicoDestino TEXT,
        isFinalizacao BOOLEAN,
        interativa BOOLEAN,
        arquivoDados TEXT,
        arquivoTipo TEXT,
        arquivoNome TEXT
    )`);

    // Inserir usuários padrão caso o banco esteja vazio
    db.get("SELECT count(*) as count FROM usuarios", (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO usuarios (identificador, senha, nome, perfil) VALUES ('admin', 'admin123', 'Administrador TI', 'admin')`);
            db.run(`INSERT INTO usuarios (identificador, senha, nome, perfil) VALUES ('user', 'user123', 'Colaborador Silva', 'user')`);
            console.log('Usuários padrão criados (admin / admin123) e (user / user123).');
        }
    });
});

module.exports = db;