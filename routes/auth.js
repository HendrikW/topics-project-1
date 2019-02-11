const express   = require('express');
const authrouter  = express.Router();
const passport  = require("passport")
const ensureLogin = require("connect-ensure-login");
const bcrypt  = require("bcrypt")
const User      = require("../models/user")
const Topic  = require("../models/topic")

// SIGN UP

authrouter.get('/signup', (req, res, next) => {
  res.render('signup');
});

authrouter.post("/signup", (req, res) => {

  var email = req.body.email
  var password = req.body.password

  if(email === "" || password === "") {
    res.render("signup", {err: "all fields required"});
    return;
  }

  User.findOne({email: email}).then(user => {
    if(user !== null) {
      res.render("signup", {err: "user already exists!"});

      return;
    }

  const salt     = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);

  const newUser  = new User({
    email: email,
    password: hashPass
  });

  newUser.save().then(() => {
    res.redirect("/auth/login")
  })

}).catch(err => {console.log(err)})

})


//LOG IN

authrouter.get('/login', (req, res, next) => {
  res.render('login', {message: req.flash('error')});
});



authrouter.post('/login', passport.authenticate('local',{
          successRedirect:'/topics',
          failureRedirect: '/auth/login',
         // passReqToCallback: true,
          failureFlash: true
      }) 
);



// LOG OUT

authrouter.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/auth/login")
})

module.exports = authrouter


