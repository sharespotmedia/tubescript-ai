import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'tubescript-ai-fjtye',
  appId: '1:927194039153:web:44bb3d07639eb5142b2cd0',
  storageBucket: 'tubescript-ai-fjtye.firebasestorage.app',
  apiKey: 'AIzaSyA-dN95Ya6vMA9RHcgA11gWMhzbg51TTgc',
  authDomain: 'tubescript-ai-fjtye.firebaseapp.com',
  messagingSenderId: '927194039153',
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
