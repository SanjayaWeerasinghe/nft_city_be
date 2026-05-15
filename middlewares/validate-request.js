
const { validationResult } = require("express-validator");
const fs = require("fs");

const validateRequest = (req, res, next) => {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails - ONLY for this request
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
         const requestId = req.requestId;
         console.log(`🧹 Validation failed - cleaning up files for request: ${requestId}`);
         
         req.uploadedFiles.forEach(file => {
            // Double-check: only clean files that belong to THIS request
            if (file && file.requestId === requestId && file.path && fs.existsSync(file.path)) {
               try {
                  fs.unlinkSync(file.path);
                  console.log(`✅ Cleaned up file on validation error for request ${requestId}: ${file.path}`);
               } catch (error) {
                  console.warn(`⚠️ Failed to cleanup file ${file.path} for request ${requestId}: ${error.message}`);
                  // Don't let file cleanup errors break the validation response
               }
            }
         });
         
         // Clear the uploaded files array
         req.uploadedFiles = [];
      }

      let error = errors.array().map((err) => {
         return { message: err.msg, field: err.param };
      });
      return res.status(400).json({ success: false, errors: error });
   }
   next()
}

module.exports = {
   validateRequest
}