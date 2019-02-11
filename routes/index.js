const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/user");
const Topic = require("../models/topic");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");

router.get("/", (req, res) => {
  res.render("login");
});

// TOPIC HOME PAGE
router.get("/topics", ensureLogin.ensureLoggedIn("/auth/login"), (req, res) => {
    res.render("topics", {user: req.user});
});



// ADD NEW TOPIC
router.post("/submittopic", ensureLogin.ensureLoggedIn("/auth/login"),(req, res) => {
    var title = req.body.title;
    var maintext = req.body.maintext;

    Topic.create({
      title: title,
      maintext: maintext,
      active: true,
    }).then(() => {
      res.redirect("/topics");
    }).catch(err => {console.log(err)});
  }
);


// UPVOTE
router.post("/:topicid/vote/upvote",ensureLogin.ensureLoggedIn("/auth/login"),(req, res) => {
    var user = mongoose.Types.ObjectId(req.user.id);
    var topic = req.params.topicid;

  // check if already downvoted
  Topic.find({ _id: topic, downvote: { $in: [user] } }).then(result => {
    // if yes
    if(result.length > 0) {
      // pull downvote, push upvote
      Topic.updateOne({ _id: topic }, { $pull: { downvote: user } }).then(result => {res.send(result)})
      Topic.updateOne({ _id: topic }, { $push: { upvote: user } }).then(result => {res.send(result)})

  // if not
    } else {
      // check if alteady upvoted
      Topic.find({ _id: topic, upvote: { $in: [user] } })
      .then(upvote => {
        if (upvote.length === 0) {
          Topic.updateOne({ _id: topic }, { $push: { upvote: user } }).then(
            topic => {
                res.send(topic)
            }
          );
        } else {
          Topic.updateOne({ _id: topic }, { $pull: { upvote: user } }).then(topic => {res.send(topic)});
        }
      }).catch(err => {console.log(err);});
    }}
  ).catch(err => {console.log(err)})
})



//CURRENT USER
router.get("/user/currentuser", (req, res) => {
  res.send(req.user)
});



// DOWNVOTE
router.post("/:topicid/vote/downvote",ensureLogin.ensureLoggedIn("/auth/login"),(req, res) => {
      var user = mongoose.Types.ObjectId(req.user.id);
      var topic = req.params.topicid;

 // check if already upvoted
 Topic.find({ _id: topic, upvote: { $in: [user] } }).then(result => {
  // if yes
  if(result.length > 0) {
    // pull upvote, push downvote
    Topic.updateOne({ _id: topic }, { $pull: { upvote: user } }).then(result => {res.send(result)}).catch(err => {console.log(err)})
    Topic.updateOne({ _id: topic }, { $push: { downvote: user } }).then(result => {res.send(result)}).catch(err => {console.log(err)})

// if not
  } else {

  Topic.find({ _id: topic, downvote: { $in: [user] } })
  .then(downvote => {
    if (downvote.length === 0) {
      Topic.updateOne({ _id: topic }, { $push: { downvote: user } }).then(topic => {res.send(topic)}).catch(err => {console.log(err)});
    } else {
      Topic.updateOne({ _id: topic }, { $pull: { downvote: user } }).then(topic => {res.send(topic)}).catch(err => {console.log(err)});
    }
  }).catch(err => {console.log(err);});
}}).catch(err => {console.log(err)})
});



// SORT TOPIC BY NEW
router.get("/gettopics/newest", ensureLogin.ensureLoggedIn("/auth/login"), (req, res) => {

  Topic.find({active:true}).sort({created_at:-1})
  .then(sortedtopics => {console.log(sortedtopics); res.send(sortedtopics)})
  .catch(err => {console.log(err)})
    
  });


// AXIOS LIVE UPDATE UP/DOWNVOTE
// would this also be possible via .sort({}) in mongoose?

router.get("/gettopics/:highlow", ensureLogin.ensureLoggedIn("/auth/login"), (req, res) => {

  Topic.find({active:true}).then(topics => {
    
    var sortedtopics = topics.sort((a,b) => {

      a = a.upvote.length
      b = b.upvote.length
 
      return b-a;
 
     })
    
     if (req.params.highlow === "highest") {res.send(sortedtopics)}
     else if (req.params.highlow === "lowest") {res.send(sortedtopics.reverse())}
    
  }).catch(err => {console.log(err)})
})


// DELETE TOPIC

router.post("/topic/:id/delete", (req, res) => {

  Topic.findByIdAndDelete(req.params.id).then(deleted => {res.redirect("/topics")}).catch(err => {console.log(err)})
  
})





module.exports = router;
