const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://172.16.0.213:27017/gerenciador-tarefas', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const tarefaSchema = new mongoose.Schema({
    descricao: String,
    status: String,
    prazo: Date,
    // Adicione o campo de descrição ao esquema
    descricao: String,
});

const Tarefa = mongoose.model('Tarefa', tarefaSchema);

app.use(express.static('public'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', async (req, res) => {
    let filtro = req.query.filtro || 'todos'; 
    const tarefas = await obterTarefasFiltradas(filtro);
    res.render('index', { tarefas, filtro });
});

app.post('/adicionar', async (req, res) => {
    const { descricao, status, prazo } = req.body;
    const tarefa = new Tarefa({ descricao, status, prazo });
    await tarefa.save();
    res.redirect('/');
});

app.post('/deletar/:id', async (req, res) => {
    const { id } = req.params;
    await Tarefa.findByIdAndDelete(id);
    res.redirect('/');
});


app.get('/editar/:id', async (req, res) => {
    const { id } = req.params;
    const tarefa = await Tarefa.findById(id);
    res.render('editar', { tarefa });
});


app.post('/editar/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao, status, prazo } = req.body;

    await Tarefa.findByIdAndUpdate(id, { descricao, status, prazo });

    res.redirect('/');
});

app.post('/filtrar', async (req, res) => {
    const { filtro } = req.body;
    res.redirect(`/?filtro=${filtro}`);
});

async function obterTarefasFiltradas(filtro) {
    let tarefas;


    const filtroLowerCase = filtro.toLowerCase();

    if (filtroLowerCase === 'completo') {
        tarefas = await Tarefa.find({ status: 'Completo' });
    } else if (filtroLowerCase === 'incompleto') {
        tarefas = await Tarefa.find({ status: 'Incompleto' });
    } else if (filtroLowerCase === 'nao-feito') {
        tarefas = await Tarefa.find({ status: 'Não Feito' });
    } else {
        tarefas = await Tarefa.find();
    }

    return tarefas;
}


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});