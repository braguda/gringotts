const express = require("express");
const router = express.Router();
const Users = require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/:id", catchAsync(async(req, res) => {
    let user = req.params.id
    let data = await Users.findById(user);
    res.send(data.following);
    
}));

router.post("/follow", catchAsync(async(req, res) => {
    let {_id} = req.body;
    let currentUserId = req.user._id;
    await Users.updateOne({_id: currentUserId}, {$push: {following: _id}});
    
    res.send("check");
}));

module.exports = router; 