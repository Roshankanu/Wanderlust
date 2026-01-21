const express = require("express");
const router=express.Router();
const asyncWrap=require("../utils/asyncWrap.js");
const passport=require("passport");
const {saveredirectUrl}=require("../middleware.js");
const userController=require("../controllers/user.js");

//for signUp
router.route("/signup")
.get(userController.getSignup)
.post(asyncWrap(userController.postSignup));


//for login
router.route("/login")
.get(userController.getLogin)
.post(saveredirectUrl,passport.authenticate('local', { failureRedirect: '/login', failureFlash:true}),userController.postLogin);


router.get("/logout",userController.logOut);

module.exports=router;
