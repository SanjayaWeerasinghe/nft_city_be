# Media Service API Documentation

## Overview
The Media Service provides secure access to files stored in AWS S3 through presigned URLs. These URLs are temporary (expire after 1 hour) and allow the frontend to access private S3 files without exposing AWS credentials.

## Why Presigned URLs?

Your S3 bucket is **private** by default, which is the secure approach. Instead of making files public, we generate temporary URLs that:
- ✅ Expire after 1 hour (configurable)
- ✅ Don't expose AWS credentials
- ✅ Can be revoked by changing bucket permissions
- ✅ Provide controlled access to private files

---

## Endpoints

### 1. Get Single File URL

**GET** `/media-service/file`

Generate a presigned URL for a single file.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes | The S3 key/path of the file (e.g., `images/abc123.png`) |

#### Example Request
```bash
GET http://your-api.com/media-service/file?key=images/2323ab6d5a0a92379d7cf54b3afc3358.png
```

#### Example Response
```json
{
  "success": true,
  "message": "Presigned URL generated successfully",
  "data": {
    "url": "https://nucoin-uploads.s3.ap-southeast-2.amazonaws.com/images/2323ab6d5a0a92379d7cf54b3afc3358.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
    "key": "images/2323ab6d5a0a92379d7cf54b3afc3358.png",
    "expiresIn": "1 hour"
  }
}
```

---

### 2. Get Multiple File URLs

**POST** `/media-service/files`

Generate presigned URLs for multiple files at once.

#### Request Body
```json
{
  "keys": [
    "images/file1.png",
    "images/file2.jpg",
    "videos/video1.mp4"
  ]
}
```

#### Example Response
```json
{
  "success": true,
  "message": "Presigned URLs generated",
  "data": {
    "files": [
      {
        "key": "images/file1.png",
        "url": "https://nucoin-uploads.s3.ap-southeast-2.amazonaws.com/images/file1.png?X-Amz-Algorithm=...",
        "success": true
      },
      {
        "key": "images/file2.jpg",
        "url": "https://nucoin-uploads.s3.ap-southeast-2.amazonaws.com/images/file2.jpg?X-Amz-Algorithm=...",
        "success": true
      },
      {
        "key": "videos/video1.mp4",
        "url": "https://nucoin-uploads.s3.ap-southeast-2.amazonaws.com/videos/video1.mp4?X-Amz-Algorithm=...",
        "success": true
      }
    ],
    "expiresIn": "1 hour"
  }
}
```

---

## Frontend Integration

### React/JavaScript Example

```javascript
// Function to get a presigned URL for displaying an image
async function getImageUrl(s3Key) {
  try {
    const response = await fetch(
      `http://your-api.com/media-service/file?key=${encodeURIComponent(s3Key)}`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      console.error('Failed to get image URL:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return null;
  }
}

// Usage in a React component
function NFTImage({ s3Key }) {
  const [imageUrl, setImageUrl] = useState(null);
  
  useEffect(() => {
    async function loadImage() {
      const url = await getImageUrl(s3Key);
      setImageUrl(url);
    }
    loadImage();
  }, [s3Key]);
  
  if (!imageUrl) return <div>Loading...</div>;
  
  return <img src={imageUrl} alt="NFT" />;
}
```

### Get Multiple Files

```javascript
async function getMultipleImageUrls(s3Keys) {
  try {
    const response = await fetch('http://your-api.com/media-service/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys: s3Keys })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Returns array of { key, url, success }
      return data.data.files;
    }
  } catch (error) {
    console.error('Error fetching multiple URLs:', error);
    return [];
  }
}

// Usage
const files = await getMultipleImageUrls([
  'images/nft1.png',
  'images/nft2.png',
  'images/nft3.png'
]);

files.forEach(file => {
  if (file.success) {
    console.log(`${file.key}: ${file.url}`);
  }
});
```

---

## How It Works

1. **Upload**: When you upload a file, it's stored in S3 with a key (e.g., `images/abc123.png`)
2. **Store Key**: Save only the S3 key in your database (not the full URL)
3. **Display**: When you need to display the file, call the media service API with the key
4. **Get URL**: The API generates a temporary presigned URL
5. **Use URL**: Use this URL in `<img>` tags, video players, etc.
6. **Expires**: The URL expires after 1 hour for security

---

## Error Responses

### Missing Key
```json
{
  "success": false,
  "message": "File key is required"
}
```

### File Not Found
```json
{
  "success": false,
  "message": "Failed to generate file URL",
  "error": "The specified key does not exist."
}
```

---

## Best Practices

> [!TIP]
> **Cache URLs on the frontend**: Since URLs expire after 1 hour, you can cache them for ~50 minutes to reduce API calls.

> [!IMPORTANT]
> **Store only S3 keys in your database**, not full URLs. URLs are temporary and will expire.

> [!WARNING]
> **Don't share presigned URLs publicly** - they grant temporary access to your private files.

---

## Configuration

The presigned URL expiration time is set to **1 hour (3600 seconds)** in [helperMethod.js](file:///Users/fahad/Desktop/nft-market-place/nft-city-backend/utils/helperMethod.js#L127).

To change the expiration time, modify the `expiresIn` parameter:

```javascript
const signedUrl = await getSignedUrl(s3Client, command, { 
  expiresIn: 3600  // Change this value (in seconds)
});
```

Common values:
- 15 minutes: `900`
- 1 hour: `3600`
- 24 hours: `86400`
- 7 days: `604800` (max allowed by AWS)
