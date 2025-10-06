// Firebase Configuration - Simple Version (No ES6 Modules)
// This version uses CDN scripts instead of ES6 modules for better compatibility

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuuhKEdDevyLKZ-hDDMNoMt3YOy3XO00Y",
  authDomain: "gaurikeerthana-residency.firebaseapp.com",
  projectId: "gaurikeerthana-residency",
  storageBucket: "gaurikeerthana-residency.firebasestorage.app",
  messagingSenderId: "272531946539",
  appId: "1:272531946539:web:f513fc6a03dc189bad7e6e",
  measurementId: "G-SZPH6Z7TGH"
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
      
      console.log('Firebase initialized successfully');
      return true;
    } else if (typeof firebase !== 'undefined') {
      app = firebase.app();
      db = firebase.firestore();
      firebaseInitialized = true;
      
      window.firebaseApp = app;
      window.firebaseDB = db;
      
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
        status: 'pending_payment'
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
