
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const crypto = require("crypto");

// Multer disk storage for ID card images
const idCardStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = './uploads/id';
        if (!fs.existsSync(uploadDir)) {
            await mkdirp.sync(uploadDir);
        }
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomId = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        const filename = `${file.fieldname}_${timestamp}_${randomId}${ext}`;
        
        // Store file info directly in the request object with unique request ID
        if (!req.uploadedFiles) {
            req.uploadedFiles = [];
            req.requestId = `${timestamp}_${randomId}`; // Unique ID for this request
        }
        req.uploadedFiles.push({
            path: path.join('./uploads/id', filename),
            fieldName: file.fieldname,
            filename: filename,
            requestId: req.requestId // Tag each file with request ID
        });
        
        cb(null, filename);
    },
});

// Multer middleware for ID card images
const idCardUpload = multer({
    storage: idCardStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for ID cards'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Completely safe cleanup function - only cleans files for THIS specific request
const cleanupRequestFiles = (req) => {
    // If no files to cleanup, just return silently
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) return;
    
    const requestId = req.requestId;
    console.log(`🧹 Cleaning up files for request: ${requestId}`);
    
    req.uploadedFiles.forEach(file => {
        // Double-check: only clean files that belong to THIS request
        if (file && file.requestId === requestId && file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
                console.log(`✅ Cleaned up file for request ${requestId}: ${file.path}`);
            } catch (error) {
                // Log warning but never throw - file cleanup failure should never break signup
                console.warn(`⚠️ Failed to cleanup file ${file.path} for request ${requestId}: ${error.message}`);
                // Continue with other files even if one fails
            }
        } else {
            console.warn(`⚠️ Skipping file cleanup - file doesn't belong to request ${requestId}: ${file?.path}`);
        }
    });
    
    // Clear the request files array regardless of cleanup success/failure
    req.uploadedFiles = [];
    console.log(`🧹 Cleanup completed for request: ${requestId}`);
};

module.exports = {
    idCardUpload,
    cleanupRequestFiles
}