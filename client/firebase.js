import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (ONLY ONCE)
const app = initializeApp(firebaseConfig);

// Auth setup
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in with Google helper
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Sync with MongoDB backend (Using 8080 as configured in server/.env)
    const response = await fetch('https://flowstate-tvmf.onrender.com/api/v1/users/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user.displayName,
        email: user.email,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Improved client-side feedback based on controller messages
      if (data.user) {
        alert(data.message + ` User: ${data.user.username}`);
      } else {
        alert(data.message);
      }
    } else {
      console.error("Backend Error:", data.message);
      alert("Authentication failed: " + data.message); // Provide user feedback for errors
    }

    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
    alert("Error signing in with Google: " + error.message); // Provide user feedback for errors
    throw error;
  }
};

// Export
export { auth, provider, signInWithGoogle };