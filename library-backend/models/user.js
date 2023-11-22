const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, minLength: 5, required: true, unique: true },
    favoriteGenre: { type: String, minLength: 3, required: true },
});
const uniqueValidator = require('mongoose-unique-validator');

module.exports = mongoose.model('User', userSchema);
