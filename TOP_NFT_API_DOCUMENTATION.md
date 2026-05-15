# Top NFTs API Documentation

## Overview

This API endpoint retrieves the top NFTs based on the number of orders they have received. It **only includes NFTs that are currently on sale** (status: "listed" and on_sale: true), ensuring that minted, sold, transferred, or cancelled NFTs are excluded.

---

## Endpoint

```
GET /nft-service/top-nfts
```

---

## Authentication

**Required**: No (Public endpoint)

This is a public endpoint that doesn't require authentication, making it perfect for displaying popular NFTs on your homepage or marketplace.

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 2 | Number of top NFTs to return (1-50) |

---

## Example Requests

### Get Top 2 NFTs (Default)
```bash
curl -X GET "http://localhost:3000/nft-service/top-nfts"
```

### Get Top 5 NFTs
```bash
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=5"
```

### Get Top 10 NFTs
```bash
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=10"
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Top NFTs retrieved successfully",
  "statusCode": 200,
  "data": {
    "total_nfts_on_sale": 25,
    "returned_count": 2,
    "topNfts": [
      {
        "nft_id": "507f1f77bcf86cd799439011",
        "blockchain_token_id": 12345,
        "title": "Amazing Digital Art",
        "description": "A beautiful piece of digital artwork",
        "resource_url": "https://example.com/nft-image.jpg",
        "resource_type": "jpg",
        "price": 150,
        "status": "listed",
        "on_sale": true,
        "creator": {
          "user_id": 123,
          "username": "artist_joe",
          "profile": {
            "user_id": 123,
            "user_name": "artist_joe",
            "first_name": "Joe",
            "middle_name": "Michael",
            "last_name": "Artist",
            "profile_image": "https://example.com/profile.jpg",
            "display_name": "Joe the Artist"
          }
        },
        "current_owner": {
          "user_id": 456,
          "profile": {
            "user_id": 456,
            "user_name": "collector_jane",
            "first_name": "Jane",
            "middle_name": null,
            "last_name": "Collector",
            "profile_image": "https://example.com/jane.jpg",
            "display_name": "Jane C."
          }
        },
        "order_statistics": {
          "total_orders": 25,
          "open_orders": 2,
          "sold_orders": 23
        }
      },
      {
        "nft_id": "507f1f77bcf86cd799439012",
        "blockchain_token_id": 12346,
        "title": "Crypto Punk Style",
        "description": "Cool crypto punk artwork",
        "resource_url": "https://example.com/punk.png",
        "resource_type": "png",
        "price": 200,
        "status": "listed",
        "on_sale": true,
        "creator": {
          "user_id": 789,
          "username": "punk_master",
          "profile": {
            "user_id": 789,
            "user_name": "punk_master",
            "first_name": "Mike",
            "middle_name": null,
            "last_name": "Punk",
            "profile_image": "https://example.com/mike.jpg",
            "display_name": "Punk Master"
          }
        },
        "current_owner": {
          "user_id": 789,
          "profile": {
            "user_id": 789,
            "user_name": "punk_master",
            "first_name": "Mike",
            "middle_name": null,
            "last_name": "Punk",
            "profile_image": "https://example.com/mike.jpg",
            "display_name": "Punk Master"
          }
        },
        "order_statistics": {
          "total_orders": 18,
          "open_orders": 3,
          "sold_orders": 15
        }
      }
    ]
  }
}
```

### Success Response - No NFTs on Sale

```json
{
  "success": true,
  "message": "Top NFTs retrieved successfully",
  "statusCode": 200,
  "data": {
    "message": "No NFTs currently on sale",
    "topNfts": []
  }
}
```

### Error Responses

**400 Bad Request** - Invalid limit parameter
```json
{
  "success": false,
  "message": "Limit must be between 1 and 50",
  "statusCode": 400
}
```

**500 Internal Server Error** - Server error
```json
{
  "success": false,
  "message": "Operation failed",
  "statusCode": 500
}
```

---

## How It Works

### 1. **Filtering Criteria**
The endpoint only considers NFTs that meet ALL of these conditions:
- ✅ `on_sale: true`
- ✅ `status: "listed"`
- ❌ Excludes: minted, sold, transferred, cancelled NFTs

### 2. **Ranking Algorithm**
NFTs are ranked by **total_orders** (descending order):
- Counts ALL orders (open, sold, close) for each NFT
- More orders = higher popularity = higher ranking
- Shows total demand/interest in the NFT

### 3. **Order Statistics Included**
For each NFT, the response includes:
- `total_orders`: All orders ever created for this NFT
- `open_orders`: Currently active orders (available for purchase)
- `sold_orders`: Completed/sold orders (historical sales)

### 4. **Profile Information**
Enriches NFT data with:
- Creator profile details
- Current owner profile details
- Profile images and display names

---

## Use Cases

### 1. **Homepage Featured Section**
Display the most popular NFTs on your marketplace homepage:
```javascript
// Get top 3 NFTs for hero section
GET /nft-service/top-nfts?limit=3
```

### 2. **Trending NFTs Page**
Show trending/hot NFTs based on order activity:
```javascript
// Get top 10 trending NFTs
GET /nft-service/top-nfts?limit=10
```

### 3. **Marketplace Recommendations**
Recommend popular NFTs to new users:
```javascript
// Get top 5 recommended NFTs
GET /nft-service/top-nfts?limit=5
```

---

## Response Fields Explained

### NFT Fields
| Field | Type | Description |
|-------|------|-------------|
| nft_id | string | MongoDB ObjectId of the NFT |
| blockchain_token_id | number | Blockchain token ID |
| title | string | NFT title |
| description | string | NFT description |
| resource_url | string | URL to the NFT media file |
| resource_type | string | File type (jpg, png, mp4, etc.) |
| price | number | Current price |
| status | string | Always "listed" for this endpoint |
| on_sale | boolean | Always true for this endpoint |

### Creator & Owner Fields
| Field | Type | Description |
|-------|------|-------------|
| user_id | number | User ID |
| username | string | Username |
| profile | object | Full profile details |

### Order Statistics
| Field | Type | Description |
|-------|------|-------------|
| total_orders | number | Total number of orders (all time) |
| open_orders | number | Currently active orders |
| sold_orders | number | Number of completed sales |

---

## Performance Considerations

1. **Aggregation Pipeline**: Uses MongoDB aggregation for efficient order counting
2. **Parallel Queries**: Fetches profiles in batch after filtering
3. **Index Requirements**: Ensure indexes exist on:
   - `NftTokenModel.on_sale`
   - `NftTokenModel.status`
   - `OrderModel.nft_id`
   - `OrderModel.status`

---

## Testing Examples

### Using cURL
```bash
# Get top 2 NFTs
curl -X GET "http://localhost:3000/nft-service/top-nfts"

# Get top 10 NFTs
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=10"
```

### Using JavaScript/Axios
```javascript
const axios = require('axios');

// Get top 5 NFTs
const response = await axios.get('http://localhost:3000/nft-service/top-nfts', {
  params: { limit: 5 }
});

console.log(response.data.data.topNfts);
```

### Using Postman
1. Create new GET request
2. URL: `http://localhost:3000/nft-service/top-nfts`
3. Add query param: `limit` = `5` (optional)
4. Send request

---

## React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopNFTs = ({ limit = 2 }) => {
  const [topNfts, setTopNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopNfts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/nft-service/top-nfts`,
          { params: { limit } }
        );
        
        if (response.data.success) {
          setTopNfts(response.data.data.topNfts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNfts();
  }, [limit]);

  if (loading) return <div>Loading top NFTs...</div>;
  if (error) return <div>Error: {error}</div>;
  if (topNfts.length === 0) return <div>No NFTs currently on sale</div>;

  return (
    <div className="top-nfts">
      <h2>Top {limit} NFTs</h2>
      <div className="nft-grid">
        {topNfts.map((nft) => (
          <div key={nft.nft_id} className="nft-card">
            <img src={nft.resource_url} alt={nft.title} />
            <h3>{nft.title}</h3>
            <p>Price: {nft.price} NUC</p>
            <p>By: @{nft.creator.username}</p>
            <div className="stats">
              <span>🔥 {nft.order_statistics.total_orders} orders</span>
              <span>📦 {nft.order_statistics.open_orders} available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopNFTs;
```

---

## Key Features ✨

✅ **Only On-Sale NFTs**: Automatically filters out minted, sold, or cancelled NFTs  
✅ **Popularity-Based**: Ranks by total order count  
✅ **Rich Data**: Includes creator and owner profiles  
✅ **Order Statistics**: Shows total, open, and sold order counts  
✅ **Public Access**: No authentication required  
✅ **Flexible Limit**: Request 1-50 top NFTs  
✅ **Performance Optimized**: Uses aggregation and batch queries  

---

## Notes

- The endpoint returns NFTs sorted by `total_orders` in descending order
- If fewer NFTs are on sale than the requested limit, it returns all available
- The `total_orders` count includes all order statuses (open, sold, close, cancel)
- Creator and current owner might be the same person if the NFT hasn't been sold yet
- This is a public endpoint, perfect for displaying on public-facing pages

---

## Support

For issues or questions about this API endpoint, please refer to:
- Main API documentation
- Your project's support channels

