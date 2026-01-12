/**
 * MongoDB Connection (Mongoose)
 * Simplified connection to MongoDB Atlas
 */

const mongoose = require("mongoose");

// MongoDB Atlas Connection String
const MONGO_CONNECTION_STRING = "mongodb+srv://Project:A6pyWYW5Hbu7QE9T@cluster0.obxjkz6.mongodb.net/socail_video";

// Connection Options
const CONNECTION_OPTIONS = {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    bufferCommands: false, // Disable buffering, fail fast if not connected
    autoIndex: true
};

// Set strictQuery option
mongoose.set('strictQuery', false);

// Connection function
const connect_to_mongodb = async () => {
    try {
        await mongoose.connect(MONGO_CONNECTION_STRING, CONNECTION_OPTIONS);
        console.log("FILE: db_mongo_mongoose.js | Successfully connected to MongoDB Atlas");
        console.log("FILE: db_mongo_mongoose.js | Database:", mongoose.connection.db.databaseName);
    } catch (error) {
        console.error("FILE: db_mongo_mongoose.js | MongoDB Connection Failed:", error);
        console.error("FILE: db_mongo_mongoose.js | Please check your connection string and network access");
        process.exit(1);
    }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('FILE: db_mongo_mongoose.js | Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('FILE: db_mongo_mongoose.js | Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('FILE: db_mongo_mongoose.js | Mongoose disconnected from MongoDB');
});

// Export connection and connect function
module.exports = {
    connection: mongoose.connection,
    connect: connect_to_mongodb
};