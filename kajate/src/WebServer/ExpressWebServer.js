const { response } = require('express');
let express = require('express');
let app = express();

let formData = {}

app.get("/", (request, response) => {
    response.send("RECEIVED GET REQUEST");
});

app.post("/", () => {
    reponse.send("RECEIVED POST REQUEST");
});

app.put("/", () => {
    response.send("RECEIVED PUT REQUEST");
});

app.delete("/", () => {
    response.send("RECEIVED DELETE REQUEST");
});

app.listen(3000);






