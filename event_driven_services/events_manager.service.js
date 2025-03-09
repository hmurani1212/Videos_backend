/**
 * This module is responsible for handling various events such as 'executing_rule_engine', 'sent_counts_country_wise', etc.
 * Each event is triggered based on specific conditions and passes event data to respective handlers.
 * This module logs the response if it is successful.
 */

/**
 * Importing Basic data/connectivity services.
 ********************************************/

const axios               = require('axios');
const moment              = require('moment');
const Handlebars          = require('handlebars');
const {FB_REQ_URL}        = require("../config");
const eventEmitter        = require('../_core_app_connectivities/emitter');
const mongoose_connection = require('../_core_app_connectivities/db_mongo_mongoose');
const memcached_ops       = require('../_core_app_connectivities/memcache');
const rabbitmq_ops        = require('../_core_app_connectivities/rabbitmq');

//Import Accounts Services from Services Folder
const wa_account_services  = require("../services/wa_accounts.service");
const wa_template_services = require("../services/template.service");

//Importing Model for Billing log
// const wa_template_v2      = require("../models/wa_template_v2");

// Event listener for various events
eventEmitter.on('wa_main_event_handler', async (eventType, eventData) => {


    let current_unix = Math.floor(Date.now() / 1000);

    try {

        switch (eventType) {

            case 'archived_wa_template': 
            {
                
                const template_id          = eventData.template_id;
                const template_name        = eventData.template_name;
                const ref_meta_template_id = eventData.ref_meta_template_id;
                const account_id           = eventData.account_id;

                let response = await wa_template_services.archived_template(template_id, template_name, ref_meta_template_id, account_id);
                console.log("File: events_manager.service.js: 48 | eventType:archived_wa_template | Response: ",response);

                break;
            }

           

            case 'store_country_wise_states':
            {


                // Emit event to Report to Data Pulse
                eventEmitter.emit('report_to_datapulse',
                    {
                        datapulse_user_id: eventData.destination_country_id,
                        datapulse_activity_id: "WHATSAPP_COUNTRY_WISE_MESSAGE_SEND",
                        datapulse_activity_ref_id: eventData.account_id,
                        datapulse_event_label: String(eventData.destination_country_iso).toUpperCase(),
                        datapulse_adjustment: "add",
                        event_id: "WA_MESSAGE_SEND",
                        datapulse_event_count: 1,
                        datapulse_event_timestamp: parseInt(Math.floor(Date.now() / 1000)),
                    }
                );


                console.log("File: events_manager.service.js | eventType:store_country_wise_states | Event Data:", eventData);
                break;

            }

            // Add more cases for other events
            default:
                console.log(`No handler for event type: ${eventType}`);
        }

    } catch (error) {
        console.error(`Error handling event type: ${eventType}`, error);
    }

    console.log("File: events_manager.service.js | eventType:archived_wa_template | Event Type:", eventType);
    console.log("File: events_manager.service.js | eventType:archived_wa_template | Event Data:", eventData);

});

