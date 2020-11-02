// Stop production
function stopProduction(){
    fetch("http://localhost:3000/stop_production");
}
document.getElementById("btnStop").addEventListener("click", () => {
    stopProduction();
    alert("Production has stopped...");
});

// Reset production
function resetProduction(){
    fetch("http://localhost:3000/reset_production");
}
document.getElementById("resetStop").addEventListener("click", () => {
    resetProduction();
    alert("Production has stopped...");
});

// Abort production
function abortProduction(){
    fetch("http://localhost:3000/abort_production");
}
document.getElementById("btnAbort").addEventListener("click", () => {
    stopProduction();
    alert("Production has aborted...");
});

// Clear production
function clearProduction(){
    fetch("http://localhost:3000/clear_production");
}
document.getElementById("btnClear").addEventListener("click", () => {
    stopProduction();
    alert("Production has been cleared...");
});

// Get OPC Server data
function poll(){
    fetch("http://localhost:3000/opcua_data")
    .then(response => response.json())
    .then(json => { 
        document.getElementById("pBatchId").innerText = document.getElementById("tfBatchID").value;
        document.getElementById("pType").innerText = document.getElementById("tfProductType").value;
        document.getElementById("pAmount").innerText = document.getElementById("tfProductAmount").value;
        document.getElementById("pSpeed").innerText = document.getElementById("tfMachineSpeed").value;
        document.getElementById("pProduced").innerText = json.produced;
    })
    .then(() => setTimeout(poll(), 500))
    .catch(err => console.log(err));
}

document.getElementById("btnStart").addEventListener("click", () => {
    alert("Production has started...");
    setTimeout(() => {
        poll();
    }, 5000);
});