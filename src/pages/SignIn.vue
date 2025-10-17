<template>
  <main class="signin">
    <div class="signin__container">
      <section class="signin__form-section">
        <form class="form" @submit.prevent="handleSignIn">
          <header class="form__header">
            <h1 class="form__title">Landmark App</h1>
            <h2 class="form__subtitle">Sign in to your account</h2>
          </header>

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

          <div class="form__actions">
            <FormButton
              button-text="Sign In"
              loading-text="Signing In..."
              :loading="loading"
              :disabled="loading"
            />
          </div>

          <footer class="form__footer">
            <p class="form__footer-text">
              Don't have an account?
              <RouterLink to="/register" class="form__link"
                >Go to Register</RouterLink
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
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import FormInput from '../components/UI/FormInput.vue';
import FormButton from '../components/UI/FormButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: '',
  password: '',
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
    errors.password = 'Password must be more than 5 symbols';
    isValid = false;
  }

  return isValid;
}

async function handleSignIn() {
  if (!validationForm()) return;

  loading.value = true;

  const success = await authStore.login(form.email, form.password);

  if (success) {
    router.push('/generalmap');
  }

  loading.value = false;
}
</script>
<style scoped>
.signin {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.signin__container {
  width: 100%;
  max-width: 762px;
}

.signin__form-section {
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.form__title {
  color: #2d3748;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form__subtitle {
  color: #718096;
  font-size: 1rem;
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
  .signin__form-section {
    padding: 2rem 1.5rem;
  }

  .signin {
    padding: 10px;
  }
}
</style>
