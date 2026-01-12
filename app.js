const express         = require('express');
const bodyParser      = require('body-parser');
const cors            = require('cors');
const mongodb         = require('./_core_app_connectivities/db_mongo_mongoose');


const app = express();

// Configure CORS
app.use(cors({
    origin: '*', // In production, specify exact origins
    credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Trust proxy for accurate IP extraction
app.set('trust proxy', true);

// Import routes
const auth_routes = require('./routes/auth.routes');
const video_routes = require('./routes/video.routes');
const comment_routes = require('./routes/comment.routes');
const payment_routes = require('./routes/payment.routes');

// Register routes
app.use('/api/auth', auth_routes);
app.use('/api/videos', video_routes);
app.use('/api/comments', comment_routes);
app.use('/api/payments', payment_routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        STATUS: "SUCCESSFUL",
        message: "Pay Videos API is running",
        mongodb_status: mongodb.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        STATUS: "ERROR",
        ERROR_FILTER: "NOT_FOUND",
        ERROR_CODE: "VTAPP-10001",
        ERROR_DESCRIPTION: "Endpoint not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('FILE: app.js | Error handler | Error:', err);
    res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-10002",
        ERROR_DESCRIPTION: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

// Start server only after MongoDB connection is established
const start_server = async () => {
    try {
        // Connect to MongoDB first
        await mongodb.connect();
        
        // Then start the Express server
        app.listen(PORT, () => {
            console.log(`FILE: app.js | Server is running on port ${PORT}`);
            console.log(`FILE: app.js | MongoDB connection status: ${mongodb.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        });
    } catch (error) {
        console.error('FILE: app.js | Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
start_server();

