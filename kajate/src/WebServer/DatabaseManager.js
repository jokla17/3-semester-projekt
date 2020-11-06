let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/kajatedb";

// Create database and collection
exports.initalizeDatabase = () => {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log("Database created!");

      var dbo = db.db("kajatedb");
      dbo.createCollection("batch_reports", function(err, res) {
        console.log("Collection created!");
      });

      db.close()
  });
}

exports.insertData = (jsonObject) => {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("kajatedb");
      dbo.collection("batch_reports").insertOne(jsonObject, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
  }); 
}

exports.updateData = (logs) => {
  MongoClient.connect(url, function(err, db) {
      var dbo = db.db("kajatedb");
      var myquery = { tfBatchId: "1" };
      var newvalues = { $set: { logs : { Produced : [logs] } } }; // the value we want to update
      dbo.collection("batch_reports").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
  }); 
}

/*
// update
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myquery = { address: "Valley 345" };
  var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
  dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
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
*/