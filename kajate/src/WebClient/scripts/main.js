/*** SERVER AVAILABLE, SEARCH FUNCTIONALITY, DATETIME ***/

$(document).ready(() => {
    // Webserver available functionality
    let checkConnectivity = () => {
        $("#btnServerConnectivity").attr("disabled", true);

        $("#btnServerConnectivity").text("Loading...");
        $("#btnServerConnectivity").removeClass("buttonSuccess buttonWarning");

        fetch("http://localhost:3000/opcua_data")
        .then(() => {
            $("#btnServerConnectivity").text("Server is online!");
            $("#btnServerConnectivity").addClass("buttonSuccess");
            
            $("button").attr("disabled", false);
            $("input:submit").attr("disabled", false);
        })
        .catch(() => {
            $("#btnServerConnectivity").text("Server is offline, Try again?");
            $("#btnServerConnectivity").addClass("buttonWarning");
            
            $("button").attr("disabled", true);
            $("input:submit").attr("disabled", true);
        }).finally(() => {
            $("#btnServerConnectivity").attr("disabled", false);
        });
    }

    checkConnectivity();
    setInterval(() => checkConnectivity(), 30000);

    $("#btnServerConnectivity").click(() => {
        $("#btnServerConnectivity").attr("disabled", true);
        checkConnectivity();
    });

    // Search functionality
    $("#btnSearch").click(() => {
        $("#searchDropdown").empty();

        fetch("http://localhost:3000/search", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : '{"BatchId" : ' +  $("#tfSearch").val() + '}'
        })
        .then(response => response.json())
        .then(json => {
            let url = new URL("http://127.0.0.1:5500/kajate/src/WebClient/singlebatch.html"); 
            url.searchParams.append('batch_id', json.BatchId); 
            
            $("#searchDropdown").append("<a href=" + url +"><p>Batch " +  json.BatchId + "</p></a>");
        });
    });

    // Datetime 
    setInterval(() => {
        $("#dateTime").text(new Date().toLocaleString());
    }, 10);
});

/*** DASHBOARD & REALTIME VISUALIZATION ***/

document.getElementById("btnStop").addEventListener("click", () => {
    // Send get stop production request
    fetch("http://localhost:3000/stop_production");
    alert("Production has stopped...");
});

document.getElementById("btnReset").addEventListener("click", () => {
    // Send get reset production request
    fetch("http://localhost:3000/reset_production");
    alert("Production has reset...");
});

document.getElementById("btnAbort").addEventListener("click", () => {
    // Send get abort production request
    fetch("http://localhost:3000/abort_production");
    alert("Production has been aborted...");
});

document.getElementById("btnClear").addEventListener("click", () => {
    // Send get clear production request
    fetch("http://localhost:3000/clear_production");
    alert("Production has been cleared...");
});

function poll(){
    // Send get OPC Server data request
    fetch("http://localhost:3000/opcua_data")
    .then(response => response.json())
    .then(json => {
        if (json.Logs != undefined) {
            document.getElementById("pBatchId").innerText = document.getElementById("tfBatchId").value;
            document.getElementById("pAmount").innerText = document.getElementById("tfProductAmount").value;
            document.getElementById("pProductsPerMinute").innerText = document.getElementById("tfMachineSpeed").value;
            document.getElementById("pProduced").innerText = json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1];
            document.getElementById("pHumidity").innerText = json.Logs.Humidity[json.Logs.Humidity.length - 1];
            document.getElementById("pVibration").innerText = json.Logs.Vibration[json.Logs.Vibration.length - 1];
            document.getElementById("pTemperature").innerText = json.Logs.Temperature[json.Logs.Temperature.length - 1];
            document.getElementById("pDefectProducts").innerText = json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1];
            document.getElementById("pAcceptableProducts").innerText = json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1] 
            - json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1]
        }
    })
    .then(() => setTimeout(poll(), 500))
    .catch(err => console.log(err));
}

document.getElementById("btnStart").addEventListener("click", () => {
    setTimeout(() => {
        poll();
    }, 4000);
});

