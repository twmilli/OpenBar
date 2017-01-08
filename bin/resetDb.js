#!/usr/bin/env node

var mongo = require("mongodb").MongoClient;

mongo.connect(process.env.MONGODB_URI, (err,db)=>{
  if (err){
    throw err;
  }

  db.collection("places", function(err, collection){
    collection.remove();
  })
}
