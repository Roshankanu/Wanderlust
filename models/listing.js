const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

let newListing = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    min: 0
  },
  image: {
    url:{
      type:String,
    },
    filename:{
    type:String
    }
  },
  location: String,
  country: String,
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic Cities", "Mountain", "Castles", "Swimming", "farm", "Camping", "Arctic", "Dome", "Boat"],
    default: "Trending"
  },
  reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review"
  },],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
  });



//delete review from listing too  (delete review middleware)
newListing.post("findOneAndDelete",async(listing)=>{
  if(listing)
  {
    await Review.deleteMany({_id:{$in:listing.reviews}})
  }
})

const Listing = new mongoose.model("Listing", newListing);
module.exports = Listing;
