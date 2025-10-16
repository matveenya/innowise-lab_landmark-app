<template>
  <div class="language-switcher">
    <button
      @click="toggleDropdown"
      class="language-switcher__trigger"
      :class="{ 'language-switcher__trigger_active': isOpen }"
    >
      <span class="language-switcher__current">
        {{ getCurrentLocale()?.flag }} {{ getCurrentLocale()?.name }}
      </span>
      <span class="language-switcher__arrow">▼</span>
    </button>

    <div v-if="isOpen" class="language-switcher__dropdown">
      <button
        v-for="locale in locales"
        :key="locale.code"
        @click="switchLanguage(locale.code)"
        class="language-switcher__option"
        :class="{
          'language-switcher__option_active':
            locale.code === localeStore.currentLocale,
        }"
      >
        <span class="language-switcher__flag">{{ locale.flag }}</span>
        <span class="language-switcher__name">{{ locale.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { locales, type Locale } from '../i18n';

const localeStore = useLocaleStore();
const isOpen = ref(false);

function getCurrentLocale() {
  return (
    locales.find((locale) => locale.code === localeStore.currentLocale) ||
    locales[0]
  );
}

function toggleDropdown(event: Event) {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
}

function switchLanguage(localeCode: string) {
  if (isValidLocale(localeCode)) {
    localeStore.setLocale(localeCode);
    isOpen.value = false;
  }
}

function isValidLocale(locale: string): locale is Locale {
  return locales.some((l) => l.code === locale);
}

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.language-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: space-between;
}

.language-switcher__trigger:hover {
  border-color: #cbd5e0;
}

.language-switcher__trigger_active {
  border-color: #48bb78;
}

.language-switcher__arrow {
  font-size: 0.75rem;
  transition: transform 0.3s;
}

.language-switcher__trigger_active .language-switcher__arrow {
  transform: rotate(180deg);
}

.language-switcher__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
}

.language-switcher__option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.875rem;
}

.language-switcher__option:hover {
  background-color: #f7fafc;
}

.language-switcher__option_active {
  background-color: #f0fff4;
  color: #48bb78;
}

.language-switcher__flag {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.language-switcher__name {
  flex: 1;
  text-align: left;
}
</style>
