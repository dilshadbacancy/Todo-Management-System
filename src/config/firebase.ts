import admin from 'firebase-admin';
import path from 'path';


const serviceAccountPath = path.join(__dirname, "../../taskmanagementsystem.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
})

export default admin;