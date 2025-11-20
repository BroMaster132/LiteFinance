<template>
    <Button v-if="!user" label="Log in" icon="pi pi-user" @click="visible = true" />
    <Button v-if="!user" label="Sign Up" class="p-button-primary" @click="visible1 = true" />
    <div v-else class="flex items-center gap-2">
        <img :src="user.photoURL" alt="user-icon" width="30px" />
        <span>{{ user.email }}</span>

    </div>
    <Dialog v-model:visible="visible" pt:root:class="border-0 bg-slate-900" pt:mask:class="backdrop-blur-sm">
        <template #container="{ closeCallback }">
            <div class="flex flex-col px-8 py-8 gap-6 rounded-2xl" style="background:#c9c9c9 ;">
                <img src="../components/icons/icon.png" alt="LiteFinance" class="self-center mb-4" style="height: 4rem;" />
                <p style="font-size: 25px; text-align: center;">Log in</p>
                <div class="inline-flex flex-col gap-2">
                    <InputText id="email" placeholder="Email" class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-80" v-model="email"></InputText>
                </div>
                <div class="inline-flex flex-col gap-2">
                    <InputText id="password" placeholder="password" class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-80" type="password" v-model="password"></InputText>
                </div>
                <div class="flex items-center gap-4">
                    <Button label="Sign-In" @click="login(email,password)" variant="text" class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
                    <Button label="Cancel" @click="closeCallback" variant="text" class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
                </div>
                <div>
                    <Divider />
                    <img src="../components/icons/google.png" @click="googleRegister" alt="google" width="50px">
                    <a href=""><img src="../components/icons/apple.png" alt="apple" width="50px"></a>
                    <a href=""><img src="../components/icons/facebook.png" alt="facebook" width="50px"></a>

                </div>
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="visible1" pt:root:class="border-0 bg-slate-900" pt:mask:class="backdrop-blur-sm">
        <template #container="{ closeCallback }">
            <div class="flex flex-col px-8 py-8 gap-6 rounded-2xl" style="background:#c9c9c9 ;">
                <img src="../components/icons/icon.png" alt="LiteFinance" class="self-center mb-4" style="height: 4rem;" />
                <p style="font-size: 25px; text-align: center;">Sign Up</p>
                <div class="inline-flex flex-col gap-2">
                    <InputText id="email" placeholder="Email" class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-80" v-model="email"></InputText>
                </div>
                <div class="inline-flex flex-col gap-2">
                    <InputText id="password" placeholder="password" class="!bg-white/20 !border-0 !p-4 !text-primary-50 w-80" type="password" v-model="password"></InputText>
                </div>
                <div class="flex items-center gap-4">
                    <Toast />
                    <Button label="Register" @click="register(email, password) " variant="text" class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>
                    <Button label="Cancel" @click="close()" variant="text" class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"></Button>

                </div>
            </div>
        </template>
    </Dialog>
    


    

</template>
<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import { useUser } from '@/composables/useUser.js';

import { useToast } from "primevue/usetoast";
const toast = useToast();
const { user, googleLogout, googleRegister, createUser, loginUser } = useUser()

import { ref } from 'vue';
const visible = ref(false);
const visible1 = ref(false);
const register = (email, password) => {
    console.log(email,password);
    
    createUser(email, password);
    toast.add({ severity: 'success', summary: 'success', detail: 'Succesfully registrated', life: 3000 });
};

const close = () => {
    toast.add({ severity: 'info', summary: 'Info', detail: 'Registration cancelled', life: 3000 });
    visible1.value = false;
};

const login = (email, password) => {
    console.log(user.value);
    
    loginUser(email, password);
    toast.add({ severity: 'success', summary: 'success', detail: 'Succesfully logged in', life: 3000 });
};


</script>

<style scoped>
Button {
    margin-left: 8px;
}
</style>