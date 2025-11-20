import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAhkeFd7lhKVtogOX5aUWyovxeQN3sPO74",
  authDomain: "litefinance1-7ced7.firebaseapp.com",
  projectId: "litefinance1-7ced7",
  storageBucket: "litefinance1-7ced7.firebasestorage.app",
  messagingSenderId: "387314397832",
  appId: "1:387314397832:web:8ef3d91d0b6bfd1a60e53d",
  measurementId: "G-GTK7BSEJ1X"
};

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const storage = getStorage(app)

export { db, storage }
