// Gaurikeerthana Residency API Server
// RESTful API for connecting billing software with the hotel booking system

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let db;
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('⚠️  Make sure serviceAccountKey.json exists in the project root');
  process.exit(1);
}

// API Authentication Middleware
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'gaurikeerthana-api-key-2025';

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. API key required in X-API-Key header.'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid API key.'
    });
  }

  next();
};

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gaurikeerthana Residency API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    firebase: db ? 'connected' : 'disconnected'
  });
});

// ==========================================
// BOOKING ENDPOINTS
// ==========================================

/**
 * GET /api/bookings
 * Get all bookings with optional filters
 * Query params: status, startDate, endDate, bookingType, limit, offset
 */
app.get('/api/bookings', authenticateAPI, async (req, res) => {
  try {
    let query = db.collection('bookings');

    // Filter by status
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }

    // Filter by booking type
    if (req.query.bookingType) {
      query = query.where('bookingType', '==', req.query.bookingType.toUpperCase());
    }

    // Filter by date range
    if (req.query.startDate) {
      query = query.where('arrivalDate', '>=', req.query.startDate);
    }
    if (req.query.endDate) {
      query = query.where('arrivalDate', '<=', req.query.endDate);
    }

    // Order by creation date (newest first)
    query = query.orderBy('createdAt', 'desc');

    // Pagination
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to ISO strings
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    });

    res.json({
      success: true,
      count: bookings.length,
      total: bookings.length, // In a real app, you'd get total from a separate count query
      bookings: bookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
app.get('/api/bookings/:id', authenticateAPI, async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const data = doc.data();
    res.json({
      success: true,
      booking: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/bookings
 * Create a new booking (for billing software to sync)
 */
app.post('/api/bookings', authenticateAPI, async (req, res) => {
  try {
    const bookingData = req.body;

    // Validate required fields
    const requiredFields = ['guestName', 'phone', 'arrivalDate', 'departureDate', 'roomType', 'total'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Prepare booking data
    const newBooking = {
      ...bookingData,
      bookingType: bookingData.bookingType || 'EXTERNAL',
      status: bookingData.status || 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firebase
    const docRef = await db.collection('bookings').add(newBooking);

    console.log('✅ Booking created:', docRef.id);

    // Fetch the created document to return
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: docRef.id,
      booking: {
        id: docRef.id,
        ...createdData,
        createdAt: createdData.createdAt?.toDate?.()?.toISOString() || createdData.createdAt,
        updatedAt: createdData.updatedAt?.toDate?.()?.toISOString() || createdData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/bookings/:id
 * Update an existing booking
 */
app.put('/api/bookings/:id', authenticateAPI, async (req, res) => {
  try {
    const updates = req.body;
    const bookingId = req.params.id;

    // Check if booking exists
    const doc = await db.collection('bookings').doc(bookingId).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Add update timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Update booking
    await db.collection('bookings').doc(bookingId).update(updates);

    // Fetch updated document
    const updatedDoc = await db.collection('bookings').doc(bookingId).get();
    const updatedData = updatedDoc.data();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || updatedData.createdAt,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || updatedData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/bookings/:id
 * Delete a booking (soft delete by updating status)
 */
app.delete('/api/bookings/:id', authenticateAPI, async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Check if booking exists
    const doc = await db.collection('bookings').doc(bookingId).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Soft delete - update status instead of deleting
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// FINANCIAL/REPORTING ENDPOINTS
// ==========================================

/**
 * GET /api/revenue
 * Get revenue reports by date range
 * Query params: startDate, endDate, groupBy (day/week/month)
 */
app.get('/api/revenue', authenticateAPI, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    let query = db.collection('bookings')
      .where('status', '==', 'confirmed')
      .where('arrivalDate', '>=', startDate)
      .where('arrivalDate', '<=', endDate);

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => doc.data());

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, booking) => sum + (parseFloat(booking.total) || 0), 0);
    const totalGST = bookings.reduce((sum, booking) => sum + (parseFloat(booking.gst) || 0), 0);
    const netRevenue = totalRevenue - totalGST;

    // Group revenue by period
    const revenueByPeriod = {};
    bookings.forEach(booking => {
      let periodKey;
      const date = new Date(booking.arrivalDate);

      switch (groupBy) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }

      if (!revenueByPeriod[periodKey]) {
        revenueByPeriod[periodKey] = {
          period: periodKey,
          revenue: 0,
          bookings: 0,
          netRevenue: 0,
          gst: 0
        };
      }
      revenueByPeriod[periodKey].revenue += parseFloat(booking.total) || 0;
      revenueByPeriod[periodKey].netRevenue += (parseFloat(booking.total) || 0) - (parseFloat(booking.gst) || 0);
      revenueByPeriod[periodKey].gst += parseFloat(booking.gst) || 0;
      revenueByPeriod[periodKey].bookings += 1;
    });

    res.json({
      success: true,
      summary: {
        totalRevenue: totalRevenue,
        netRevenue: netRevenue,
        totalGST: totalGST,
        totalBookings: bookings.length,
        period: `${startDate} to ${endDate}`
      },
      breakdown: Object.values(revenueByPeriod)
    });

  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/room-occupancy
 * Get room occupancy statistics
 */
app.get('/api/room-occupancy', authenticateAPI, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db.collection('bookings').where('status', '==', 'confirmed');

    if (startDate && endDate) {
      query = query.where('arrivalDate', '>=', startDate)
                   .where('arrivalDate', '<=', endDate);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => doc.data());

    // Room type statistics
    const roomStats = {};
    bookings.forEach(booking => {
      const roomType = booking.roomTypeText || booking.roomType || 'Unknown';
      if (!roomStats[roomType]) {
        roomStats[roomType] = {
          roomType: roomType,
          totalNights: 0,
          totalRevenue: 0,
          bookings: 0,
          totalRoomsBooked: 0
        };
      }

      const checkIn = new Date(booking.arrivalDate);
      const checkOut = new Date(booking.departureDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      roomStats[roomType].totalNights += nights;
      roomStats[roomType].totalRevenue += parseFloat(booking.total) || 0;
      roomStats[roomType].bookings += 1;
      roomStats[roomType].totalRoomsBooked += (booking.roomCount || 1);
    });

    res.json({
      success: true,
      occupancy: Object.values(roomStats)
    });

  } catch (error) {
    console.error('Error generating occupancy report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// EXPORT ENDPOINTS
// ==========================================

/**
 * GET /api/export/:format
 * Export bookings data
 * Format: csv, json
 */
app.get('/api/export/:format', authenticateAPI, async (req, res) => {
  try {
    const { format } = req.params;
    const { startDate, endDate } = req.query;

    let query = db.collection('bookings').orderBy('createdAt', 'desc').limit(1000);

    if (startDate && endDate) {
      query = query.where('arrivalDate', '>=', startDate)
                   .where('arrivalDate', '<=', endDate);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    });

    switch (format) {
      case 'csv':
        // Convert to CSV
        if (bookings.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No bookings to export'
          });
        }

        const csvHeaders = Object.keys(bookings[0]);
        const csvRows = bookings.map(booking =>
          csvHeaders.map(header => {
            const value = booking[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/"/g, '""');
          }).map(v => `"${v}"`).join(',')
        );
        const csv = [csvHeaders.map(h => `"${h}"`).join(','), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=bookings-export-${Date.now()}.csv`);
        return res.send(csv);

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=bookings-export-${Date.now()}.json`);
        return res.json(bookings);

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid format. Use csv or json.'
        });
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// ROOM AVAILABILITY ENDPOINT
// ==========================================

/**
 * GET /api/availability
 * Check room availability
 * Query params: roomType, startDate, endDate
 */
app.get('/api/availability', authenticateAPI, async (req, res) => {
  try {
    const { roomType, startDate, endDate } = req.query;

    if (!roomType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'roomType, startDate, and endDate are required'
      });
    }

    // Room capacities
    const roomCapacities = {
      'normal-non-ac': 3,
      'Normal Non-AC Room': 3,
      'normal-ac': 6,
      'Normal AC Room': 6,
      'deluxe-ac': 2,
      'Deluxe AC Room': 2
    };

    const totalCapacity = roomCapacities[roomType] || 0;

    if (totalCapacity === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room type'
      });
    }

    // Find conflicting bookings
    const conflictingBookings = await db.collection('bookings')
      .where('roomType', '==', roomType.toLowerCase().replace(/\s+/g, '-'))
      .where('status', '==', 'confirmed')
      .get();

    let totalBookedRooms = 0;
    conflictingBookings.docs.forEach(doc => {
      const booking = doc.data();
      const bookingStart = new Date(booking.arrivalDate);
      const bookingEnd = new Date(booking.departureDate);
      const queryStart = new Date(startDate);
      const queryEnd = new Date(endDate);

      // Check if dates overlap
      if (bookingStart < queryEnd && bookingEnd > queryStart) {
        totalBookedRooms += (booking.roomCount || 1);
      }
    });

    const availableRooms = Math.max(0, totalCapacity - totalBookedRooms);

    res.json({
      success: true,
      roomType: roomType,
      totalCapacity: totalCapacity,
      bookedRooms: totalBookedRooms,
      availableRooms: availableRooms,
      startDate: startDate,
      endDate: endDate
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Gaurikeerthana Residency API Server');
  console.log(`📊 Running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: See API-DOCUMENTATION.md`);
  console.log(`🔑 API Key required for all endpoints (except /api/health)`);
});

module.exports = app;

