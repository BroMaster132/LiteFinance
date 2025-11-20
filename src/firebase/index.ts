import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyCSZ02sP3iYgIT-OEr375CrqKKkrBdEAc8",
  authDomain: "diploma-d854b.firebaseapp.com",
  projectId: "diploma-d854b",
  storageBucket: "diploma-d854b.appspot.com",
  messagingSenderId: "573812565293",
  appId: "1:573812565293:web:bc2baef031d55fb7f3dfa4"
};

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const storage = getStorage(app)

export { db, storage }
