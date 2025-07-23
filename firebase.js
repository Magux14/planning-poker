// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDm-AvEErJaTOkpKudDGhhRPsK0pUYd64M",
    authDomain: "ionic-capacitor-generic.firebaseapp.com",
    projectId: "ionic-capacitor-generic",
    storageBucket: "ionic-capacitor-generic.firebasestorage.app",
    messagingSenderId: "670034150569",
    appId: "1:670034150569:web:060bfa350149e920a555b8",
    measurementId: "G-B49HY2FGT2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
