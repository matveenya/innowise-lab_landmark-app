<template>
  <div>
    <h1>Test ESLint</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
// Намеренные ошибки для проверки ESLint
const message = 'Hello World';
console.log('This should trigger no-console rule'); // Должна вызвать предупреждение

const unusedVariable = 'test'; // Должна вызвать no-unused-vars предупреждение

// Нарушение Prettier форматирования - длинная строка
const longString =
  'This is a very long string that should trigger prettier formatting because it exceeds the print width limit of 80 characters';
</script>
