/**
 * 
 * This is a central service for reporting analytics to the data pulse service.
 * This following functions are attached to events which can be fired anywhere in the application, and the particular event
 * would be reported to data pulse service accordingly and seamlessly, this approch makes the application maintenance more convenient.
 * Plus it allows to add more reporting/analytics without any hassle.
 * 
 * You can either directly call the function reportToDataPulse() with the required data or emit an event with the data to be reported,
 * the event name should be "report_to_datapulse".
 * Whatever approach you choose, as per your technical requirement, the data will be reported to data pulse service.
 * 
 * Here is the format of the data that needs to be passed to the function or emitted with the event: 
 * 
 * event_data:
 * {
 *  datapulse_app_id: OneID Application ID,
 *  datapulse_user_id: User ID within the Application or 0 for global analytics,
 *	datapulse_activity_id: Data Pulse Activity ID,
 * 	datapulse_activity_ref_id: Reference ID for the Activity as per Application event/activity,
 * 	datapulse_event_label: Any label that you want to be reported with data, useful when rendering analytics based on this data.
 * 	datapulse_adjustment: "add" or "sub" for addition or subtraction of the event count,
 * 	datapulse_event_count: Int value to be reported as event count ie 1,
 * 	datapulse_event_timestamp: Unix timestamp of the event, if not provided, current timestamp will be used.
 * }
 * 
 ************************************************************************/


/**
 * 
 * Importing Basic data/connectivity services.
 * 
 ********************/
const eventEmitter = require('../_core_app_connectivities/emitter');
const mongoose_connection = require('../_core_app_connectivities/db_mongo_mongoose');
const memcached_ops = require('../_core_app_connectivities/memcache');
const rabbitmq_ops = require('../_core_app_connectivities/rabbitmq');


/**
 * 
 * Configuring the Data Pulse Service
 * 
 *********************/
const data_pulse_app_id = 8586; //OneID Application ID for Data Pulse Service



/*** 
*
*	Listen to events related to report_to_datapulse which actually process
*	the event data and reports it to data pulse service.
*
*	Make sure to add event_id to any unique event ID so that you can process
*	& customize event data in effortless way.
*
**********/
eventEmitter.on('report_to_datapulse', async (event_data) => {

	/**
	 * Start - Let's handle events to customize the data/event reporting to data pulse, if required.
	 ***/

	//Any customization to the event data can be done here.
	//if(event_data.event_id == "message_sent"){event_data.datapulse_event_label = "Custom Label";}




	/**
	 * Let's pass the modified event data to the data pulse function to be reported to data pulse service.
	 ***/
	reportToDataPulse(event_data);
});





/**
 * 
 * This function reports the data to data pulse service.
 * 
 * It accepts the following parameter in event_data array:
 * 
 * event_data:
 * {
 *     datapulse_app_id: OneID Application ID,
 *     datapulse_user_id: User ID within the Application or 0 for global analytics,
 *     datapulse_activity_id: Data Pulse Activity ID,
 *     datapulse_activity_ref_id: Reference ID for the Activity as per Application event/activity,
 *     datapulse_event_label: Any label that you want to be reported with data, useful when rendering analytics based on this data.
 *     datapulse_adjustment: "add" or "sub" for addition or subtraction of the event count,
 *     datapulse_event_count: Int value to be reported as event count ie 1,
 *     datapulse_event_timestamp: Unix timestamp of the event, if not provided, current timestamp will be used.
 * }
 * 
 * @param {array} event_data - It takes the data as explained above.
 * 
 **********/
async function reportToDataPulse(event_data)
{
	/**
	 * 	Setup body as per Data Pulse Requirements
	 ******/
	const queue_name = "data_pulse_queue";

	//Set undefined required fields.
	if (!event_data.datapulse_app_id) { event_data.datapulse_app_id = data_pulse_app_id; }
	if (!event_data.datapulse_adjustment) { event_data.datapulse_adjustment = "add"; }
	if (!event_data.datapulse_event_count) { event_data.datapulse_event_count = 1; }
	if (!event_data.datapulse_event_timestamp) { event_data.datapulse_event_timestamp = moment().unix(); }

	//Prepare Request body for Data Pulse, it expects array of objects.
	const q_msg_body =
		[
			{
				app_id: event_data.datapulse_app_id,
				user_id: event_data.datapulse_user_id,
				name: event_data.datapulse_activity_id,
				activity_ref_id: event_data.datapulse_activity_ref_id,
				event_label: event_data.datapulse_event_label,
				adjustment: event_data.datapulse_adjustment,
				event_count: event_data.datapulse_event_count,
				event_timestamp: event_data.datapulse_event_timestamp
			}
		];


	//Publish to RabbitMQ
	rabbitmq_ops.sendToRabbitMQ(queue_name, q_msg_body);
	console.log("Data Pulse Event Reported: ", q_msg_body);
}


