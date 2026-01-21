const Listing = require("../models/listing.js");
const axios = require("axios");


//for index route
module.exports.index = async (req, res) => {
  const alllisting = await Listing.find({});
  res.render("./listings/index.ejs", { alllisting, selectedCategory: null, searchQuery: null });
};

//for new routes
module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

//to save new posts
module.exports.save = async (req, res) => {
  const location = req.body.listing.location;
  const country = req.body.listing.country;

  const geoResponse = await axios.get(
    `https://api.openweathermap.org/geo/1.0/direct`,
    {
      params: {
        q: `${encodeURIComponent(location)},${country}`,
        limit: 1,
        appid:process.env.OPENWEATHER_API,
      },
    }
  );

  const loc = geoResponse?.data[0];
  
  if (!loc) {
    req.flash("error", "Location not found. Please enter a valid location and country.");
    return res.redirect("/listings/new");
  }
  
  const lat = loc.lat;
  const lon = loc.lon;
  let url = req.file.path;
  let filename = req.file.filename;
  let newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = {
    type: "Point",
    coordinates: [lon, lat],
  };
  await newlisting.save();

  req.flash("success", "New Listing created.");
  res.redirect("/listings");
};

//to show specific posts
module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listings doesn't exists.");
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};


// Helper function to get coordinates from location and country
module.exports.getCoordinates = async (location, country) => {
  const geoResponse = await axios.get(
    `https://api.openweathermap.org/geo/1.0/direct`,
    {
      params: {
        q: `${encodeURIComponent(location)},${country}`,
        limit: 1,
        appid:process.env.OPENWEATHER_API,
      },
    }
  );

  const loc = geoResponse?.data[0];
  if (!loc || !loc.lat || !loc.lon) {
    throw new Error("Location not found. Please enter a valid location and country.");
  }
  return { lat: loc.lat, lon: loc.lon };
};


//to edit listings
module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you try to access doesn't exists.");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

//to update listings
module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  // If location or country changed, update coordinates
  if (req.body.listing.location !== listing.location || 
      req.body.listing.country !== listing.country) {
    try {
      const { lat, lon } = await module.exports.getCoordinates(
        req.body.listing.location,
        req.body.listing.country
      );
      req.body.listing.geometry = {
        type: "Point",
        coordinates: [lon, lat],
      };
    } catch (error) {
      req.flash("error", error.message || "Location not found. Please enter a valid location and country.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }


  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated.");
  res.redirect(`/listings/${id}`);
};

//to delete listings
module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted.");
  res.redirect("/listings");
};

//to search listings by destination (place-focused)
module.exports.search = async (req, res) => {
  const searchQuery = req.query.search;
  if (!searchQuery) {
    return res.redirect("/listings");
  }

  // Escape regex special chars to prevent malformed patterns
  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    const safeQuery = escapeRegex(searchQuery.trim());

    // Match from word boundaries for place-like searches; case-insensitive
    const searchPattern = new RegExp(`\\b${safeQuery}`, "i");

    // Destination-first search: location and country are primary, title as secondary
    const alllisting = await Listing.find({
      $or: [
        { location: { $regex: searchPattern } },
        { country: { $regex: searchPattern } },
        { title: { $regex: searchPattern } }
      ]
    });

    if (alllisting.length === 0) {
      req.flash("error", `No places found for "${searchQuery}". Try another city, country, or nearby place.`);
    }

    res.render("./listings/index.ejs", { alllisting, searchQuery, selectedCategory: null });
  } catch (error) {
    console.error("Search error:", error);
    req.flash("error", "Search failed. Please try again.");
    res.redirect("/listings");
  }
};

//to filter listings by category
module.exports.filter = async (req, res) => {
  const category = req.query.category;
  if (!category) {
    return res.redirect("/listings");
  }
  
  try {
    const alllisting = await Listing.find({ category: category });
    res.render("./listings/index.ejs", { alllisting, selectedCategory: category, searchQuery: null });
  } catch (error) {
    req.flash("error", "Filter failed. Please try again.");
    res.redirect("/listings");
  }
};
