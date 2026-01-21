const Listing = require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
//for server side error
const {reviewSchema,listingSchema}=require("./schema.js");
const Review = require("./models/review.js");
module.exports.isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async(req,res,next)=>{
      let {id}=req.params;
      let listing=await Listing.findById(id);
      if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error","You don't have access to modify listings");
        return res.redirect(`/listings/${id}`);
      }
    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
      let {id,reviewId}=req.params;
      let review=await Review.findById(reviewId);
      if(!review.author._id.equals(res.locals.currentUser._id)){
        req.flash("error","You don't have access to modify review");
        return res.redirect(`/listings/${id}`);
      }
    next();
}
//middleware for schmea
module.exports.validationSchema=((req,res,next)=>{
  const {error}=listingSchema.validate(req.body);
  if(error)
  {
    throw new ExpressError(400,error.details[0].message);
  }
  else{
    next();
  }
});

module.exports.validateReview=((req,res,next)=>{
  const {error}=reviewSchema.validate(req.body);
  if(error)
  {
    throw new ExpressError(400,error.details[0].message);
  }
  else{
    next();
  }
});