//DB CONNECTION HANDLING
/*
*
* Use this to establish connection with your MongoDB database.
* The extra parameters help ensure that the connection is re-established in case of a failure.
*
* Simply copy/paste this file in your app _core_apps_connectivities folder and import it in your app.js file with below line:

const mongoose_connection = require('./db_mongo_mongoose');

* You can then use db1 and db2 to perform your database operations.
**********/
const mongoose                = require("mongoose");  //Import mongoose for MongoDB connection
mongoose.connection.setMaxListeners(20); // Adjust the number based on your application's needs


const user                     = "USER";
const password                 = "PASS";
const server_ip                = "172.18.0.71:27017";
const auth_db                  = "admin";


mongoose.connect("mongodb://"+user+":"+password+"@"+server_ip+"/"+auth_db, 
    { 
    maxPoolSize: 250, // Adjust this based on your server capabilities
    serverSelectionTimeoutMS: 30000, // Increase server selection timeout
    socketTimeoutMS: 45000 // Increase socket timeout
    }
).catch(
    (error) => console.error("FILE: db_mongo_mongoose.js:22 | MongDB Connection Failure: ", error)
    );

module.exports = mongoose.connection;