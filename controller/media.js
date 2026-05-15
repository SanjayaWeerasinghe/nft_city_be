const { getFileUrl, getContentType, isVideo } = require('../utils/helperMethod');

/**
 * Get a presigned URL for a file stored in S3
 * This allows secure, temporary access to private S3 files
 * 
 * Query params:
 * - key: The S3 key/path of the file (e.g., "images/abc123.png")
 * 
 * Returns:
 * - url: A temporary presigned URL that expires in 1 hour
 */
async function getFile(req, res) {
    try {
        const { key } = req.query;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'File key is required'
            });
        }

        console.log(`📥 Generating presigned URL for key: ${key}`);

        // Generate presigned URL
        let fileKey = key;

        // Check if key already has a folder prefix
        if (!key.includes('/')) {
            const contentType = getContentType(key);
            // Check if it's a video based on extension or content type
            if (isVideo(contentType) || isVideo(key)) {
                fileKey = `videos/${key}`;
            } else {
                fileKey = `images/${key}`;
            }
        }

        const signedUrl = await getFileUrl(fileKey);

        return res.status(200).json({
            success: true,
            message: 'Presigned URL generated successfully',
            data: {
                url: signedUrl,
                key: key,
                expiresIn: '1 hour'
            }
        });

    } catch (error) {
        console.error('Error in getFile:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate file URL',
            error: error.message
        });
    }
}

/**
 * Get presigned URLs for multiple files at once
 * 
 * Body params:
 * - keys: Array of S3 keys/paths
 * 
 * Returns:
 * - urls: Array of objects with key and url
 */
async function getMultipleFiles(req, res) {
    try {
        const { keys } = req.body;

        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Keys array is required'
            });
        }

        console.log(`📥 Generating presigned URLs for ${keys.length} files`);

        // Generate presigned URLs for all keys
        const urlPromises = keys.map(async (key) => {
            try {
                let fileKey = key;

                // Check if key already has a folder prefix
                if (!key.includes('/')) {
                    const contentType = getContentType(key);
                    if (isVideo(contentType) || isVideo(key)) {
                        fileKey = `videos/${key}`;
                    } else {
                        fileKey = `images/${key}`;
                    }
                }

                const url = await getFileUrl(fileKey);
                return { key, url, success: true };
            } catch (error) {
                return { key, error: error.message, success: false };
            }
        });

        const results = await Promise.all(urlPromises);

        return res.status(200).json({
            success: true,
            message: 'Presigned URLs generated',
            data: {
                files: results,
                expiresIn: '1 hour'
            }
        });

    } catch (error) {
        console.error('Error in getMultipleFiles:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate file URLs',
            error: error.message
        });
    }
}

module.exports = {
    getFile,
    getMultipleFiles
};
