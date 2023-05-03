const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const {userSchemaJoi} = require("../joiSchema");


router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post("/register", catchAsync(async(req, res, next) => {
    try{
        let {email, username, password} = req.body;
        let newUser = new userModel({email, username});
        await userModel.register(newUser, password);
        req.flash("success", "Registered!")
        res.redirect("/home");
    }catch(e){
        res.send(e);
        next();
    }
}));

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/auth/login"}), (req, res) => {
    req.flash("success", "Hey You!");
    let redirectUrl ="/home";
    delete req.session.retrunTo;
    res.redirect(redirectUrl);
});


module.exports = router;