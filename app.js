if(process.env.NODE_ENV!="production")
{
  require('dotenv').config()
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingroutes = require("./routes/listing.js");
const reviewroutes = require("./routes/review.js");
const userroutes=require("./routes/user.js")


const session=require("express-session");
const MongoStore = require('connect-mongo').default;
const flash=require("connect-flash");

//for authentication
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//mongo atlas for online db
const dbUrl=process.env.ATLASDB_URL
main()
  .then(() => {
    console.log("Connecting to server");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

// for store
const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET_CODE,
  },
  touchAfter:24*3600,
})
store.on("err",()=>{
  console.log("Error in the session",err);
  
})
//express-session
const sessionOption={
  store,
  secret:process.env.SECRET_CODE,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true
  }
};

app.use(session(sessionOption));
app.use(flash());

//middleware for authentication
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to use flash
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currentUser=req.user;
  next();
})

app.use("/listings", listingroutes);
app.use("/listings/:id/reviews", reviewroutes);
app.use("/",userroutes);

//error handling for all other root that is not defined
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

//error handling middleware

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("./Error.ejs", { message });
});
app.listen(8080, () => {
  console.log("Connecting to port");
});
