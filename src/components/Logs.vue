<template>
    <Toast />
    <Button v-if="!user" label="Log in" icon="pi pi-user" @click="visible = true" class="soft-pill"/>
    <Button v-if="!user" label="Sign Up" class="soft-pill" @click="visible1 = true"  />

    <div v-else class="flex items-center gap-2">
        <img :src="user.photoURL" alt="user-icon" width="30px" />
        <span>{{ user.email }}</span>

    </div>
    <Dialog  v-model:visible="visible"  modal  pt:root:class="!bg-transparent !border-0 !shadow-none"  pt:mask:class="'auth-dialog-mask'">
      <template #container="{ closeCallback }">
        <div class="auth-card">
          <img  src="../components/icons/icon.png"  alt="LiteFinance"  class="auth-logo"/>

          <p class="auth-title">Log in</p>

          <div class="auth-field">
            <InputText  id="email"  placeholder="Email or username"  v-model="email"  class="auth-input"/>
          </div>

          <div class="auth-field">
            <InputText  id="password"  placeholder="Password..."  type="password"  v-model="password"  class="auth-input"/>

          </div>

          <div class="auth-actions">
            <Button  label="Enter"  @click="login(email,password)"  class="auth-btn-primary"/>
            <button class="auth-forgot">Forgot password?</button>
          </div>

          <Divider><span class="auth-or">OR</span></Divider>
          <div class="auth-social-row">
            <img  src="../components/icons/google.png"  @click="googleRegister"  alt="google"  class="auth-social-icon"/>
            <img src="../components/icons/apple.png" alt="apple" class="auth-social-icon"/>
            <img src="../components/icons/facebook.png" alt="facebook" class="auth-social-icon"/>
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog  v-model:visible="visible1"  modal  pt:root:class="!bg-transparent !border-0 !shadow-none" pt:mask:class="'auth-dialog-mask'">
      <template #container="{ closeCallback }">
        <div class="auth-card">
          <img  src="../components/icons/icon.png"  alt="LiteFinance"  class="auth-logo"/>
          <p class="auth-title">Sign up</p>

          <div class="auth-field">
            <Form v-slot="$form" :resolver="emailResolver" :initialValues="initialValues"  @submit="onFormSubmit"  >
              <div class="flex flex-col gap-1">
                  <InputText  id="email" name="password"  placeholder="Email"  v-model="email"  class="auth-input"/>
                  <template  v-if="$form.password?.invalid">
                        <Message v-for="(error, index) of $form.password.errors" :key="index" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                </div>
            </Form>
          </div>

          <div class="auth-field">
            <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues"  @submit="onFormSubmit"  >
                <div class="flex flex-col gap-1">
                    <Password name="password" placeholder="Password" v-model="password"  class="auth-input" :feedback="false" fluid  />
                    <template  v-if="$form.password?.invalid">
                        <Message v-for="(error, index) of $form.password.errors" :key="index" severity="error" size="small" variant="simple">{{ error.message }}</Message>
                    </template>
                </div>
            </Form>
          </div>


          <div class="auth-actions">
            <Button label="Create account"  @click="register(email, password)"  class="auth-btn-primary"/>
            <Button label="Cancel" class="auth-cancel"  @click="close()" />
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
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import Password from 'primevue/password';
import { Form } from '@primevue/forms';
import Message from 'primevue/message';

const toast = useToast();
const { user, googleLogout, googleRegister, createUser, loginUser } = useUser()


const visible = ref(false);
const visible1 = ref(false);


const register = async (email, password) => {
  try {
    await createUser(email, password);

    visible1.value = false;

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Successfully registered',
      life: 3000
    });
  } catch (error) {
    if (error.code === 'custom/invalid-email-format') {
      toast.add({
        severity: 'error',
        summary: 'Invalid email',
        detail: 'Email format is incorrect',
        life: 3000
      });
      return;
    }

    if (error.code === 'custom/weak-password') {
      const details = Array.isArray(error.details)
        ? error.details.join(', ')
        : 'at least 6 characters, an uppercase and a lowercase letter';

      toast.add({
        severity: 'error',
        summary: 'Weak password',
        detail: `Password must contain ${details}.`,
        life: 3000
      });
      return;
    }

    if (error.code === 'auth/email-already-in-use') {
      toast.add({
        severity: 'warn',
        summary: 'Email in use',
        detail: 'This email is already registered',
        life: 3000
      });
      return;
    }

    toast.add({
      severity: 'error',
      summary: 'Registration error',
      detail: error.message || 'Unknown error',
      life: 3000
    });
  }
};




const close = () => {
    toast.add({ severity: 'info', summary: 'Info', detail: 'Registration cancelled', life: 3000 });
    visible1.value = false;
};

const login = async (email, password) => {
  try {
    await loginUser(email, password);

    visible.value = false;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Successfully logged in",
      life: 3000
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error.code);

    // неправильный формат email
    if (error.code === "custom/invalid-email-format") {
      toast.add({
        severity: "error",
        summary: "Invalid email",
        detail: "Email format is incorrect",
        life: 3000
      });
      return;
    }

    // пустой пароль
    if (error.code === "custom/empty-password") {
      toast.add({
        severity: "error",
        summary: "Password required",
        detail: "Please enter password",
        life: 3000
      });
      return;
    }

    // учетная запись не найдена
    if (error.code === "auth/user-not-found") {
      toast.add({
        severity: "error",
        summary: "User not found",
        detail: "No account with this email",
        life: 3000
      });
      return;
    }

    // неверный пароль или ошибка Firebase v10+
    if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      toast.add({
        severity: "error",
        summary: "Wrong password",
        detail: "Password is incorrect",
        life: 3000
      });
      return;
    }

    // слишком много попыток
    if (error.code === "auth/too-many-requests") {
      toast.add({
        severity: "warn",
        summary: "Too many attempts",
        detail: "Try again later",
        life: 3000
      });
      return;
    }

    // fallback
    toast.add({
      severity: "error",
      summary: "Login error",
      detail: error.message || "Unknown error",
      life: 3000
    });
  }
};





const initialValues = ref({
    password: ''
});
const emailResolver = ref(zodResolver(
    z.object({
        password: z
            .string()
            .refine((value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(value),
  { message: 'Invalid email format' }  )
    })
));
const resolver = ref(zodResolver(
    z.object({
        password: z
            .string()
            .min(6, { message: 'Minimum 6 characters.' })
            .refine((value) => /[a-z]/.test(value), {
                message: 'Must have a lowercase letter.'
            })
            .refine((value) => /[A-Z]/.test(value), {
                message: 'Must have an uppercase letter.'
            })
    })
));

const onFormSubmit = ({ valid }) => {
    if (valid) {
        toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
    }
};

</script>

<style scoped>
Button {
    margin-left: 8px;
}
.soft-pill {
  border-radius: 999px;
  background-color: #f3e8ff;
  border: none;
  color: #a855f7;
  font-weight: 500;
  padding: 0.5rem 1.8rem;
  box-shadow: none;
}

.soft-pill:hover {
  background-color: #ebe0ff !important;
  color: #9333ea !important;
}

.soft-pill:focus-visible{
  outline: none;
  box-shadow: 0 0 0 2px #ede9fe, 0 0 0 4px #a855f7;
}

/* Dialog background / mask */
:deep(.auth-dialog-root) {
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.auth-dialog-mask) {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
}

/* Card */
.auth-card {
  width: 430px;
  padding: 2.5rem 3rem 2.8rem;
  border-radius: 40px;
  background: rgba(249, 250, 251, 0.95);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.1rem;
}

/* Logo */
.auth-logo {
  height: 4rem;
  width: 4rem;
  border-radius: 1.4rem;
  margin: 0 auto 0.5rem;
  box-shadow: 0 16px 30px rgba(168, 85, 247, 0.55);
}

/* Title */
.auth-title {
  margin: 0;
  text-align: center;
  font-size: 1.7rem;
  font-weight: 600;
  color: #4b5563;
}

/* Fields */
.auth-field {
  margin-top: 0.25rem;
}

/* PrimeVue InputText */
:deep(.auth-input.p-inputtext) {
  width: 100%;
  border-radius: 999px;
  padding: 0.85rem 1.4rem;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

:deep(.auth-input.p-inputtext::placeholder) {
  color: #cbd5f5;
}

/* Actions row */
.auth-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.4rem;
}

/* Primary "Enter" button (outlined purple pill) */
:deep(.auth-btn-primary.p-button) {
  flex: 1;
  border-radius: 999px;
  border: 1px solid #c084fc;
  background: #f5ebff;
  color: #a855f7;
  font-weight: 600;
  padding-block: 0.7rem;
  box-shadow: none;
}

.auth-btn-primary:hover {
  background: #ede4ff;

}

/* Forgot password */
.auth-forgot {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: #9ca3af;
  cursor: pointer;
}

/* Divider "OR" text */
.auth-or {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Social icons */
.auth-social-row {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 0.4rem;
}

.auth-social-icon {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  padding: 0.6rem;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  object-fit: contain;
}

.auth-social-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
}

/* Small screens */
@media (max-width: 480px) {
  .auth-card {
    width: 100%;
    padding: 2rem 1.8rem 2.2rem;
  }
}

:deep(.p-button.signup-pill) {
  border-radius: 999px;          /* full pill */
  background-color: #f5ebff;     /* light lilac fill */
  border: 2px solid #a855f7;     /* vivid purple border */
  color: #a855f7;                /* purple text */
  font-weight: 500;
  padding: 0.45rem 1.9rem;
  box-shadow: none;
}

/* hover state */
:deep(.p-button.signup-pill:hover) {
  background-color: #ede4ff;
  border-color: #9333ea;
  color: #9333ea;
}

/* focus ring */
:deep(.p-button.signup-pill:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 2px #ede9fe, 0 0 0 4px #a855f7;
}

.auth-title {
  margin: 0;
  text-align: center;
  font-size: 1.7rem;
  font-weight: 600;
  color: #4b5563;
}

.auth-subtitle {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: #9ca3af;
}

.auth-link {
  border: none;
  background: transparent;
  padding: 0;
  margin-left: 0.25rem;
  color: #a855f7;
  cursor: pointer;
}

/* fields */
.auth-field {
  margin-top: 0.3rem;
}

/* pill inputs */
:deep(.auth-input.p-inputtext) {
  width: 100%;
  border-radius: 999px;
  padding: 0.85rem 1.4rem;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

:deep(.auth-input.p-inputtext::placeholder) {
  color: #cbd5f5;
}

/* actions row */
.auth-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

/* purple outlined pill button (like Enter in screenshot) */
:deep(.auth-btn-primary.p-button) {
  flex: 1;
  border-radius: 999px;
  border: 1px solid #c084fc;
  background: #f5ebff;
  color: #a855f7;
  font-weight: 600;
  padding-block: 0.7rem;
  box-shadow: none;
}

:deep(.auth-btn-primary.p-button:hover) {
  background: #ede4ff;
}

/* cancel text */
.auth-cancel {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: #9ca3af;
  cursor: pointer;
}

.auth-cancel:hover {
    background-image: none;
  color: #6b7280;
}

/* divider */
.auth-or {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

/* social buttons */
.auth-social-row {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 0.4rem;
}

.auth-social-icon {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  padding: 0.6rem;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  object-fit: contain;
}

.auth-social-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
}

/* responsive */
@media (max-width: 480px) {
  .auth-card {
    width: 100%;
    padding: 2rem 1.8rem 2.2rem;
  }
}

:deep(.p-password-input) {
  width: 100%;
  border-radius: 999px;
  padding: 0.85rem 1.4rem;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}
:deep(.p-password.p-password-input::placeholder) {
  color: #cbd5f5;
}
</style>
