/***
* RABBIT MQ CONNECTION HANDLING
*
* Use this to establish connection with VT Queuing System/RabbitMQ.
* The extra parameters help ensure that the connection is re-established in case of a failure.
*
* Simply copy/paste this file in your app _core_apps_connectivity folder and import it in your app.js file with below line:

const rabbitmq_ops				= require('./_core_app_connectivity/rabbitmq');

* You can then use below code to securely start using rabbitmq once the connection is successfully established by listening to the event 'rabbitMQConnected'.


*
*
*	Event fired on Successful Connection with RabbitMQ.
*
**********
eventEmitter.on('rabbitMQConnected', () => 
{
	channelMQ = rabbitmq_ops.getChannelMQ();

	//Add error handling on the RabbitMQ connection
	channelMQ.on('error', (err) => 
	{
	    console.error(' [!] RabbitMQ Channel Error:', err.message);
	});
	
    Any of code that needs to be executed after the RabbitMQ connection is established.

});

*
*
**********/
const amqp = require('amqplib/callback_api');
const eventEmitter = require('./emitter');

let channelMQ; // This will hold our channel
let connection; // This will hold our connection
let isReconnecting = false; // Flag to prevent multiple reconnections
let retryCount = 0; // Retry counter
const MAX_RECON_RETRIES = 30; // Maximum number of retries before exiting
const RECONNECTION_DELAY = 10000; // Reconnection delay in milliseconds



async function startRabbitMQChannel(url) {
    // Close existing connection and channel before creating new ones
    if (channelMQ) {
        try {
            await channelMQ.close();
            console.log('Existing channel closed.');
        } catch (error) {
            console.error('Error closing existing channel:', error.message);
        }
    }

    if (connection) {
        try {
            await connection.close();
            console.log('Existing connection closed.');
        } catch (error) {
            console.error('Error closing existing connection:', error.message);
        }
    }

    connection = await new Promise((resolve, reject) => {
        amqp.connect(url, (err, conn) => {
            if (err) reject(err);
            else resolve(conn);
        });
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err.message);
        if (!isReconnecting) {
            reconnectToRabbitMQ(url); // Attempt to reconnect
        }
    });

    connection.on('close', () => {
        console.log('Connection closed. Reconnecting...');
        if (!isReconnecting) {
            reconnectToRabbitMQ(url); // Attempt to reconnect
        }
    });

    channelMQ = await new Promise((resolve, reject) => {
        connection.createChannel((err, channel) => {
            if (err) reject(err);
            else resolve(channel);
        });
    });

    channelMQ.on('error', (err) => {
        console.error('Channel error:', err.message);
        if (!isReconnecting) {
            reconnectToRabbitMQ(url); // Attempt to reconnect
        }
    });

    channelMQ.on('close', () => {
        console.log('Channel closed. Reconnecting...');
        if (!isReconnecting) {
            reconnectToRabbitMQ(url); // Attempt to reconnect
        }
    });

    retryCount = 0; // Reset retry counter on successful connection
    return channelMQ;
}



async function reconnectToRabbitMQ(url) {
    if (isReconnecting) return; // Prevent multiple reconnections
    isReconnecting = true;

    console.log(`Attempting to reconnect to RabbitMQ in ${RECONNECTION_DELAY / 1000} seconds...`);
    setTimeout(async () => {
        try {
            await startRabbitMQChannel(url);
            eventEmitter.emit('rabbitMQConnected');
            console.log('Reconnected to RabbitMQ.');
            isReconnecting = false;
        } catch (error) {
            retryCount += 1;
            console.error(`Reconnection attempt ${retryCount} failed:`, error.message);

            if (retryCount >= MAX_RECON_RETRIES) {
                console.error(`Maximum retry attempts (${MAX_RECON_RETRIES}) reached. Exiting...`);
                process.exit(1); // Exit the process to trigger PM2 restart
            } else {
                isReconnecting = false;
                reconnectToRabbitMQ(url); // Retry reconnection
            }
        }
    }, RECONNECTION_DELAY);
}



async function connectToRabbitMQ() {
    const rabbitMQURL = "amqp://USER:PASS@172.18.0.88:5672/%2f";

    try {
        await startRabbitMQChannel(rabbitMQURL);
        console.log('Successfully connected to RabbitMQ and created a channel.');
        eventEmitter.emit('rabbitMQConnected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        reconnectToRabbitMQ(rabbitMQURL); // Attempt to reconnect
    }
}



// Start the connection establishment
connectToRabbitMQ();


// Calling the function in-order to allow the connection with RabbitMQ is established
// before the instance is called/used.
function getChannelMQ() 
{
    return channelMQ;
}





/*
*
*	Function to Send/Publish Data into RabbitMQ Q
*	Pass exchange field as empty '', in-case you want to publish to default exchange.
*
*   Never sent JSON Stringified data into this function as this double stringify it and will cause issues,
*   As this function already perform JSON.stringify on data being stored.
*
**********/
const MAX_RETRIES = 3;  		//You can adjust this as needed
const RETRY_DELAY = 2000; 		//Delay of 2 second between retries


async function sendToRabbitMQ(queue, messages, headers = {}, exchange = '') 
{
    // Create or check the existence of the queue
    // Note: This is relevant if you're not using a specific exchange to route messages.
    if (exchange === '')
    {
        await channelMQ.assertQueue(queue, {
            durable: true // Ensuring the queue will survive broker restarts
        });
    }

    // Send the message to the queue    
    const sendMessage = async (message) => 
	{
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) 
		{
            try 
			{
				await channelMQ.publish(exchange, queue, Buffer.from(JSON.stringify(message)), { headers });
				return;  // Successful send
            } 
			catch (rabbitMQError) 
			{
                console.warn(`Attempt ${attempt} failed when sending to RabbitMQ. Retrying in ${RETRY_DELAY}ms...`);
                if (attempt < MAX_RETRIES) 
				{
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
				else 
				{
                    console.error("Max retries reached. Failed to send to RabbitMQ:", rabbitMQError);
                    throw rabbitMQError;
                }
            }
        }
    };

    if(Array.isArray(messages)) 
	{
		await sendMessage(messages);
    } 
	else 
	{
        //Handle a single message
        await sendMessage(messages);
    }
}




/*
*
*	Function to handle Q Message retries, this stores a count
*	in header info, incase of maxRetries failures, this responds with nack
*	where the message is then moved to dead letter for onwards processing.
*	
*	It could be very useful in-case you want to retry a Q message incase of
*	any failures and that's too in controlled manner ie maintaining certain
*	number of retries.
*
*	The max_retries takes int value to attempt max retries on the message.
*
**********/
async function RetryQMessage(msg, max_retries, queue)
{
	//SET THE INITIAL RETRIES TO 1 AS A FAILED MESSAGE WILL REACH HERE FOR RETRY
    const currentRetryCount = msg.properties.headers['x-retry-count'] || 1;


    if(currentRetryCount < max_retries)
	{
		//CONVERT BUFFER TO JSON OBJECT
		const messageContent = JSON.parse(msg.content.toString());
		
				
        //UPDATE THE HEADER WITH THE INCREMENTED RETRY COUNT
        const headers = { ...msg.properties.headers, 'x-retry-count': currentRetryCount + 1 };
        
        try
		{
            //SEND THE UPDATED MESSAGE BACK TO THE SAME QUEUE
            await sendToRabbitMQ(queue, messageContent, headers);
            
            //IF WE REACH HERE, IT MEANS SENDTORABBITMQ WAS SUCCESSFUL, SO WE CAN ACKNOWLEDGE THE OLD MESSAGE
            channelMQ.ack(msg);
        }
		catch (error) 
		{
            console.error("Failed to retry message:", error);
            
			//IF DESIRED, YOU CAN NACK THE MESSAGE HERE IF SENDING FAILS. OTHERWISE, IT WILL JUST REMAIN UNACKNOWLEDGED.
            channelMQ.nack(msg, false, true); 
        }
    }
	else 
	{
        //MAX RETRIES REACHED, NEGATIVELY ACKNOWLEDGE (YOU CAN CONFIGURE DEAD-LETTER EXCHANGE TO HANDLE THESE)
        channelMQ.nack(msg, false, false);  // THE LAST ARGUMENT AS `FALSE` MEANS IT WILL NOT BE RE-QUEUED
    }
}



module.exports = 
{
getChannelMQ,
sendToRabbitMQ,
RetryQMessage
};