const mongoose = require('mongoose');
Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
})

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
