# Gaurikeerthana Residency API Documentation

RESTful API for connecting billing software with the hotel booking system.

## Base URL

```
http://localhost:3000/api
```

**Production:** Replace with your actual domain

## Authentication

All API endpoints (except `/api/health`) require authentication using an API key.

### Header Required:
```
X-API-Key: your-api-key-here
```

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "Gaurikeerthana Residency API is running",
  "version": "1.0.0",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "firebase": "connected"
}
```

---

### 2. Get All Bookings

**GET** `/api/bookings`

**Query Parameters:**
- `status` (optional) - Filter by status: `confirmed`, `pending`, `cancelled`
- `bookingType` (optional) - Filter by type: `ONLINE`, `WALK_IN`, `EXTERNAL`
- `startDate` (optional) - Filter from date: `YYYY-MM-DD`
- `endDate` (optional) - Filter to date: `YYYY-MM-DD`
- `limit` (optional) - Number of results (default: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Example:**
```
GET /api/bookings?status=confirmed&startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "bookings": [
    {
      "id": "abc123",
      "bookingId": "GR-1704901234567-123",
      "guestName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "arrivalDate": "2024-02-01",
      "departureDate": "2024-02-03",
      "roomType": "deluxe-ac",
      "roomTypeText": "Deluxe AC Room",
      "roomCount": 1,
      "adults": 2,
      "children": 0,
      "subtotal": 9000,
      "gst": 450,
      "total": 9450,
      "status": "confirmed",
      "bookingType": "ONLINE",
      "paymentMethod": "razorpay",
      "paymentStatus": "success",
      "createdAt": "2024-01-10T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Booking

**GET** `/api/bookings/:id`

**Example:**
```
GET /api/bookings/abc123
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "abc123",
    "bookingId": "GR-1704901234567-123",
    "guestName": "John Doe",
    // ... all booking fields
  }
}
```

---

### 4. Create Booking

**POST** `/api/bookings`

**Request Body:**
```json
{
  "guestName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "arrivalDate": "2024-02-01",
  "departureDate": "2024-02-03",
  "roomType": "deluxe-ac",
  "roomTypeText": "Deluxe AC Room",
  "roomCount": 1,
  "adults": 2,
  "children": 0,
  "subtotal": 9000,
  "gst": 450,
  "total": 9450,
  "status": "confirmed",
  "bookingType": "EXTERNAL",
  "paymentMethod": "cash",
  "paymentStatus": "confirmed"
}
```

**Required Fields:**
- `guestName`
- `phone`
- `arrivalDate`
- `departureDate`
- `roomType`
- `total`

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "bookingId": "xyz789",
  "booking": {
    "id": "xyz789",
    // ... all booking fields
  }
}
```

**Response (Error - Overbooked):**
```json
{
  "success": false,
  "error": "Overbooking prevented. Requested room type is fully booked for these dates.",
  "availableRooms": 0,
  "requestedRooms": 1
}
```

---

### 5. Update Booking

**PUT** `/api/bookings/:id`

**Request Body:**
```json
{
  "status": "cancelled",
  "paymentStatus": "refunded"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    // ... updated booking data
  }
}
```

**Response (Error - Overbooked):**
```json
{
  "success": false,
  "error": "Update failed: Selected dates/room type would cause overbooking.",
  "availableRooms": 0,
  "requestedRooms": 1
}
```

---

### 6. Cancel Booking

**DELETE** `/api/bookings/:id`

Soft deletes by updating status to `cancelled`.

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### 7. Revenue Report

**GET** `/api/revenue`

**Query Parameters:**
- `startDate` (required) - Start date: `YYYY-MM-DD`
- `endDate` (required) - End date: `YYYY-MM-DD`
- `groupBy` (optional) - Group by: `day`, `week`, `month` (default: `day`)

**Example:**
```
GET /api/revenue?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalRevenue": 500000,
    "netRevenue": 475000,
    "totalGST": 25000,
    "totalBookings": 50,
    "period": "2024-01-01 to 2024-12-31"
  },
  "breakdown": [
    {
      "period": "2024-01",
      "revenue": 50000,
      "netRevenue": 47500,
      "gst": 2500,
      "bookings": 5
    }
  ]
}
```

---

### 8. Room Occupancy Report

**GET** `/api/room-occupancy`

**Query Parameters:**
- `startDate` (optional) - Start date: `YYYY-MM-DD`
- `endDate` (optional) - End date: `YYYY-MM-DD`

**Response:**
```json
{
  "success": true,
  "occupancy": [
    {
      "roomType": "Deluxe AC Room",
      "totalNights": 100,
      "totalRevenue": 450000,
      "bookings": 25,
      "totalRoomsBooked": 25
    }
  ]
}
```

---

### 9. Export Data

**GET** `/api/export/:format`

**Formats:** `csv`, `json`

**Query Parameters:**
- `startDate` (optional) - Start date: `YYYY-MM-DD`
- `endDate` (optional) - End date: `YYYY-MM-DD`

**Example:**
```
GET /api/export/csv?startDate=2024-01-01&endDate=2024-12-31
```

Returns a downloadable file.

---

### 10. Check Availability

**GET** `/api/availability`

**Query Parameters:**
- `roomType` (required) - Room type: `Normal Non-AC Room`, `Normal AC Room`, `Deluxe AC Room`
- `startDate` (required) - Check-in date: `YYYY-MM-DD`
- `endDate` (required) - Check-out date: `YYYY-MM-DD`

**Example:**
```
GET /api/availability?roomType=Deluxe AC Room&startDate=2024-02-01&endDate=2024-02-03
```

**Response:**
```json
{
  "success": true,
  "roomType": "Deluxe AC Room",
  "totalCapacity": 2,
  "bookedRooms": 1,
  "availableRooms": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-02-03"
}
```

---

## Integration Examples

### Example 1: Fetch All Bookings (JavaScript/Node.js)

```javascript
const fetch = require('node-fetch');

async function getBookings() {
  const response = await fetch('http://localhost:3000/api/bookings', {
    headers: {
      'X-API-Key': 'your-api-key-here'
    }
  });
  
  const data = await response.json();
  console.log(data.bookings);
}
```

### Example 2: Create Booking from Billing Software

```javascript
async function syncBooking(bookingData) {
  const response = await fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      guestName: "John Doe",
      phone: "9876543210",
      arrivalDate: "2024-02-01",
      departureDate: "2024-02-03",
      roomType: "deluxe-ac",
      roomTypeText: "Deluxe AC Room",
      roomCount: 1,
      total: 9450,
      subtotal: 9000,
      gst: 450,
      bookingType: "EXTERNAL",
      status: "confirmed"
    })
  });
  
  const result = await response.json();
  console.log('Booking ID:', result.bookingId);
}
```

### Example 3: Generate Revenue Report (Python)

```python
import requests

headers = {
    'X-API-Key': 'your-api-key-here'
}

params = {
    'startDate': '2024-01-01',
    'endDate': '2024-12-31',
    'groupBy': 'month'
}

response = requests.get(
    'http://localhost:3000/api/revenue',
    headers=headers,
    params=params
)

data = response.json()
print(f"Total Revenue: ₹{data['summary']['totalRevenue']}")
```

### Example 4: Export Bookings to CSV (cURL)

```bash
curl -H "X-API-Key: your-api-key-here" \
  "http://localhost:3000/api/export/csv?startDate=2024-01-01&endDate=2024-12-31" \
  -o bookings-export.csv
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing API key)
- `404` - Not Found
- `500` - Server Error

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gaurikeerthana-residency-c3ba4`
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the file as `serviceAccountKey.json` in the project root

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and set your API_KEY
```

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

---

## Security Notes

1. **Never commit** `serviceAccountKey.json` or `.env` to Git
2. Use strong, unique API keys
3. Use HTTPS in production
4. Implement rate limiting for production
5. Regularly rotate API keys

---

## Support

For questions or issues:
- Email: Gaurikeerthanagvyr@gmail.com
- Phone: +91 994779277

---

## License

© 2025 Gaurikeerthana Residency. All Rights Reserved.



