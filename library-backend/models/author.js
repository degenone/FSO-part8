const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
    },
    born: {
        type: Number,
    },
    bookCount: {
        type: Number,
        default: 0,
    },
});

authorSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Author', authorSchema);
