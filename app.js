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
const commentModel = require("./models/comments")
const userRoutes = require("./routes/auth");
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

const validatePost = (req, res, next) => {
    let {error} = postSchemaJoi.validate(req.body);
    if(error) {
        let message = error.details.map(element => element.message).join(",");
        throw new ExpressError(message, 400)
    }else{
        next();
    }
};

const validateComment = (req, res, next) => {
    let {error} = commentSchemaJoi.validate(req.body);
    if(error){
        let message = error.details.map(element =>element.message).join(",");
        throw new ExpressError(message, 400);
    }else{
        next();
    }
};


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
        res.redirect("/auth/login");
    }
    next();
}

const homePageAccess = (req, res, next) => {
    if(!req.user){
        req.flash("success", "SIGN IN");
        res.redirect("/auth/login");
    }
    next();
}
app.use("/auth", userRoutes);

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/home", homePageAccess, catchAsync(async(req, res) => {
    let posts = await postModel.find({});
    res.render("home", {posts}); 
}));

app.get("/posts/myPosts", async(req, res) => {
    let currentUser = req.user._id;
    let foundPosts = await postModel.find({author: currentUser});
    res.render("posts/myPosts", {foundPosts});
});

app.post("/posts", isLoggedIn ,validatePost ,catchAsync(async(req, res) => {
    if(!req.body) throw new ExpressError("Incomplete Post data");
    let newPost = new postModel(req.body.post);
    newPost.author = req.user._id;
    await newPost.save();
    req.flash("success", "The pennies for your thoughts");
    res.redirect("/home");
}));

app.get("/posts/:id", async(req, res) => {
    let foundPosts = await postModel.findById(req.params.id).populate("comments").populate("author");
    res.render("posts/showPost", {foundPosts});
});

app.get('/posts/:id/edit', async (req, res) => {
    let foundPost = await postModel.findById(req.params.id)
    res.render("posts/editPosts", { foundPost });
}); 

app.put('/posts/:id', async (req, res) => {
    let { id } = req.params;
    await postModel.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect("/posts/myPosts");
});

app.delete("/posts/:id", async(req, res) => {
    let {id } = req.params;
    await postModel.findByIdAndDelete(id);
    res.redirect("/posts/myposts");
});

app.post('/posts/:id/comments', validateComment, catchAsync(async (req, res) => {
    let foundPost = await postModel.findById(req.params.id);
    let newComment = new commentModel(req.body.commentBody);
    foundPost.comments.push(newComment);
    await newComment.save();
    await foundPost.save();
    res.redirect(`/posts/${foundPost._id}`);
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