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

function poll() {
    fetch("http://localhost:3000/opcua_data")
        .then(response => response.json())
        .then(json => {
            if (json.Logs != undefined) {
                document.getElementById("pBatchId").innerText = json.BatchId;
                document.getElementById("pAmount").innerText = json.Products;
                document.getElementById("pProductsPerMinute").innerText = json.Speed;
                document.getElementById("pProduced").innerText = json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1];
                document.getElementById("pHumidity").innerText = json.Logs.Humidity[json.Logs.Humidity.length - 1];
                document.getElementById("pVibration").innerText = json.Logs.Vibration[json.Logs.Vibration.length - 1];
                document.getElementById("pTemperature").innerText = json.Logs.Temperature[json.Logs.Temperature.length - 1];
                document.getElementById("pDefectProducts").innerText = json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1];
                document.getElementById("pAcceptableProducts").innerText = json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1]
                    - json.Logs.ProdDefectiveCount[json.Logs.ProdDefectiveCount.length - 1]

                // If produced equals amount, update id in input
                if (json.Logs.ProdProcessedCount[json.Logs.ProdProcessedCount.length - 1] == json.Products) {
                    fetch("http://localhost:3000/batches")
                    .then(response => response.json())
                    .then(json => {
                        document.getElementById("tfBatchId").value = json[json.length - 1].BatchId + 1;
                    });
                }
            }
        })
        .then(() => setTimeout(poll(), 500))
        .catch(err => console.log(err));
}
poll();

document.getElementById("btnStart").addEventListener("click", () => {
    fetch("http://localhost:3000/form_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: 
        '{"tfBatchId" : ' + document.getElementById("tfBatchId").value + 
        ',"slProductType" : ' + document.getElementById("slProductType").value +
        ',"tfProductAmount" : ' + document.getElementById("tfProductAmount").value +
        ',"tfMachineSpeed" : ' + document.getElementById("tfMachineSpeed").value + '}'
    });
});


