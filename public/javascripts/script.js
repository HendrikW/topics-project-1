

// CLICK HANDLER UPVOTE AND DOWNVOTE
let clickHandler = function(event) {
  var clickedTopic = $(this).attr("data-topic-id");

  axios.post(`/${clickedTopic}/vote/${event.data.action}`).then(() => {
    getAll("highest");
  });
};



// MASSIVE GET ALL FUNCTION

var getAll = function(sorting) {
  axios.get("/user/currentuser").then(user => {
    axios.get(`/gettopics/${sorting}`).then(topics => {
      // EMPTY ALL TOPICS CONTAINER


      $("#alltopics").empty();

      // RENDER INPUT
      for (var i = 0; i < topics.data.length; i++) {
        var input = `
  

      <div id="topicandvote">
      <div id="votes">
      <button class="upvote" data-topic-id="${topics.data[i]._id}">
      <img class="voteicon upgreen" changeupgreen=${
        topics.data[i]._id
      } src="/images/up-chevron-button.png">
      <img class="voteicon uppink" changeuppink=${
        topics.data[i]._id
      } src="/images/up-chevron-button1.png">
      <p class="oneup" search-id="${topics.data[i]._id}">${
          topics.data[i].upvote.length
        }</p></button>
      <button class="downvote" data-topic-id="${topics.data[i]._id}">
      <p class="onedown" search-id="${topics.data[i]._id}">${
          topics.data[i].downvote.length
        }</p>
      <img class="voteicon" changedowngreen=${
        topics.data[i]._id
      } src="/images/chevron-sign-down.png">
      <img class="voteicon uppink" changedownpink=${
        topics.data[i]._id
      } src="/images/chevron-sign-down2.png">
      </button>

      </div>
      <div class="singletopic">
      <div class="headlineanddone">
      <h2>${topics.data[i].title}</h2>
      <div class="icons">
      <div class="delete" delete="${topics.data[i]._id}" style="display:none"><img class="cancelicon" src="images/cancel.png"></div>
      <div class="archiv" style="display:none" archive-please="${topics.data[i]._id}" id="topicdone"><img class="doneicon" src="images/correct-symbol.png"></div>
      </div>

      <div class="confirmdelete" confirmdelete="${topics.data[i]._id}">
      <form action="/topic/${topics.data[i]._id}/delete" method="post">
      <h2>are you sure you want to delete this topic?</h2>
      <div class="deletetopicbuttons"><button class="canceldelete">cancel</button><button type="submit">delete</button></div>
      </form>
      </div>  

      <div class="archivetopic" popup=${topics.data[i]._id}>
      <form class="offres" method="post" action="/archiv/${topics.data[i]._id}">
      <h2>archive this topic</h2>
      <p>would you like to add an official response?</p>
      <textarea name="officialr"></textarea>
      <div class="archivetopicbuttons">
      <button class="cancelOR">cancel</button>
      <button type="submit" class="submitOR" archive-please="${
        topics.data[i]._id
      }">submit</button>
      </div>
      </form>
      </div>

      </div>
      <p class="truncate">${topics.data[i].maintext}</p>
      <p class="timestamp">${moment(topics.data[i].created_at).fromNow()}</p>


      </div>
      `;


        $("#alltopics").append(input);



        // HIGHLIGHT CLICKED TOPICS
        if (topics.data[i].upvote.includes(user.data._id)) {
          $(`[changeupgreen=${topics.data[i]._id}]`).toggle();
          $(`[changeuppink=${topics.data[i]._id}]`).toggle();
        } else if (topics.data[i].downvote.includes(user.data._id)) {
          $(`[changedowngreen=${topics.data[i]._id}]`).toggle();
          $(`[changedownpink=${topics.data[i]._id}]`).toggle();
        }


      }

        // SHOW MORE SHOW LESS
        $(".truncate").each(function() {
          var content = $(this).html();
          if (content.length > 400) {
            var smalltext = content.substr(0, 400);
            var html =
              '<div class="truncate-text" style="display:block">' +
              smalltext +
              " ... " +
              '<a href="" class="moreless more">more</a></div><div class="truncate-text" style="display:none">' +
              content +
              '<a href="" class="moreless less">Less</a></div>';
            $(this).html(html);
          }
        });
  
        $(".moreless").click(function() {
          if ($(this).hasClass("less")) {
            $(this)
              .closest(".truncate-text")
              .prev(".truncate-text")
              .toggle();
            $(this)
              .closest(".truncate-text")
              .toggle();
          } else {
            $(this)
              .closest(".truncate-text")
              .toggle();
            $(this)
              .closest(".truncate-text")
              .next(".truncate-text")
              .toggle();
          }
          return false;
        });


        // ADMIN PART
        if ($(".isAdmin")[0]) {
          $(".archiv").show()
          $(".delete").show()
        
        }

      //DELETE
      $(".delete").on("click", function() {
        $(`[confirmdelete=${$(this).attr("delete")}]`).toggle();
        $(".topicfieldback").toggle();
      });

      $(".canceldelete").on("click", function() {
        event.preventDefault();
        $(".confirmdelete").hide();
        $(".topicfieldback").toggle();
      });

  

 //EMPTY TOPICS PAGE


  if ($("#alltopics").children().length === 0){
    $("#alltopics").append("<div class = notopicsyet>There are no topics yet.<br>Please add your first topic!</div><button class = clickme>add topic</button>")
    $(".addtopicbutton").addClass("toggle")
    $("#sortby").hide();
  } 

  $(".clickme").on("click", function() {
    $(".topicfield").toggle();
    $(".topicfieldback").toggle();
  });

  
      // HIDE PINK BUTTON
      $(".uppink").toggle();
      $(".confirmdelete").toggle();

      // ARCHIVE & OFFICIAL RESPONSE
      $(".archivetopic").hide();

      $(".archiv").on("click", function(event) {
        $(`[popup=${$(this).attr("archive-please")}]`).toggle();
        $(".topicfieldback").toggle();
      });

      $(".cancelOR").on("click", function() {
        event.preventDefault();
        $(".archivetopic").hide();
        $(".topicfieldback").toggle();
      });

      

      // UP/DOWN VOTE
      $(".upvote").on("click", { action: "upvote" }, clickHandler);
      $(".downvote").on("click", { action: "downvote" }, clickHandler);

      $("#sortby").on("change", function() {
        var selectedValue = document.getElementById("sortby").value;

        if (selectedValue === "newest") {
          getAll("newest");
        } else if (selectedValue === "highest") {
          getAll("highest");
        } else if (selectedValue === "lowest") {
          getAll("lowest");
        }
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // ADD TOPIC
  $(".topicfield").hide();
  $(".topicfieldback").hide();
 
 
  // OFFICIAL RESPONSE
  $(".singleor").hide();

  $(".responsebutton").on("click", function(){

  $(`[hide=${$(this).attr("click")}]`).toggle()
  $(`[orId=${$(this).attr("click")}]`).toggle();

  })

  $(".toggle").on("click", function() {
    $(".topicfield").toggle();
    $(".topicfieldback").toggle();
  });

 
  $(".archivetime").each(function(index, element) {
     $(this).html(moment($(this).html()).fromNow())
  
  })

  $(".truncate").each(function() {
    var content = $(this).html();
    if (content.length > 400) {
      var smalltext = content.substr(0, 400);
      var html =
        '<div class="truncate-text" style="display:block">' +
        smalltext +
        " ... " +
        '<a href="" class="moreless more">more</a></div><div class="truncate-text" style="display:none">' +
        content +
        '<a href="" class="moreless less">Less</a></div>';
      $(this).html(html);
    }
  });

  $(".moreless").click(function() {
    if ($(this).hasClass("less")) {
      $(this)
        .closest(".truncate-text")
        .prev(".truncate-text")
        .toggle();
      $(this)
        .closest(".truncate-text")
        .toggle();
    } else {
      $(this)
        .closest(".truncate-text")
        .toggle();
      $(this)
        .closest(".truncate-text")
        .next(".truncate-text")
        .toggle();
    }
    return false;
  });
 

});


    

//Learnings
// dom loaded --> jquery wird ausgeführt
// ajax request.then( bekommt result zurück)
// <img class="voteicon" src="/images/chevron-sign-down.png">


