# API Documentation

## Base URL
- Development: `http://localhost:8081/api`
- Production: `https://your-domain.com/api`

## Authentication

All API requests require a Twitch Extension JWT token in the Authorization header:

```
Authorization: Bearer <twitch_jwt_token>
```

The JWT token is automatically provided by the Twitch Extension Helper and contains:
- `user_id`: Twitch user ID
- `channel_id`: Twitch channel ID
- `role`: User role (broadcaster, moderator, or viewer)

---

## Endpoints

### Authentication

#### Verify Token
Verify the current authentication token and get user info.

```http
GET /api/auth/verify
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "userId": "123456789",
    "channelId": "123456789",
    "role": "broadcaster"
  }
}
```

---

### Tier Lists

#### Create Tier List
Create a new tier list. **Broadcaster only.**

```http
POST /api/tierlists
```

**Request Body:**
```json
{
  "title": "Best Video Games of All Time",
  "items": [
    {
      "id": "1",
      "name": "The Legend of Zelda",
      "imageUrl": "https://example.com/zelda.jpg"
    },
    {
      "id": "2",
      "name": "Super Mario Bros",
      "imageUrl": "https://example.com/mario.jpg"
    }
  ],
  "tiers": ["S", "A", "B", "C", "D", "F"]
}
```

**Response:**
```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
  "channelId": "123456789",
  "channelName": "streamer_name",
  "title": "Best Video Games of All Time",
  "items": [...],
  "tiers": ["S", "A", "B", "C", "D", "F"],
  "status": "draft",
  "allowRealTimeUpdates": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Get All Tier Lists
Get all tier lists for the current channel.

```http
GET /api/tierlists
```

**Response:**
```json
[
  {
    "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
    "channelId": "123456789",
    "title": "Best Video Games of All Time",
    "items": [...],
    "tiers": ["S", "A", "B", "C", "D", "F"],
    "status": "active",
    "startTime": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

#### Get Tier List by ID
Get a specific tier list.

```http
GET /api/tierlists/:id
```

**Response:** Same as single tier list object above.

---

#### Update Tier List
Update an existing tier list. **Broadcaster only.**

```http
PUT /api/tierlists/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "items": [...],
  "tiers": ["S", "A", "B", "C", "D"],
  "status": "draft"
}
```

**Response:** Updated tier list object.

---

#### Activate Tier List
Activate a tier list for voting. Deactivates any currently active tier lists. **Broadcaster only.**

```http
POST /api/tierlists/:id/activate
```

**Response:**
```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
  "status": "active",
  "startTime": "2024-01-01T12:00:00.000Z",
  ...
}
```

---

#### Complete Tier List
Mark a tier list as completed. **Broadcaster only.**

```http
POST /api/tierlists/:id/complete
```

**Response:**
```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
  "status": "completed",
  "endTime": "2024-01-01T13:00:00.000Z",
  ...
}
```

---

#### Get Tier List Results
Get aggregated voting results for a tier list.

```http
GET /api/tierlists/:id/results
```

**Response:**
```json
{
  "tierList": {
    "_id": "60f1b2c3d4e5f6a7b8c9d0e1",
    "title": "Best Video Games of All Time",
    ...
  },
  "results": [
    {
      "item": {
        "id": "1",
        "name": "The Legend of Zelda",
        "imageUrl": "https://example.com/zelda.jpg"
      },
      "tierCounts": {
        "S": 45,
        "A": 12,
        "B": 3,
        "C": 0,
        "D": 0,
        "F": 0
      },
      "totalVotes": 60,
      "averageTier": "S"
    },
    {
      "item": {
        "id": "2",
        "name": "Super Mario Bros",
        "imageUrl": "https://example.com/mario.jpg"
      },
      "tierCounts": {
        "S": 20,
        "A": 30,
        "B": 10,
        "C": 0,
        "D": 0,
        "F": 0
      },
      "totalVotes": 60,
      "averageTier": "A"
    }
  ],
  "totalVoters": 60
}
```

**Tier Calculation:**
The average tier is calculated using weighted values:
- S = 6 points
- A = 5 points
- B = 4 points
- C = 3 points
- D = 2 points
- F = 1 point

Average = Sum of (tier_value × vote_count) / total_votes

---

#### Reset Tier List Votes
Delete all votes for a tier list. **Broadcaster only.**

```http
POST /api/tierlists/:id/reset
```

**Response:**
```json
{
  "message": "Votes reset successfully"
}
```

---

### Votes

#### Submit Vote
Submit or update a vote for a tier list. Each user can only vote once per tier list.

```http
POST /api/votes
```

**Request Body:**
```json
{
  "tierListId": "60f1b2c3d4e5f6a7b8c9d0e1",
  "votes": [
    {
      "itemId": "1",
      "tier": "S"
    },
    {
      "itemId": "2",
      "tier": "A"
    }
  ]
}
```

**Response:**
```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e2",
  "tierListId": "60f1b2c3d4e5f6a7b8c9d0e1",
  "channelId": "123456789",
  "userId": "987654321",
  "username": "viewer_name",
  "votes": [
    {
      "itemId": "1",
      "tier": "S"
    },
    {
      "itemId": "2",
      "tier": "A"
    }
  ],
  "createdAt": "2024-01-01T12:05:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```

**Notes:**
- Submitting a vote for an already-voted tier list will update the existing vote
- All items in the tier list must be voted on
- The tier list must be in "active" status

---

#### Get User Vote
Get the current user's vote for a tier list.

```http
GET /api/votes/:tierListId
```

**Response:**
```json
{
  "_id": "60f1b2c3d4e5f6a7b8c9d0e2",
  "tierListId": "60f1b2c3d4e5f6a7b8c9d0e1",
  "userId": "987654321",
  "votes": [
    {
      "itemId": "1",
      "tier": "S"
    },
    {
      "itemId": "2",
      "tier": "A"
    }
  ],
  "createdAt": "2024-01-01T12:05:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "No vote found"
}
```

---

## WebSocket Events

WebSocket endpoint: `ws://localhost:8081/ws`

### Client → Server

#### Authentication
Must be sent immediately after connecting.

```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Vote Update Notification
Notify other clients in the channel about a vote update.

```json
{
  "type": "vote_update",
  "data": {
    "tierListId": "60f1b2c3d4e5f6a7b8c9d0e1"
  }
}
```

### Server → Client

#### Authentication Success
```json
{
  "type": "auth_success",
  "userId": "987654321",
  "channelId": "123456789",
  "role": "viewer"
}
```

#### Vote Update Broadcast
Sent to all clients in the channel when someone votes.

```json
{
  "type": "vote_update",
  "data": {
    "tierListId": "60f1b2c3d4e5f6a7b8c9d0e1"
  }
}
```

#### Error
```json
{
  "type": "error",
  "message": "Invalid message format"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here",
  "message": "Additional details (development only)"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

API requests are rate limited to:
- **100 requests per 15 minutes per IP address**

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704110400
```

---

## Examples

### JavaScript/TypeScript (Frontend)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${twitchToken}`,
  },
});

// Create tier list
const tierList = await api.post('/tierlists', {
  title: 'Best Snacks',
  items: [
    { id: '1', name: 'Pizza', imageUrl: 'https://...' },
    { id: '2', name: 'Tacos', imageUrl: 'https://...' },
  ],
});

// Submit vote
await api.post('/votes', {
  tierListId: tierList.data._id,
  votes: [
    { itemId: '1', tier: 'S' },
    { itemId: '2', tier: 'A' },
  ],
});

// Get results
const results = await api.get(`/tierlists/${tierList.data._id}/results`);
console.log(results.data);
```

### cURL

```bash
# Create tier list
curl -X POST http://localhost:8081/api/tierlists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Best Snacks",
    "items": [
      {"id": "1", "name": "Pizza"},
      {"id": "2", "name": "Tacos"}
    ]
  }'

# Get results
curl http://localhost:8081/api/tierlists/TIERLIST_ID/results \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing

### Health Check
```http
GET /health
```

Returns server status without authentication:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Mock Authentication (Development Only)

When `NODE_ENV=development` and Twitch Extension Helper is not available, the frontend uses mock authentication:

```typescript
const mockAuth = {
  token: 'mock_token_for_development',
  userId: 'dev_user_123',
  channelId: 'dev_channel_123',
  role: 'broadcaster',
};
```

You can test API endpoints using this mock token in development mode.
