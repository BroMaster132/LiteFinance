<template>
  <Button label="Add Expense" icon="pi pi-plus" @click="open = true" />
  <Dialog v-model:visible="open" modal header="Add spending" :style="{ width: '28rem' }">
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label class="text-sm">Category</label>
        <Dropdown v-model="form.category" :options="categories" placeholder="Select category" class="w-full" />
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col gap-2 flex-1">
          <label class="text-sm">Amount</label>
          <InputNumber v-model="form.amount" class="w-full" :min="0" :minFractionDigits="0" :maxFractionDigits="2" />
        </div>

        <div class="flex flex-col gap-2" style="width: 9rem;">
          <label class="text-sm">Currency</label>
          <Dropdown v-model="form.currency" :options="currencies" class="w-full" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm">Date</label>
        <Calendar v-model="form.date" class="w-full" dateFormat="yy-mm-dd" showIcon />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm">Note</label>
        <InputText v-model="form.note" class="w-full" placeholder="Optional" />
      </div>

      <small v-if="error" class="text-red-400">{{ error }}</small>

      <div class="flex justify-end gap-2 mt-2">
        <Button label="Cancel" severity="secondary" :disabled="loading" @click="close" />
        <Button label="Submit" :loading="loading" @click="submit" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'

import { ref, computed } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUser } from '@/composables/useUser'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'saved'])

const { user } = useUser()

const open = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

const loading = ref(false)
const error = ref('')

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other']
const currencies = ['KZT', 'USD', 'EUR']

const form = ref({
  category: null,
  amount: null,
  currency: 'KZT',
  date: new Date(),
  note: ''
})

function reset() {
  error.value = ''
  form.value = { category: null, amount: null, currency: 'KZT', date: new Date(), note: '' }
}

function close() {
  open.value = false
  reset()
}

async function submit() {
  error.value = ''

  if (!user.value?.uid) {
    error.value = 'Login required'
    return
  }
  if (!form.value.category) {
    error.value = 'Choose a category'
    return
  }
  if (form.value.amount === null || Number(form.value.amount) <= 0) {
    error.value = 'Enter a valid amount'
    return
  }

  loading.value = true
  try {
    const uid = user.value.uid

    const spending = {
      uid,
      category: form.value.category,
      amount: Number(form.value.amount),
      currency: form.value.currency,
      note: form.value.note?.trim() || '',
      spentAt: new Date(form.value.date || Date.now()),
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'users', uid, 'spendings'), spending)

    emit('saved', spending)
    close()
  } catch (e) {
    error.value = e?.message || 'Failed to save'
  } finally {
    loading.value = false
  }
}
</script>
