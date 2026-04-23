import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBd7T7Oed283lTPrhCoF2XoOJLYpjipUj4",
  authDomain: "claseyhoryi.firebaseapp.com",
  projectId: "claseyhoryi",
  storageBucket: "claseyhoryi.firebasestorage.app",
  messagingSenderId: "304071182218",
  appId: "1:304071182218:web:383f001c5bef7e52a12a73"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 👇 AQUÍ VA LO QUE PREGUNTAS
googleProvider.setCustomParameters({
  prompt: "select_account"
});