// --- 1. IMPORTAÇÕES E CONFIGURAÇÕES ---
require('dotenv').config(); // Carrega variáveis de ambiente (.env) para segurança (RNF03)
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Inicializa o framework Express
const app = express();

// Middlewares (Configurações intermediárias)
app.use(express.json()); // Permite que a API entenda dados enviados em JSON
app.use(cors());         // Permite que o Front-end (Vercel) acesse esta API

// --- 2. CONEXÃO COM O BANCO DE DADOS (SUPABASE) ---
// Conecta ao PostgreSQL usando as chaves seguras do ambiente (RNF03)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota de Teste (Para verificar se o servidor está online no Render)
app.get('/', (req, res) => res.send('API GymTracker Operacional 🚀'));

// --- 3. ROTAS DA API (ENDPOINTS) ---

/**
 * ROTA: Cadastro de Usuário
 * Método: POST
 */
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    
    // Insere o novo usuário na tabela 'usuarios'
    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nome, email, senha }]);
    
    // Tratamento de erro (ex: email duplicado)
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ msg: "Usuário criado com sucesso!", data });
});

/**
 * ROTA: Login (Autenticação)
 * Método: POST
 */
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    // Busca usuário que tenha o email E a senha informados
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single(); // Retorna apenas um objeto, não uma lista

    if (error || !data) return res.status(401).json({ error: "Credenciais inválidas" });
    
    res.json({ msg: "Login realizado", user: data });
});

/**
 * ROTA: Criar Exercício
 * Método: POST
 */
app.post('/treinos', async (req, res) => {
    // Recebe os dados do front-end
    const { usuario_id, exercicio, series, repeticoes, carga } = req.body;

    // Salva na tabela 'treinos'
    const { data, error } = await supabase
        .from('treinos')
        .insert([{ usuario_id, exercicio, series, repeticoes, carga }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

/**
 * ROTA: Listar Treinos
 * Método: GET
 */
app.get('/treinos/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;

    // Busca todos os treinos vinculados ao ID do usuário logado
    const { data, error } = await supabase
        .from('treinos')
        .select('*')
        .eq('usuario_id', usuario_id)
        .order('created_at', { ascending: false }); // Ordena do mais recente para o antigo

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

/**
 * ROTA: Excluir Exercício
 * Método: DELETE
 */
app.delete('/treinos/:id', async (req, res) => {
    const { id } = req.params;

    // Remove o treino baseado no ID do exercício
    const { error } = await supabase
        .from('treinos')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ msg: "Exercício removido com sucesso" });
});

// --- 4. INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));