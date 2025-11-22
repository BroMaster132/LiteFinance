<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- Left: logo + copyright -->
      <div class="footer-left">
        <!-- Replace src with your logo path -->
        <img
          src="@/components/icons/icon.png"
          alt="LiteFinance logo"
          class="footer-logo"
        />
        <span class="footer-copy">©2025 LiteFinance</span>
      </div>

      <!-- Center: links -->
      <nav class="footer-nav">
        <a href="#features">Features</a>
        <a href="#spending">My spending</a>
        <a href="#feedback">Feedback</a>
      </nav>

      <!-- Right: button -->
      <button class="footer-cta">
        Get started
      </button>
    </div>
  </footer>
</template>
<script setup>

</script>

<style scoped>
.footer {
  background: #18181b; /* dark gray like on screenshot */
  padding: 18px 24px;
  color: #e5e7eb;
}

.footer-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

/* left block */
.footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.footer-logo {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  object-fit: cover;
}

.footer-copy {
  font-size: 0.9rem;
}

/* center nav */
.footer-nav {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  gap: 32px;
  font-size: 0.95rem;
}

.footer-nav a {
  color: #e5e7eb;
  text-decoration: none;
}

.footer-nav a:hover {
  color: #ffffff;
}

/* right button */
.footer-cta {
  flex: 0 0 auto;
  padding: 9px 28px;
  border-radius: 999px;
  border: 1px solid #4b5563;
  background: #111827;
  color: #f9fafb;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.footer-cta:hover {
  background: #020617;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

/* responsive */
@media (max-width: 820px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-nav {
    justify-content: flex-start;
    gap: 18px;
  }

  .footer-cta {
    align-self: stretch;
    text-align: center;
  }
}

</style>