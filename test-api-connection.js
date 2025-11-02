// Test API Connection Script
// This script checks if the API server can be initialized

const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config();

console.log('🔍 Testing API Connection Setup...\n');

// Test 1: Check environment variables
console.log('1️⃣ Checking environment variables...');
if (process.env.API_KEY) {
  console.log('   ✅ API_KEY found in .env');
  console.log(`   📝 API Key: ${process.env.API_KEY.substring(0, 20)}...`);
} else {
  console.log('   ❌ API_KEY not found in .env');
}

if (process.env.PORT) {
  console.log(`   ✅ PORT configured: ${process.env.PORT}`);
} else {
  console.log('   ⚠️  PORT not set, will use default: 3000');
}

// Test 2: Check Firebase credentials
console.log('\n2️⃣ Checking Firebase credentials...');
try {
  const fs = require('fs');
  if (fs.existsSync('./serviceAccountKey.json')) {
    console.log('   ✅ serviceAccountKey.json found');
    const serviceAccount = require('./serviceAccountKey.json');
    if (serviceAccount.project_id) {
      console.log(`   ✅ Firebase Project: ${serviceAccount.project_id}`);
    }
    
    // Try to initialize Firebase
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      const db = admin.firestore();
      console.log('   ✅ Firebase Admin SDK initialized successfully');
      console.log('   ✅ Database connection ready');
      
      // Test database connection
      console.log('\n3️⃣ Testing database connection...');
      db.collection('bookings').limit(1).get()
        .then(() => {
          console.log('   ✅ Database connection successful');
          console.log('\n✅ All checks passed! API is ready to use.');
          process.exit(0);
        })
        .catch((error) => {
          console.log('   ❌ Database connection failed:', error.message);
          console.log('\n⚠️  Setup incomplete. Please check Firebase configuration.');
          process.exit(1);
        });
    } catch (error) {
      console.log('   ❌ Firebase initialization failed:', error.message);
      console.log('\n⚠️  Setup incomplete. Please check serviceAccountKey.json.');
      process.exit(1);
    }
  } else {
    console.log('   ❌ serviceAccountKey.json NOT found');
    console.log('   📝 Action required: Download from Firebase Console');
    console.log('      → Go to: Firebase Console > Project Settings > Service Accounts');
    console.log('      → Click: Generate New Private Key');
    console.log('      → Save as: serviceAccountKey.json in project root');
    console.log('\n⚠️  Setup incomplete. API cannot start without Firebase credentials.');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Error checking Firebase:', error.message);
  process.exit(1);
}

