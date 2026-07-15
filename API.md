# AutoTube API Documentation

Complete REST API documentation for the AutoTube platform.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints (except auth routes) require authentication via JWT token stored in an HTTP-only cookie.

## Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "credits": 100
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "credits": 100
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "credits": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Videos

#### List Videos
```http
GET /api/videos?status=COMPLETED&limit=20&offset=0
```

Response:
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Video Title",
      "script": "Video script...",
      "description": "Video description",
      "tags": ["tag1", "tag2"],
      "hashtags": ["#hashtag1", "#hashtag2"],
      "status": "COMPLETED",
      "videoUrl": "/api/storage/videos/video.mp4",
      "duration": 180,
      "resolution": "1080p",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### Create Video
```http
POST /api/videos
Content-Type: application/json

{
  "title": "Video Title",
  "script": "Video script...",
  "description": "Video description",
  "tags": ["tag1", "tag2"],
  "hashtags": ["#hashtag1"],
  "niche": "tech",
  "topic": "AI trends",
  "channelId": "channel_id"
}
```

#### Generate Video Content
```http
POST /api/videos/generate
Content-Type: application/json

{
  "niche": "tech",
  "topic": "The Future of AI",
  "voiceProvider": "EDGE_TTS",
  "voiceId": "en-US-AriaNeural",
  "speed": 1.0,
  "pitch": 1.0,
  "resolution": "1080p"
}
```

Response:
```json
{
  "video": {
    "id": "video_id",
    "title": "Generated Title",
    "status": "DRAFT"
  },
  "content": {
    "title": "Generated Title",
    "script": "Generated script...",
    "description": "Generated description",
    "tags": ["tag1", "tag2"],
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
}
```

---

### Settings

#### List API Keys
```http
GET /api/settings/api-keys
```

Response:
```json
{
  "apiKeys": [
    {
      "provider": "openai",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Save API Key
```http
POST /api/settings/api-keys
Content-Type: application/json

{
  "provider": "openai",
  "key": "sk-..."
}
```

#### Delete API Key
```http
DELETE /api/settings/api-keys
Content-Type: application/json

{
  "provider": "openai"
}
```

---

### Scripts

#### List Scripts
```http
GET /api/scripts
```

#### Create Script
```http
POST /api/scripts
Content-Type: application/json

{
  "title": "Script Title",
  "content": "Script content...",
  "niche": "tech",
  "tags": ["tag1", "tag2"]
}
```

---

### Channels

#### List Channels
```http
GET /api/channels
```

#### Create Channel
```http
POST /api/channels
Content-Type: application/json

{
  "name": "Channel Name",
  "description": "Channel description"
}
```

---

### Scheduler

#### List Scheduled Videos
```http
GET /api/schedule
```

#### Schedule Video
```http
POST /api/schedule
Content-Type: application/json

{
  "videoId": "video_id",
  "channelId": "channel_id",
  "scheduledFor": "2024-01-20T09:00:00.000Z"
}
```

#### Remove from Schedule
```http
DELETE /api/schedule/:id
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limits

The API is currently rate-limited to:
- `100` requests per minute per user
- `1000` requests per hour per user

## Webhooks

(Coming soon)

Configure webhooks to receive notifications about:
- Video rendering completion
- Scheduled video publication
- Credits running low

---

## Support

For API support, please contact support@autotube.app or open an issue on GitHub.
