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
var player_1_choice;
var player_2_choice;
var chat_array = [];
var player1Name;
var player2Name;

function new_round_init(){
    database.ref("round").remove();
}

//Set up the player boxes
$("#name_button").on("click", function () {

    playerName = $("#name_input").val(); //Capture the name
    
    database.ref().once("value", function (snapshot) {
        
        //If user is the first to connect, create a firebase ref for Players
        //Assign an object of 1 the values listed.
        //This user will be player 2
        if (snapshot.child("Players/1").exists() == false) {
            player1 = true; //Player One is connected
            database.ref("Players/1").set({
                Losses: 0, 
                Name: playerName, 
                Wins: 0
            });
            $("#player1NameBox").html(playerName); //Place name in panel heading

        //If there is already a user connected, create a firebase ref for Player 2
        //This user will be player 2
        } else if (snapshot.child("Players/1").exists()) {
            player2 = true; //Player Two is connected
            database.ref('Players/2').set({
                Losses: 0, 
                Name: playerName, 
                Wins: 0
            });
            $("#player2NameBox").html(playerName); //Place name in panel heading
        }
    });
});

database.ref().on("value", function (snapshot) { //Anytime a value changes in firebase

    //Update Player 1's details
    if (snapshot.child("Players/1").exists()) {
        $("#player1NameBox").html(snapshot.child("Players/1/Name").val());
        $("#player1Stats").html("Wins: " + snapshot.child("Players/1/Wins").val() + " Losses: " + snapshot.child("Players/1/Losses").val());
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
        $("#player2Stats").html("Wins: " + snapshot.child("Players/2/Wins").val() + " Losses: " + snapshot.child("Players/2/Losses").val());
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
        $(".left_box").removeClass("highLighter");
        $(".right_box").removeClass("highLighter");
        $(".center_box").removeClass("highLighter").empty();
        $("#player1RPS").empty();
        $("#player2RPS").empty();
    }

    //Begin game if Player 1 and 2 are present and round 1 hasn't started yet
    if (snapshot.child("Players/1").exists() && snapshot.child("Players/2").exists()) {
        if(snapshot.child("round").exists() == false){
            database.ref("round").set(1);
        }
    }

    if (snapshot.child('round').exists() && snapshot.val().round == 1) {
        $(".left_box").addClass("highLighter");
        $(".lower_message").empty().text("Waiting For Player 1 To Decide");
        if (player1) {
            $(".lower_message").empty().text("It's Your Turn!");
            $("#player1RPS").empty()
                .append($("<div>")
                    .addClass("choice_sub_box_1")
                    .text("Rock")
                    .on("click", function () {
                        database.ref('Players/1/Choice').set("Rock");
                        $("#player1RPS").empty().text("Rock");
                        database.ref().update({round: 2})
                    }))
                .append($("<div>")
                    .addClass("choice_sub_box_2")
                    .text("Paper")
                    .on("click", function () {
                        database.ref('Players/1/Choice').set("Paper");
                        $("#player1RPS").empty().text("Paper");
                        database.ref().update({round: 2})
                    }))
                .append($("<div>")
                    .addClass("choice_sub_box_3")
                    .text("Scissors")
                    .on("click", function () {
                        database.ref('Players/1/Choice').set("Scissors");
                        $("#player1RPS").empty().text("Scissors");
                        database.ref().update({round: 2})
                    }))
        }
    } else if (snapshot.child('round').exists() && snapshot.val().round == 2) {
        $(".left_box").removeClass("highLighter");
        $(".right_box").addClass("highLighter");
        $(".lower_message").empty().text("Waiting For Player 2 To Decide");
        if (player2) {
            $(".lower_message").empty().text("It's Your Turn!");
            $("#player2RPS")
                .append($("<div>")
                    .addClass("choice_sub_box_1")
                    .text("Rock")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Rock");
                        $("#player2RPS").empty().text("Rock");
                        database.ref().update({round: 3})
                    }))
                .append($("<div>")
                    .addClass("choice_sub_box_2")
                    .text("Paper")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Paper");
                        $("#player2RPS").empty().text("Paper");
                        database.ref().update({round: 3})
                    }))
                .append($("<div>")
                    .addClass("choice_sub_box_3")
                    .text("Scissors")
                    .on("click", function () {
                        database.ref('Players/2/Choice').set("Scissors");
                        $("#player2RPS").empty().text("Scissors");
                        database.ref().update({round: 3});

                    }));

        }
    }else if ((snapshot.child('Players/1/Choice').val() && snapshot.child('Players/2/Choice').val() != null) && snapshot.val().round == 3) {
        $(".right_box").removeClass("highLighter");

            player_1_choice = snapshot.child("Players/1/Choice").val();
            player_2_choice = snapshot.child("Players/2/Choice").val();

        $("#player1RPS").text(player_1_choice);
        $("#player2RPS").text(player_2_choice);

        if (player_1_choice == player_2_choice) {
            $(".center_box").addClass("highLighter").text("You've Tied!");
            setTimeout(new_round_init, 5000)
        } else if ((player_1_choice == "Rock" && player_2_choice == "Scissors") ||
            (player_1_choice == "Paper" && player_2_choice == "Rock") ||
            (player_1_choice == "Scissors" && player_2_choice == "Paper")) {
            $(".left_box").addClass("highLighter");
            $(".center_box").html(snapshot.child("Players/1/Name").val() + " Wins!");
            var w = snapshot.child("Players/1/Wins").val();
            var l = snapshot.child("Players/2/Losses").val();
            w++;
            l++;
            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/1/Wins").set(w);
            database.ref("Players/2/Losses").set(l);
            setTimeout(new_round_init, 5000)
        } else if ((player_2_choice == "Rock" && player_1_choice == "Scissors") ||
            (player_2_choice == "Paper" && player_1_choice == "Rock") ||
            (player_2_choice == "Scissors" && player_1_choice == "Paper")) {
            $(".right_box").addClass("highLighter");

                $(".center_box").html(snapshot.child("Players/2/Name").val() + " Wins!");
                var w = snapshot.child("Players/2/Wins").val();
                var l = snapshot.child("Players/1/Losses").val();
                w++;
                l++;
            database.ref("Players/1/Choice").remove();
            database.ref("Players/2/Choice").remove();

            database.ref("Players/2/Wins").set(w);
                database.ref("Players/1/Losses").set(l);
            setTimeout(new_round_init, 5000)
        }
    }
});

$("#chat_button").on("click", function () {
    if (playerName != undefined) {
        chatMessage = playerName + ": " + $(".chat_text").val();
        database.ref("Chat").push(chatMessage);
    }
});

database.ref("Chat").on("value",function (snapshot) {
    $(".text_box").empty();
    for (var i in snapshot.val()){
        $(".text_box").append($("<div>").html(snapshot.val()[i]));
    }

});