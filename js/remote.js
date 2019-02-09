// Global variables
$currentTabID = -1;
$tabsList = [];

// Update the tabs 
function updateTabs(list) {
    var container = document.getElementById("openedTabsList");
    var html = "";
    $tabsList = [];

    if (list.length > 0) {
        // If the list of tabs contains at least 1 tab, display them
        for (var item in list) {
            var element = list[item];
            // Display each tab 
            html += `<div class="input-group mb-3">
                        <input type="text" class="form-control focusTabButton" data-tabID="` + element.id + `" readonly value="` + element.title + `">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary closeTabButton" type="button" data-tabID="` + element.id + `">X</button>
                        </div>
                    </div>`;

            // If the tab is active change the UI accordingly
            if (element.active){
                $currentTabID = element.id;
                
                // Change Play button text
                document.getElementById("playButton").innerHTML = element != null && element.audible ? "Pause Video" : "Play Video";
                // Enable/Disable play button             
                document.getElementById("playButton").disabled = element == null ? true : false;
                // Show/hide error message
                document.getElementById("activeTab").innerHTML = element == null ? "You must select a video tab first" : "<b>" + element.title + "</b>";  
            }

            // Add the tabs to the local list
            $tabsList.push(element);
        }
    } else {
        // Display a default message when there is no video tab
        html += `<div>You have no video tabs</div>`;
    }

    // Apply the changes
    container.innerHTML = html;

    Array.from(container.getElementsByClassName("closeTabButton")).forEach(element => {
        // Add event listeners for "close" buttons
        element.addEventListener("click", function(params) {
            var tabID = this.getAttribute("data-tabID");
            
            // Send command to close the tab
            closeTab(tabID);
        });
    });

    Array.from(container.getElementsByClassName("focusTabButton")).forEach(element => {
        // Add event listeners for "focus" buttons
        element.addEventListener("click", function(params) {
            this.blur();
            var tabID = this.getAttribute("data-tabID");
            
            // Send command to change the tab
            changeTab(tabID);
        });
    })
}

// Change the UI when the tab has changed
function setCurrentTabID(id) {
    $currentTabID = id;
    var tab = getTabById(id);

    // Change Play button text
    document.getElementById("playButton").innerHTML = tab != null && tab.audible ? "Pause Video" : "Play Video"; 
    // Enable/Disable play button  
    document.getElementById("playButton").disabled = tab == null ? true : false;
    // Show/hide error message
    document.getElementById("activeTab").innerHTML = tab == null ? "You must select a video tab first" : "<b>" + tab.title + "</b>";  
}

// Change the UI when the audible has changed (sound)
function setAudibleChanged(id, audible) {
    var tab = getTabById(id);

    // Change Play button text
    document.getElementById("playButton").innerHTML = tab != null && audible ? "Pause Video" : "Play Video";
}

// Open and process QR Code image
function openQRCamera(node, elementID) {
    var reader = new FileReader();

    reader.onload = function() {
        node.value = "";

        qrcode.callback = function(res) {
            if(res instanceof Error) {
                // Error - QR code couldn't be found
                alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
            } else {
                // QR code was found
                elementID.value = res;
            }
        };

        qrcode.decode(reader.result);
    };

    reader.readAsDataURL(node.files[0]);
}

// Get tab by id, from local tab list
function getTabById(id) {
    var tab = null;

    for (const key in $tabsList) {
        const element = $tabsList[key];
        if (element.id == id) {
            tab = element;
            break;
        }
    }

    return tab;
}

// Add event listener to "Play" button
document.getElementById("playButton").addEventListener("click", function(params) {
    // FixMe - adding an attribute on playButton which will show the status
    document.getElementById("playButton").innerHTML = document.getElementById("playButton").innerHTML == "Play Video"? "Pause Video" : "Play Video";
    playTab($currentTabID);    
});

// Add event listener to "New tab" button
document.getElementById("newTabButton").addEventListener("click", function(params) {
    newTab(urlInput.value);
});

// Add event listener for "scan" button
document.getElementById("scanButton").addEventListener("change", function() {
    openQRCamera(this, document.getElementById("connectInput"));
});

// Add event listener for "connect" button
document.getElementById("connectButton").addEventListener("click", function() {
    var code = document.getElementById("connectInput").value;

    if (code.length < 10) {
        alert("Your code is too short");
    } else {
        // If code is valid send connect command
        connect(code); 
    }  
});

// Add event listener for "disconnect" button
document.getElementById("disconnectButton").addEventListener("click", function() {
    // Disconnect the user
    disconnect();
});