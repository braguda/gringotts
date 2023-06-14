const express = require("express");
const router = express.Router();
const Posts = require("../models/post")
const Users = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const {postSchemaJoi, commentSchemaJoi} = require("../joiSchema");
const moment = require("moment");

const validatePost = (req, res, next) => {
    let {error} = postSchemaJoi.validate(req.body);
    if(error) {
        let message = error.details.map(element => element.message).join(",");
        throw new ExpressError(message, 400)
    }else{
        next();
    }
};

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "SIGN IN!");
        return res.redirect("/auth/login");
    }
    next();
}

router.get("/users/:username",isLoggedIn, async(req, res) => {
    res.locals.username = req.params.username;
    let data = await Users.find({username: req.params.username});
    let foundPosts = await Posts.find().populate("author");
    let foundUsers = data[0];
    res.render("posts/profile", {foundPosts, foundUsers});
});

router.get("/myPosts", isLoggedIn, async(req, res) => {
    let currentUser = req.user._id;
    let foundPosts = await Posts.find({author: currentUser}).populate("author");
    res.render("posts/myPosts", {foundPosts, currentUser});
});

router.post("/", isLoggedIn, validatePost, catchAsync(async(req, res) => {
    if(!req.body) throw new ExpressError("Incomplete Post data");
    let stamp = moment();
    let date = stamp.format("MM/DD/YYY");
    let dateStamp = Date(date);
    let newPost = new Posts(req.body.post);
    newPost.date = dateStamp;
    newPost.likes = 0;
    newPost.author = req.user._id;
    await newPost.save();
    req.flash("success", "The pennies for your thoughts");
    res.redirect("/posts/myPosts");
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

router.get("/:id/edit", isLoggedIn, async (req, res) => {
    let foundPost = await Posts.findById(req.params.id)
    res.render("posts/editPosts", { foundPost });
});

router.get("/find/name", async (req, res) => {
    let username = req.query.username.toLowerCase();
    res.redirect(`/posts/users/${username}`);
   });

router.put("/:id",isLoggedIn, validatePost, async(req, res) => {
    let { id } = req.params; 
    await Posts.findByIdAndUpdate(id, { ...req.body.post });
    req.flash("success", "Post Updated!!!")
    res.redirect("/posts/myPosts");
});

router.put("/:id/likes", isLoggedIn, async(req, res) => {
    let {id} = req.params;
    await Posts.updateOne({_id: id}, {$inc: {likes: 1}});
    res.redirect(`/posts/${id}`);
});

router.delete("/:id",isLoggedIn, async(req, res) => {
    let {id } = req.params;
    await Posts.findByIdAndDelete(id);
    req.flash("success, Post Deleted!!")
    res.redirect("/posts/myposts");
});



module.exports = router;