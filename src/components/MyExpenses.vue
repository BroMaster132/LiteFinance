<template>
  <Card class="expenses-card">
    <template #title>
      <div class="header">
        <span>MY EXPENSES</span>

        <div class="period-tabs">
          <Button
            v-for="period in periods"
            :key="period.value"
            :label="period.label"
            variant="text"
            size="small"
            :class="['period-btn', { 'is-active': activePeriod === period.value }]"
            @click="activePeriod = period.value"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="body">
        <!-- LEFT: donut + legend -->
        <div class="left">
          <div class="chart-wrapper">
            <Chart
              type="doughnut"
              :data="chartData"
              :options="chartOptions"
              class="donut-chart"
            />
          </div>

          <ul class="legend">
            <li v-for="item in breakdown" :key="item.label">
              <span :class="['dot', item.class]"></span>
              <span>
                {{ item.icon }} {{ item.label }} - {{ item.amount }} ₸ ({{ item.percent }}%)
              </span>
            </li>
          </ul>
        </div>

        <!-- RIGHT: latest expenses + buttons -->
        <div class="right">
          <div class="latest">
            <h3>Latest Expenses</h3>

            <div
              v-for="row in latestExpenses"
              :key="row.label"
              class="expense-row"
            >
              <span>{{ row.icon }} <strong>{{ row.label }}</strong></span>
              <span class="amount">{{ row.amount }} ₸</span>
            </div>

            <div class="divider"></div>

            <button class="see-all">
              See All Expenses
              <span class="arrow">⌄</span>
            </button>
          </div>

          <div class="actions">
            <Button
              label="Add Expenses"
              class="add-btn"
              size="large"
            />

            <div class="small-actions">
              <Button
                label="Take photo of receipt"
                icon="pi pi-camera"
                size="small"
                variant="outlined"
              />
              <Button
                label="Upload image of receipt"
                icon="pi pi-upload"
                size="small"
                variant="outlined"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Chart from 'primevue/chart'


/* Available periods */
const periods = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Period', value: 'period' }
]

const activePeriod = ref('day')

/* Data for each period (example values – change to yours or load from API) */
const periodExpenses = {
  day: {
    breakdown: [
      { label: 'Food',          amount: 1350, percent: 37.5, icon: '🍔', class: 'dot-food' },
      { label: 'Clothes',       amount: 450,  percent: 12.5, icon: '👕', class: 'dot-clothes' },
      { label: 'Entertainment', amount: 900,  percent: 25,   icon: '🎉', class: 'dot-entertainment' },
      { label: 'Transport',     amount: 540,  percent: 15,   icon: '🚕', class: 'dot-transport' },
      { label: 'Other',         amount: 360,  percent: 10,   icon: '⚪', class: 'dot-other' }
    ],
    latest: [
      { label: 'Transport',     amount: 540, icon: '🚕' },
      { label: 'Food',          amount: 650, icon: '🍔' },
      { label: 'Entertainment', amount: 300, icon: '🎉' }
    ]
  },
  week: {
    breakdown: [
      { label: 'Food',          amount: 4200, percent: 40, icon: '🍔', class: 'dot-food' },
      { label: 'Clothes',       amount: 800,  percent: 7.5, icon: '👕', class: 'dot-clothes' },
      { label: 'Entertainment', amount: 2500, percent: 24, icon: '🎉', class: 'dot-entertainment' },
      { label: 'Transport',     amount: 1600, percent: 15, icon: '🚕', class: 'dot-transport' },
      { label: 'Other',         amount: 900,  percent: 13.5, icon: '⚪', class: 'dot-other' }
    ],
    latest: [
      { label: 'Cinema',       amount: 1500, icon: '🎬' },
      { label: 'Groceries',    amount: 2200, icon: '🛒' },
      { label: 'Taxi',         amount: 700,  icon: '🚕' }
    ]
  },
  month: {
    breakdown: [
      { label: 'Food',          amount: 13000, percent: 35, icon: '🍔', class: 'dot-food' },
      { label: 'Clothes',       amount: 5000,  percent: 13, icon: '👕', class: 'dot-clothes' },
      { label: 'Entertainment', amount: 9000,  percent: 24, icon: '🎉', class: 'dot-entertainment' },
      { label: 'Transport',     amount: 6000,  percent: 16, icon: '🚕', class: 'dot-transport' },
      { label: 'Other',         amount: 4000,  percent: 12, icon: '⚪', class: 'dot-other' }
    ],
    latest: [
      { label: 'Restaurant',   amount: 4500, icon: '🍽' },
      { label: 'New shoes',    amount: 6000, icon: '👟' },
      { label: 'Concert',      amount: 3500, icon: '🎵' }
    ]
  },
  year:   { 
    breakdown: [
      { label: 'Food',          amount: 156000, percent: 34, icon: '🍔', class: 'dot-food' },
      { label: 'Clothes',       amount: 72000,  percent: 16, icon: '👕', class: 'dot-clothes' },
      { label: 'Entertainment', amount: 108000, percent: 24, icon: '🎉', class: 'dot-entertainment' },
      { label: 'Transport',     amount: 72000,  percent: 16, icon: '🚕', class: 'dot-transport' },
      { label: 'Other',         amount: 48000,  percent: 10, icon: '⚪', class: 'dot-other' }
    ],
    latest: [
      { label: 'Vacation',     amount: 45000, icon: '🏖' },
      { label: 'New wardrobe', amount: 60000, icon: '👗' },
      { label: 'Gadgets',      amount: 30000, icon: '📱' }
    ]
   },
  period: { breakdown: [
    { label: 'Food',          amount: 0, percent: 0, icon: '🍔', class: 'dot-food' },
    { label: 'Clothes',       amount: 0, percent: 0, icon: '👕', class: 'dot-clothes' },
    { label: 'Entertainment', amount: 0, percent: 0, icon: '🎉', class: 'dot-entertainment' },
    { label: 'Transport',     amount: 0, percent: 0, icon: '🚕', class: 'dot-transport' },
    { label: 'Other',         amount: 0, percent: 0, icon: '⚪', class: 'dot-other' }
  ], 
  latest: [
    { label: '-', amount: 0, icon: '–' },
    { label: '-', amount: 0, icon: '–' },
    { label: '-', amount: 0, icon: '–' }
  ] }
}

/* Data for currently selected period */
const breakdown = computed(
  () => periodExpenses[activePeriod.value].breakdown
)
const latestExpenses = computed(
  () => periodExpenses[activePeriod.value].latest
)

/* Chart data depends on current breakdown */
const chartData = computed(() => ({
  labels: breakdown.value.map(b => b.label),
  datasets: [
    {
      data: breakdown.value.map(b => b.amount),
      backgroundColor: ['#fb923c', '#22d3ee', '#f97373', '#facc15', '#9ca3af'],
      hoverBackgroundColor: ['#fdba74', '#38e5ff', '#fca5a5', '#fde047', '#d1d5db'],
      borderWidth: 0
    }
  ]
}))

/* Chart options */
const chartOptions = {
  cutout: '70%',
  plugins: {
    legend: { display: false }
  },
  maintainAspectRatio: false
}
</script>

<style scoped>
/* same styles as before */
.expenses-card {
  max-width: 780px;
  margin: 0 auto;
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  color: #000;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.header > span {
  letter-spacing: 0.12em;
  font-size: 1.6rem;
}
.period-tabs {
  display: flex;
  gap: 8px;
}
.period-btn {
  font-size: 0.9rem;
  padding: 4px 10px;
  border-radius: 999px;
}
.period-btn.is-active {
  background: #111827;
  color: #ffffff;
}
.body {
  display: flex;
  gap: 32px;
  margin-top: 10px;
}
.left {
  flex: 0 0 45%;
}
.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chart-wrapper {
  height: 190px;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.donut-chart {
  width: 190px !important;
  height: 190px !important;
}
.legend {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.dot-food { background: #fb923c; }
.dot-clothes { background: #22d3ee; }
.dot-entertainment { background: #f97373; }
.dot-transport { background: #facc15; }
.dot-other { background: #9ca3af; }
.latest h3 {
  text-align: center;
  margin: 0 0 12px;
  font-size: 1.05rem;
}
.expense-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.98rem;
}
.amount {
  font-weight: 600;
}
.divider {
  border-bottom: 1px solid #e5e7eb;
  margin: 6px 0 4px;
}
.see-all {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.86rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.arrow {
  font-size: 0.9rem;
}
.actions {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.add-btn {
  align-self: flex-end;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-radius: 999px;
  border: none;
  box-shadow: 0 16px 30px rgba(168, 85, 247, 0.45);
}
.small-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}
@media (max-width: 780px) {
  .body {
    flex-direction: column;
  }
  .add-btn {
    align-self: center;
    width: 100%;
  }
  .small-actions {
    justify-content: center;
  }
}
</style>
