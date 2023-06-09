const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/expressError");
const {userSchemaJoi} = require("../joiSchema");

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
        let newUser = new userModel({email, username});
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
})


module.exports = router;