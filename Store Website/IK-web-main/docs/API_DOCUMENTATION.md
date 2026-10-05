# İnci Gold E-commerce API Documentation

## Overview

The İnci Gold E-commerce Platform provides a comprehensive REST API for managing products, orders, users, and payments. This API is designed for enterprise-level security and performance.

## Base URL

```
Production: https://incigold.com/api
Staging: https://staging.incigold.com/api
Development: http://localhost:5000/api
```

## Authentication

### JWT Token Authentication

All API endpoints require authentication using JWT tokens.

#### Login Endpoint

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Using the Token

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Rate Limiting

API endpoints are protected by rate limiting:

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **Payment endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## API Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+905551234567"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <token>
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### User Management

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+905551234567",
  "address": "123 Main St",
  "city": "Istanbul",
  "postal_code": "34000"
}
```

#### Change Password

```http
POST /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword",
  "confirm_password": "newpassword"
}
```

### Products

#### Get All Products

```http
GET /products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `category` - Category ID
- `search` - Search term
- `min_price` - Minimum price
- `max_price` - Maximum price
- `sort` - Sort by: `name`, `price`, `created_at`

**Example:**
```http
GET /products?page=1&limit=20&category=1&search=altın&min_price=100&max_price=1000&sort=price
```

#### Get Product by ID

```http
GET /products/{id}
```

#### Get Product Categories

```http
GET /categories
```

#### Get Featured Products

```http
GET /products/featured
```

#### Get New Arrivals

```http
GET /products/new
```

### Cart Management

#### Get Cart

```http
GET /cart
Authorization: Bearer <token>
```

#### Add Item to Cart

```http
POST /cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Update Cart Item

```http
PUT /cart/items/{item_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart

```http
DELETE /cart/items/{item_id}
Authorization: Bearer <token>
```

#### Clear Cart

```http
DELETE /cart
Authorization: Bearer <token>
```

### Guest Cart Management

#### Add Item to Guest Cart

```http
POST /cart/guest/items
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Get Guest Cart

```http
GET /cart/guest
```

#### Process Guest Order

```http
POST /cart/guest/checkout
Content-Type: application/json

{
  "email": "guest@example.com",
  "phone": "+905551234567",
  "shipping_address": "123 Guest St",
  "shipping_city": "Istanbul",
  "shipping_postal_code": "34000",
  "payment_method": "credit_card"
}
```

#### Convert Guest to User

```http
POST /cart/guest/convert
Content-Type: application/json

{
  "email": "guest@example.com"
}
```

### Orders

#### Get User Orders

```http
GET /orders
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Order status filter

#### Get Order by ID

```http
GET /orders/{id}
Authorization: Bearer <token>
```

#### Get Order by Number

```http
GET /orders/number/{order_number}
Authorization: Bearer <token>
```

#### Create Order

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipping_address": "123 Main St",
  "shipping_city": "Istanbul",
  "shipping_postal_code": "34000",
  "shipping_phone": "+905551234567",
  "payment_method": "credit_card",
  "notes": "Please deliver after 2 PM"
}
```

#### Cancel Order

```http
POST /orders/{id}/cancel
Authorization: Bearer <token>
```

### Payments

#### Process Payment

```http
POST /payments/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "payment_method": "credit_card",
  "card_number": "5555444433332222",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvv": "123",
  "card_holder": "John Doe"
}
```

#### Get Payment Status

```http
GET /payments/{payment_id}/status
Authorization: Bearer <token>
```

#### 3D Secure Callback

```http
POST /payments/3ds-callback
Content-Type: application/json

{
  "token": "3ds_token",
  "status": "success"
}
```

### Admin Endpoints

#### Get Dashboard Stats

```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Users

```http
GET /admin/users
Authorization: Bearer <admin_token>
```

#### Create Product

```http
POST /admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Gold Ring",
  "description": "Beautiful gold ring",
  "price": 500.00,
  "stock": 10,
  "category_id": 1,
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### Update Product

```http
PUT /admin/products/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Gold Ring",
  "price": 550.00,
  "stock": 15
}
```

#### Delete Product

```http
DELETE /admin/products/{id}
Authorization: Bearer <admin_token>
```

#### Get All Orders

```http
GET /admin/orders
Authorization: Bearer <admin_token>
```

#### Update Order Status

```http
PUT /admin/orders/{id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "tracking_number": "TRK123456789"
}
```

### Analytics

#### Get Payment Analytics

```http
GET /analytics/payments
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)
- `group_by` - Group by: `day`, `week`, `month`

#### Get Sales Analytics

```http
GET /analytics/sales
Authorization: Bearer <admin_token>
```

#### Get User Analytics

```http
GET /analytics/users
Authorization: Bearer <admin_token>
```

### Webhooks

#### Register Webhook

```http
POST /webhooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["order.created", "payment.completed"],
  "secret": "webhook_secret"
}
```

#### List Webhooks

```http
GET /webhooks
Authorization: Bearer <admin_token>
```

#### Update Webhook

```http
PUT /webhooks/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "url": "https://new-example.com/webhook",
  "events": ["order.created", "payment.completed", "order.shipped"]
}
```

#### Delete Webhook

```http
DELETE /webhooks/{id}
Authorization: Bearer <admin_token>
```

### Health Check

#### System Health

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "mail": "healthy"
  },
  "version": "1.0.0"
}
```

## Webhook Events

### Order Events

#### order.created
```json
{
  "event": "order.created",
  "data": {
    "order_id": 123,
    "order_number": "ORD-20250106-001",
    "user_id": 456,
    "total_amount": 500.00,
    "status": "pending",
    "created_at": "2025-01-06T10:00:00Z"
  }
}
```

#### order.updated
```json
{
  "event": "order.updated",
  "data": {
    "order_id": 123,
    "order_number": "ORD-20250106-001",
    "status": "shipped",
    "tracking_number": "TRK123456789",
    "updated_at": "2025-01-06T11:00:00Z"
  }
}
```

### Payment Events

#### payment.completed
```json
{
  "event": "payment.completed",
  "data": {
    "payment_id": 789,
    "order_id": 123,
    "amount": 500.00,
    "status": "completed",
    "transaction_id": "TXN123456789",
    "completed_at": "2025-01-06T10:30:00Z"
  }
}
```

#### payment.failed
```json
{
  "event": "payment.failed",
  "data": {
    "payment_id": 789,
    "order_id": 123,
    "amount": 500.00,
    "status": "failed",
    "error_message": "Insufficient funds",
    "failed_at": "2025-01-06T10:30:00Z"
  }
}
```

### User Events

#### user.registered
```json
{
  "event": "user.registered",
  "data": {
    "user_id": 456,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "registered_at": "2025-01-06T09:00:00Z"
  }
}
```

## SDKs and Libraries

### Python SDK

```python
from incigold import İnciGoldClient

client = İnciGoldClient(
    api_key="your_api_key",
    base_url="https://incigold.com/api"
)

# Get products
products = client.products.list(page=1, limit=20)

# Create order
order = client.orders.create({
    "shipping_address": "123 Main St",
    "shipping_city": "Istanbul",
    "payment_method": "credit_card"
})
```

### JavaScript SDK

```javascript
import { İnciGoldClient } from '@incigold/sdk';

const client = new İnciGoldClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://incigold.com/api'
});

// Get products
const products = await client.products.list({ page: 1, limit: 20 });

// Create order
const order = await client.orders.create({
  shipping_address: '123 Main St',
  shipping_city: 'Istanbul',
  payment_method: 'credit_card'
});
```

## Rate Limiting

API endpoints are protected by rate limiting to ensure fair usage and system stability.

### Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Payment Processing | 10 requests | 1 minute |
| Admin Operations | 200 requests | 1 minute |

### Rate Limit Headers

Every API response includes rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Handling Rate Limits

When rate limited, the API returns a `429 Too Many Requests` status code:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Security

### HTTPS

All API communications must use HTTPS in production. HTTP is only allowed for local development.

### Authentication

- JWT tokens expire after 24 hours
- Refresh tokens expire after 30 days
- Tokens are automatically rotated on refresh

### Data Validation

All input data is validated and sanitized:
- SQL injection protection
- XSS protection
- CSRF protection
- Input length limits
- Data type validation

### Security Headers

All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

## Support

For API support and questions:
- Email: api-support@incigold.com
- Documentation: https://docs.incigold.com
- Status Page: https://status.incigold.com
