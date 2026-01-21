const Joi = require('joi');
//for serer validation
module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        price:Joi.number().required().min(0),
        location:Joi.string().required(),
        country:Joi.string().required(),
        category:Joi.string().required().valid("Trending", "Rooms", "Iconic Cities", "Mountain", "Castles", "Swimming", "farm", "Camping", "Arctic", "Dome", "Boat"),
        // Form posts listing[image][url], so image must be an object
        image: Joi.object({
            url: Joi.string().uri().allow("", null)
        }).optional()
    }).required()
});


module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
});
