document.getElementById("btnStop").addEventListener("click", () => {
    fetch("http://localhost:3000/stop_production");
});

document.getElementById("btnReset").addEventListener("click", () => {
    fetch("http://localhost:3000/reset_production");
});

document.getElementById("btnAbort").addEventListener("click", () => {
    fetch("http://localhost:3000/abort_production");
});

document.getElementById("btnClear").addEventListener("click", () => {
    fetch("http://localhost:3000/clear_production");
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
                 
                // Maintenance
                let maxMaintenance = 65535;
                document.getElementById("maintenancePercentage").innerText = ((json.Maintenance / maxMaintenance * 100) - 41).toFixed(0) + "%";

                // Inventory: resources
                let maxResources = 35000;
                document.getElementById("resourceBarley").innerText = (json.Inventory.Barley / maxResources * 100).toFixed(0) + "%";
                document.getElementById("resourceYeast").innerText = (json.Inventory.Yeast / maxResources * 100).toFixed(0) + "%";
                document.getElementById("resourceHops").innerText = (json.Inventory.Hops / maxResources * 100).toFixed(0) + "%";
                document.getElementById("resourceMalt").innerText = (json.Inventory.Malt / maxResources * 100).toFixed(0) + "%";
                document.getElementById("resourceWheat").innerText = (json.Inventory.Wheat / maxResources * 100).toFixed(0) + "%";

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


