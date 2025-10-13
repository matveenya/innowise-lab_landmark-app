<template>
  <main class="register">
    <div class="register__container">
      <section class="register__form-section">
        <form action="" class="form">
          <header class="form__header">
            <h1 class="form__title">Create Account</h1>
          </header>

          <div class="form__group display-name">
            <label for="displayName" class="form__label display-name__label"
              >Display Name</label
            >
            <input
              id="dispalyName"
              type="text"
              required
              class="form__input display-name__input"
              placeholder="Enter your display name"
            />
            <span class="form__error">Error</span>
          </div>

          <div class="form__group email">
            <label for="email" class="form__label email__label">Email</label>
            <input
              id="email"
              type="email"
              required
              class="form__input email__input"
              placeholder="Enter your email"
            />
            <span class="form__error">Error</span>
          </div>

          <div class="form__group password">
            <label for="password" class="form__label password__label"
              >Password</label
            >
            <input
              id="password"
              type="password"
              required
              class="form__input password__input"
              placeholder="Enter your password"
            />
            <span class="form__error">Error</span>
          </div>

          <div class="form__group confirm-password">
            <label
              for="confirmPassword"
              class="form__label confirm-password__label"
              >Confirm Password</label
            >
            <input
              id="confirmPassword"
              type="password"
              required
              class="form__input confrim-password__input"
              placeholder="Confirm your password"
            />
            <span class="form__error">Error</span>
          </div>

          <div class="form__action">
            <button type="submit" class="form__submit">
              <span class="form__submit-text"> Create Account </span>
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
import { RouterLink } from 'vue-router';
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
  background: white;
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
  background: #f7fafc;
}

.form__input:focus {
  outline: none;
  border-color: #48bb78;
  background: white;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
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
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.form__submit:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
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
