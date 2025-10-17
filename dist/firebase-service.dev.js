"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Firebase Configuration - Simple Version (No ES6 Modules)
// This version uses CDN scripts instead of ES6 modules for better compatibility
// Firebase Configuration
var firebaseConfig = {
  apiKey: "AIzaSyDK0nn070RQAkmL_EzzfKo8HyBw78wyWzg",
  authDomain: "gaurikeerthana-residency-c3ba4.firebaseapp.com",
  projectId: "gaurikeerthana-residency-c3ba4",
  storageBucket: "gaurikeerthana-residency-c3ba4.firebasestorage.app",
  messagingSenderId: "875606607101",
  appId: "1:875606607101:web:baa1cf0e22b0d52c466a94",
  measurementId: "G-X365HD4ESW"
}; // Initialize Firebase (will be available globally after CDN scripts load)

var app, db;
var firebaseInitialized = false; // Function to initialize Firebase

function initializeFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      firebaseInitialized = true; // Make available globally

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
} // Firebase Database Functions


var FirebaseBookingService =
/*#__PURE__*/
function () {
  function FirebaseBookingService() {
    _classCallCheck(this, FirebaseBookingService);

    this.db = null;
    this.collection = 'bookings';
  } // Initialize the service


  _createClass(FirebaseBookingService, [{
    key: "init",
    value: function init() {
      if (firebaseInitialized && db) {
        this.db = db;
        return true;
      }

      return false;
    } // Save new booking

  }, {
    key: "saveBooking",
    value: function saveBooking(bookingData) {
      var now, bookingRef;
      return regeneratorRuntime.async(function saveBooking$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.init()) {
                _context.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context.prev = 2;
              // Use Firebase Timestamp for consistency
              now = firebase.firestore.Timestamp.now();
              _context.next = 6;
              return regeneratorRuntime.awrap(db.collection(this.collection).add(_objectSpread({}, bookingData, {
                createdAt: now,
                updatedAt: now,
                // Only set status to 'confirmed' if not already set
                status: bookingData.status || 'confirmed'
              })));

            case 6:
              bookingRef = _context.sent;
              console.log('Booking saved with ID: ', bookingRef.id);
              return _context.abrupt("return", bookingRef.id);

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](2);
              console.error('Error saving booking: ', _context.t0);
              throw _context.t0;

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[2, 11]]);
    } // Update booking status

  }, {
    key: "updateBookingStatus",
    value: function updateBookingStatus(bookingId, updates) {
      return regeneratorRuntime.async(function updateBookingStatus$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.init()) {
                _context2.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context2.prev = 2;
              _context2.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).doc(bookingId).set(_objectSpread({}, updates, {
                updatedAt: new Date()
              }), {
                merge: true
              }));

            case 5:
              console.log('Booking updated successfully');
              return _context2.abrupt("return", true);

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](2);
              console.error('Error updating booking: ', _context2.t0);
              throw _context2.t0;

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[2, 9]]);
    } // Get booking by ID

  }, {
    key: "getBooking",
    value: function getBooking(bookingId) {
      var bookingDoc;
      return regeneratorRuntime.async(function getBooking$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (this.init()) {
                _context3.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context3.prev = 2;
              _context3.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).doc(bookingId).get());

            case 5:
              bookingDoc = _context3.sent;

              if (!bookingDoc.exists) {
                _context3.next = 10;
                break;
              }

              return _context3.abrupt("return", _objectSpread({
                id: bookingDoc.id
              }, bookingDoc.data()));

            case 10:
              throw new Error('Booking not found');

            case 11:
              _context3.next = 17;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3["catch"](2);
              console.error('Error getting booking: ', _context3.t0);
              throw _context3.t0;

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[2, 13]]);
    } // Get all bookings (for admin)

  }, {
    key: "getAllBookings",
    value: function getAllBookings() {
      var querySnapshot, bookings;
      return regeneratorRuntime.async(function getAllBookings$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (this.init()) {
                _context4.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context4.prev = 2;
              _context4.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).orderBy('createdAt', 'desc').get());

            case 5:
              querySnapshot = _context4.sent;
              bookings = [];
              querySnapshot.forEach(function (doc) {
                bookings.push(_objectSpread({
                  id: doc.id
                }, doc.data()));
              });
              return _context4.abrupt("return", bookings);

            case 11:
              _context4.prev = 11;
              _context4.t0 = _context4["catch"](2);
              console.error('Error getting all bookings: ', _context4.t0);
              throw _context4.t0;

            case 15:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[2, 11]]);
    } // Get bookings by status

  }, {
    key: "getBookingsByStatus",
    value: function getBookingsByStatus(status) {
      var querySnapshot, bookings;
      return regeneratorRuntime.async(function getBookingsByStatus$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (this.init()) {
                _context5.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context5.prev = 2;
              _context5.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).where('status', '==', status).get());

            case 5:
              querySnapshot = _context5.sent;
              bookings = [];
              querySnapshot.forEach(function (doc) {
                bookings.push(_objectSpread({
                  id: doc.id
                }, doc.data()));
              });
              return _context5.abrupt("return", bookings);

            case 11:
              _context5.prev = 11;
              _context5.t0 = _context5["catch"](2);
              console.error('Error getting bookings by status: ', _context5.t0);
              throw _context5.t0;

            case 15:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[2, 11]]);
    } // Get bookings by date range

  }, {
    key: "getBookingsByDateRange",
    value: function getBookingsByDateRange(startDate, endDate) {
      var querySnapshot, bookings;
      return regeneratorRuntime.async(function getBookingsByDateRange$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (this.init()) {
                _context6.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context6.prev = 2;
              _context6.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).where('arrivalDate', '>=', startDate).where('arrivalDate', '<=', endDate).get());

            case 5:
              querySnapshot = _context6.sent;
              bookings = [];
              querySnapshot.forEach(function (doc) {
                bookings.push(_objectSpread({
                  id: doc.id
                }, doc.data()));
              });
              return _context6.abrupt("return", bookings);

            case 11:
              _context6.prev = 11;
              _context6.t0 = _context6["catch"](2);
              console.error('Error getting bookings by date range: ', _context6.t0);
              throw _context6.t0;

            case 15:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[2, 11]]);
    } // Delete booking

  }, {
    key: "deleteBooking",
    value: function deleteBooking(bookingId) {
      var snapshot, batch;
      return regeneratorRuntime.async(function deleteBooking$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (this.init()) {
                _context7.next = 2;
                break;
              }

              throw new Error('Firebase not initialized');

            case 2:
              _context7.prev = 2;
              _context7.next = 5;
              return regeneratorRuntime.awrap(db.collection(this.collection).doc(bookingId)["delete"]());

            case 5:
              console.log("Booking ".concat(bookingId, " deleted successfully from Firebase")); // Also try to delete any bookings with matching bookingId in case of data inconsistency

              _context7.next = 8;
              return regeneratorRuntime.awrap(db.collection(this.collection).where('bookingId', '==', bookingId).get());

            case 8:
              snapshot = _context7.sent;

              if (snapshot.empty) {
                _context7.next = 15;
                break;
              }

              batch = db.batch();
              snapshot.docs.forEach(function (doc) {
                batch["delete"](doc.ref);
              });
              _context7.next = 14;
              return regeneratorRuntime.awrap(batch.commit());

            case 14:
              console.log("Additional bookings with ID ".concat(bookingId, " deleted from Firebase"));

            case 15:
              return _context7.abrupt("return", true);

            case 18:
              _context7.prev = 18;
              _context7.t0 = _context7["catch"](2);
              console.error('Error deleting booking from Firebase: ', _context7.t0);
              throw _context7.t0;

            case 22:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[2, 18]]);
    }
  }]);

  return FirebaseBookingService;
}(); // Initialize Firebase service


window.firebaseBookingService = new FirebaseBookingService(); // Fallback to localStorage if Firebase fails

window.localStorageFallback = {
  saveBooking: function saveBooking(bookingData) {
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    console.log('Booking saved to localStorage (Firebase fallback)');
  },
  updateBookingStatus: function updateBookingStatus(bookingId, updates) {
    var bookingData = JSON.parse(localStorage.getItem('currentBooking') || '{}');

    var updatedData = _objectSpread({}, bookingData, {}, updates);

    localStorage.setItem('currentBooking', JSON.stringify(updatedData));
    console.log('Booking updated in localStorage (Firebase fallback)');
  },
  getBooking: function getBooking(bookingId) {
    var bookingData = JSON.parse(localStorage.getItem('currentBooking') || '{}');
    return bookingData;
  },
  deleteBooking: function deleteBooking(bookingId) {
    // More targeted removal based on booking ID
    var keysToCheck = ['confirmedBooking', 'failedBooking', 'currentBooking'];
    var removed = false;
    keysToCheck.forEach(function (key) {
      var stored = localStorage.getItem(key);

      if (stored && stored !== 'null') {
        try {
          var parsed = JSON.parse(stored);

          if (parsed && parsed.bookingId === bookingId) {
            localStorage.removeItem(key);
            console.log("Booking ".concat(bookingId, " deleted from localStorage key: ").concat(key));
            removed = true;
          }
        } catch (e) {
          console.error("Error parsing ".concat(key, ":"), e);
        }
      }
    });

    if (!removed) {
      console.log("Booking ".concat(bookingId, " not found in localStorage"));
    }

    return true;
  }
}; // Initialize Firebase when DOM is ready

document.addEventListener('DOMContentLoaded', function () {
  // Try to initialize Firebase
  if (initializeFirebase()) {
    console.log('Firebase ready for use');
  } else {
    console.log('Firebase initialization failed, using localStorage fallback');
  }
}); // Also try to initialize immediately (in case DOM is already loaded)

if (document.readyState === 'loading') {// DOM is still loading
} else {
  // DOM is already loaded
  if (initializeFirebase()) {
    console.log('Firebase ready for use');
  } else {
    console.log('Firebase initialization failed, using localStorage fallback');
  }
}