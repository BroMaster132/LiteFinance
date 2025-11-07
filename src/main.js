import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjkDgomRdNzq9cwi2lfAz7QcTePMvhxxE",
  authDomain: "litefinance-d01f2.firebaseapp.com",
  projectId: "litefinance-d01f2",
  storageBucket: "litefinance-d01f2.firebasestorage.app",
  messagingSenderId: "817751383399",
  appId: "1:817751383399:web:86c54dcb324de739a9e3c2",
  measurementId: "G-65NNBV6R5M"
};

// Initialize Firebase
const analytics = getAnalytics(initializeApp(firebaseConfig));

const app = createApp(App);


app.use(PrimeVue, { theme: { preset: Aura } })



app.mount('#app')