const mongoose = require('mongoose');
Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    color: {
        type: String,
        default: 'default'
    }
})

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
    