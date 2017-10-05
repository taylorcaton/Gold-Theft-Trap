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
var chatMessage;
var playerName;
var player1 = false;
var player2 = false;
var choice1;
var choice2;
var chat_array = [];
var player1Name;
var player2Name;
var g1;
var g2;

function new_round_init(){
    database.ref("round").remove();

    if(g1===5 && g2 === 5){
        console.log("It's a tie");
        swal("It's a tie", "Gold will reset")
        resetGold();
        
    }else if(g1 >= 5){
        console.log("Player 1 WINS!");
        swal(player1Name + 'WINS!')
        resetGold();
        
    }else if(g2 >= 5){
        console.log("Player 2 WINS!");
        swal(player2Name + 'WINS!')
        resetGold();
        
    }
}

function resetGold(){
    database.ref("Players/1/Gold").set(0);
    database.ref("Players/2/Gold").set(0);
}

//Set up the player boxes
$("#name_button").on("click", function () {

    playerName = $("#name_input").val(); //Capture the name
    
    database.ref().once("value", function (snapshot) {
        
        //If user is the first to connect, create a firebase ref for Players
        //Assign an object of 1 the values listed.
        //This user will be player 2
        if (snapshot.child("Players/1").exists() == false) {
            player1 = true; //Only true for player 1's screen
            database.ref("Players/1").set({
                Losses: 0, 
                Name: playerName, 
                Wins: 0,
                Gold: 0
            });
            $("#player1NameBox").html(playerName); //Place name in panel heading
            $(".message").remove();

        //If there is already a user connected, create a firebase ref for Player 2
        //This user will be player 2
        } else if (snapshot.child("Players/1").exists()) {
            player2 = true; //Only true for player 2's screen
            database.ref('Players/2').set({
                Losses: 0, 
                Name: playerName, 
                Wins: 0,
                Gold: 0
            });
            $("#player2NameBox").html(playerName); //Place name in panel heading
            $(".message").remove();
        }
    });
});

database.ref().on("value", function (snapshot) { //Anytime a value changes in firebase

    //Update Player 1's details
    if (snapshot.child("Players/1").exists()) {
        $("#player1NameBox").html(snapshot.child("Players/1/Name").val());
        $("#player1Stats").html("Gold: " + snapshot.child("Players/1/Gold").val());
        player1Name = snapshot.child("Players/1/Name").val();
    }
    else {
        if (($("#player1NameBox").text().trim() != "Waiting for Player 1")&&(player2)){
            $("#player1NameBox").html("Waiting for Player 1");
            $("#player1Stats").empty()
            chatMessage = player1Name + " Has Disconnected";
            database.ref("Chat").push(chatMessage);
        }
    }

    //Update Player 2's details
    if (snapshot.child("Players/2").exists()) {
        $("#player2NameBox").html(snapshot.child("Players/2/Name").val());
        $("#player2Stats").html("Gold: " + snapshot.child("Players/2/Gold").val());
        player2Name = snapshot.child("Players/2/Name").val();
    }
    else {
        if (($("#player2NameBox").text().trim() != "Waiting for Player 2")&&(player1)){
            $("#player2NameBox").html("Waiting for Player 2");
            $("#player2Stats").empty();
            chatMessage = player2Name + " Has Disconnected";
            database.ref("Chat").push(chatMessage);
        }
    }


    //If Either Player Disconnects remove them from the firebase ref
    if (player1) {

        database.ref("Players/1").onDisconnect().remove();
        database.ref("round").onDisconnect().remove();


    } else if (player2) {

        database.ref("Players/2").onDisconnect().remove();
        database.ref("round").onDisconnect().remove();

    }

    //Remove the highlighter effect and button controls AFTER the end of a round
    if (snapshot.child("round").exists() == false) {
        $("#player1Box").removeClass("highLighter");
        $("#player2Box").removeClass("highLighter");
        $("#centerDisplay").removeClass("highLighter").empty();
        $("#player1RPS").empty();
        $("#player2RPS").empty();
    }

    //Begin game if Player 1 and 2 are present and round 1 hasn't started yet
    if (snapshot.child("Players/1").exists() && snapshot.child("Players/2").exists()) {
        if(snapshot.child("round").exists() == false){
            database.ref("round").set(1);
        }
    }

    //ROUND 1
    //Player 1's Turn
    if (snapshot.child('round').exists() && snapshot.val().round == 1) {

        //Highlight the player box
        $("#player1Box").addClass("highLighter");

        //Change Status area to display who's turn it is
        $("#status").empty().text(player1Name + "'s turn...");

        if (player1) {
            //Displayed only on player 1's screen
            $("#status").empty().text("Make a choice");


            $("#player1RPS").empty() //Display Button Choioces
                .append($("<div class='rockButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>GOLD</button>")
                    .on("click", function () { //Add Event Listener to Button
                        database.ref('Players/1/Choice').set("Gold"); //Set player choice to firebase
                        var img = $("<img>") 
                        img.attr({src:'assets/images/gold.png', class:'gameSprite'});
                        $("#player1RPS").empty().append(img); //display Gold
                        database.ref().update({round: 2}) //Update firebase to 2nd round (player 2's turn)
                    }))
                .append($("<div class='paperButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>THEFT</button>")
                    .on("click", function () {
                        database.ref('Players/1/Choice').set("Theft");
                        var img = $("<img>") 
                        img.attr({src:'assets/images/ThiefL.png', class:'gameSprite'});
                        $("#player1RPS").empty().append(img); //display Theft
                        database.ref().update({round: 2})
                    }))
                .append($("<div class='scissorsButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>TRAP</button>")
                    .on("click", function () {
                        database.ref('Players/1/Choice').set("Trap");
                        var img = $("<img>") 
                        img.attr({src:'assets/images/trap.png', class:'gameSprite'});
                        $("#player1RPS").empty().append(img);
                        database.ref().update({round: 2})
                    }))
        }
    //ROUND 2
    //PLAYER 2's Turn    
    } else if (snapshot.child('round').exists() && snapshot.val().round == 2) {
        
        //Remove Highlight from Player 1
        $("#player1Box").removeClass("highLighter");

        //Highlight Player 2's Box
        $("#player2Box").addClass("highLighter");

        //Change Status area to display who's turn it is
        $("#status").empty().text(player2Name + "'s turn...");


        if (player2) {
            //Displayed only on player 2's screen
            $("#status").empty().text("Make a choice");


            $("#player2RPS").empty()
                .append($("<div class='rockButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>GOLD</button>")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Gold");
                        var img = $("<img>") 
                        img.attr({src:'assets/images/gold.png', class:'gameSprite'});
                        $("#player2RPS").empty().append(img);
                        database.ref().update({round: 3})
                    }))
                .append($("<div class='paperButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>THEFT</button>")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Theft");
                        var img = $("<img>") 
                        img.attr({src:'assets/images/ThiefR.png', class:'gameSprite'});
                        $("#player2RPS").empty().append(img);
                        database.ref().update({round: 3})
                    }))
                .append($("<div class='scissorsButton'>")
                    .append("<button type='button' class='btn btn-lg btn-block btn-primary gameButton'>TRAP</button>")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Trap");
                        var img = $("<img>") 
                        img.attr({src:'assets/images/trap.png', class:'gameSprite'});
                        $("#player2RPS").empty().append(img);
                        database.ref().update({round: 3});

                    }));

        }
    }else if ((snapshot.child('Players/1/Choice').val() && snapshot.child('Players/2/Choice').val() != null) && snapshot.val().round == 3) {
        $("#player2Box").removeClass("highLighter");

        choice1 = snapshot.child("Players/1/Choice").val(); //fetch player 1's choice
        choice2 = snapshot.child("Players/2/Choice").val(); //fetch player 2's choice
        
        //SHOW CHOICES TO BOTH PLAYERS
        var img1 = $("<img>")
        var img2 = $("<img>")

        switch (choice1) {
            case "Rock":
                img1.attr({src:'assets/images/gold.png', class:'gameSprite'});
                break;
            case "Paper":
                img1.attr({src:'assets/images/ThiefL.png', class:'gameSprite'});
                break;
            case "Scissors":
                img1.attr({src:'assets/images/trap.png', class:'gameSprite'});
                break;
        }

        switch (choice2) {
            case "Rock":
                img2.attr({src:'assets/images/gold.png', class:'gameSprite'});
                break;
            case "Paper":
                img2.attr({src:'assets/images/ThiefR.png', class:'gameSprite'});
                break;
            case "Scissors":
                img2.attr({src:'assets/images/trap.png', class:'gameSprite'});
                break;
        }

        //Show both players their opponents choice!
        $("#player1RPS").empty().append(img1);
        $("#player2RPS").empty().append(img2); 


        //GOLD - THEFT - TRAP LOGIC
        if (choice1 == "Gold" && choice2 == "Gold")  { //BOTH GOLD

            $("#player1Box").addClass("highLighter"); //Highlight both players
            $("#player2Box").addClass("highLighter");

            $("#centerDisplay").html("<h2>You each get 1 Gold</h2>"); //Update the center box

            g1 = snapshot.child("Players/1/Gold").val();
            g2 = snapshot.child("Players/2/Gold").val();
            g1++;
            g2++;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Gold").set(g1);
            database.ref("Players/2/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Gold" && choice2 == "Theft")  { //P1 GOLD & P2 THEFT

            $("#player2Box").addClass("highLighter"); //Highlight P2

            $("#centerDisplay").html("<h2>" + player2Name + " steals ALL the gold!</h2>"); //Update the center box

            g1 = snapshot.child("Players/1/Gold").val();
            g2 = snapshot.child("Players/2/Gold").val();
            g2+=g1+1;
            g1=0;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Gold").set(g1);
            database.ref("Players/2/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Theft" && choice2 == "Gold")  { //P1 THEFT & P2 GOLD

            $("#player1Box").addClass("highLighter"); //Highlight P1

            $("#centerDisplay").html("<h2>" + player1Name + " steals ALL the gold!</h2>"); //Update the center box

            g1 = snapshot.child("Players/1/Gold").val();
            g2 = snapshot.child("Players/2/Gold").val();
            g1+=g2+1;
            g2=0;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Gold").set(g1);
            database.ref("Players/2/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Gold" && choice2 == "Trap")  { //P1 GOLD & P2 TRAP

            $("#player1Box").addClass("highLighter"); //Highlight P1

            $("#centerDisplay").html("<h2>" + player1Name + " gets one gold!</h2>"); //Update the center box

            g1 = snapshot.child("Players/1/Gold").val();
            
            g1++;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Gold").set(g1);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Trap" && choice2 == "Gold")  { //P1 Trap & P2 Gold

            $("#player2Box").addClass("highLighter"); //Highlight P2

            $("#centerDisplay").html("<h2>" + player2Name + " gets one gold!</h2>"); //Update the center box

            g2 = snapshot.child("Players/2/Gold").val();
            
            g2++;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/2/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Theft" && choice2 == "Trap")  { //P1 Theft & P2 Trap

            $("#player2Box").addClass("highLighter"); //Highlight P2

            $("#centerDisplay").html("<h2>" + player2Name + " 's Trap Works!</h2>"); //Update the center box

            g2 = snapshot.child("Players/2/Gold").val();
            
            g2=5;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/2/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == "Trap" && choice2 == "Theft")  { //P1 Trap & P2 Theft

            $("#player1Box").addClass("highLighter"); //Highlight P1

            $("#centerDisplay").html("<h2>" + player1Name + " 's Trap Works!</h2>"); //Update the center box

            g1 = snapshot.child("Players/1/Gold").val();
            
            g1=5;

            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Gold").set(g2);
            setTimeout(new_round_init, 5000)

        }else if (choice1 == choice2) { //TIE CASE

            $("#centerDisplay").addClass("highLighter").html("<h2>You Both Chose"+choice1+", Nothing Happens</h2>");
            setTimeout(new_round_init, 5000) //WAIT 5 SECONDS TO START A NEW ROUND

        } 

    }
});

$("#chatSubmit").on("click", function () {

    if (playerName != undefined) { //if playerName has a value

        $(".chatTextBox").val("");
        chatMessage = "(" + moment().format("hh:mm:ss a") + ") ";
        chatMessage += playerName + ": " + $(".chatTextBox").val();
        console.log('new msg being sent to firebase: ' + chatMessage);
        database.ref("Chat").push(chatMessage);
    }

});

//Place each chat message on it's own line
database.ref("Chat").on("value",function (snapshot) {
    $(".chatWindow").empty();
    $(".chatWindow").append("<table id='chatTable'>")
    for (var i in snapshot.val()){ //enhanced for loop over the object!

        var tr = $("<tr>");
        tr.append(snapshot.val()[i]); //Uses the key name to fetch the data.

        $("#chatTable").append(tr);
    }

    //Scroll to last chat message
    $(".chatWindow").scrollTop( $(".chatWindow").get(0).scrollHeight )

});

//Instructions Sweet Alert
$(document).on("click", "#instructions", function(){
    
    var div = $("<div>");
    div.append("<p><strong>Gold:</strong> Immediately gain 1 Gold.</p>");
    div.append("<p><strong>Theft:</strong> Gain all the gold the opposing player has. Also, if they chose the Gold this round you get the Gold they would have gained from that too.<p>")
    div.append("<p><strong>Trap:</strong> Does nothing unless the opposing player played Theft. If they did, your trap kills them in the act of thieving and you instantly win the game.</p>")  

    swal({
        title: 'How to Play',
        html: $("<div>").html(div),
    });

});