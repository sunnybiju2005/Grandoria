// Firebase Configuration - Simple Version (No ES6 Modules)
// This version uses CDN scripts instead of ES6 modules for better compatibility

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK0nn070RQAkmL_EzzfKo8HyBw78wyWzg",
  authDomain: "gaurikeerthana-residency-c3ba4.firebaseapp.com",
  projectId: "gaurikeerthana-residency-c3ba4",
  storageBucket: "gaurikeerthana-residency-c3ba4.firebasestorage.app",
  messagingSenderId: "875606607101",
  appId: "1:875606607101:web:baa1cf0e22b0d52c466a94",
  measurementId: "G-X365HD4ESW"
};

// Initialize Firebase (will be available globally after CDN scripts load)
let app, db;
let firebaseInitialized = false;

// Function to initialize Firebase
function initializeFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      firebaseInitialized = true;
      
      // Make available globally
      window.firebaseApp = app;
      window.firebaseDB = db;
      window.firebaseInitialized = firebaseInitialized;
      
      console.log('Firebase initialized successfully');
      return true;
    } else if (typeof firebase !== 'undefined') {
      app = firebase.app();
      db = firebase.firestore();
      firebaseInitialized = true;
      
      window.firebaseApp = app;
      window.firebaseDB = db;
      window.firebaseInitialized = firebaseInitialized;
      
      console.log('Firebase already initialized');
      return true;
    } else {
      console.error('Firebase CDN not loaded');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

// Firebase Database Functions
class FirebaseBookingService {
  constructor() {
    this.db = null;
    this.collection = 'bookings';
  }

  // Initialize the service
  init() {
    if (firebaseInitialized && db) {
      this.db = db;
      return true;
    }
    return false;
  }

  // Save new booking
  async saveBooking(bookingData) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const bookingRef = await db.collection(this.collection).add({
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'confirmed'
      });
      
      console.log('Booking saved with ID: ', bookingRef.id);
      return bookingRef.id;
    } catch (error) {
      console.error('Error saving booking: ', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, updates) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      await db.collection(this.collection).doc(bookingId).set({
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Booking updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating booking: ', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBooking(bookingId) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const bookingDoc = await db.collection(this.collection).doc(bookingId).get();
      
      if (bookingDoc.exists) {
        return { id: bookingDoc.id, ...bookingDoc.data() };
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.error('Error getting booking: ', error);
      throw error;
    }
  }

  // Get all bookings (for admin)
  async getAllBookings() {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const querySnapshot = await db.collection(this.collection)
        .orderBy('createdAt', 'desc')
        .get();
      
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting all bookings: ', error);
      throw error;
    }
  }

  // Get bookings by status
  async getBookingsByStatus(status) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const querySnapshot = await db.collection(this.collection)
        .where('status', '==', status)
        .get();
      
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting bookings by status: ', error);
      throw error;
    }
  }

  // Get bookings by date range
  async getBookingsByDateRange(startDate, endDate) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const querySnapshot = await db.collection(this.collection)
        .where('arrivalDate', '>=', startDate)
        .where('arrivalDate', '<=', endDate)
        .get();
      
      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting bookings by date range: ', error);
      throw error;
    }
  }

  // Delete booking
  async deleteBooking(bookingId) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      // First, try to delete the specific document
      await db.collection(this.collection).doc(bookingId).delete();
      console.log(`Booking ${bookingId} deleted successfully from Firebase`);
      
      // Also try to delete any bookings with matching bookingId in case of data inconsistency
      const snapshot = await db.collection(this.collection).where('bookingId', '==', bookingId).get();
      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Additional bookings with ID ${bookingId} deleted from Firebase`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting booking from Firebase: ', error);
      throw error;
    }
  }
}

// Initialize Firebase service
window.firebaseBookingService = new FirebaseBookingService();

// Fallback to localStorage if Firebase fails
window.localStorageFallback = {
  saveBooking: (bookingData) => {
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    console.log('Booking saved to localStorage (Firebase fallback)');
  },
  
  updateBookingStatus: (bookingId, updates) => {
    const bookingData = JSON.parse(localStorage.getItem('currentBooking') || '{}');
    const updatedData = { ...bookingData, ...updates };
    localStorage.setItem('currentBooking', JSON.stringify(updatedData));
    console.log('Booking updated in localStorage (Firebase fallback)');
  },
  
  getBooking: (bookingId) => {
    const bookingData = JSON.parse(localStorage.getItem('currentBooking') || '{}');
    return bookingData;
  },

  deleteBooking: (bookingId) => {
    // More targeted removal based on booking ID
    const keysToCheck = ['confirmedBooking', 'failedBooking', 'currentBooking'];
    let removed = false;
    
    keysToCheck.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored && stored !== 'null') {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.bookingId === bookingId) {
            localStorage.removeItem(key);
            console.log(`Booking ${bookingId} deleted from localStorage key: ${key}`);
            removed = true;
          }
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });
    
    if (!removed) {
      console.log(`Booking ${bookingId} not found in localStorage`);
    }
    
    return true;
  }
};

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Try to initialize Firebase
  if (initializeFirebase()) {
    console.log('Firebase ready for use');
  } else {
    console.log('Firebase initialization failed, using localStorage fallback');
  }
});

// Also try to initialize immediately (in case DOM is already loaded)
if (document.readyState === 'loading') {
  // DOM is still loading
} else {
  // DOM is already loaded
  if (initializeFirebase()) {
    console.log('Firebase ready for use');
  } else {
    console.log('Firebase initialization failed, using localStorage fallback');
  }
}