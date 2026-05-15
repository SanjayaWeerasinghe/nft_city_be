# Search API Documentation

## Search Endpoint

Search for users and NFTs by matching `blockchain_token_id`, `username`, or NFT `title`.

### Endpoint

```
GET /search-service/search
```

### Authentication

**Required**: Yes (Bearer token)

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| searchText | string | Yes | - | The search term to match against blockchain_token_id, username, or title (1-200 characters) |
| page | integer | No | 1 | Page number for pagination (minimum: 1) |
| itemsPerPage | integer | No | 20 | Number of items per page (1-100) |

### Example Requests

#### Search by Username
```bash
curl -X GET "http://localhost:3000/search-service/search?searchText=johndoe&page=1&itemsPerPage=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Search by NFT Title
```bash
curl -X GET "http://localhost:3000/search-service/search?searchText=CryptoArt&page=1&itemsPerPage=20" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Search by Blockchain Token ID
```bash
curl -X GET "http://localhost:3000/search-service/search?searchText=12345" \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "statusCode": 200,
  "data": {
    "searchText": "johndoe",
    "pagination": {
      "currentPage": 1,
      "itemsPerPage": 20,
      "totalUsers": 5,
      "totalNfts": 12,
      "totalResults": 17,
      "totalPages": 1
    },
    "results": {
      "users": [
        {
          "type": "user",
          "user_id": 123,
          "username": "johndoe",
          "display_name": "John Doe",
          "full_name": "John Michael Doe",
          "email": "john@example.com",
          "profile_image": "https://...",
          "cover_image": "https://...",
          "public_address": "0x..."
        }
      ],
      "nfts": [
        {
          "type": "nft",
          "nft_id": "507f1f77bcf86cd799439011",
          "blockchain_token_id": 12345,
          "title": "Amazing NFT Art",
          "description": "Description of the NFT",
          "resource_url": "https://...",
          "resource_type": "jpg",
          "price": 100,
          "creator_id": 123,
          "creator_username": "johndoe",
          "current_owner": 456,
          "on_sale": true,
          "status": "listed"
        }
      ]
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid or missing parameters
```json
{
  "success": false,
  "message": "Search text cannot be empty",
  "statusCode": 400
}
```

**401 Unauthorized** - Missing or invalid authentication token
```json
{
  "success": false,
  "message": "Authentication required",
  "statusCode": 401
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

### Search Behavior

1. **Username Search**: Case-insensitive partial matching on the `user_name` field in the Profile collection
2. **NFT Title Search**: Case-insensitive partial matching on the `title` field in the NFT collection
3. **Blockchain Token ID Search**: Exact matching on the `blockchain_token_id` field (numeric) in the NFT collection
4. **Results**: Returns both matching users and NFTs in a single response
5. **Pagination**: Applied to both users and NFTs separately

### Notes

- Search is case-insensitive for text fields
- Search supports partial matching for username and title
- Blockchain token ID requires exact numeric match
- Maximum 100 items per page
- Minimum search text length is 1 character, maximum is 200 characters

