//DB CONNECTION HANDLING
/*
*
*	Configure MySQL Connection Pool to avoid timeout issues.
* We have used proxy to pass connections/queries to DB which can greatly help handling
* failure such as incase of connection losses, this will auto reattempt connection to 
* execute the query before failing apart.
*
**********/
const mysql = require('mysql2/promise');

function createDbPool() 
{
  return mysql.createPool({
    multipleStatements: true,
    connectionLimit: 20,
    host: '172.18.0.63',
    user: 'USER',
    password: 'PASSWORD',
    database: ''
  });
}
 
let pool = createDbPool();



const poolProxy = new Proxy(pool, 
  {
  get(target, prop, receiver) {
    if (typeof target[prop] === 'function') 
    {
      return async (...args) => 
      {
        let attempts = 0;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 1000; // Delay between retries in milliseconds

        while (attempts <= maxRetries) {
          try 
          {
            const result = await target[prop](...args);
            return result; // If the query is successful, return the results
          } catch (error) 
          {
            attempts++;
            if (error.code === 'PROTOCOL_CONNECTION_LOST' && attempts <= maxRetries) 
            {
              console.log(`Connection lost, attempting to recreate pool and retry... Attempt ${attempts} of ${maxRetries}`);
              // Recreate the pool
              target = createDbPool();
              pool = target; // Update the reference for future queries
              
              // Wait for a bit before retrying
              await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
              
              // Retry logic will continue
            } 
            else 
            {
              // If max retries reached or other type of error, throw
              console.error(`Query failed after ${attempts} attempts:`, error);
              throw error;
            }
          }
        }
      };
    } else 
    {
      return target[prop];
    }
  }
});


//EXPORT THE FUNCTIONS/MODULES FOR FURTHER USE
module.exports = poolProxy;
