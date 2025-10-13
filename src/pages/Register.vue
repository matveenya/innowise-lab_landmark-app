<template>
  <main class="register">
    <div class="register__container">
      <section class="register__form-section">
        <form class="form" @submit.prevent="handleRegister">
          <header class="form__header">
            <h1 class="form__title">Create Account</h1>
          </header>

          <div class="form__group display-name">
            <label for="displayName" class="form__label display-name__label"
              >Display Name</label
            >
            <input
              id="dispalyName"
              v-model="form.displayName"
              type="text"
              required
              class="form__input display-name__input"
              :class="{ form__input_error: errors.displayName }"
              placeholder="Enter your display name"
            />
            <span v-if="errors.displayName" class="form__error">{{
              errors.displayName
            }}</span>
          </div>

          <div class="form__group email">
            <label for="email" class="form__label email__label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form__input email__input"
              :class="{ form__input_error: errors.email }"
              placeholder="Enter your email"
            />
            <span v-if="errors.email" class="form__error">{{
              errors.email
            }}</span>
          </div>

          <div class="form__group password">
            <label for="password" class="form__label password__label"
              >Password</label
            >
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="form__input password__input"
              :class="{ form__input_error: errors.password }"
              placeholder="Enter your password"
            />
            <span v-if="errors.password" class="form__error">{{
              errors.password
            }}</span>
          </div>

          <div class="form__group confirm-password">
            <label
              for="confirmPassword"
              class="form__label confirm-password__label"
              >Confirm Password</label
            >
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="form__input confrim-password__input"
              :class="{ form__input_error: errors.confirmPassword }"
              placeholder="Confirm your password"
            />
            <span v-if="errors.confirmPassword" class="form__error">{{
              errors.confirmPassword
            }}</span>
          </div>

          <div class="form__actions">
            <button
              type="submit"
              :disabled="loading"
              class="form__submit"
              :class="{ form__submit_loading: loading }"
            >
              <span class="form__submit-text">
                {{ loading ? 'Creating Account...' : 'Create Account' }}
              </span>
            </button>
          </div>

          <footer class="form__footer">
            <p class="form__footer-text">
              Already have an account?
              <RouterLink to="/signin" class="form__link"
                >Go to Sign In</RouterLink
              >
            </p>
          </footer>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

onMounted(() => {
  authStore.clearError();
});

function validationForm(): boolean {
  let isValid = true;

  Object.keys(errors).forEach((key) => {
    const errorKey = key as keyof typeof errors;
    errors[errorKey] = '';
  });

  if (!form.displayName.trim()) {
    errors.displayName = 'Display name is required';
    isValid = false;
  } else if (form.displayName.length < 2) {
    errors.displayName = 'Display name must be more than 2 symbols';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 5) {
    errors.password = 'Password must be more  than 5 symbols';
    isValid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
    isValid = false;
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Password do not match';
    isValid = false;
  }

  return isValid;
}

async function handleRegister() {
  if (!validationForm()) return;

  loading.value = true;

  const success = await authStore.register(
    form.email,
    form.password,
    form.displayName.trim()
  );

  if (success) {
    router.push('/generalmap');
  }

  loading.value = false;
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register__container {
  width: 100%;
  max-width: 762px;
}

.register__form-section {
  background-color: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.form__title {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.form__group {
  margin-bottom: 1.5rem;
}

.form__label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form__input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: #f7fafc;
}

.form__input:focus {
  outline: none;
  border-color: #48bb78;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
}

.form__input_error {
  border-color: #e53e3e;
  background-color: #fed7d7;
}

.form__error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form__actions {
  margin: 2rem 0 1rem;
}

.form__submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #48bb78;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.form__submit:hover:not(:disabled) {
  background-image: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.form__submit:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form__footer {
  text-align: center;
  margin-top: 1rem;
}

.form__footer-text {
  color: #718096;
}

.form__link {
  color: #48bb78;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.form__link:hover {
  color: #38a169;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register__form-section {
    padding: 1.5rem;
  }

  .register {
    padding: 10px;
  }
}
</style>
