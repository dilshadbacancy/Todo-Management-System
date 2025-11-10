import admin from 'firebase-admin';
import path from 'path';
import { firebaseConfig } from './firebase_config';


const serviceAccountPath = path.join(__dirname, "../../taskmanagementsystem.json");

const formattedConfig = {
    ...firebaseConfig,
    private_key: firebaseConfig.private_key!.replace(/\\n/g, "\n")
}


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(formattedConfig as admin.ServiceAccount),
    });
}

export default admin;