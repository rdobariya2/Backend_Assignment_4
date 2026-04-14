import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../..', 'Assignment_4.json');
const serviceAccount = require(serviceAccountPath) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

const auth: Auth = getAuth();

const db: Firestore = getFirestore();

export { auth, db };