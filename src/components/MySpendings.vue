<template>
  <div class="min-h-[calc(100vh-80px)] px-4 py-6">
    <div class="mx-auto w-full max-w-6xl">
      <div class="rounded-3xl bg-slate-100/90 p-6 shadow-sm ring-1 ring-black/5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-2xl font-semibold tracking-widest text-slate-900">ALL SPENDINGS</div>
            <div class="mt-1 text-sm text-slate-500">All your expenses in one table</div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="globalSearch" placeholder="Search..." class="w-72" />
            </span>

            <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="refresh" />
          </div>
        </div>

        <Divider class="my-5" />

        <div v-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </div>

        <DataTable
          v-else
          :value="rows"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          dataKey="id"
          sortMode="multiple"
          :globalFilterFields="['category', 'note', 'currency']"
          v-model:filters="filters"
          class="rounded-2xl overflow-hidden"
        >
          <template #empty>
            <div class="py-8 text-center text-sm text-slate-500">No spendings found</div>
          </template>

          <Column field="spentAt" header="Date" sortable style="width: 9rem;">
            <template #body="{ data }">
              <span class="text-sm text-slate-800">{{ formatDate(data.spentAt) }}</span>
            </template>
          </Column>

          <Column field="category" header="Category" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ iconFor(data.category) }}</span>
                <span class="text-sm font-semibold text-slate-800">{{ data.category || 'Other' }}</span>
              </div>
            </template>
          </Column>

          <Column field="amount" header="Amount" sortable style="width: 10rem;">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-slate-900">
                {{ formatMoney(data.amount, data.currency || 'KZT') }}
              </span>
            </template>
          </Column>

          <Column field="currency" header="Cur" sortable style="width: 6rem;">
            <template #body="{ data }">
              <span class="text-xs font-semibold text-slate-700">{{ (data.currency || 'KZT').toUpperCase() }}</span>
            </template>
          </Column>

          <Column field="note" header="Note">
            <template #body="{ data }">
              <span class="text-sm text-slate-600">{{ data.note || '-' }}</span>
            </template>
          </Column>

          <template #footer>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2 py-2">
              <div class="text-sm text-slate-600">
                Rows: <span class="font-semibold text-slate-800">{{ rows.length }}</span>
              </div>
              <div class="text-sm text-slate-600">
                Total (by currency):
                <span class="font-semibold text-slate-800">{{ totalsText }}</span>
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Divider from 'primevue/divider'

import { ref, computed, watchEffect } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
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
</script>
