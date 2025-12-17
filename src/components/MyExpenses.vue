<template>
  <div class="min-h-[calc(100vh-80px)] bg-slate-950/0 px-4 py-6">
    <div class="mx-auto w-full max-w-6xl">
      <div class="rounded-3xl bg-slate-100/90 p-6 shadow-sm ring-1 ring-black/5">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-center text-2xl font-semibold tracking-widest text-slate-900 md:text-left">
              MY EXPENSES
            </div>
            <div class="mt-1 text-center text-sm text-slate-500 md:text-left">
              Track spending by category and time range
            </div>
          </div>

          <div class="flex items-center gap-3">
            <SelectButton v-model="range" :options="rangeOptions" optionLabel="label" optionValue="value" />
            <Dropdown v-model="targetCurrency" :options="targetCurrencyOptions" class="w-32" />
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold text-slate-900">Overview</div>
                <div class="text-xs text-slate-500">{{ totalLabel }}</div>
              </div>

              <div class="mt-4">
                <div v-if="loading" class="h-[320px]">
                  <Skeleton width="100%" height="320px" />
                </div>

                <div v-else-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  {{ error }}
                </div>

                <div v-else-if="ratesLoading" class="flex h-[320px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                  Loading currency rates...
                </div>

                <div v-else-if="ratesError" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  {{ ratesError }}
                </div>

                <div
                  v-else-if="!chartReady"
                  class="flex h-[320px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500"
                >
                  No expenses yet for this period
                </div>

                <div v-else class="h-[320px]">
                  <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-full w-full" />
                </div>
              </div>

              <Divider class="my-5" />

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  v-for="row in legendRows"
                  :key="row.label"
                  class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div class="flex items-center gap-3">
                    <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: row.color }"></span>
                    <div class="text-sm font-medium text-slate-800">{{ row.label }}</div>
                  </div>
                  <div class="text-sm text-slate-700">
                    {{ formatMoney(row.value, targetCurrency) }}
                    <span class="ml-2 text-xs text-slate-400">({{ row.percent }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5">
            <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold text-slate-900">Latest Expenses</div>
                <button class="text-xs text-slate-500 hover:text-slate-700" @click="goAll">See all</button>
              </div>

              <div class="mt-4 space-y-3">
                <div v-if="loading">
                  <Skeleton width="100%" height="52px" />
                  <Skeleton width="100%" height="52px" class="mt-3" />
                  <Skeleton width="100%" height="52px" class="mt-3" />
                </div>

                <div v-else-if="!latestExpenses.length" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No expenses yet
                </div>

                <div
                  v-else
                  v-for="e in latestExpenses"
                  :key="e.id"
                  class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div class="flex items-center gap-3">
                    <div class="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/5">
                      <span class="text-lg">{{ iconFor(e.category) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-800">{{ e.category }}</div>
                      <div class="text-xs text-slate-500">{{ formatDate(e.spentAt) }}</div>
                      <div class="text-[11px] text-slate-400">
                        Original: {{ formatMoney(e.amount, e.currency || 'KZT') }}
                      </div>
                    </div>
                  </div>

                  <div class="text-sm font-semibold text-slate-800">
                    {{ formatMoney(e.amountConverted, targetCurrency) }}
                  </div>
                </div>
              </div>

              <Divider class="my-5" />

              <div class="flex flex-col gap-3">
                <AddExpenses v-model:visible="openAdd" @saved="handleSaved" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import Chart from 'primevue/chart'
import SelectButton from 'primevue/selectbutton'
import Divider from 'primevue/divider'
import Skeleton from 'primevue/skeleton'
import Dropdown from 'primevue/dropdown'

import { ref, computed, watchEffect, watch } from 'vue'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUser } from '@/composables/useUser'
import { useRouter } from 'vue-router'
import AddExpenses from '@/components/AddExpenses.vue'
const { user } = useUser()
const { initAuthListener } = useUser()

initAuthListener()

watch(
  () => user.value?.uid,
  (uid) => {
    if (uid) loadSpendings(uid)
  },
  { immediate: true }
)
const router = useRouter()
const categoryColors = {
  Food: '#fb923c',
  Transport: '#22c55e',
  Bills: '#38bdf8',
  Shopping: '#a78bfa',
  Entertainment: '#fb7185',
  Other: '#94a3b8'
}

function normalizeCategory(label) {
  return (label || 'Other').trim()
}

function hashColorKey(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const fallbackPalette = ['#fb923c', '#22c55e', '#38bdf8', '#fb7185', '#a78bfa', '#94a3b8']

function colorForCategory(label) {
  const key = normalizeCategory(label)
  if (categoryColors[key]) return categoryColors[key]
  return fallbackPalette[hashColorKey(key) % fallbackPalette.length]
}

const rangeOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' }
]
const range = ref('month')

const openAdd = ref(false)

const loading = ref(false)
const error = ref('')
const spendingsRaw = ref([])

function goAll() {
  router.push('/myspendings')
}

function handleSaved() {
  const uid = user.value?.uid
  if (uid) loadSpendings(uid)
}

function iconFor(cat) {
  const c = (cat || '').toLowerCase()
  if (c.includes('food')) return '🍔'
  if (c.includes('transport')) return '🚕'
  if (c.includes('entertain')) return '🎉'
  if (c.includes('cloth')) return '👕'
  if (c.includes('bill')) return '🧾'
  return '⚪'
}

function formatMoney(amount, cur) {
  const a = Number(amount || 0)
  return `${a.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur || ''}`.trim()
}

function formatDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString()
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfWeek(d) {
  const x = startOfDay(d)
  const day = x.getDay() || 7
  x.setDate(x.getDate() - (day - 1))
  return x
}
function startOfMonth(d) {
  const x = startOfDay(d)
  x.setDate(1)
  return x
}
function startOfYear(d) {
  const x = startOfDay(d)
  x.setMonth(0, 1)
  return x
}
function fromDateForRange(r) {
  const now = new Date()
  if (r === 'day') return startOfDay(now)
  if (r === 'week') return startOfWeek(now)
  if (r === 'month') return startOfMonth(now)
  if (r === 'year') return startOfYear(now)
  return null
}

const spendingsByRange = computed(() => {
  const from = fromDateForRange(range.value)
  if (!from) return spendingsRaw.value
  return spendingsRaw.value.filter(s => {
    const d = s.spentAt instanceof Date ? s.spentAt : new Date(s.spentAt)
    return d >= from
  })
})

async function loadSpendings(uid) {
  loading.value = true
  error.value = ''
  try {
    const q = query(collection(db, 'users', uid, 'spendings'), orderBy('spentAt', 'desc'), limit(300))
    const snap = await getDocs(q)
    spendingsRaw.value = snap.docs.map(d => {
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

const targetCurrency = ref('KZT')
const rates = ref({})
const ratesLoading = ref(false)
const ratesError = ref('')

const targetCurrencyOptions = computed(() => {
  const set = new Set(spendingsRaw.value.map(s => (s.currency || 'KZT').toUpperCase()))
  const base = ['KZT', 'USD', 'EUR']
  return Array.from(new Set([...base, ...Array.from(set)]))
})

async function fetchRates(baseCurrency) {
  const key = import.meta.env.VITE_EXCHANGERATE_API_KEY
  if (!key) throw new Error('Missing VITE_EXCHANGERATE_API_KEY')

  const url = `https://v6.exchangerate-api.com/v6/${key}/latest/${baseCurrency}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Rates error: ${res.status}`)

  const json = await res.json()
  if (json.result !== 'success') throw new Error(json['error-type'] || 'Rates error')

  return json.conversion_rates || {}
}

async function ensureRates() {
  ratesError.value = ''
  ratesLoading.value = true
  try {
    rates.value = await fetchRates(targetCurrency.value.toUpperCase())
  } catch (e) {
    ratesError.value = e?.message || 'Failed to load rates'
  } finally {
    ratesLoading.value = false
  }
}



function convertToTarget(amount, fromCur) {
  const from = (fromCur || 'KZT').toUpperCase()
  const to = targetCurrency.value.toUpperCase()

  if (from === to) return Number(amount || 0)

  const r = rates.value[from]
  if (!r) return Number(amount || 0)

  return Number(amount || 0) / r
}


const spendingsConverted = computed(() =>
  spendingsByRange.value.map(s => ({
    ...s,
    amountConverted: convertToTarget(s.amount, s.currency)
  }))
)

const totalsByCategory = computed(() => {
  const map = new Map()
  for (const s of spendingsConverted.value) {
    const key = s.category || 'Other'
    map.set(key, (map.get(key) || 0) + Number(s.amountConverted || 0))
  }
  return map
})

const latestExpenses = computed(() => spendingsConverted.value.slice(0, 3))

const totalLabel = computed(() => {
  if (ratesLoading.value) return 'Total: loading rates...'
  if (ratesError.value) return 'Total: rates error'
  return `Total: ${formatMoney(totalSum.value, targetCurrency.value)}`
})


const totalSum = computed(() => {
  let t = 0
  for (const v of totalsByCategory.value.values()) t += v
  return t
})

const chartReady = computed(() => totalSum.value > 0 && totalsByCategory.value.size > 0)

const colors = ['#fb923c', '#22c55e', '#38bdf8', '#fb7185', '#a78bfa', '#94a3b8']

const chartData = computed(() => {
  const labels = Array.from(totalsByCategory.value.keys())
  const data = Array.from(totalsByCategory.value.values())
  return {
    labels,
    datasets: [{ data, backgroundColor: labels.map(colorForCategory), borderWidth: 0 }]
  }
})


const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  }
}))

const legendRows = computed(() => {
  const labels = Array.from(totalsByCategory.value.keys())
  const vals = Array.from(totalsByCategory.value.values())
  const sum = totalSum.value || 1
  return labels.map((label, i) => {
    const value = vals[i] || 0
    const percent = Math.round((value / sum) * 1000) / 10
    return { label, value, percent, color: colorForCategory(label) }
  })
})


watchEffect(() => {
  if (spendingsRaw.value.length) ensureRates()
})

watch(targetCurrency, () => {
  if (spendingsRaw.value.length) ensureRates()
})
</script>
