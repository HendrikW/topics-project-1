const express = require("express");
const mongoose = require("mongoose");
const archiv = express.Router();
const User = require("../models/user");
const Topic = require("../models/topic");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");


archiv.get("/", (req, res) => {

  Topic.find({active:false}).then(topics => {
    
    var sortedtopics = topics.sort((a,b) => {

      a = a.upvote.length
      b = b.upvote.length
 
      return b-a;
 
     }).reverse()

     res.render("archiv", {sortedtopics})
  })

})


archiv.post("/:topicid", (req, res) => {

Topic.updateOne({_id: req.params.topicid}, {$set: {active: false}, officialresponse: req.body.officialr})
.then(result => {res.redirect("/topics")})
.catch(err => {console.log(err)})

})



module.exports = archiv