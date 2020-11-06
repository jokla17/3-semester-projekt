let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/kajatedb";

/*
// Create database 
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close()
});

// Create collection
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("kajatedb");
    dbo.createCollection("batch_reports", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
});

// Insert row
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("kajatedb");
    var myobj = { name: "test_name", testValue: "test_value" };
    dbo.collection("batch_reports").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
});


// Query
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("kajatedb");
    var query = { name: "test_name" };
    dbo.collection("batch_reports").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
});
*/

// Delete
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("kajatedb");
  var query = { name: 'test_name' };
  dbo.collection("batch_reports").deleteOne(query, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
  });
});
