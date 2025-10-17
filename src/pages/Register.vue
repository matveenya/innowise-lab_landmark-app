<template>
  <main class="register">
    <div class="register__container">
      <section class="register__form-section">
        <form class="form" @submit.prevent="handleRegister">
          <header class="form__header">
            <h1 class="form__title">Create Account</h1>
          </header>

          <FormInput
            id="displayName"
            label="Display Name"
            type="text"
            placeholder="Enter your display name"
            v-model="form.displayName"
            :required="true"
            :error-message="errors.displayName"
            container-class="display-name"
          />

          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            v-model="form.email"
            :required="true"
            :error-message="errors.email"
            container-class="email"
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            v-model="form.password"
            :required="true"
            :error-message="errors.password"
            container-class="password"
          />

          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            v-model="form.confirmPassword"
            :required="true"
            :error-message="errors.confirmPassword"
            container-class="confirm-password"
          />

          <div class="form__actions">
            <FormButton
              button-text="Create Account"
              loading-text="Creating Account..."
              :loading="loading"
              :disabled="loading"
            />
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
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import FormInput from '../components/UI/FormInput.vue';
import FormButton from '../components/UI/FormButton.vue';

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
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 symbols';
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

.form__actions {
  margin: 2rem 0 1rem;
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
