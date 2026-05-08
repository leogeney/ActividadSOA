import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({ 
  login: " " // ← espacio fuerza a GitHub a mostrar el login siempre
});

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ auth_type: "reauthenticate" });