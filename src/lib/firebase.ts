/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9DT541sAEDGhM3a_zNvxDFbQDEdoN4fA",
  authDomain: "academic-data-store.firebaseapp.com",
  projectId: "academic-data-store",
  storageBucket: "academic-data-store.firebasestorage.app",
  messagingSenderId: "434659010881",
  appId: "1:434659010881:web:b547f4cdc60b59523319c0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure auth settings for better network resilience
auth.useDeviceLanguage();

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: 50 * 1024 * 1024 // 50MB cache for offline support
}, "ai-studio-academicdatastor-70e5e4dd-682c-4b6e-84e4-ebc88e3fdf52");
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };