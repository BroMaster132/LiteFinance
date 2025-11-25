<template>
  <section class="hero">
    <div class="hero-inner">
      <!-- Left content -->
      <div class="hero-left">
        <p class="hero-eyebrow">Smart control of your money starts here.</p>
        <h1 class="hero-title">
          Track every <span class="highlight">cent</span>,<br />
          Shape your <span class="highlight">future</span>.
        </h1>
        <br />
        <br />
        <ul class="feature-list">
          <li  v-for="feature in features"  :key="feature.title"  class="feature-card">
            <div class="feature-icon">  {{ feature.icon }}</div>
            <div class="feature-text">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.text }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="hero-right">
        <div class="phone-frame">
          <img  src="@/assets/img_phone.png"  alt="App preview"  class="phone-image"/>
        </div>
      </div>
    </div>
  </section>
  <div class="expenses">
    <MyExpenses />
  </div>
</template>

<script setup>
import MyExpenses from './MyExpenses.vue';
const features = [
  {
    icon: '📊',
    title: 'Clear charts and analytics',
    text: 'Understand your spending with easy-to-read graphs and detailed reports.'
  },
  {
    icon: '⚡',
    title: 'Quick and simple to use',
    text: 'Add and track expenses in just few taps, no extra effort needed.'
  },
  {
    icon: '🧾',
    title: 'Easy receipt upload',
    text: 'Snap or upload your receipts – expenses are saved instantly.'
  }
]

</script>

<style scoped>
.expenses {
  height: 600px;
}
.hero {
  background-color: #f9fafb;
  color: #111827;
  display: flex;
  justify-content: center;
  padding: 40px 16px 56px;
}



.hero-inner {
  width: 100%;
  max-width: 1120px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero-left {
  flex: 1 1 0;
  max-width: 560px;
}

.hero-right {
  flex: 0 0 320px;
  display: flex;
  justify-content: center;
}

.hero-eyebrow {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 16px;
}

.hero-title {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text',
    sans-serif;
  font-weight: 700;
  font-size: clamp(2.4rem, 4vw + 1rem, 3.4rem);
  line-height: 1.1;
  margin: 0 0 24px;
}

.highlight {
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-cta {
  margin-bottom: 32px;
  padding: 14px 32px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  background: #a855f7;
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(168, 85, 247, 0.55);
  background: #9333ea;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-radius: 999px;
  background: #f3f4f6;
}

.feature-icon {
  flex: 0 0 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  font-size: 1.3rem;
}

.feature-text h3 {
  margin: 0 0 2px;
  font-size: 1.02rem;
  font-weight: 600;
}

.feature-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

/* Phone mockup */

.phone-frame {
}

.phone-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 30px;
  margin-left: 150px;
}

/* Responsive */
@media (max-width: 900px) {
  .hero-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-right {
    align-self: center;
  }

  .hero {
    padding-top: 32px;
  }
}
</style>