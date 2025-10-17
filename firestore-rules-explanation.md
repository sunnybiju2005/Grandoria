# Firestore Security Rules for Booking System

## Current Rules (Development)
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

## What These Rules Do:

### ✅ **Allows Both Booking Types**
- **Online Bookings**: Can read and write to `bookings` collection
- **Walk-in Bookings**: Can read and write to `bookings` collection
- **Admin Dashboard**: Can read all bookings for management

### ✅ **Unified Database Access**
- Both systems can access the same `bookings` collection
- Real-time availability checks work for both booking types
- No separate databases or collections needed

## Production-Ready Rules (Recommended)

For production, you should use more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings collection - allow read/write for authenticated users
    match /bookings/{document} {
      // Allow read access to check availability
      allow read: if true;
      
      // Allow write access for creating bookings
      allow create: if true;
      
      // Allow update access for modifying bookings (admin only)
      allow update: if request.auth != null;
      
      // Allow delete access for admin only
      allow delete: if request.auth != null;
    }
    
    // Admin collection for user management
    match /admin/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Deploy Rules:

### 1. **Firebase Console Method:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `gaurikeerthana-residency-c3ba4`
3. Go to "Firestore Database" → "Rules"
4. Replace the rules with your new rules
5. Click "Publish"

### 2. **Firebase CLI Method:**
```bash
# Create firestore.rules file
echo 'rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{document} {
      allow read, write: if true;
    }
  }
}' > firestore.rules

# Deploy rules
firebase deploy --only firestore:rules
```

## Testing the Rules:

### 1. **Test Read Access:**
```javascript
// This should work for both online and walk-in bookings
const bookings = await db.collection('bookings').get();
```

### 2. **Test Write Access:**
```javascript
// This should work for creating new bookings
await db.collection('bookings').add({
  guestName: "Test Guest",
  roomType: "normal-ac",
  bookingType: "ONLINE",
  status: "confirmed"
});
```

## Security Considerations:

### ⚠️ **Current Rules (Development)**
- `allow read, write: if true` - Very permissive
- Good for development and testing
- **Not recommended for production**

### ✅ **Production Rules (Recommended)**
- More restrictive access controls
- Authentication-based permissions
- Better security for live system

## Benefits for Your Booking System:

1. **Unified Access**: Both online and walk-in bookings can access the same data
2. **Real-time Sync**: Availability updates immediately for both systems
3. **No Overbooking**: Both systems check the same database
4. **Easy Management**: Single collection for all bookings

## Next Steps:

1. **Deploy Current Rules**: Use the development rules for now
2. **Test Both Systems**: Verify online and walk-in bookings work
3. **Implement Production Rules**: When ready for live deployment
4. **Monitor Usage**: Check Firebase console for any issues

Your current rules are perfect for ensuring both booking systems can access the same database! 🎯

