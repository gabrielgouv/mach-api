import * as admin from 'firebase-admin'

// Initialize app
admin.initializeApp()

const firestore = admin.firestore();
export default firestore;

const firebase = admin.database();
export { firebase }