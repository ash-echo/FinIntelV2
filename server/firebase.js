require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

let db = null;

try {
    const credentialPath = process.env.FIREBASE_CREDENTIAL_PATH;

    if (!credentialPath) {
        throw new Error("FIREBASE_CREDENTIAL_PATH not set in .env");
    }

    // Resolve path relative to this file if it's not absolute
    const serviceAccountPath = path.isAbsolute(credentialPath)
        ? credentialPath
        : path.join(__dirname, credentialPath);

    console.log(`🔍 Attempting to load credentials from: ${serviceAccountPath}`);

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log(`🔥 Firebase Initialized Successfully (Key: ${path.basename(serviceAccountPath)})`);
} catch (error) {
    console.error(`⚠️ Firebase Initialization Failed. \n   Reason: ${error.message} \n   Stack: ${error.stack}`);
    console.log('Running in IN-MEMORY mode until .env points to valid json key');
}

module.exports = { db };
