const User=require("../models/user.js");

module.exports.getSignup=(req,res)=>{
    res.render("../views/Users/signup.ejs");
};

module.exports.postSignup=async(req,res)=>{
    try
    {
    let {username,email,password}=req.body;
    let newUser= new User({username,email});
    let registeredUser=await User.register(newUser,password);
    req.logIn(registeredUser,(err)=>{
        if(err)
            {
                return next(err);
            }
         req.flash("success","User registered Successfully!");
         res.redirect("/listings");   
    })

    }
    catch(e)
    {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
 
};

module.exports.getLogin=(req,res)=>{
    res.render("../views/Users/login.ejs");
};

module.exports.postLogin=async(req,res)=>{
    req.flash("success","Welcome to wanderlust!");
    let redirectUrl=res.locals.redirectUrl || "/listings" ;
    res.redirect(redirectUrl);
};

module.exports.logOut=(req,res,next)=>{
    req.logOut((err)=>{
        if(err)
        {
            return next(err);
        }
        req.flash("success","You are logout from this page");
        res.redirect("/listings")
    })

};