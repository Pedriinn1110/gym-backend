require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o Front-end acesse o Back-end

// Conexão com Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota de Teste
app.get('/', (req, res) => res.send('API GymTracker Funcionando!'));

// 1. Cadastro de Usuário (RF01)
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nome, email, senha }]);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ msg: "Usuário criado!", data });
});

// 2. Login (RF02)
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single();

    if (error || !data) return res.status(401).json({ error: "Login inválido" });
    res.json({ msg: "Logado com sucesso", user: data });
});

// 3. Criar Exercício (RF03)
app.post('/treinos', async (req, res) => {
    const { usuario_id, exercicio, series, repeticoes, carga } = req.body;
    const { data, error } = await supabase
        .from('treinos')
        .insert([{ usuario_id, exercicio, series, repeticoes, carga }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// 4. Listar Treinos de um Usuário (RF04)
app.get('/treinos/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    const { data, error } = await supabase
        .from('treinos')
        .select('*')
        .eq('usuario_id', usuario_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// 5. Excluir Exercício (RF03)
app.delete('/treinos/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('treinos')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ msg: "Exercício removido" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));