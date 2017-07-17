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
var chatActive = false;
var once = true;
var user = {};
var chat = {};
var userKey;
var userKeys;
var userList;

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
    user.uid = 1;
    user.displayName = "Player 1"
    gameReady = false;
    database.ref("user").remove(); //INIT REMOVE USERS

  }else if(snap.numChildren() === 2){
    
    if(playerID !== 1){
      playerID = 2;
      user.uid = 2;
      user.displayName = "Player 2"
    }

    gameReady = true;
    updateScores();
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
    initChat();
    setupUserRef();

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

//Button Actions
$(document).on("click", ".gameButton", function(){

  var playerID = $(this).attr("data-player"); //get the playerID
  var tempPlayerChoice = $(this).attr("id") //get the choice
  tempPlayerChoice = tempPlayerChoice.substring(0, tempPlayerChoice.indexOf("Button"));

  console.log("Player " + playerID + " chooses " + tempPlayerChoice);
  user.choice = tempPlayerChoice;

  pushToChat({
    user: "Game Master",
    timeStamp: moment().format("h:mm:ss a"),
    message: user.displayName + " has locked in a choice!"
  })

  updateUser();

})

//Chat Window Framework
function initChat(){

  // deleteOldChat(); //DELTES OLD CHAT

  //CREATES A CHAT REF
  var rootRef = database.ref()
  var storesRef = rootRef.child('chat')
  var newStoreRef = storesRef.push()
  // newStoreRef.set({
  //   user: "Game Master",
  //   timeStamp: moment().format("h:mm:ss a"),
  //   message: ""
  // })

  $("#firebaseChat").empty //BUILD THE CHAT WINDOW
  if(once){
    var newDiv = $("<form><div class='form-group'>")
    
    newDiv.append("<label for='displayName'>Enter Your Name</label>");
    newDiv.append("<input class='form-control' id='displayName' type='text'>");
    newDiv.append("<button class='btn btn-primary' id='submitDisplayName' type='submit'>Enter Chat</button>")

    $("#firebaseChat").append(newDiv)
    once = false;
  }

}

//Captures the display name
$(document).on("click", "#submitDisplayName", function(){
  event.preventDefault();
  user.displayName = $("#displayName").val().trim();
  if(user.displayName === ""){
    user.displayName = "Player " + playerID;
  }
  $("#firebaseChat").empty()
  chatInterface()
  chatActive = true;
  updateUser();
})

//build a chat window
function chatInterface(){
  if(!once){

    $("#firebaseChat").empty();
    var chatDiv = $("<div id='chatDiv'>");
    var submitDiv = $("<form><div class='form-group' id='submitDiv'>");

    $("#firebaseChat").append(chatDiv);
    

    submitDiv.append("<input class='form-control' id='chatMessage' type='text'>")
    submitDiv.append("<button type='button' id='submitMessage' class='btn btn-primary'>Submit</button>")
    $("#firebaseChat").append(submitDiv);

  }

}

//Captures the chat message, user, and time
$(document).on("click", "#submitMessage", function(){
  event.preventDefault();
  
  var chatObj = {
    user: user.displayName,
    timeStamp: moment().format("h:mm:ss a"),
    message: $("#chatMessage").val().trim()
  }

  $("#chatMessage").val("");
  pushToChat(chatObj);

});

//What the enter key does
$(document).keypress(function(event){

    if (event.keyCode === 10 || event.keyCode === 13){ 
        event.preventDefault();
        if(chatActive){
          pushToChat();
        }
    }

  });

//Pushes the chatObj to Firebase
function pushToChat(chatObj){

  database.ref("chat").push(chatObj)
}

//Places all the messages (from Firebase) on the chat window
function buildChatTable(){

  $("#chatDiv").empty();
  newTable = $("<table><tbody>")

  var chatKeys = Object.keys(chat);

  for (var i = 0; i < chatKeys.length; i++) {
    var tr = $("<tr>");
    tr.append("<td>"  + "("+chat[chatKeys[i]].timeStamp+")"  
                      + " " + chat[chatKeys[i]].user + ": " + chat[chatKeys[i]].message);
    newTable.append(tr);
    
  }

  $("#chatDiv").append(newTable);

}

//Refesh the chat window everytime someone pushes a message
database.ref("chat").on("value", function(snapshot) {
  chat = snapshot.val();
  buildChatTable();
})


//Deletes the old chat before the start of a new game
function deleteOldChat(){

  database.ref("chat").remove();
  
}

//Setup User Ref
function setupUserRef(){

  var rootRef = database.ref()
  var storesRef = rootRef.child('user')
  var newStoreRef = storesRef.push()
  userKey = newStoreRef.push().key
  user = {
    displayName: user.displayName,
    uid: user.uid,
    choice: "",
    gold: 0,
    score: 0,
    userKey: userKey
  }
  updateUser();
}

//Update user data to firebase
function updateUser(){
  console.log("Updating object: " + userKey);

  var updates = {}
  updates["/user/"+userKey] = user;
  database.ref().update(updates)

}

function checkScore(){

  userKeys = Object.keys(userList);
  var players = [];

  for (var i = 0; i < userKeys.length; i++) {
    if(userList[userKeys[i]].choice === ""){
        console.log("Wating on other player to make a choice");
        $("#gameStatus").html("<p>"+"Wating on other player to make a choice...");
        return;
    }else{
      players.push(userList[userKeys[i]]);
    }

  }

  if(players[0].choice === "gold" && players[1].choice === "gold"){
    
    players[0].gold++;
    players[1].gold++;
    console.log("Both Players picked GOLD, you each get a point");
    $("#gameStatus").html("<p>"+"Both Players picked GOLD, you each get a point");
  
  }else if(players[0].choice === "gold" && players[1].choice === "theft"){
    
    players[1].gold = players[0].gold + players[1].gold;
    players[0].gold = 0;
    console.log(players[1].displayName + " stole all the gold from " + players[0].displayName + "!");
    $("#gameStatus").html("<p>"+players[1].displayName + " stole all the gold from " + players[0].displayName + "!");
  
  }else if(players[1].choice === "gold" && players[0].choice === "theft"){
    
    players[0].gold = players[1].gold + players[0].gold;
    players[1].gold = 0;
    console.log(players[0].displayName + " stole all the gold from " + players[1].displayName + "!");
    $("#gameStatus").html("<p>"+players[0].displayName + " stole all the gold from " + players[1].displayName + "!");
  
  }else if(players[1].choice === "gold" && players[0].choice === "trap"){
    
    players[1].gold++;
    console.log(players[1].displayName + " gets one gold, " + players[0].displayName + "'s trap failed");
    $("#gameStatus").html("<p>"+players[1].displayName + " gets one gold, " + players[0].displayName + "'s trap failed");
  
  }else if(players[0].choice === "gold" && players[1].choice === "trap"){
    
    players[1].gold++;
    console.log(players[0].displayName + " gets one gold, " + players[1].displayName + "'s trap failed");
    $("#gameStatus").html("<p>"+players[0].displayName + " gets one gold, " + players[1].displayName + "'s trap failed");
  
  }else if(players[0].choice === "theft" && players[1].choice === "trap"){
    
    players[1].gold = 0;
    players[0].gold = 0;
    players[1].score++;
    console.log(players[1].displayName + "'s trap killed " + players[0].displayName + "! " + players[1].displayName + " wins!");
    $("#gameStatus").html("<p>"+players[1].displayName + "'s trap killed " + players[0].displayName + "! " + players[1].displayName + " wins!");
  
  }else if(players[1].choice === "theft" && players[0].choice === "trap"){
    
    players[1].gold = 0;
    players[0].gold = 0;
    players[0].score++;
    console.log(players[0].displayName + "'s trap killed " + players[1].displayName + "! " + players[0].displayName + " wins!");
    $("#gameStatus").html("<p>"+players[0].displayName + "'s trap killed " + players[1].displayName + "! " + players[0].displayName + " wins!");
  
  }else if(players[1].choice === "theft" && players[0].choice === "theft"){
    
    console.log("Both players try to steal, and both FAIL");
    $("#gameStatus").html("<p>"+"Both players try to steal, and both FAIL");
  
  }else if(players[1].choice === "trap" && players[0].choice === "trap"){
    
    console.log("Both traps FAIL");
    $("#gameStatus").html("<p>"+"Both traps FAIL");
  
  }


  players[0].choice = "";
  players[1].choice = "";

  var updates = {}
  updates["/user/"+players[0].userKey] = players[0];
  updates["/user/"+players[1].userKey] = players[1];
  database.ref().update(updates)

  updateScores();

}

database.ref("user").on("value", function(snapshot) {
  
  console.log("Users updated")

  userList = snapshot.val();
  userKeys = Object.keys(userList);
  user = userList[userKeys[user.uid-1]];
  checkScore();
  
})

function updateScores(){
  $("#gold").html( "GOLD:  " + user.gold);
  $("#score").html("SCORE: "+ user.score);
}