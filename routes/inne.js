const express = require("express");
const router = express.Router();
const Users = require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/follow", catchAsync(async(req, res) => {
    let userID = req.user._id;
    let followData = await Users.findById(userID);
    res.render("home", {followData});
}));

router.post("/follow", catchAsync(async(req, res) => {
    let {_id} = req.body;
    let currentUserId = req.user._id;
    await Users.updateOne({_id: currentUserId}, {$push: {following: _id}});
    res.redirect("/home");
}));

router.post("/follow/remove", catchAsync(async(req, res) => {
    let {_id} = req.body;
    let currentUserId = req.user._id;
    await Users.findByIdAndUpdate(currentUserId,{$pull: {following: _id}});
    req.flash("success", "No longer followed");
    res.redirect("/home");
}));

module.exports = router; 