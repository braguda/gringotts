const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        type: String,
    },
    body: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Posts", postSchema);