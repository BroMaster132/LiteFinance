<template>
  <div class="settings-page">
    <h1 class="settings-title">Settings</h1>

    <div class="settings-grid">
      <!-- Profile section -->
      <section class="settings-card">
        <h2>Profile</h2>

        <div class="field">
          <label for="name">Name</label>
          <InputText id="name" v-model="form.name" placeholder="Your name" />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model="form.email" placeholder="Your email" />
        </div>

        <div class="field">
          <label for="currentPassword">Current password (for email / password change)</label>
          <Password
            id="currentPassword"
            v-model="form.currentPassword"
            toggleMask
            :feedback="false"
            placeholder="Current password"
          />
        </div>

        <div class="field">
          <label for="newPassword">New password</label>
          <Password
            id="newPassword"
            v-model="form.newPassword"
            toggleMask
            :feedback="false"
            placeholder="New password"
          />
        </div>

        <div class="field">
          <label for="confirmPassword">Confirm new password</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            toggleMask
            :feedback="false"
            placeholder="Confirm new password"
          />
        </div>
      </section>

      <!-- Appearance / language -->
      <section class="settings-card">
        <h2>Appearance</h2>
        <div class="field">
          <label>Theme</label>
          <Dropdown
            v-model="form.theme"
            :options="themes"
            optionLabel="label"
            optionValue="value"
            placeholder="Select theme"
          />
        </div>
        <div class="field switch-field">
          <span>Dark mode</span>
          <InputSwitch v-model="form.darkMode" />
        </div>
      </section>

      <!-- Notifications -->
      <section class="settings-card">
        <h2>Notifications</h2>
        <div class="field switch-field">
          <span>Email notifications</span>
          <InputSwitch v-model="form.emailNotifications" />
        </div>
        <div class="field switch-field">
          <span>Push notifications</span>
          <InputSwitch v-model="form.pushNotifications" />
        </div>
      </section>
    </div>

    <div class="settings-actions">
      <Button
        label="Cancel"
        class="p-button-text"
        :disabled="saving"
        @click="resetForm"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        :loading="saving"
        @click="saveSettings"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

import InputText from 'primevue/inputtext'
import InputSwitch from 'primevue/inputswitch'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Password from 'primevue/password'

import { useUser } from '@/composables/useUser'

const toast = useToast()
const { user, changeUserCredentials } = useUser()

const themes = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const defaultForm = {
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  theme: 'system',
  darkMode: false,
  emailNotifications: true,
  pushNotifications: true,
}

const form = reactive({ ...defaultForm })
const saving = ref(false)

function fillFromUser(u) {
  if (!u) return
  form.name = u.name || u.displayName || ''
  form.email = u.email || ''
}

onMounted(() => {
  if (user.value) {
    fillFromUser(user.value)
  }
})

watch(
  () => user.value,
  (val) => {
    if (val) fillFromUser(val)
  },
  { immediate: false },
)

function resetForm() {
  Object.assign(form, defaultForm)
  if (user.value) {
    fillFromUser(user.value)
  }
}

function getFirebaseMessage(code, message) {
  const map = {
    'auth/wrong-password': 'Incorrect password',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/email-already-in-use': 'This email is already taken',
    'auth/invalid-email': 'Email is invalid',
    'auth/requires-recent-login': 'Please re-login to change email or password',
    'current-password-required': 'Enter current password to change email or password',
    'no-auth-user': 'You must be logged in',
    'nothing-to-update': 'Nothing to update',
  }
  if (map[code]) return map[code]
  return message || code || 'Unknown error'
}

async function saveSettings() {
  if (saving.value) return

  try {
    if (!user.value) {
      toast.add({
        severity: 'error',
        summary: 'Not logged in',
        detail: 'Please log in again',
        life: 3000,
      })
      return
    }

    // Password match check
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.add({
        severity: 'warn',
        summary: 'Password mismatch',
        detail: 'New passwords do not match',
        life: 3000,
      })
      return
    }

    // Build payload only with changed fields
    const payload = {}

    if (form.name && form.name !== (user.value.name || user.value.displayName)) {
      payload.name = form.name
    }
    if (form.email && form.email !== user.value.email) {
      payload.email = form.email
    }
    if (form.newPassword) {
      payload.newPassword = form.newPassword
    }

    // If nothing changed, short-circuit
    if (!payload.name && !payload.email && !payload.newPassword) {
      toast.add({
        severity: 'info',
        summary: 'Nothing to update',
        detail: 'No changes detected',
        life: 2500,
      })
      return
    }

    // Current password is only needed if email or password is changing
    if ((payload.email || payload.newPassword) && !form.currentPassword) {
      toast.add({
        severity: 'warn',
        summary: 'Current password required',
        detail: 'Enter current password to change email or password',
        life: 3000,
      })
      return
    }

    if (payload.email || payload.newPassword) {
      payload.currentPassword = form.currentPassword
    }

    saving.value = true

    await changeUserCredentials(payload)

    toast.add({
      severity: 'success',
      summary: 'Settings updated',
      detail: 'Profile changes saved',
      life: 3000,
    })

    // Clear sensitive fields
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    console.error('Update error:', e)
    const code = e?.code
    const message = e?.message
    toast.add({
      severity: 'error',
      summary: 'Update failed',
      detail: getFirebaseMessage(code, message),
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.settings-title {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.settings-card {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border, #e0e0e0);
  background: var(--surface-card, #fff);
}

.settings-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.field label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.switch-field {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.settings-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
