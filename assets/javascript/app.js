// Init var
let statusA = 0;
let statusB = 0;
let selectionA = "";
let selectionB = "";
let winA = 0;
let winB = 0;
let lossA = 0;
let lossB = 0;
let chatBox = [];
let statusChecked = false;
let inputChecked = false;
let currentPlayerName = "";

let emptyGame = {
    playerA: { 
        status: 0,
        name: "Waiting for player",
        currentSelection: "",
        wins: 0,
        losses: 0,
    },
    playerB: { 
        status: 0,
        name: "Waiting for player",
        currentSelection: "",
        wins: 0,
        losses: 0,
    },
    gamePrompt: "Waiting for players to join",
    chatBox: []
};

//Connect to Firebase
// Your web app's Firebase configuration
var config = {
    apiKey: "AIzaSyBfGy7mgz8Mm8TtBGB9_Seg2Zet_bI4cDM",
    authDomain: "my-bootcamp-project-a1f8f.firebaseapp.com",
    databaseURL: "https://my-bootcamp-project-a1f8f.firebaseio.com",
    projectId: "my-bootcamp-project-a1f8f",
    storageBucket: "my-bootcamp-project-a1f8f.appspot.com",
    messagingSenderId: "775630397577",
    appId: "1:775630397577:web:0711d0063acc3ed5"
};

// Initialize Firebase
firebase.initializeApp(config);

// Create a variable to reference the database.
var db = firebase.database();

//Chatbox call-back
db.ref("/game/chatBox").on("value", function(snap) {
    chatBox = [];
    snap.forEach(function(snap1) {
        // debugger;
        var chatMsg = snap1.val();
        // debugger;
        chatBox.push(chatMsg);
        console.log(snap1.val());
    });
    $("#chatBox").text("")
    for (var i = 0; i < chatBox.length; i++) {
        //Update DOM
        $("#chatBox").append(`${chatBox[i]}<br>`);
    }
    //Initialize jQuery
    $(document).ready(function() {
        // chatListener();

        // function chatListener() {
            $("#chatSend").on("click", function() {
                if ($("#chatInput").val() == "") {
                    alert("Please insert chat message!");
                } else {
                //set delay on click listener - 500ms
                var chatKey = db.ref("/game/chatBox/").push(`${currentPlayerName} wrote: ${$("#chatInput").val()}`);
                console.log(chatKey);
                // debugger;
                $("#chatInput").val("");
                }
            });
        // };//end chatListener()    
    });//end jQuery
});//end Chatbox call-back

//Call-back that runs to update in parallel with values in Firebase game-node
db.ref("/game").on("value", function(snap) {
    console.log(snap.val());

    //Keep variables updated to Firebase
    statusA = snap.val().playerA.status;
    statusB = snap.val().playerB.status;
    selectionA = snap.val().playerA.currentSelection;
    selectionB = snap.val().playerB.currentSelection;
    playerAname = snap.val().playerA.name;
    playerBname = snap.val().playerB.name;
    winA = snap.val().playerA.wins;
    winB = snap.val().playerB.wins;
    lossA = snap.val().playerA.losses;
    lossB = snap.val().playerB.losses;
    gamePrompt = snap.val().gamePrompt;

    //Keep DOM updated with Firebase
    $("#playerA-name").text(playerAname);
    $("#playerB-name").text(playerBname);
    $("#aWinCount").text(winA);
    $("#bWinCount").text(winB);
    $("#aLossCount").text(lossA);
    $("#bLossCount").text(lossB);
    $("#gamePrompt").text(gamePrompt);
    

    //Initialize jQuery
    $(document).ready(function() {

        if (!statusChecked) {
            availabilityLogic();
        };
        if (!inputChecked) {
            inputListener();
        };

        evaluateGame();

        function availabilityLogic() {
            if (statusA !== 0 && statusB !== 0) {
                setFirebase('gamePrompt/', `Game is currently full`);
                $("#playerContainer").hide();
            }
            else if (statusA == 0) {
                //playerA is available - set up new player here
                //Set status to 1 (in use)
                $("#playerContainer").show();
                $("#bSelections").hide();
                setFirebase('playerA/status',1);
                //Prompt for username and set to firebase - update on DOM
                setFirebase('playerA/name',prompt("Enter your name:"));
                $("#playerA-name").text(playerAname);
                $("#stats-playerA-name").text(playerAname);
                currentPlayerName = playerAname;
            }
            else if (statusB == 0) {
                //playerB is available - set up new player here
                //Set status to 1 (in use)
                $("#playerContainer").show();
                $("#aSelections").hide();
                setFirebase('playerB/status',1);
                //Prompt for username and set to firebase - update on DOM
                setFirebase('playerB/name',prompt("Enter your name:"));
                $("#playerB-name").text(playerBname);
                $("#stats-playerB-name").text(playerBname);
                currentPlayerName = playerBname;
            };
            statusChecked = true;
        }//end availabilityLogic()
        
        function inputListener() {
            $(".selectionBtn").on("click", function(){
            //If player A is making selection
            if ($(this).attr("player") === "A") {
                //Update firebase with selection
                setFirebase('playerA/currentSelection', $(this).attr("data"));
                setFirebase('gamePrompt/', `${playerAname} has made a selection`)
                console.log(selectionA);
            }
            //If player B is making selection
            else {
                //Save player's selection and set to firebase
                //Update firebase with selection
                setFirebase('playerB/currentSelection', $(this).attr("data"));
                setFirebase('gamePrompt/', `${playerBname} has made a selection`)
                console.log(selectionB);
            };
            setTimeout(evaluatePicks, 100);
            });
            inputChecked = true;
        }//end inputListener()

        function evaluatePicks() {
            // If that initiates when both players have made a selection
            if (selectionA !== "" && selectionB !== "") {
                // Evaluate selections
                if (selectionA === selectionB) {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    setFirebase('gamePrompt/', `It's a tie! Make another move.`)
                }
                else if (selectionA === "R" && selectionB === "P") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    lossA++;
                    setFirebase('playerA/losses', lossA);
                    winB++;
                    setFirebase('playerB/wins', winB);
                    setFirebase('gamePrompt/', `${playerBname} wins this round!`)
                }        
                else if (selectionA === "R" && selectionB === "S") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    winA++;
                    setFirebase('playerA/wins', winA);
                    lossB++;
                    setFirebase('playerB/losses', lossB);
                    setFirebase('gamePrompt/', `${playerAname} wins this round!`)
                }
                else if (selectionA === "P" && selectionB === "R") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    winA++;
                    setFirebase('playerA/wins', winA);
                    lossB++;
                    setFirebase('playerB/losses', lossB);
                    setFirebase('gamePrompt/', `${playerAname} wins this round!`)
                }        
                else if (selectionA === "P" && selectionB === "S") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    lossA++;
                    setFirebase('playerA/losses', lossA);
                    winB++;
                    setFirebase('playerB/wins', winB);
                    setFirebase('gamePrompt/', `${playerBname} wins this round!`)
                }
                else if (selectionA === "S" && selectionB === "R") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    lossA++;
                    setFirebase('playerA/losses', lossA);
                    winB++;
                    setFirebase('playerB/wins', winB);
                    setFirebase('gamePrompt/', `${playerBname} wins this round!`)
                }        
                else if (selectionA === "S" && selectionB === "P") {
                    setFirebase('playerA/currentSelection', "");
                    setFirebase('playerB/currentSelection', "");
                    winA++;
                    setFirebase('playerA/wins', winA);
                    lossB++;
                    setFirebase('playerB/losses', lossB);
                    setFirebase('gamePrompt/', `${playerAname} wins this round!`)
                };
            }
        }// end evaluatePicks()

        function evaluateGame() {
            while (winA < 5 && winB <5) {
                return;
            };
            if (winA === 5) {
                setFirebase('gamePrompt/', `${playerAname} wins it all!`);
                resetFirebase();
                statusChecked = false;
                inputChecked = false;
            }
            else if (winB === 5) {
                setFirebase('gamePrompt/', `${playerBname} wins it all!`);
                resetFirebase();
                statusChecked = false;
                inputChecked = false;
            }
        };//end evaluateGame

        //Reset listener
        $("#resetBtn").on("click", function() {
            resetFirebase();
            statusChecked = false;
            inputChecked = false;
            currentPlayerName = "";
            chatBox = [];
        });
    });//end jQuery ready
    
});//end call-back

function setFirebase(child,data) {
    db.ref("/game").child(child).set(data);
};

function resetFirebase() {
    db.ref("/game").set(emptyGame)
}