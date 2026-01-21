const express = require("express");
const router=express.Router({mergeParams:true});
const asyncWrap=require("../utils/asyncWrap.js");

const{validateReview, isloggedin, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/review.js")


//review route
//Post
router.post("/",isloggedin,validateReview,asyncWrap(reviewController.create));

//delete review route
router.delete("/:reviewId",isReviewAuthor,asyncWrap(reviewController.delete));

module.exports=router;
