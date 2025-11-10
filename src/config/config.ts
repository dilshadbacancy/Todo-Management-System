import dotenv from "dotenv";
import { env } from "process";
import { FirebaseConfig } from "./firebase_config";

dotenv.config();

interface Config {
    server: {
        port: string;
        nodeEnv: string;
    }
    database: {
        url: string;
    }
    keys: {
        secret_keys: {
            jwt_key: string | undefined,
            jwt_expires_in_day: string | undefined,
        },
        firebase: FirebaseConfig | undefined
    }
}



function validateConfig(): Config {

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }

    if (!process.env.PORT) {
        throw new Error("PORT is not set");
    }

    if (!process.env.NODE_ENV) {
        throw new Error("NODE_ENV is not set");
    }


    return {
        server: {
            port: process.env.PORT,
            nodeEnv: process.env.NODE_ENV,
        },
        database: {
            url: process.env.MONGODB_URI,
        },
        keys: {
            secret_keys: {
                jwt_key: process.env.JWT_SECRET,
                jwt_expires_in_day: process.env.JWT_EXPIRES_IN,
            },
            firebase: process.env.FIREBASE_ADMIN
                ? JSON.parse(process.env.FIREBASE_ADMIN)
                : undefined
        }
    };
}

export const config = validateConfig(); 