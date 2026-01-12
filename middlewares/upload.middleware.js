/**
 * File Upload Middleware
 * Handles file uploads using multer
 */

const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for videos
const video_file_filter = (req, file, cb) => {
    // Accept video files only
    const allowed_mime_types = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-flv',
        'video/webm',
        'video/x-matroska'
    ];

    if (allowed_mime_types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max file size
    },
    fileFilter: video_file_filter
});

class upload_middleware {
    /**
     * Upload single video file
     */
    upload_video(req, res, next) {
        const upload_single = upload.single('video');
        
        upload_single(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error(`FILE: upload.middleware.js | upload_video | Multer error:`, err);
                
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        STATUS: "ERROR",
                        ERROR_FILTER: "INVALID_REQUEST",
                        ERROR_CODE: "VTAPP-06001",
                        ERROR_DESCRIPTION: "File size too large. Maximum size is 500MB"
                    });
                }
                
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-06002",
                    ERROR_DESCRIPTION: err.message || "File upload error"
                });
            } else if (err) {
                console.error(`FILE: upload.middleware.js | upload_video | Error:`, err);
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-06003",
                    ERROR_DESCRIPTION: err.message || "Invalid file"
                });
            }
            
            if (!req.file) {
                return res.status(400).json({
                    STATUS: "ERROR",
                    ERROR_FILTER: "INVALID_REQUEST",
                    ERROR_CODE: "VTAPP-06004",
                    ERROR_DESCRIPTION: "No video file provided"
                });
            }
            
            next();
        });
    }
}

module.exports = new upload_middleware();

