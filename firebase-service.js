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
let app, db, storage;
let firebaseInitialized = false;

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'sunnybiju',      // Put your Cloud Name here
  upload_preset: 'grandoria_preset', // Put your Unsigned Preset name here
  folder: 'grandoria_payments'
};

// Function to initialize Firebase
function initializeFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();

      // Initialize storage only if storage function exists
      if (typeof firebase.storage === "function") {
        storage = firebase.storage();
        window.firebaseStorage = storage;
        console.log('Firebase Storage initialized');
      } else {
        console.warn('Firebase Storage SDK not loaded - storage features will be unavailable');
      }

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

      if (typeof firebase.storage === "function") {
        storage = firebase.storage();
        window.firebaseStorage = storage;
        console.log('Firebase Storage re-initialized');
      }

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
    this.storage = null;
    this.collection = 'bookings';
  }

  // Initialize the service
  init() {
    // If local variables aren't set, try picking them from window
    if (!this.db && window.firebaseDB) this.db = window.firebaseDB;
    if (!this.storage && window.firebaseStorage) this.storage = window.firebaseStorage;

    // We strictly need db for most operations
    if (this.db) {
      return true;
    }

    // If still not set, try one more time to initialize
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      this.db = firebase.firestore();
      try {
        if (typeof firebase.storage === "function") this.storage = firebase.storage();
      } catch (e) { }
      return true;
    }

    return false;
  }

  // Create a unique filename and upload to Cloudinary
  async uploadPaymentScreenshot(file, bookingId) {
    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
      formData.append('folder', CLOUDINARY_CONFIG.folder);
      formData.append('public_id', `${bookingId}_${Date.now()}`);

      console.log('API Request: Uploading to Cloudinary...');
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      console.log('✅ API Response: Secure URL received');
      return data.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary API Error:', error);
      throw error;
    }
  }

  // Save new booking
  async saveBooking(bookingData) {
    if (!this.init()) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Use Firebase Timestamp for consistency
      const now = firebase.firestore.Timestamp.now();

      const bookingRef = await this.db.collection(this.collection).add({
        ...bookingData,
        createdAt: now,
        updatedAt: now,
        // Only set status to 'confirmed' if not already set
        status: bookingData.status || 'confirmed'
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
      await this.db.collection(this.collection).doc(bookingId).set({
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
      const bookingDoc = await this.db.collection(this.collection).doc(bookingId).get();

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
      const querySnapshot = await this.db.collection(this.collection)
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
      const querySnapshot = await this.db.collection(this.collection)
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
      const querySnapshot = await this.db.collection(this.collection)
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
      await this.db.collection(this.collection).doc(bookingId).delete();
      console.log(`Booking ${bookingId} deleted successfully from Firebase`);

      // Also try to delete any bookings with matching bookingId in case of data inconsistency
      const snapshot = await this.db.collection(this.collection).where('bookingId', '==', bookingId).get();
      if (!snapshot.empty) {
        const batch = this.db.batch();
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
document.addEventListener('DOMContentLoaded', function () {
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