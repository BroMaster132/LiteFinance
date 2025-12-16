<template>
    <Menubar   :model="items" pt:root:class="bg-transparent !border-0 !shadow-none">
        <template #start>
            <img src="/src/components/icons/icon.png" alt="LiteFinance" class="mr-2" style="height: 4rem;" />
        </template>
        <template #item="{ item, props, hasSubmenu, root }">
            <a v-ripple class="flex items-center" v-bind="props.action">
                <span>{{ item.label }}</span>
                <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
                <span v-if="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                <i v-if="hasSubmenu" :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"></i>
            </a>
        </template>
        <template #end>
            <Logs />
            <UserBar v-if="user" />

        </template>
    </Menubar>
</template>

<script setup>
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import Logs from '../Logs.vue';
import UserBar from '../UserBar.vue';
import { useUser } from '@/composables/useUser';
const { user } = useUser();
import { ref } from "vue";
import { useRouter } from 'vue-router';
const router = useRouter();



const items = ref([
  { label: 'Home', command: () => { router.push('/') } },
  { label: 'My Expenses', command: () => { router.push('/expenses') } },
  { label: 'Feedback', command: () => { router.push('/feedback') } }
]);

</script>
<style scoped>
:deep(.p-menubar-start) {
    margin-left: 100px;
}
:deep(.p-menubar-end) {
    margin-right: 100px;
}
:deep(.p-menubar) {
  background-color: black;
  border: none;
  box-shadow: none;
}
:deep(.p-menubar-root-list) {
    margin-left: auto;
}

</style>
