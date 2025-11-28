<template>
  <!-- Button that opens drawer (for example) -->
  <Button icon="pi pi-user" rounded @click="visibleRight = true" />

  <Drawer v-model:visible="visibleRight" position="right" :modal="true" :showCloseIcon="false" class="profile-drawer">
    <div class="sidebar">
      <div class="profile">
        <img class="avatar" :src="user.photoURL"  alt="avatar"/>
        <div class="name">{{ user.displayName }}</div>
        <div class="email">{{ user.email }}</div>
      </div>

      <hr class="divider" />

      <nav class="menu">
        <Button label="Profile" class="menu-item" variant="outlined" />
        <Button label="My Expenses" class="menu-item" variant="outlined" />
        <Button label="Add Expense" class="menu-item" variant="outlined" />
      </nav>

      <hr class="divider" />

      <nav class="menu">
        <Button label="Settings" class="menu-item" variant="outlined" />
        <Button label="Help" class="menu-item" variant="outlined" />
        <Button label="Privacy Policy" class="menu-item" variant="outlined" />
        <hr class="divider" />
        <Button label="Log out" @click="googleLogout()" class="menu-item" variant="outlined" />
      </nav>
    </div>
  </Drawer>
</template>

<script setup>
import { ref } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import { useUser } from '@/composables/useUser';
const { user, googleLogout } = useUser();

const visibleRight = ref(false)
</script>

<style scoped>
/* Drawer root */
.profile-drawer {
  width: 280px;                /* similar width to screenshot */
}

/* Drawer content */
.profile-drawer .p-drawer-content {
  padding: 24px 16px;
  background: #f3f3f3;
  height: 100%;
  box-sizing: border-box;
}

/* Layout inside drawer */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 2px;
}

.email {
  font-size: 12px;
  color: #555;
}

.divider {
  border: none;
  border-top: 1px solid #cfcfcf;
  margin: 16px 0;
}

.menu {
  display: flex;
  flex-direction: column;
}

.menu-item {
  text-align: right;
  background: none;
  border: none;
  padding: 6px 0;
  font-size: 14px;
  cursor: pointer;
}

.menu-item:hover {
  text-decoration: underline;
}
</style>
