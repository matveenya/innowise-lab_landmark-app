<template>
  <div class="landmark-form__group">
    <label :for="id" class="landmark-form__label">{{ label }}</label>
    <template v-if="type === 'textarea'">
      <textarea
        :id="id"
        :value="modelValue"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLTextAreaElement)?.value || ''
          )
        "
        required
        class="landmark-form__textarea"
        :placeholder="placeholder"
        rows="4"
      ></textarea>
    </template>
    <template v-else>
      <input
        :id="id"
        :value="modelValue"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement)?.value || ''
          )
        "
        :type="type"
        required
        class="landmark-form__input"
        :placeholder="placeholder"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  label: string;
  placeholder: string;
  modelValue: string;
  type?: 'text' | 'textarea';
}

withDefaults(defineProps<Props>(), {
  type: 'text',
});

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.landmark-form__group {
  margin-bottom: 1.5rem;
}

.landmark-form__label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.landmark-form__input,
.landmark-form__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.landmark-form__input:focus,
.landmark-form__textarea:focus {
  outline: none;
  border-color: #48bb78;
}

.landmark-form__textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
