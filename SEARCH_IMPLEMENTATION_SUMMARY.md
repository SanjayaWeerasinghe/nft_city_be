# Search Implementation Summary

## Overview
A comprehensive search feature has been implemented that allows users to search across both users and NFTs by matching:
- **Username** (from Profile collection)
- **NFT Title** (from NFT Token collection)
- **Blockchain Token ID** (from NFT Token collection)

---

## Files Created/Modified

### 1. **Backend Validation** ✅
**File**: `/validation/searchValidation.js`
- Validates search query parameters
- Ensures searchText is provided and valid (1-200 characters)
- Supports pagination with `page` and `itemsPerPage` parameters

### 2. **Backend Controller** ✅
**File**: `/controller/search.js`
- Main search logic implementation
- `searchUsersAndNfts()` function handles:
  - Case-insensitive regex matching for username and title
  - Exact numeric matching for blockchain_token_id
  - Parallel database queries for optimal performance
  - Pagination support
  - Structured response with user and NFT results

### 3. **Routes Updated** ✅
**File**: `/routes/index.js`
- Added search validation import
- Added search controller import
- New route: `GET /search-service/search`
- Includes authentication and validation middleware

### 4. **API Documentation** 📚
**File**: `/SEARCH_API_DOCUMENTATION.md`
- Complete API endpoint documentation
- Request/response examples
- Query parameter descriptions
- Error handling documentation

### 5. **React Component Example** ⚛️
**File**: `/REACT_SEARCH_COMPONENT_EXAMPLE.jsx`
- Full React component with search functionality
- Includes state management
- Pagination support
- Separate sections for users and NFTs
- Basic CSS styles included

---

## API Endpoint Details

### Endpoint
```
GET /search-service/search
```

### Authentication
Required: Yes (Bearer token)

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| searchText | string | Yes | - | Search term (1-200 chars) |
| page | integer | No | 1 | Page number |
| itemsPerPage | integer | No | 20 | Items per page (max 100) |

### Example Request
```bash
curl -X GET "http://localhost:3000/search-service/search?searchText=crypto&page=1&itemsPerPage=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Search Behavior

1. **Username Search**: 
   - Searches `user_name` field in ProfileModel
   - Case-insensitive partial match
   - Returns user details including profile image, email, etc.

2. **NFT Title Search**: 
   - Searches `title` field in NftTokenModel
   - Case-insensitive partial match
   - Returns NFT details including price, status, creator info

3. **Blockchain Token ID Search**: 
   - Searches `blockchain_token_id` field in NftTokenModel
   - Exact numeric match only
   - Returns matching NFTs

---

## Database Queries Used

### Profile Search (MongoDB)
```javascript
ProfileModel.find({
    user_name: /searchText/i
})
```

### NFT Search (MongoDB)
```javascript
NftTokenModel.find({
    $or: [
        { blockchain_token_id: parseInt(searchText) },
        { title: /searchText/i }
    ]
})
```

---

## Response Structure

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "statusCode": 200,
  "data": {
    "searchText": "crypto",
    "pagination": {
      "currentPage": 1,
      "itemsPerPage": 20,
      "totalUsers": 5,
      "totalNfts": 12,
      "totalResults": 17,
      "totalPages": 1
    },
    "results": {
      "users": [...],
      "nfts": [...]
    }
  }
}
```

---

## Integration Steps for Frontend

### 1. Set up environment variable
```env
REACT_APP_API_URL=http://localhost:3000
```

### 2. Install axios (if not already installed)
```bash
npm install axios
```

### 3. Create search page/component
- Use the provided `REACT_SEARCH_COMPONENT_EXAMPLE.jsx` as a starting point
- Customize styling to match your design system
- Add routing in your React Router configuration

### 4. Add route to your React app
```javascript
import SearchPage from './pages/SearchPage';

<Route path="/search" element={<SearchPage />} />
```

---

## Testing the API

### Test with cURL
```bash
# Search by username
curl -X GET "http://localhost:3000/search-service/search?searchText=john" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by NFT title
curl -X GET "http://localhost:3000/search-service/search?searchText=artwork" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by blockchain token ID
curl -X GET "http://localhost:3000/search-service/search?searchText=12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test with Postman
1. Create new GET request
2. URL: `http://localhost:3000/search-service/search`
3. Add query params: `searchText`, `page`, `itemsPerPage`
4. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
5. Send request

---

## Performance Considerations

1. **Indexes**: Ensure MongoDB indexes exist on:
   - `ProfileModel.user_name`
   - `NftTokenModel.title`
   - `NftTokenModel.blockchain_token_id`

2. **Pagination**: Always use pagination for large result sets

3. **Parallel Queries**: The implementation uses `Promise.all()` to run user and NFT searches simultaneously

---

## Future Enhancements (Optional)

1. **Full-text search**: Implement MongoDB text search for better relevance
2. **Filters**: Add filters for NFT status, price range, date range
3. **Sort options**: Allow sorting by relevance, date, price
4. **Search history**: Save user search history
5. **Autocomplete**: Add search suggestions as user types
6. **Advanced search**: Support complex queries with multiple fields

---

## Project Structure Maintained ✅

The implementation follows your existing project patterns:
- ✅ Validation files in `/validation/`
- ✅ Controller files in `/controller/`
- ✅ Routes in `/routes/index.js`
- ✅ Uses existing middleware (authentication, validateRequest)
- ✅ Follows existing response format (successResponse, errorResponse)
- ✅ Consistent error handling
- ✅ MongoDB models usage

---

## Support

For issues or questions:
1. Check the API documentation: `SEARCH_API_DOCUMENTATION.md`
2. Review the React example: `REACT_SEARCH_COMPONENT_EXAMPLE.jsx`
3. Check console logs for detailed error messages

