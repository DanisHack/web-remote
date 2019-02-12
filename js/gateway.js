// Global variables
var $socket = null;
var $remotePeer = null;
$serverUrl = 'https://browsercast-messaging-broker.herokuapp.com';

// Handle the commands from the extension
function actionHandler(data) {
    console.log(data)
    switch (data.payload.cmd) {
        // Update list of tabs 
        case "tabsListUpdate":
            updateTabs(data.payload.params.tabsList);
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
function connect(peerID) {
    // Set remote peer id
    $remotePeer = peerID;

    // Open socket
    $socket = io($serverUrl);

    // Trigger when the connection was made
    $socket.on('connect', function() {
        $socket.emit('join', { id : peerID });
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

