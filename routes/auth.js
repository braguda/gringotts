const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post("/register", async(req, res) => {
    try{
        let {email, username, password} = req.body;
        let newUser = new userModel({email, username});
        let registered = await userModel.register(newUser, password);
        console.log(registered);
        res.redirect("/home");
    }catch(e){
        res.send(e);
    }
});

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect:"/auth/login"}), (req, res) => {
    res.redirect("/home");
})


module.exports = router;