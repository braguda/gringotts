const express = require("express");
const router = express.Router();
const Posts = require("../models/post")
const Users = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const {postSchemaJoi, commentSchemaJoi} = require("../joiSchema");

const validatePost = (req, res, next) => {
    let {error} = postSchemaJoi.validate(req.body);
    if(error) {
        let message = error.details.map(element => element.message).join(",");
        throw new ExpressError(message, 400)
    }else{
        next();
    }
};

router.get("/users/:username", async(req, res) => {
    res.locals.username = req.params.username;
    let data = await Users.find({username: req.params.username});
    let foundPosts = await Posts.find().populate("author");
    let foundUsers = data[0];
    res.render("posts/profile", {foundPosts, foundUsers});
});

router.get("/myPosts", async(req, res) => {
    let currentUser = req.user._id;
    let foundPosts = await Posts.find({author: currentUser});
    res.render("posts/myPosts", {foundPosts, currentUser});
});

router.post("/", validatePost, catchAsync(async(req, res) => {
    if(!req.body) throw new ExpressError("Incomplete Post data");
    let newPost = new Posts(req.body.post);
    newPost.likes = 0;
    newPost.author = req.user._id;
    await newPost.save();
    req.flash("success", "The pennies for your thoughts");
    res.redirect("/home");
}));

router.get("/:id", async(req, res) => {
    let foundPosts = await Posts.findById(req.params.id).populate({
        path: "comments",
        populate: {
            path: "author"
        }
    }).populate("author");
    res.render("posts/showPost", {foundPosts}); 
});

router.get("/:id/edit", async (req, res) => {
    let foundPost = await Posts.findById(req.params.id)
    res.render("posts/editPosts", { foundPost });
}); 

router.put("/:id", validatePost, async(req, res) => {
    let { id } = req.params; 
    await Posts.findByIdAndUpdate(id, { ...req.body.post });
    req.flash("success", "Post Updated!!!")
    res.redirect("/posts/myPosts");
});

router.put("/:id/likes", async(req, res) => {
    let {id} = req.params;
    await Posts.updateOne({_id: id}, {$inc: {likes: 1}});
});

router.delete("/:id", async(req, res) => {
    let {id } = req.params;
    await Posts.findByIdAndDelete(id);
    req.flash("success, Post Deleted!!")
    res.redirect("/posts/myposts");
});



module.exports = router;