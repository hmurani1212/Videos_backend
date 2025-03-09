/*
*
* Configure Redis Connection here.
*
**********/

// IMPORT THE REDIS PACKAGE
const Redis = require('ioredis');

// List of Redis servers (PRIMARY and FAILOVER)
const servers = ['172.18.0.86']; // Add more servers as needed
let currentServerIndex = 0;

// Function to create ioredis client
function createRedisClient(serverIndex) {
  const server = servers[serverIndex];
  
  const client = new Redis({
    host: server,
    port: 6379,
    password: 'openx',
    // If you're using TLS/SSL, uncomment and configure the following:
    // tls: {
    //   // Your TLS configuration
    // },
    retryStrategy: (retries) => {
      if (retries > 5) {
        // After 5 retries, switch to the failover server
        currentServerIndex = (currentServerIndex + 1) % servers.length;
        const nextServer = servers[currentServerIndex];
        console.log(`Switching to failover server: ${nextServer}`);
        return 15000; // Wait 15 seconds before retrying
      }
      // Reconnect after increasing intervals
      return Math.min(retries * 3000, 10000); // Wait up to 10 seconds
    },
    // Important: maxRetriesPerRequest should be set to null for BullMQ compatibility
    maxRetriesPerRequest: null,
  });
  
  // Event listeners
  client.on('connect', () => {
    console.log(`Redis client connected to server ${server}`);
  });
  
  client.on('ready', () => {   
    console.log(`Redis client ready to use on server ${server}`);
  });
  
  client.on('error', (err) => {
    console.error(`Redis Client Error on server ${server}:`, err);
  });
  
  client.on('end', () => {
    console.log(`Redis client disconnected from server ${server}`);
  });
  
  return client;
}

// Initialize the Redis client with the first server
const redisClient = createRedisClient(currentServerIndex);

module.exports = redisClient;
