const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const {storage} = require("../cloudinary");
const multer = require("multer");
const upload = multer({storage});

function usernameToLowerCase(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    next();
}

router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post("/register", catchAsync(async(req, res, next) => {
    try{
        let {email, password} = req.body;
        let username = req.body.username.toLowerCase();
        let pfp = {
            url: "https://res.cloudinary.com/dmm49vvvy/image/upload/v1686611923/blankphoto_hno0uv.jpg",
            filename: "blankphoto_hno0uv"
        }
        let tagline = "Change ME!";
        let newUser = new userModel({email, username, pfp, tagline});
        let registered = await userModel.register(newUser, password);
        req.login(registered, err => {
            if(err) return next(err);
            req.flash("success", "Registered!")
            res.redirect("/home");
        })

    }catch(e){
        req.flash("error", e.message)
        return res.redirect("register");

    }
}));

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post("/login", usernameToLowerCase, passport.authenticate("local", {failureFlash: true, failureRedirect: "/auth/login"}), (req, res) => {
    req.flash("success", "Hey You!");
    delete req.session.retrunTo;
    res.redirect("/home");
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You have logged out");
        res.redirect("/");
    });
});



module.exports = router;