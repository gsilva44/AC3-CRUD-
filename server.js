const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('node:fs');
for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_CA_CERT']) {
  if (!process.env[key]) throw new Error(`Configure ${key} no painel do Render.`);
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'cruduser',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'escola',
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 15000,
  ssl: {
    ca: process.env.DB_CA_CERT.replace(/\\n/g, '\n'),
    rejectUnauthorized: true,
    verifyIdentity: true,
    minVersion: 'TLSv1.2'
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validAluno(aluno) {
  return aluno && ['nome', 'email', 'curso'].every(k => typeof aluno[k] === 'string' && aluno[k].trim().length > 0) &&
    aluno.nome.length <= 100 && aluno.email.length <= 120 && aluno.curso.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(aluno.email);
}
function fail(res, error) {
  console.error('Erro no banco:', error.message);
  return res.status(500).json({ erro: 'Não foi possível concluir a operação no banco de dados.' });
}
function idValido(req, res) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    res.status(400).json({ erro: 'ID inválido.' });
    return false;
  }
  return true;
}

app.get('/health', (req, res) => {
  db.query('SELECT 1', err => {
    if (err) return fail(res, err);
    res.json({ status: 'ok', banco: 'conectado' });
  });
});
app.get('/alunos', (req, res) => {
  db.query('SELECT * FROM alunos ORDER BY id DESC', (err, results) => {
    if (err) return fail(res, err);
    res.json(results);
  });
});
app.post('/alunos', (req, res) => {
  if (!validAluno(req.body)) return res.status(400).json({ erro: 'Informe nome, e-mail válido e curso.' });
  const { nome, email, curso } = req.body;
  db.query('INSERT INTO alunos (nome,email,curso) VALUES (?,?,?)', [nome.trim(), email.trim(), curso.trim()], (err, result) => {
    if (err) return fail(res, err);
    res.status(201).json({ id: result.insertId, mensagem: 'Aluno cadastrado.' });
  });
});
app.put('/alunos/:id', (req, res) => {
  if (!idValido(req, res)) return;
  if (!validAluno(req.body)) return res.status(400).json({ erro: 'Informe nome, e-mail válido e curso.' });
  const { nome, email, curso } = req.body;
  db.query('UPDATE alunos SET nome=?, email=?, curso=? WHERE id=?', [nome.trim(), email.trim(), curso.trim(), req.params.id], (err, result) => {
    if (err) return fail(res, err);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json({ mensagem: 'Aluno atualizado.' });
  });
});
app.delete('/alunos/:id', (req, res) => {
  if (!idValido(req, res)) return;
  db.query('DELETE FROM alunos WHERE id=?', [req.params.id], (err, result) => {
    if (err) return fail(res, err);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json({ mensagem: 'Aluno excluído.' });
  });
});
async function iniciar() {
  // Cria apenas a tabela ausente; preserva todos os registros existentes.
  await db.promise().query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  app.listen(PORT, '0.0.0.0', () => console.log('Aplicacao iniciada; MySQL conectado com TLS.'));
}
iniciar().catch(async error => {
  console.error('Falha ao conectar ou preparar o banco:', error.code || 'CONFIGURACAO_INVALIDA');
  await db.promise().end();
  process.exitCode = 1;
});
