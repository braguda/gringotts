if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/expressError");
const session = require("express-session");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userModel = require("./models/user");
const postModel = require("./models/post");
const userRoutes = require("./routes/auth");
const flash = require("connect-flash");

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
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24,
    }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/auth", userRoutes);

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/myposts", async(req, res) => {
    let posts = await postModel.find({});
    res.render("myposts", {posts});
});

app.post("/myposts", catchAsync(async(req, res) => {
    if(!req.body) throw new ExpressError("Incomplete Post data");
    let {title, body} = req.body;
    let author = "Kimora"
    let newPost = new postModel({title, body, author});
    await newPost.save();
    req.flash("success", "The pennies for your thoughts");
    res.redirect("/myposts");
}));

app.get("/myposts/:author", async(req, res) => {
    let posts = await postModel.find({"author": req.params.author});
    res.render("myposts", {posts});
});

app.delete("/myposts/:id", async(req, res) => {
    let {id } = req.params;
    await postModel.findByIdAndDelete(id);
    res.redirect("/myposts");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
    let {statusCode = 500 } = err;
    if(!err.message) err.message = "sommmmtiiing";
    res.status(statusCode).render("error", {err});
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`app open on ${port}`);
});