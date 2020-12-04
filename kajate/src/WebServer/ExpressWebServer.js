let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let dbmanager = require('./DatabaseManager');
let pdfConfiguration = require("./PDFManager");
let app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(cors());
app.use(express.static('../WebClient/'));

// Save temporary data
let formData = {} 
let opcuaData = {}

// Get request handlers
app.get("/stop_production", (request, response) => {
    runJar("StopProduction");
    response.send("Production has been stopped...");
});

app.get("/abort_production", (request, response) => {
    runJar("AbortProduction");
    response.send("Production has been aborted...");
});

app.get("/clear_production", (request, response) => {
    runJar("ClearProduction");
    response.send("Production has been cleared...");
});

app.get("/reset_production", (request, response) => {
    runJar("ResetProduction");
    response.send("Production has been reset...");
});

app.get("/form_data", (request, response) => {
    response.send(formData);
});

app.get("/opcua_data", (request, response) => {
    response.send(opcuaData);
});

app.get("/batches", (request, response) => {
    dbmanager.selectAllData((callback) => response.send(callback));
});

// Post request handlers
app.post("/form_data", (request, response) => { 
    response.send("RECEIVED POST REQUEST");
    formData = request.body;
    console.log(formData);
    runJar("StartProduction");
});

app.post("/search", (request, response) => {
    if (request.body.BatchId != 0) {
        dbmanager.selectSpecificData(request.body.BatchId, (callback) => response.send(callback));
        return;
    }
    dbmanager.selectAllData((callback) => response.send(callback));
});

app.post("/savepdf", (request, response) => {
    dbmanager.selectSpecificData(request.body.BatchId, (callback) => pdfConfiguration.saveAsPdf(callback));
});

// Put request handlers
app.put("/opcua_data", (request, response) => {
    response.send("RECEIVED PUT REQUEST");
    opcuaData = request.body;    
    console.log(opcuaData);
    dbmanager.updateData(opcuaData);
});
    
// Run jar function
let runJar = (jarFileName) => {
    var exec = require('child_process').exec, child;
    child = exec("java -jar ./jars/" + jarFileName + ".jar",
    function (error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null){
        console.log('exec error: ' + error);
    }
    }); 
}   

console.log("\n---------------------------------------")
console.log("WebServer is running...\nListens on requests sent to the server on port 3000...")
console.log("---------------------------------------\n");
app.listen(3000);

