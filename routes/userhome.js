const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const {storage, cloudinary} = require("../cloudinary");
const multer = require("multer");
const upload = multer({storage});

router.get("/editProfile/:id/tagline",catchAsync(async(req, res) => {
    let currentUserId = req.user._id;
    let data = await userModel.findById(currentUserId);
    res.render("userhome/editTagline", {data});
}));

router.put("/editProfile/:id/tagline",catchAsync(async(req, res) => {
    let {id} = req.params;
    let updatedProfile = await userModel.findByIdAndUpdate(id, {...req.body.user});
    updatedProfile.save();
    res.redirect("/home");
}));

router.get("/editProfile/:id/photo",catchAsync(async(req, res) => {
    let {newTagline} = req.body;
    let currentUserId = req.user._id;
    let data = await userModel.findByIdAndUpdate(currentUserId, {tagline: newTagline});
    res.render("userhome/editPhoto", {data});
}));

router.put("/editProfile/:id/photo", upload.single("pfp"), catchAsync(async(req, res) => {
    let {path, filename} = req.file;
    let newPic = {
        url: path,
        filename: filename
    }
    let updatedProfile = await userModel.findByIdAndUpdate(req.params.id, {pfp: newPic});
    await updatedProfile.save();
    res.redirect("/home");
}));

router.put("/deletePhoto/:id", catchAsync(async(req, res) => {
    let {id} = req.params;
    let {oldPic} = req.body;
    let defaultPic = {
        url: "https://res.cloudinary.com/dmm49vvvy/image/upload/v1686611923/blankphoto_hno0uv.jpg",
        filename: "blankphoto_hno0uv"
    }
    let defaultPfp = await userModel.findByIdAndUpdate(id, {pfp: defaultPic});
    await defaultPfp.save();
    await cloudinary.uploader.destroy(oldPic);
    req.flash("success", "Photo removed");
    res.redirect("/home");
}))

module.exports = router;