document.getElementById("btnStop").addEventListener("click", () => {
    fetch("http://localhost:3000/stop_production");
    alert("Production has stopped...");
});

document.getElementById("btnReset").addEventListener("click", () => {
    fetch("http://localhost:3000/reset_production");
    alert("Production has reset...");
});

document.getElementById("btnAbort").addEventListener("click", () => {
    fetch("http://localhost:3000/abort_production");
    alert("Production has been aborted...");
});

document.getElementById("btnClear").addEventListener("click", () => {
    fetch("http://localhost:3000/clear_production");
    alert("Production has been cleared...");
});

function poll(){
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

