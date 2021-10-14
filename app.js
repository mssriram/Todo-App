const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Note = require('./models/note');

mongoose.connect('mongodb://localhost:27017/todoApp')
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.error(err))

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', async (req, res) => {
    const notes = await Note.find();
    return res.render('index', {notes});   
})

app.get('/notes', async (req, res) => {
    const notes = await Note.find();
    res.send(notes);
})

app.post('/new', async (req, res) => {
    const note = req.body;
    const newNote = await new Note(note);
    newNote.save();
    return res.send(newNote);
})

app.get('/:id', async (req, res) =>{
    const {id} = req.params;
    const note = await Note.findById(id);
    res.send(note);
})

app.delete('/:id', async (req, res) => {
    const {id} = req.params;
    await Note.findByIdAndDelete(id);
    console.log('deleted');
    return res.send('note received');
})

app.put('/:id', async (req, res) => {
    const {id} = req.params;
    const updatedNote = req.body;

    await Note.findByIdAndUpdate(id, updatedNote);
    console.log('updated');
    return res.send('note received');
})

app.put('/color/:id', async (req, res) => {
    const {id} = req.params;
    const {color} = req.body;

    const note = await Note.findById(id);
    note.color = color;
    await note.save();

    res.send('color updated');
})

app.listen(3000, () => {
    console.log('connected to port 3000');
})