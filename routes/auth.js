const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const {userSchemaJoi} = require("../joiSchema");

const validateUser = (req, res, next) => {
    let {error} = userSchemaJoi.validate(req.body);
    if(error) {
        let message = error.details.map(element => element.message).join(",");
        throw new ExpressError(message, 400)
    }else{
        next();
    }
}

router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post("/register", validateUser, catchAsync(async(req, res, next) => {
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

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect:"/auth/login"}), (req, res) => {
    res.redirect("/home");
})


module.exports = router;