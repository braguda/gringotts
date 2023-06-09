if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync")
const ExpressError = require("./utils/expressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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
const engageRoutes = require("./routes/follow");
const userHomepageRoutes = require("./routes/userhome");
const flash = require("connect-flash");
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/micePace"

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

const secret = process.env.SECRET || "Odie"; 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on("error", function(err){
    console.log("session store error");
});

const sessionConfig = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60,
        maxAge: 1000 * 60 * 60
    }
}

app.use(session(sessionConfig));
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
app.use("/follow", engageRoutes);
app.use("/userhome", userHomepageRoutes);

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
    posts.sort((a,b) => {
        let keyA = new Date(a.date);
        let keyB = new Date(b.date);
        if(keyA < keyB) return 1;
        if(keyA > keyB) return -1;
        return 0
    });
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