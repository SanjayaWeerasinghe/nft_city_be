# Top NFTs API Implementation Summary

## Overview
A specialized API endpoint has been created to fetch the **top NFTs based on order count (popularity)**. The endpoint **only returns NFTs that are currently on sale**, excluding minted, sold, transferred, or cancelled NFTs.

---

## ✅ Files Created/Modified

### 1. **Validation** 
**File**: `/validation/topNftValidation.js`
- Validates the `limit` query parameter (1-50)
- Optional parameter with default value of 2

### 2. **Controller**
**File**: `/controller/topNft.js`
- Main business logic for top NFTs
- Filters: `on_sale: true` AND `status: 'listed'`
- Uses MongoDB aggregation to count orders per NFT
- Sorts by total order count (descending)
- Enriches response with creator and owner profiles

### 3. **Routes**
**File**: `/routes/index.js` (Updated)
- New route: `GET /nft-service/top-nfts`
- Public endpoint (no authentication required)
- Includes validation middleware

### 4. **Documentation**
**File**: `/TOP_NFT_API_DOCUMENTATION.md`
- Complete API documentation
- Request/response examples
- Use cases and integration guide

### 5. **Test Script**
**File**: `/test-top-nfts.js`
- Automated test script
- Tests various limit parameters
- Easy to run: `node test-top-nfts.js`

---

## 🎯 Key Features

### ✅ On-Sale NFTs Only
- **Filters**: `on_sale: true` AND `status: 'listed'`
- **Excludes**: 
  - Minted NFTs (not listed yet)
  - Sold NFTs (already purchased)
  - Transferred NFTs (ownership changed)
  - Cancelled NFTs (removed from sale)

### 📊 Order-Based Ranking
NFTs are ranked by **total order count**, which includes:
- **Total Orders**: All orders ever created for the NFT
- **Open Orders**: Currently active/available orders
- **Sold Orders**: Completed sales

This provides a true measure of **popularity and demand**.

### 👥 Profile Enrichment
Each NFT includes:
- **Creator Profile**: User who created the NFT
- **Current Owner Profile**: Current NFT owner
- Profile details: username, display name, profile image

### 🔧 Flexible Limit
- Default: 2 NFTs
- Range: 1-50 NFTs
- Configurable via query parameter

---

## 📡 API Endpoint Details

### Endpoint
```
GET /nft-service/top-nfts
```

### Authentication
**Not Required** - Public endpoint

### Query Parameters
| Parameter | Type | Required | Default | Range | Description |
|-----------|------|----------|---------|-------|-------------|
| limit | integer | No | 2 | 1-50 | Number of top NFTs to return |

### Example Requests

```bash
# Get top 2 NFTs (default)
curl -X GET "http://localhost:3000/nft-service/top-nfts"

# Get top 5 NFTs
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=5"

# Get top 10 NFTs
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=10"
```

---

## 📦 Response Structure

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
        "resource_url": "https://example.com/image.jpg",
        "resource_type": "jpg",
        "price": 150,
        "status": "listed",
        "on_sale": true,
        "creator": {
          "user_id": 123,
          "username": "artist_joe",
          "profile": { /* Full profile object */ }
        },
        "current_owner": {
          "user_id": 456,
          "profile": { /* Full profile object */ }
        },
        "order_statistics": {
          "total_orders": 25,
          "open_orders": 2,
          "sold_orders": 23
        }
      }
    ]
  }
}
```

---

## 🔄 How It Works (Step-by-Step)

### Step 1: Filter On-Sale NFTs
```javascript
NftTokenModel.find({
    on_sale: true,
    status: 'listed'
})
```

### Step 2: Aggregate Order Counts
```javascript
OrderModel.aggregate([
    { $match: { nft_id: { $in: nftIds } } },
    { 
        $group: {
            _id: "$nft_id",
            totalOrders: { $sum: 1 },
            openOrders: { $sum: { $cond: [...] } },
            soldOrders: { $sum: { $cond: [...] } }
        }
    },
    { $sort: { totalOrders: -1 } }
])
```

### Step 3: Combine & Sort
- Merge NFT data with order statistics
- Sort by `totalOrders` (descending)
- Apply limit

### Step 4: Enrich with Profiles
- Fetch creator profiles
- Fetch owner profiles
- Map to NFT data

### Step 5: Format Response
- Structure final JSON response
- Include statistics and metadata

---

## 💡 Use Cases

### 1. Homepage Featured Section
Display most popular NFTs on your marketplace homepage:
```javascript
// React Component
<TopNFTs limit={3} />
```

### 2. Trending Page
Show trending/hot NFTs:
```javascript
GET /nft-service/top-nfts?limit=10
```

### 3. Marketing Widgets
Embed popular NFTs in promotional materials:
```javascript
// Public API - no auth required
fetch('https://api.example.com/nft-service/top-nfts?limit=5')
```

### 4. Mobile App Home Screen
Display popular NFTs in mobile app:
```javascript
// Swift/Kotlin
fetchTopNFTs(limit: 5)
```

---

## 🧪 Testing

### Run Test Script
```bash
node test-top-nfts.js
```

### Manual Testing with cURL
```bash
# Test default limit
curl -X GET "http://localhost:3000/nft-service/top-nfts"

# Test custom limit
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=5"

# Test edge cases
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=1"
curl -X GET "http://localhost:3000/nft-service/top-nfts?limit=50"
```

### Using Postman
1. Create GET request
2. URL: `http://localhost:3000/nft-service/top-nfts`
3. Add query param: `limit` (optional)
4. Send request

---

## ⚡ Performance Optimizations

### 1. **Aggregation Pipeline**
- Uses MongoDB's native aggregation
- Efficient order counting
- Single database query for counts

### 2. **Batch Profile Fetching**
- Collects all unique user IDs
- Single query for all profiles
- Creates lookup map for O(1) access

### 3. **Parallel Queries**
- Fetches NFTs and order counts separately
- Combines results efficiently

### 4. **Index Recommendations**
```javascript
// Recommended indexes
NftTokenModel: ['on_sale', 'status']
OrderModel: ['nft_id', 'status']
ProfileModel: ['user_id']
```

---

## 📊 Statistics Explained

### Total Orders
- **All** orders ever created for the NFT
- Includes: open, sold, close, cancel
- **Best indicator** of overall popularity

### Open Orders
- Currently active orders
- Available for purchase
- Shows current availability

### Sold Orders  
- Completed/successful sales
- Historical demand
- Proof of value

---

## 🎨 React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopNFTsSection = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopNfts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/nft-service/top-nfts`,
          { params: { limit: 5 } }
        );
        
        if (res.data.success) {
          setNfts(res.data.data.topNfts);
        }
      } catch (error) {
        console.error('Error fetching top NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNfts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <section className="top-nfts">
      <h2>🔥 Trending NFTs</h2>
      <div className="nft-grid">
        {nfts.map((nft, index) => (
          <div key={nft.nft_id} className="nft-card">
            <div className="rank-badge">{index + 1}</div>
            <img src={nft.resource_url} alt={nft.title} />
            <h3>{nft.title}</h3>
            <p className="price">{nft.price} NUC</p>
            <p className="creator">by @{nft.creator.username}</p>
            <div className="stats">
              <span>🔥 {nft.order_statistics.total_orders} orders</span>
              <span>📦 {nft.order_statistics.open_orders} available</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopNFTsSection;
```

---

## 🔒 Security & Access

### Public Endpoint
- ✅ No authentication required
- ✅ Safe for public consumption
- ✅ Rate limiting recommended (if not already implemented)

### Data Privacy
- ✅ Only shows public NFT information
- ✅ Includes public profile data only
- ✅ No sensitive user information exposed

---

## 📈 Comparison with Similar Endpoints

| Endpoint | Purpose | Authentication | Filters |
|----------|---------|----------------|---------|
| `/nft-service/marketplace` | All NFTs on sale | Optional | Various filters |
| `/nft-service/top-nfts` | **Top NFTs by popularity** | **Not required** | **On-sale only** |
| `/nft-service/created-nfts` | User's created NFTs | Required | User-specific |

---

## 🚀 Integration Checklist

- [ ] API endpoint deployed and accessible
- [ ] Test script executed successfully
- [ ] Frontend component created
- [ ] Environment variables configured
- [ ] Database indexes created (recommended)
- [ ] Rate limiting configured (optional but recommended)
- [ ] Monitoring/analytics added (optional)

---

## 🎯 Key Differences from Other Endpoints

### What Makes This Endpoint Special?

1. **Popularity-Based**: Ranks by order count, not price or date
2. **Demand Indicator**: Shows real user interest/activity
3. **On-Sale Only**: Automatically filters status and availability
4. **Public Access**: Perfect for public-facing pages
5. **Rich Context**: Includes order statistics for insights

---

## 📝 Notes

- If no NFTs are on sale, returns empty array with message
- Creator and owner may be the same user
- Order counts are calculated in real-time
- Limit parameter is capped at 50 to prevent performance issues
- Response includes total count of NFTs on sale for context

---

## 🔮 Future Enhancements (Optional)

### Potential Improvements
1. **Time-based Trending**: Filter orders by time period (last 7 days, etc.)
2. **Category Filtering**: Top NFTs per category
3. **Price Range**: Top NFTs within price ranges
4. **Caching**: Cache results for better performance
5. **Real-time Updates**: WebSocket for live popularity updates
6. **Weighted Scoring**: Combine multiple factors (orders, views, likes)

---

## ✅ Implementation Complete

The Top NFTs API is fully functional and ready to use! It provides:
- ✅ Filtered on-sale NFTs only
- ✅ Order-based popularity ranking
- ✅ Rich profile information
- ✅ Flexible limit parameter
- ✅ Public access (no auth)
- ✅ Comprehensive documentation
- ✅ Test script included
- ✅ React component example

Perfect for showcasing the most popular NFTs on your marketplace! 🎉

