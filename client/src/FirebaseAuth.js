// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

 const firebaseConfig = {
    apiKey: "AIzaSyC4x1lCVCeDPo-91whpby8MYpMpJ8U72Ak",
    authDomain: "webmark-3bd3a.firebaseapp.com",
    projectId: "webmark-3bd3a",
    storageBucket: "webmark-3bd3a.appspot.com",
    messagingSenderId: "789166247094",
    appId: "1:789166247094:web:bc8b249b89cf5bffe12a17",
    measurementId: "G-HSMKY7H9XY"
  };
  // Initialize Firebase
const auth = firebase.initializeApp(firebaseConfig);
//const auth = 6;
export default auth;