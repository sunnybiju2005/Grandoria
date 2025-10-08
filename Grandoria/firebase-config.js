// Firebase Configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK0nn070RQAkmL_EzzfKo8HyBw78wyWzg",
  authDomain: "gaurikeerthana-residency-c3ba4.firebaseapp.com",
  projectId: "gaurikeerthana-residency-c3ba4",
  storageBucket: "gaurikeerthana-residency-c3ba4.firebasestorage.app",
  messagingSenderId: "875606607101",
  appId: "1:875606607101:web:baa1cf0e22b0d52c466a94",
  measurementId: "G-X365HD4ESW"
};

// Initialize Firebase using CDN imports (compatible with HTML files)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export for use in other files
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseFunctions = {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
};

// Firebase Database Functions
class FirebaseBookingService {
  constructor() {
    this.db = db;
    this.collection = 'bookings';
  }

  // Save new booking
  async saveBooking(bookingData) {
    try {
      const bookingRef = await addDoc(collection(this.db, this.collection), {
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
    try {
      const bookingRef = doc(this.db, this.collection, bookingId);
      await setDoc(bookingRef, {
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
    try {
      const bookingRef = doc(this.db, this.collection, bookingId);
      const bookingSnap = await getDoc(bookingRef);
      
      if (bookingSnap.exists()) {
        return { id: bookingSnap.id, ...bookingSnap.data() };
      } else {
        throw new Error('Booking not found');
      }
    } catch (error) {
      console.error('Error getting booking: ', error);
      throw error;
    }
  }

  // Get all bookings (for admin) - only confirmed bookings
  async getAllBookings() {
    try {
      const q = query(
        collection(this.db, this.collection), 
        where('status', '==', 'confirmed'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
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
    try {
      const q = query(collection(this.db, this.collection), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      
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
    try {
      const q = query(
        collection(this.db, this.collection),
        where('arrivalDate', '>=', startDate),
        where('arrivalDate', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      
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

console.log('Firebase initialized successfully');
