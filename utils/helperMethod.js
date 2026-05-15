const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs-extra');
const path = require('path');

// Initialize S3-compatible client (Contabo Object Storage)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu2',
  endpoint: process.env.S3_ENDPOINT || 'https://eu2.contabostorage.com',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;

function generateOTP() {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

function isVideo(type) {
  return RegExp('video|VIDEO|mp4|MP4|MOV|mov').test(type);
}
// AWS S3 Upload Function
// Note: S3 doesn't have traditional "folders" - it uses a flat structure with keys
// When you upload with Key='images/file.png', S3 automatically creates the path structure
// No need to manually create folders like with local file systems!
async function upload({ Key, Body }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('📤 Uploading to S3...');
      console.log('Key:', Key);
      console.log('Bucket:', BUCKET_NAME);
      console.log('Body type:', Body instanceof Buffer ? 'Buffer' : typeof Body);

      // Prepare S3 upload parameters
      // S3 automatically handles the path structure - if Key is 'images/subfolder/file.png',
      // S3 will create the appearance of folders without you needing to create them first
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: Key, // Full path including any "folders" - S3 handles this automatically
        Body: Body,
        ContentType: getContentType(Key), // Auto-detect content type
      };

      // Upload to S3 - this will succeed even if the "path" doesn't exist
      const command = new PutObjectCommand(uploadParams);
      const data = await s3Client.send(command);

      // Construct the S3 URL
      const location = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${Key}`;

      console.log(`✅ File uploaded successfully to S3: ${location}`);

      resolve({
        Location: location,
        Key: Key,
        Bucket: BUCKET_NAME,
        ETag: data.ETag
      });
    } catch (err) {
      console.error('❌ S3 Upload Error:', err);
      reject(err);
    }
  });
}

// Helper function to determine content type based on file extension
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// ========================================
// OLD LOCAL UPLOAD METHOD (COMMENTED OUT)
// ========================================
/*
function upload({ Key, Body }) {
  return new Promise((resolve, reject) => {
    try {
      // Local file storage
      console.log("key", Key, "body ", Body)
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      console.log("Upload directory", uploadsDir, "actuall path", Key)
      const filePath = path.join(uploadsDir, Key);
      const dirPath = path.dirname(filePath);

{{ ... }}
    } catch (err) {
      reject(err);
    }
  })
}
*/

// Generate presigned URL for secure file access
// This creates a temporary URL that expires after 1 hour
async function getFileUrl(key) {
  try {
    console.log("key", key)
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Generate presigned URL that expires in 1 hour (3600 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // console.log(`🔗 Generated presigned URL for: ${key}`);
    return signedUrl;
  } catch (err) {
    console.error('❌ Error generating presigned URL:', err);
    throw err;
  }
}

function uploadLocal({ Key, Body }) {
  return new Promise((resolve, reject) => {
    try {
      // S3 upload - commented out for local development
      // s3.upload({ Bucket, Key, Body }, function(err, data) {
      //     if(err) return reject(err);
      //     resolve(data);
      // })

      // Local file storage
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      console.log("Upload direee", uploadsDir, "actuall apthj", Key)
      const filePath = path.join(uploadsDir, Key);
      const dirPath = path.dirname(filePath);

      // Ensure directory exists
      fs.ensureDirSync(dirPath);

      // Write file
      fs.writeFileSync(filePath, Body);

      console.log(`📁 File saved locally: ${filePath}`);
      resolve({ Location: filePath, Key });
    } catch (err) {
      reject(err);
    }
  })
}

module.exports = {
  generateOTP,
  isVideo,
  upload,
  getFileUrl,
  getContentType,
  uploadLocal
}

