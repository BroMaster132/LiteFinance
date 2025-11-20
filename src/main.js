import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

// База стилей + иконки
import '@primeuix/styled';
import 'primeicons/primeicons.css';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        // options не обязательно, можно оставить по умолчанию
        // options: {
        //   darkModeSelector: 'system',
        // }
    }
});

app.use(router);
app.mount('#app');