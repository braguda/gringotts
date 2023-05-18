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
const methodOverride = require("method-override");
const userModel = require("./models/user");
const postModel = require("./models/post");
const userRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const engageRoutes = require("./routes/inne");
const flash = require("connect-flash");
const {postSchemaJoi} = require("./joiSchema");
const {commentSchemaJoi} = require("./joiSchema");
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
app.use(methodOverride("_method"));

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
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash("error", "SIGN IN!");
        return res.redirect("/auth/login");
    }
    next();
}
app.use("/auth", userRoutes);
app.use("/posts", postsRoutes);
app.use("/posts/:id/comments", commentRoutes);
app.use("/inne", engageRoutes);

app.get("/", (req, res) => {
    res.render("landing");
}); 

app.get("/home",isLoggedIn, catchAsync(async(req, res) => {
    let userID = req.user._id;
    let data = await userModel.findById(userID);
    let following = data.following;
    let foundUsers = [];
    let foundPosts = [];
    for (let i of following){
        let newData = await userModel.findById(i);
        foundUsers.push(newData);
    }
    for(let i of foundUsers){
         foundPosts.push(await postModel.find({author: i._id}).populate("author"));
    }
    let posts = foundPosts.flat();
    res.render("home", {posts, foundUsers}); 
}));


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