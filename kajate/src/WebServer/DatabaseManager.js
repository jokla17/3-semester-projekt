let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/kajatedb";

// Create database and collection
let initalizeDatabase = () => {
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
      if (err) throw err;
      console.log("Database created!");

      var dbo = db.db("kajatedb");
      dbo.createCollection("batch_reports", function(err, res) {
        console.log("Collection created!");
      });

      db.close()
  });
}
initalizeDatabase();

// Insert or update data
exports.updateData = (jsonObject) => {
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
      let dbo = db.db("kajatedb");
      
      // Query to check if particular property exists.
      let  myquery = { BatchId : jsonObject.BatchId };

      // If it does not exist, insert a new document based of js object - or update existing one.
      let newvalues = { 
        $set: jsonObject
      }; 

      // Option initialized to first check if documente exists. 
      let options = { 
        upsert: true 
      };

      // Opertion sent to MongoDB database.
      dbo.collection("batch_reports").updateOne(myquery, newvalues, options, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
      });
  }); 
}

// Select all
exports.selectAllData = (callback) => {
  MongoClient.connect(url, {useUnifiedTopology: true},function(err, db) {
    if (err) throw err;
    var dbo = db.db("kajatedb");
    dbo.collection("batch_reports").find({}).toArray(function(err, result) {
      if (err) throw err;
      db.close();
      return callback(result);
    });
  });
}

// Select one
exports.selectSpecificData = (search, callback) => {
  MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("kajatedb");
    dbo.collection("batch_reports").findOne({BatchId : search}, function(err, result) {
      if (err) throw err;
      db.close();
      return callback(result);
    });
  });  
}
