const express         = require('express');
const bodyParser      = require('body-parser');
const redisConnection = require('./_core_app_connectivities/redis'); // Redis connection


const app = express();
app.use(bodyParser.json());



app.listen(3000, () => {
    console.log('File: app.js | Line: 12 | Server is running on port 3000');
});

