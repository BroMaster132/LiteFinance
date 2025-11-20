<template>
    <Menubar :model="items">
        <template #start>
            <img src="/src/assets/icon.png" alt="LiteFinance" class="mr-2" style="height: 4rem;" />
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
            <div class="flex items-center gap-2">
                <Button label="Sign in / Sign up"/>
            </div>
        </template>
</Menubar>
</template>

<script setup>
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';

import { ref } from "vue";

const items = ref([
    {
        label: 'Features',
    },
    {
        label: 'My Spending',
    },
    {
        label: 'Feedback',
    }
]);

</script>
<style scoped>
:deep(.p-menubar-root-list) {
    background-color: var(--vwa-c-bg-1);
    position: relative;
    left: 250px;
    font-size: 15pt;
}
.p-menubar {
    box-shadow: none;
    border: none;
    padding: 0;
    background-color: var(--vwa-c-bg-1);
}   
:deep(.p-menubar-start) {
    margin-left: 200px;
}
:deep(.p-menubar-end) {
    margin-right: 50px;
}
</style>