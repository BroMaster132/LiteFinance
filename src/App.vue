<script setup>
import NavBar from '@/components/layouts/NavBar.vue'
import Footer from '@/components/layouts/Footer.vue'
import { onMounted } from 'vue';
import { useUser } from '@/composables/useUser';

const { initAuthListener } = useUser();

onMounted(() => {
  initAuthListener();
});
</script>

<template>
  <div class="page">
    <NavBar />

    <main class="page-main">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>


<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

/* общий лейаут */
.page {
  min-height: 100vh;        /* растянуть на высоту экрана */
  display: flex;
  flex-direction: column;   /* сверху вниз: navbar, main, footer */
}

/* основная часть — растягивается, выталкивает футер вниз */
.page-main {
  flex: 1;
}
</style>
