<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/layouts/NavBar.vue'
import Footer from './components/layouts/Footer.vue';
</script>

<template>
  <NavBar />
  <RouterView />
  <Footer />
</template>

<style scoped>

</style>
