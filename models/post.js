const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: String
});

module.exports = mongoose.model("Posts", postSchema);