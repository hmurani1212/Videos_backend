const express         = require('express');
const bodyParser      = require('body-parser');
const bullmqRoutes    = require('./routes/bullmq.routes');
const redisConnection = require('./_core_app_connectivities/redis'); // Redis connection
const send_email_notification = require('./_bg_services/send_email_notification');
const send_acc_task_reminder  = require('./_bg_services/send_acc_task_reminder');
// const send_data_to_webhook    = require('./_bg_services/send_data_to_webhook');
