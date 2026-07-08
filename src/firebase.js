import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBIL4_XiAiTgI6ZmGArT6Jn02M5m7ZEgoA",
  authDomain: "pid-tracker-f37ad.firebaseapp.com",
  databaseURL: "https://pid-tracker-f37ad-default-rtdb.firebaseio.com",
  projectId: "pid-tracker-f37ad",
  storageBucket: "pid-tracker-f37ad.firebasestorage.app",
  messagingSenderId: "241685426291",
  appId: "1:241685426291:web:5611878ab9a65171d1ba06"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue };
