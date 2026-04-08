import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_APP.firebaseapp.com",
  projectId: "SEU_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
