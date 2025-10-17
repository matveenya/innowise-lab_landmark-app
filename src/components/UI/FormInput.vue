<template>
  <div class="form-group" :class="containerClass">
    <label :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      v-model="modelValue"
      :required="required"
      class="form-input"
      :class="{ 'form-input_error': errorMessage }"
      :placeholder="placeholder"
    />
    <span v-if="errorMessage" class="form-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });

interface Props {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  containerClass?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  errorMessage: '',
  containerClass: '',
});
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: #f7fafc;
}

.form-input:focus {
  outline: none;
  border-color: #48bb78;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.form-input_error {
  border-color: #e53e3e;
  background-color: #fed7d7;
}

.form-error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
