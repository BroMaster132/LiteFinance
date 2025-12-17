<template>
  <div class="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-6">
    <div class="mx-auto w-full max-w-6xl">
      <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-2xl font-semibold tracking-widest text-slate-900">ALL SPENDINGS</div>
            <div class="mt-1 text-sm text-slate-500">All your expenses in one table</div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="p-input-icon-left w-full sm:w-[320px]">
              <i class="pi pi-search" />
              <InputText v-model="globalSearch" placeholder="Search category / note / currency" class="w-full" />
            </span>

            <Button
              label="Refresh"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :loading="loading"
              @click="refresh"
              class="w-full sm:w-auto"
            />
          </div>
        </div>

        <Divider class="my-5" />

        <div v-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </div>

        <div v-else class="overflow-hidden rounded-2xl ring-1 ring-black/5">
          <DataTable
            :value="rows"
            :loading="loading"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 50]"
            dataKey="id"
            sortMode="single"
            :globalFilterFields="['category', 'note', 'currency']"
            v-model:filters="filters"
            class="sp-table"
          >
            <template #empty>
              <div class="py-10 text-center text-sm text-slate-500">No spendings found</div>
            </template>

            <Column field="spentAt" header="Date" sortable style="width: 9.5rem;">
              <template #body="{ data }">
                <span class="text-sm text-slate-700">{{ formatDate(data.spentAt) }}</span>
              </template>
            </Column>

            <Column field="category" header="Category" sortable>
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <div class="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 ring-1 ring-black/5">
                    <span class="text-lg">{{ iconFor(data.category) }}</span>
                  </div>
                  <div class="text-sm font-semibold text-slate-900">{{ data.category || 'Other' }}</div>
                </div>
              </template>
            </Column>

            <Column field="amount" header="Amount" sortable style="width: 12rem;">
              <template #body="{ data }">
                <span class="text-sm font-semibold text-slate-900">
                  {{ formatMoney(data.amount, data.currency || 'KZT') }}
                </span>
              </template>
            </Column>

            <Column field="currency" header="Cur" sortable style="width: 6rem;">
              <template #body="{ data }">
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5">
                  {{ (data.currency || 'KZT').toUpperCase() }}
                </span>
              </template>
            </Column>

            <Column field="note" header="Note">
              <template #body="{ data }">
                <span class="text-sm text-slate-600">{{ data.note || '—' }}</span>
              </template>
            </Column>

            <Column header="Actions" style="width: 9.5rem;">
              <template #body="{ data }">
                <div class="flex items-center gap-2 justify-end">
                  <Button icon="pi pi-pencil" severity="secondary" outlined size="small" @click="openEdit(data)" />
                  <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="openDelete(data)" />
                </div>
              </template>
            </Column>

            <template #footer>
              <div class="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-sm text-slate-600">
                  Rows: <span class="font-semibold text-slate-900">{{ rows.length }}</span>
                </div>
                <div class="text-sm text-slate-600">
                  Total (by currency):
                  <span class="font-semibold text-slate-900">{{ totalsText }}</span>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog appendTo="self" v-model:visible="editOpen" modal header="Edit spending" :style="{ width: '28rem' }">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-sm">Category</label>
          <Dropdown v-model="editForm.category" :options="categories" placeholder="Select category" class="w-full" />
        </div>

        <div class="flex gap-3">
          <div class="flex flex-col gap-2 flex-1">
            <label class="text-sm">Amount</label>
            <InputNumber v-model="editForm.amount" class="w-full" :min="0" :minFractionDigits="0" :maxFractionDigits="2" />
          </div>

          <div class="flex flex-col gap-2" style="width: 9rem;">
            <label class="text-sm">Currency</label>
            <Dropdown v-model="editForm.currency" :options="currencies" class="w-full" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm">Date</label>
          <Calendar v-model="editForm.date" class="w-full" dateFormat="yy-mm-dd" showIcon />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm">Note</label>
          <InputText v-model="editForm.note" class="w-full" placeholder="Optional" />
        </div>

        <small v-if="editError" class="text-red-600">{{ editError }}</small>

        <div class="flex justify-end gap-2 mt-2">
          <Button label="Cancel" severity="secondary" outlined :disabled="editLoading" @click="closeEdit" />
          <Button label="Save" :loading="editLoading" @click="saveEdit" />
        </div>
      </div>
    </Dialog>

    <Dialog appendTo="self" v-model:visible="deleteOpen" modal header="Delete spending?" :style="{ width: '24rem' }">
      <div class="text-sm text-slate-600">
        This will permanently delete this record.
      </div>

      <div class="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-black/5">
        <div class="font-semibold">{{ deleteTarget?.category || 'Other' }}</div>
        <div class="mt-1 text-slate-500">
          {{ formatDate(deleteTarget?.spentAt) }} ·
          {{ formatMoney(deleteTarget?.amount, deleteTarget?.currency || 'KZT') }}
        </div>
      </div>

      <small v-if="deleteError" class="mt-3 block text-red-600">{{ deleteError }}</small>

      <div class="mt-4 flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" outlined :disabled="deleteLoading" @click="closeDelete" />
        <Button label="Delete" severity="danger" :loading="deleteLoading" @click="confirmDelete" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'

import { ref, computed, watchEffect } from 'vue'
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUser } from '@/composables/useUser'

const { user } = useUser()

const loading = ref(false)
const error = ref('')
const rows = ref([])

const globalSearch = ref('')
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

watchEffect(() => {
  filters.value.global.value = globalSearch.value
})

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other']
const currencies = ['KZT', 'USD', 'EUR']

function iconFor(cat) {
  const c = (cat || '').toLowerCase()
  if (c.includes('food')) return '🍔'
  if (c.includes('transport')) return '🚕'
  if (c.includes('entertain')) return '🎉'
  if (c.includes('cloth')) return '👕'
  if (c.includes('bill')) return '🧾'
  return '⚪'
}

function formatDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString()
}

function formatMoney(amount, cur) {
  const a = Number(amount || 0)
  return `${a.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur || ''}`.trim()
}

async function loadAll(uid) {
  loading.value = true
  error.value = ''
  try {
    const q = query(collection(db, 'users', uid, 'spendings'), orderBy('spentAt', 'desc'))
    const snap = await getDocs(q)
    rows.value = snap.docs.map(d => {
      const data = d.data()
      const spentAt = data.spentAt?.toDate ? data.spentAt.toDate() : data.spentAt
      return { id: d.id, ...data, spentAt }
    })
  } catch (e) {
    error.value = e?.message || 'Failed to load spendings'
  } finally {
    loading.value = false
  }
}

function refresh() {
  const uid = user.value?.uid
  if (uid) loadAll(uid)
}

watchEffect(() => {
  const uid = user.value?.uid
  if (uid) loadAll(uid)
})

const totalsByCurrency = computed(() => {
  const map = new Map()
  for (const r of rows.value) {
    const cur = (r.currency || 'KZT').toUpperCase()
    map.set(cur, (map.get(cur) || 0) + Number(r.amount || 0))
  }
  return map
})

const totalsText = computed(() => {
  if (!rows.value.length) return '0'
  return Array.from(totalsByCurrency.value.entries())
    .map(([cur, sum]) => `${sum.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur}`)
    .join(' + ')
})

const editOpen = ref(false)
const editLoading = ref(false)
const editError = ref('')
const editId = ref(null)
const editForm = ref({
  category: null,
  amount: null,
  currency: 'KZT',
  date: new Date(),
  note: ''
})

function openEdit(row) {
  editError.value = ''
  editId.value = row.id
  editForm.value = {
    category: row.category || 'Other',
    amount: Number(row.amount || 0),
    currency: (row.currency || 'KZT').toUpperCase(),
    date: row.spentAt instanceof Date ? row.spentAt : new Date(row.spentAt),
    note: row.note || ''
  }
  editOpen.value = true
}

function closeEdit() {
  editOpen.value = false
  editError.value = ''
  editId.value = null
}

async function saveEdit() {
  editError.value = ''
  const uid = user.value?.uid
  if (!uid) {
    editError.value = 'Login required'
    return
  }
  if (!editId.value) {
    editError.value = 'Missing record id'
    return
  }
  if (!editForm.value.category) {
    editError.value = 'Choose a category'
    return
  }
  if (editForm.value.amount === null || Number(editForm.value.amount) <= 0) {
    editError.value = 'Enter a valid amount'
    return
  }

  editLoading.value = true
  try {
    const refDoc = doc(db, 'users', uid, 'spendings', editId.value)
    const payload = {
      category: editForm.value.category,
      amount: Number(editForm.value.amount),
      currency: editForm.value.currency,
      note: (editForm.value.note || '').trim(),
      spentAt: new Date(editForm.value.date || Date.now())
    }
    await updateDoc(refDoc, payload)

    const idx = rows.value.findIndex(r => r.id === editId.value)
    if (idx !== -1) rows.value[idx] = { ...rows.value[idx], ...payload }

    closeEdit()
  } catch (e) {
    editError.value = e?.message || 'Failed to update'
  } finally {
    editLoading.value = false
  }
}

const deleteOpen = ref(false)
const deleteLoading = ref(false)
const deleteError = ref('')
const deleteTarget = ref(null)

function openDelete(row) {
  deleteError.value = ''
  deleteTarget.value = row
  deleteOpen.value = true
}

function closeDelete() {
  deleteOpen.value = false
  deleteError.value = ''
  deleteTarget.value = null
}

async function confirmDelete() {
  deleteError.value = ''
  const uid = user.value?.uid
  if (!uid) {
    deleteError.value = 'Login required'
    return
  }
  if (!deleteTarget.value?.id) {
    deleteError.value = 'Missing record id'
    return
  }

  deleteLoading.value = true
  try {
    await deleteDoc(doc(db, 'users', uid, 'spendings', deleteTarget.value.id))
    rows.value = rows.value.filter(r => r.id !== deleteTarget.value.id)
    closeDelete()
  } catch (e) {
    deleteError.value = e?.message || 'Failed to delete'
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped>
:deep(.sp-table .p-datatable-header) {
  display: none;
}
:deep(.sp-table .p-datatable-thead > tr > th) {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.08);
  font-weight: 700;
}
:deep(.sp-table .p-datatable-tbody > tr) {
  background: #ffffff;
}
:deep(.sp-table .p-datatable-tbody > tr > td) {
  border-color: rgba(15, 23, 42, 0.06);
}
:deep(.sp-table .p-datatable-footer) {
  background: #ffffff;
  color: #0f172a;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}
:deep(.sp-table .p-paginator) {
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}
:deep(.p-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.p-dialog .p-dialog-header),
:deep(.p-dialog .p-dialog-content),
:deep(.p-dialog .p-dialog-footer) {
  background: #ffffff;
  color: #0f172a;
}

:deep(.p-dialog .p-dialog-header) {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

:deep(.p-dialog .p-dialog-footer) {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

:deep(.p-dialog .p-dialog-header-icon) {
  color: #475569;
}

:deep(.p-dialog .p-dialog-header-icon:hover) {
  background: rgba(15, 23, 42, 0.06);
}

</style>
