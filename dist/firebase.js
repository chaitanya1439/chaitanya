"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth"); // ✅ Correct import
const firebaseConfig = {
    apiKey: "AIzaSyAXt8laOXa8OYnHeFYu-QKSHGd1ovMK_6w",
    authDomain: "normal-2a466.firebaseapp.com",
    projectId: "normal-2a466",
    storageBucket: "normal-2a466.appspot.com",
    messagingSenderId: "864436503164",
    appId: "1:864436503164:web:ffced5de55be5a9c333ff9",
    measurementId: "G-E5JH4Z0PGX",
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(app);
