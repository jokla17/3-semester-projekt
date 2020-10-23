const { response } = require('express');
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(cors());

let formData = {}
let opcuaData = {}

// Get
app.get("/", (request, response) => {
    response.send("RECEIVED GET REQUEST");
});

// Get form_data
app.get("/form_data", (request, response) => {
    response.send(formData);
});

app.get("/opcua_data", (request, response) => {
    response.send(opcuaData);
});

// Post
app.post("/form_data", (request, response) => { 
    response.send("RECEIVED POST REQUEST");
    formData = request.body;
    console.log(formData);

    var exec = require('child_process').exec, child;
    child = exec('java -jar ./StartProduction.jar',
    function (error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null){
        console.log('exec error: ' + error);
    }
    });  
});


// Put
app.put("/opcua_data", (request, response) => {
    opcuaData = request.body;  
    console.log(opcuaData);
    response.send("RECEIVED PUT REQUEST");
});

// Delete
app.delete("/", () => {
    response.send("RECEIVED DELETE REQUEST");
});

// Server listens on port 3000
console.log("\n---------------------------------------")
console.log("WebServer is running...\nListens on requests sent to the server on port 3000...")
console.log("---------------------------------------\n");
app.listen(3000);



/*
var exec = require('child_process').exec, child;
    child = exec('java -jar ***put jar file in WebServer folder, and type ./FileName here***',
    child = exec('java -jar ***put jar file in WebServer folder, and type ./FileName here***',
    child = exec('java -jar ***put jar file in WebServer folder, and type ./FileName here***',
    child = exec('java -jar ***put jar file in WebServer folder, and type ./FileName here***',
    function (error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null){
        console.log('exec error: ' + error);
    }
*/