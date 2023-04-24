if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const userModel = require("./models/user");
const postModel = require("./models/post");

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true})
.then(() => {
    console.log("Connection Open!!!");
})
.catch(err => {
    console.log("Oh NO ERROR!!!!", err)
});

app.engine("ejs", ejsMate);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/login", (req, res) => {
    res.render("auth/login");
});

app.get("/register", (req, res) => {
    res.render("auth/register");
});

app.post("/register", async(req, res) => {
    try{
        let {email, username, password} = req.body;
        let newUser = new userModel({email, username, password});
        await newUser.save();
        res.redirect("/");
    }catch(e){
        res.send(e);
    }
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/myposts", async(req, res) => {
    let foundPosts = await postModel.find({});
    console.log(foundPosts[0].body);
    res.render("myposts", {postBody: foundPosts[0].body});
});

app.post("/myposts", async(req, res) => {
    try{
        let {title, body} = req.body;
        let author = "Kimora"
        let newPost = new postModel({title, body, author});
        await newPost.save();
        res.redirect("/myposts");
    }catch(e){
        res.send(e)
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`app open on ${port}`);
});