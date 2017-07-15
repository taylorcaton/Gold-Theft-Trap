// Initialize Firebase
var config = {
  apiKey: "AIzaSyAS9DHcHwp3ZjxBU_WBtBy04htrMQ3ql64",
  authDomain: "rps-multiplayer-bc9e6.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-bc9e6.firebaseio.com",
  projectId: "rps-multiplayer-bc9e6",
  storageBucket: "",
  messagingSenderId: "1080271619205"
};
firebase.initializeApp(config);

var database = firebase.database();

var playerID;
var gameReady = false;
var user = {};

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  // $("#connectedPlayers").text(snap.numChildren());

  if(snap.numChildren() < 2){
    // Waiting for players to connect
    gameWait();
    playerID = 1;
    // user.uid = 1;
    // user.displayName = "Player 1"
    gameReady = false;

  }else if(snap.numChildren() === 2){
    
    if(playerID !== 1){
      playerID = 2;
      // user.uid = 2;
      // user.displayName = "Player 2"
    }

    gameReady = true;
    gameStart();

  }else{
    // Players are spectating...
      gameFull();
  }

});

function gameWait(){
  $("#gameStatus").html("<p>"+"Waiting for other player " + "<i class='fa fa-spinner fa-pulse fa-1x fa-fw'></i>");
}

function gameStart(){
  $("#gameStatus").html("<p>"+"Lets begin!");
  buildGameArea();
}

function gameFull(){
  $("#gameStatus").html("<p>"+"Sorry, the game is full right now");
}

function buildGameArea(){
  
  if(gameReady){
    //Display control and chat windows
    $(".gameWindow").show();

    buildButtons();
    //initChat();
  }else{
    $(".gameWindow").hide();
  }
  

}

function buildButtons(){
  var newDiv = $("<div>");
  playerID;
  newDiv.append("<button type='button' id='goldButton' data-player='"+playerID+"' class='btn btn-primary btn-block btn-lg gameButton'>GOLD</button>")
  newDiv.append("<button type='button' id='theftButton' data-player='"+playerID+"' class='btn btn-primary btn-block btn-lg gameButton'>THEFT</button>")
  newDiv.append("<button type='button' id='trapButton' data-player='"+playerID+"' class='btn btn-primary btn-block btn-lg gameButton'>TRAP</button>")
  
  $("#controlsWindow").empty();
  $("#controlsWindow").append(newDiv);  
}

$(document).on("click", ".gameButton", function(){

  var playerID = $(this).attr("data-player"); //get the playerID
  var tempPlayerChoice = $(this).attr("id") //get the choice
  tempPlayerChoice = tempPlayerChoice.substring(0, tempPlayerChoice.indexOf("Button"));

  console.log("Player " + playerID + " chooses " + tempPlayerChoice);

})

//Firechat
function initChat(user) {
  // Get a Firebase Database ref
  var chatRef = database.ref("chat");

  // Create a Firechat instance
  var chat = new FirechatUI(chatRef, document.getElementById("firechat-wrapper"));

  // Set the Firechat user
  chat.setUser(user.uid, user.displayName);
  // chat.enterRoom("-Kp2sj1kuUjiQ4BqXazL")
}

function login() {
    // Log the user in via Twitter
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function(error) {
      console.log("Error authenticating user:", error);
    });
  }

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    user.uid = usert.uid;
    initChat(user)
    // ...
  } else {
    // User is signed out.
    // ...
  }
  // ...
});

$(document).on("click","#auth",function(){
  login();
})
