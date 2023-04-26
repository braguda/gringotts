if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = require("./models/user");
const postModel = require("./models/post");
const userRoutes = require("./routes/auth");

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

app.use(session({
    secret: "Odie",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use("/auth", userRoutes);

app.get("/", (req, res) => {
    res.render("landing");
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