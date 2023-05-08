const express = require("express");
const router = express.Router({mergeParams: true});
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



router.post("/", validateComment, catchAsync(async (req, res) => {
    let foundPost = await Posts.findById(req.params.id);
    let newComment = new Comments(req.body.comment);
    foundPost.comments.push(newComment);
    newComment.author = req.user._id;
    newComment.likes = 0;
    await newComment.save();
    await foundPost.save();
    res.redirect(`/posts/${foundPost._id}`);
}));

module.exports = router;