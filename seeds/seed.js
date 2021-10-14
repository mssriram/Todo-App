const mongoose = require('mongoose');
const Note = require('../models/note');

mongoose.connect('mongodb://localhost:27017/todoApp')
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.error(err))

const setColor = async () => {
    const notes = await Note.find();
}

setColor();