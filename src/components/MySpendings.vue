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
            <Button  label="Refresh"  icon="pi pi-refresh"  severity="secondary"  outlined  :loading="loading"  @click="refresh"  class="w-full sm:w-auto"/>
          </div>
        </div>

        <Divider class="my-5" />

        <div v-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          {{ error }}
        </div>

        <div v-else class="overflow-hidden rounded-2xl ring-1 ring-black/5">
          <DataTable  :value="rows"  :loading="loading"  paginator  :rows="10"   :rowsPerPageOptions="[10, 20, 50]"  dataKey="id"  :globalFilterFields="['category', 'note', 'currency']"  v-model:filters="filters"  class="sp-table">
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

/* ✅ FIX DARK FOOTER */
:deep(.sp-table .p-datatable-footer) {
  background: #ffffff;
  color: #0f172a;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

/* ✅ FIX DARK PAGINATOR */
:deep(.sp-table .p-paginator) {
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

:deep(.sp-table .p-paginator .p-dropdown) {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

:deep(.sp-table .p-paginator .p-dropdown-label) {
  color: #0f172a;
}

/* Optional: make paginator buttons softer */
:deep(.sp-table .p-paginator .p-paginator-page),
:deep(.sp-table .p-paginator .p-paginator-next),
:deep(.sp-table .p-paginator .p-paginator-prev),
:deep(.sp-table .p-paginator .p-paginator-first),
:deep(.sp-table .p-paginator .p-paginator-last) {
  border-radius: 9999px;
}

:deep(.sp-table .p-sortable-column-badge) {
  display: none;
}
</style>

