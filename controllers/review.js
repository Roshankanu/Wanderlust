const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//create review
module.exports.create=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
       throw new ExpressError(404,"Listing not found");
     }
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review created.");
    res.redirect(`/listings/${listing._id}`);
};

//delete review
module.exports.delete=async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review Deleted.");
  res.redirect(`/listings/${id}`);
};