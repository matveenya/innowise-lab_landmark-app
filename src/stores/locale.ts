import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Locale } from '../i18n';

export const useLocaleStore = defineStore('locale', () => {
  const { locale } = useI18n();
  const currentLocale = ref<Locale>(
    (localStorage.getItem('locale') as Locale) || 'en'
  );

  locale.value = currentLocale.value;

  watch(currentLocale, (newLocale) => {
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
  });

  function setLocale(newLocale: Locale) {
    currentLocale.value = newLocale;
  }

  return {
    currentLocale,
    setLocale,
  };
});
