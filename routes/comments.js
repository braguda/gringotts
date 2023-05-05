const express = require("express");
const router = express.Router();
const Posts = require("../models/post")
const Comments = require("../models/comments");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const {postSchemaJoi, commentSchemaJoi} = require("../joiSchema");

const validateComment = (req, res, next) => {
    let {error} = commentSchemaJoi.validate(req.body);
    if(error){
        let message = error.details.map(element =>element.message).join(",");
        throw new ExpressError(message, 400);
    }else{
        next();
    }
};

router.post('/', validateComment, catchAsync(async (req, res) => {
    let foundPost = await Posts.findById(req.params.id);
    let newComment = new Comments(req.body.commentBody);
    foundPost.comments.push(newComment);
    await newComment.save();
    await foundPost.save();
    console.log(foundPost._id);
    res.redirect(`posts/${foundPost._id}`);
}));

module.exports = router;