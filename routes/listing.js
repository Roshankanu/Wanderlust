const express = require("express");
const router=express.Router();
const asyncWrap=require("../utils/asyncWrap.js");
const {isloggedin,isOwner,validationSchema}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');

const {storage}=require("../cloudinary.js");
const upload = multer({storage});


//index route or main route
router.route("/")
.get(asyncWrap(listingController.index))

// to save
.post(upload.single('listing[image]'),validationSchema, asyncWrap(listingController.save));


//to create new route
router.get("/new",isloggedin,listingController.new);


//to show specific list
router.route("/:id")
.get(validationSchema,asyncWrap(listingController.show))

//to update the edited list
.put(isOwner,upload.single('listing[image]'),validationSchema,asyncWrap(listingController.update))
.delete(isloggedin,isOwner,listingController.delete);

//to edit the list
router.get("/:id/edit",isloggedin,isOwner,validationSchema,asyncWrap(listingController.edit));

//to search listings
router.get("/search/destination",asyncWrap(listingController.search));

//to filter listings by category
router.get("/filter/category",asyncWrap(listingController.filter));


module.exports=router;