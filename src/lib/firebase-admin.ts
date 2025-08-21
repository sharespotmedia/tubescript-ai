import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
    throw new Error('Firebase service account key is not set in environment variables.');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
}

export const auth = admin.auth();
export const db = admin.firestore();
