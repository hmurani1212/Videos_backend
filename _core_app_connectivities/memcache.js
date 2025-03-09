//DB CONNECTION HANDLING
/*
*
* Configure Memcache Connection here.
*
**********/
//IMPORT THE MEMCACHED PACKAGE
const Memcached = require('memcached');

//SET UP A MEMCACHED INSTANCE WITH YOUR SERVER IPS
const memcached = new Memcached(['172.18.0.81'], 
{
    maxValue: 2097152, //The maximum size of a value that Memcached can store - 2MB
    timeout: 3000, //The time (in milliseconds) to wait for a server response before retrying the request. - 3 seconds
    idle: 30000, //The time (in milliseconds) to wait before closing idle connections. - 10 seconds
    retries: 3, //The number of times to retry an operation in case of failure. - 3 times
    failures: 5, //The number of failed-attempts to a server before it is regarded as 'dead'. - 1 times
    retry: 1000, //The time (in milliseconds) to wait between failed-attempts. - 1 seconds
    remove: false, //Whether to remove failed servers from the rotation. - false
    failOverServers: ['172.18.0.82'], //The list of servers to use for failover. 
    keyCompression: true, //Whether to compress keys. - true
    reconnect: 1000 // retry time for reconnection (in milliseconds)
});


/*
*
*	START Getting value from memcache
*
**********/
async function getFromMemcache(key)
{
    return new Promise((resolve, reject) => 
	{
        memcached.get(key, (err, value) => 
		{
            if (err) 
			{
                return reject(err);
            }
            resolve(value);
        });
    });
}




/*
*
*	START Getting JSON object from memcache
*
**********/
async function getJsonFromMemcache(key)
{
    return new Promise((resolve, reject) => 
	{
        memcached.get(key, (err, value) => 
		{
            if (err) 
			{
                return reject(err);
            }
            resolve(value ? JSON.parse(value.toString()) : null);
        });
    });
}



/*
*
*	START Deleting Key from memcache
*
**********/
async function deleteCacheKey(key) 
{
return new Promise((resolve, reject) => {
    memcached.delete(key, (error) => {
    if (error) {
        return reject(error);
    } else {
        console.log(`Cache for ${key} deleted successfully.`);
        resolve();
    }
    });
});
}



/******************************************************
 * 
 * 
 * Handling Memcached Events
 * 
 *
 ******************************************************/
memcached.on('issue', (details) => 
{
    console.error('FILE: memcache.js | TIME: ', new Date(), '| ERROR: Memcached connection issue', details);
});
  
memcached.on('reconnecting', (details) => {
    console.error('FILE: memcache.js | TIME: ', new Date(), '| ERROR: reconnecting to server', details.server);
});
  
memcached.on('reconnect', (details) => {
console.log('FILE: memcache.js | TIME: ', new Date(), '| Reconnection Successful ', details.server);
});
  


/***
*
*	DEFINE a value for the cache storage time.
*	If you use this value in a function, it can help you controlled the caching time in centralized manner.
*   ie incase of development you can reduce this value to let the changes take effect instantly, in production you can
*   increase it.
*   This is exported from this module so to use it in other modules, you can import/use it as follows:
*   memcached_ops.CentralcacheTime
*   
*   Ensure you have imported this module in the file you want to use it.
*
******************************************************/
const CentralcacheTime = 10; //Value in seconds.




//EXPORT MODULES
module.exports = 
{
memcached,
deleteCacheKey,
getFromMemcache,
getJsonFromMemcache,
CentralcacheTime
};
