const { response } = require('express');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json()); 

let formData = {}

// Get
app.get("/", (request, response) => {
    response.send("RECEIVED GET REQUEST");
});

// Post
app.post("/", (request, response) => {
    console.log(request.body);
    response.send("RECEIVED POST REQUEST");
});

// Put
app.put("/", (request, response) => {
    console.log(request.body);
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


/* ::FOR RUNNING JAR FILES::
var exec = require('child_process').exec, child;
child = exec('java -jar C:/Users/Jonas/Desktop/3SemProj/3-semester-projekt-1/3-semester-projekt.jar',
function (error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(error !== null){
        console.log('exec error: ' + error);
    }
});
*/





