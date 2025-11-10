
import dotenv from "dotenv";
import { token } from "morgan";
import { env } from "process";

dotenv.config();

export interface FirebaseConfig {
    type: string,
    project_id: string,
    private_key_id: string,
    private_key: string,
    client_email: string,
    client_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_x509_cert_url: string,
    universe_domain: string,
}


function validateFirebaseConfig() {
    return {
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN
    }
}


export const firebaseConfig = validateFirebaseConfig();

