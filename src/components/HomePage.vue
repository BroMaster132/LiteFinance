<template>
  <div class="middle">
    <div>
      <div>
        <h2>Track every cent</h2>
        <h2>Shape your future</h2>
        <p style="font-size: 12pt;">Smart control of your money starts here</p>
        <Button label="Get Started" />
      </div>
    <div >
      <div class="card">
        <i class="pi pi-chart-bar" style="font-size: 1rem"></i>
        <div>
          <p>Clear charts and analytics</p>
          <p>Understand your spending with easy-to-read graphs and detailed reports</p>
        </div>
      </div>
    </div>
    </div>
    <div>
      <img src="/src/assets/img_phone.png" alt="LiteFinance Phone" style="height: 500px;" />
    </div>
  </div>
  
</template>

<script setup>
import Button from 'primevue/button';
</script>

<style scoped>
.middle {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 2rem;
  border: solid white 2px;
  display: flex;
  gap: 50px;

}
.card {
  border-radius: 100px;
  text-align: center;
  background-color: rgb(72, 72, 72);
  font-size: 10px;
  padding: 20px;
  width: 300px;
  display: flex;
  gap: 10px;
}
</style>
