$(function(){
// Disable buttons and form sections
$("#classDesc").attr("disabled","disabled");
$("#classCateg").attr("disabled","disabled");
$("#classTime").attr("disabled","disabled");
$("#class-submit").hide();
$(".submit-link").hide();
$("#class-create-link").hide();
$(".create-link").hide();

var submitBtn = $("#class-submit");
var signInBtn = $("#class-signIn");
var createLinkBtn = $("#class-create-link");
var title = $("#classTitle").val();
var date = $("#date").val();

signInBtn.on("click", function(event) {
  event.preventDefault();
  authenticate().then(loadClient);
  if($("#classTitle").val() === ""){
    alert("You have not filled out the Class title");
  }
  else{
  signInBtn.hide();
  $(".signin-link").hide();
  createLinkBtn.show(); 
  $(".create-link").show();
  $("#classTitle").attr("disabled","disabled");
  $("#classDesc").removeAttr("disabled","disabled");
  $("#classCateg").removeAttr("disabled","disabled");
  $("#classTime").removeAttr("disabled","disabled");
  }
});


createLinkBtn.on("click", function(event) {
  event.preventDefault();
  if($("#classDesc").val() === "" || $("#classCateg").val() === "" || $("#classTime").val() === ""){
    alert("You have not filled out all fields");
  }
  else {
  createLinkBtn.hide(); 
  $(".create-link").hide();
  submitBtn.show(); 
  $(".submit-link").show();
  $("#classDesc").attr("disabled","disabled");
  $("#classCateg").attr("disabled","disabled");
  $("#classTime").attr("disabled","disabled");
  date = $("#classTime").val();
  title = $("#classTitle").val();
  console.log("date",moment(date,"YYYY-MM-DD HH:mm:ss"));
  execute();
  }
});


gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: "602269593939-5eqq385l144j8mu68idmeq0m7kr50kqc.apps.googleusercontent.com"});
  });
  function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube"})
        .then(function() { console.log("Sign-in successful"); },
              function(err) { console.error("Error signing in", err); });
  }
  function loadClient() {
    gapi.client.setApiKey(yapikey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err); });
  }
  function execute() {
    console.log("title",title);
    return gapi.client.youtube.liveBroadcasts.insert({
      "part": "snippet,contentDetails,status",
      "resource": {
        "snippet": {
          "title": title,
          "scheduledStartTime": new Date(moment(date,"MM-DD-YYYY HH:mm a"))
        },
        "contentDetails": {
          "enableClosedCaptions": true,
          "enableContentEncryption": true,
          "enableDvr": true,
          "enableEmbed": true,
          "recordFromStart": true,
          "startWithSlate": true
        },
        "status": {
          "privacyStatus": "public"
        }
      }
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
                console.log("Embed Iframe", response.result.contentDetails.monitorStream.embedHtml);
                console.log("Video ID", response.result.id);
                var id = response.result.contentDetails.id;
                //This is the url to attach video id to in order to redirct to youtube: https://www.youtube.com/watch?v= + id
                console.log("End time",response.result.snippet.scheduledEndTime);
                console.log("start Time", response.result.snippet.scheduledStartTime);
                console.log("Title", response.result.snippet.title);
                console.log("Channel ID", response.result.snippet.channelId);
              var embed = response.result.contentDetails.monitorStream.embedHtml;
              $("#embed-link").attr("placeholder", embed);
      
              $("#embed-link").val(embed);
              console.log("form embed value",$("#embed-link").val());
              console.log("form embed text val",$("#embed-link").text());
              },
              function(err) { console.error("Execute error", err); });
  }


})
  
