# Firebase Setup Guide for Gaurikeerthana Residency

## 🔥 **Step-by-Step Firebase Setup**

### **Step 1: Create Firebase Project**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Project name: `gaurikeerthana-residency-c3ba4`
   - Click "Continue"

3. **Enable Google Analytics (Optional)**
   - Choose "Enable Google Analytics for this project"
   - Select Analytics account or create new one
   - Click "Create project"

4. **Wait for Project Creation**
   - Firebase will create your project
   - Click "Continue" when ready

### **Step 2: Enable Firestore Database**

1. **Navigate to Firestore**
   - In Firebase Console, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (for development)
   - Click "Next"

3. **Choose Location**
   - Select "asia-south1 (Mumbai)" (closest to India)
   - Click "Done"

4. **Database Created**
   - Your Firestore database is now ready
   - You'll see the database interface

### **Step 3: Get Configuration Keys**

1. **Go to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`)
   - App nickname: `Hotel Booking Website`
   - Click "Register app"

3. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyDK0nn070RQAkmL_EzzfKo8HyBw78wyWzg",
     authDomain: "gaurikeerthana-residency-c3ba4.firebaseapp.com",
     projectId: "gaurikeerthana-residency-c3ba4",
     storageBucket: "gaurikeerthana-residency-c3ba4.firebasestorage.app",
     messagingSenderId: "875606607101",
     appId: "1:875606607101:web:baa1cf0e22b0d52c466a94",
     measurementId: "G-X365HD4ESW"
   };
   ```

### **Step 4: Update Your Website**

1. **Edit firebase-config-simple.js**
   - Open `Grandoria/firebase-config-simple.js`
   - The configuration has been updated with your new Firebase project:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyDK0nn070RQAkmL_EzzfKo8HyBw78wyWzg",
     authDomain: "gaurikeerthana-residency-c3ba4.firebaseapp.com",
     projectId: "gaurikeerthana-residency-c3ba4",
     storageBucket: "gaurikeerthana-residency-c3ba4.firebasestorage.app",
     messagingSenderId: "875606607101",
     appId: "1:875606607101:web:baa1cf0e22b0d52c466a94",
     measurementId: "G-X365HD4ESW"
   };
   ```

2. **Test the Integration**
   - Open your website
   - Try making a booking
   - Check browser console for Firebase messages
   - Check Firebase Console → Firestore → Data to see bookings

### **Step 5: Set Up Security Rules (Important!)**

1. **Go to Firestore Rules**
   - In Firebase Console, click "Firestore Database"
   - Click "Rules" tab

2. **Update Security Rules**
   - Replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write access to bookings collection
       match /bookings/{document} {
         allow read, write: if true; // For development only
       }
     }
   }
   ```

3. **For Production (Recommended)**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write access to bookings collection
       match /bookings/{document} {
         allow read, write: if request.auth != null; // Requires authentication
       }
     }
   }
   ```

### **Step 6: Test Your Setup**

1. **Make a Test Booking**
   - Go to your website
   - Fill out the booking form
   - Complete the payment process
   - Check if data appears in Firebase Console

2. **Check Admin Dashboard**
   - Open `admin-dashboard.html`
   - You should see your test booking
   - Try filtering by status

3. **Verify Data Structure**
   - In Firebase Console, check the data structure
   - Each booking should have all required fields

## 📊 **Expected Data Structure**

Your bookings will be stored like this in Firestore:

```json
{
  "bookingId": "GR-1704901234567-123",
  "guestName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "arrivalDate": "2024-01-15",
  "departureDate": "2024-01-17",
  "roomType": "deluxe-ac",
  "roomTypeText": "Deluxe AC Room",
  "roomCount": 2,
  "roomRate": 4000,
  "subtotal": 8000,
  "gst": 400,
  "total": 8400,
  "paymentMethod": "razorpay",
  "status": "confirmed",
  "paymentStatus": "success",
  "paymentDate": "2024-01-10T10:30:00.000Z",
  "timestamp": "2024-01-10T10:30:00.000Z",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Firebase not initialized"**
   - Check if firebase-config.js is loaded correctly
   - Verify your configuration keys are correct

2. **"Permission denied"**
   - Check Firestore security rules
   - Make sure rules allow read/write access

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

4. **Data not appearing**
   - Check browser console for errors
   - Verify Firestore database is enabled
   - Check if you're looking at the right project

### **Browser Console Messages:**
- ✅ **Success**: "Firebase initialized successfully"
- ✅ **Success**: "Booking saved to Firebase with ID: xxxxx"
- ❌ **Error**: Check error messages and fix accordingly

## 📈 **Monitoring and Analytics**

### **Firebase Console Features:**
1. **Real-time Data**: See bookings as they happen
2. **Usage Statistics**: Monitor database usage
3. **Error Logging**: View any errors
4. **Performance Monitoring**: Track response times

### **Admin Dashboard Features:**
1. **View All Bookings**: See all bookings in one place
2. **Filter by Status**: Filter confirmed, pending, failed bookings
3. **Export Receipts**: Download booking receipts
4. **Statistics**: See booking counts and totals

## 🚀 **Next Steps**

### **Immediate:**
1. Set up Firebase project
2. Update configuration
3. Test booking flow
4. Verify admin dashboard

### **Short-term:**
1. Set up proper security rules
2. Add authentication for admin access
3. Implement email notifications
4. Add more analytics

### **Long-term:**
1. Set up automated backups
2. Implement advanced reporting
3. Add customer management features
4. Integrate with hotel management systems

## 📞 **Support**

If you encounter any issues:
1. Check browser console for error messages
2. Verify Firebase configuration
3. Check Firestore security rules
4. Ensure internet connection is stable

Your Firebase integration is now ready! 🎉
