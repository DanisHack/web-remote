// Global variables
var $socket = null;
var $remotePeer = null;
var $googleId = null;
var $serverUrl = 'https://video-pc-app.herokuapp.com';

// Handle the commands from the extension
function actionHandler(data) {
    switch (data.payload.cmd) {
        // Update list of tabs 
        case "tabsListUpdate":
            updateTabs(data.payload.params.tabsList, data.payload.params.iframesList);
            break;
        // Change current tab
        case "currentTabUpdate":
            setCurrentTabID(data.payload.params.id);
            break;
        // Audible change
        case "audibleUpdate":
            setAudibleChanged(data.payload.params.id, data.payload.params.audible);
            break;

        default:
            break;
    }
}

// Send a command to the socket
function sendCommand(payload) {
    $socket.emit("send", { id: $remotePeer, payload: payload });
}

// Connect the extension to the socket server
function connect(peerID, google) {
    // Set remote peer id
    $remotePeer = peerID;

    // Open socket
    $socket = io($serverUrl);

    // Trigger when peer id received
    $socket.on('peer-id-social', function(peers) {
        updateListOfPeers(peers);
    });

    // Trigger when the connection was made
    $socket.on('connect', function() {
        if (google != undefined) {
            $socket.emit('joined-id-social-check', google);
        } else {
            $socket.emit('join', { id : peerID });
        }
    });

    // Trigger when another user joined
    $socket.on('join', (data) => {
        connectionStarted()
    });

    // Trigger when a command was received
    $socket.on('receive', (data) => {
        // Handle the command
        actionHandler(data);
    });

    // Trigger when the app disconnected
    $socket.on('user-disconnected', function() {
        // Handle the command
        connectionEnded();
    });
}

// Disconnect from socket
function disconnectSocket() {
    $socket.close();
}

// Connect to device
function connectToPeer(peerId) {
    $socket.emit('join', { id : peerId });
    $remotePeer = peerId;
}

// Social user signed in
function socialConnectionStarted(user) {
    var socialButton = document.getElementById("googleButton");
    var googleButtonContainer = document.getElementById("googleStatus");

    socialButton.innerHTML = "Logout";
    googleButtonContainer.innerHTML = `Connected as ${user.displayName} `; 

    document.getElementById("googleButton").removeEventListener("click", connectGoogle);
    document.getElementById("googleButton").addEventListener("click", disconnectGoogle);
}

// Social user signed out
function socialConnectionEnded() {
    var socialButton = document.getElementById("googleButton");
    var googleButtonContainer = document.getElementById("googleStatus");
    var devices = document.getElementById("devices");

    socialButton.innerHTML = "Connect with Google";
    googleButtonContainer.innerHTML = ""; 
    devices.innerHTML ="";

    document.getElementById("googleButton").addEventListener("click", connectGoogle);
    document.getElementById("googleButton").removeEventListener("click", disconnectGoogle);
}

// Trigger when connection started
function connectionStarted() {
    var connectSection = document.getElementById("connectSection");
    var panelSection = document.getElementById("panelSection");

    // Send the first tab update
    sendCommand({ cmd: "tabsListUpdate" });

    // Update UI
    connectSection.style.display = "none";
    panelSection.style.display = "block";
}

// Trigger when connection ended
function connectionEnded() {
    var connectSection = document.getElementById("connectSection");
    var panelSection = document.getElementById("panelSection");
    var openedTabsList = document.getElementById("openedTabsList");

    // Update UI
    connectSection.style.display = "block";
    panelSection.style.display = "none";
    openedTabsList.innerHTML = "";
}

// Disconnect from server
function disconnect() {
    firebase.auth().signOut();
    $socket.disconnect();
    connectionEnded();
}

// Close a tab
function closeTab(id) {
    sendCommand({ cmd: "closeTab", params: { id: id } });
}

// Change a tab
function changeTab(id) {
    sendCommand({ cmd: "changeTab", params: { id: id } });
}

// Play a video
function playTab(id) {
    sendCommand({ cmd: "playTab", params: { id: id } });
}

// Open a new tab
function newTab(url) {
    sendCommand({ cmd: "newTab", params: { url : url } });
}

// Seek video 
function seekVideo(id, seconds) {
    sendCommand({ cmd: "seekVideo", params: { id : id, seconds : seconds } });
}

// Change volume
function changeVolume(id, volume) {
    sendCommand({ cmd: "changeVolume", params: { id : id, volume : volume } });
}

