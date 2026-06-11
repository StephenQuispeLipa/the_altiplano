<template>
  <v-row no-gutters class="fill-height overflow-hidden bg-surface">
    <v-col cols="12" md="6" lg="7" class="d-none d-md-flex relative hero-section">
      <v-img :src="illimaniImg" cover class="fill-height" alt="Nevado Illimani, La Paz">
        <div class="absolute inset-0 hero-gradient"></div>
        <div class="absolute bottom-16 left-16 max-w-xl z-10 p-8">
          <p class="font-display text-white text-h2 font-weight-bold leading-tight tracking-tight mb-6">
            La esencia del Altiplano <br /> en cada detalle.
          </p>
          <div class="h-1-5 w-24 bg-primary rounded-pill"></div>
        </div>
      </v-img>
    </v-col>

    <v-col cols="12" md="6" lg="5"
      class="bg-surface-container-low d-flex flex-column align-center justify-center pa-8 pa-md-16">
      <div class="auth-card-width w-100">
        <header class="text-center text-md-left mb-12">
          <div class="d-flex flex-column align-center align-md-start mb-8">
            <span class="font-display font-weight-black text-h4 tracking-tighter text-primary">
              The Altiplano
            </span>
          </div>
          <h1 class="font-display text-h3 font-weight-bold text-on-surface mb-3">
            Bienvenido de nuevo
          </h1>
          <p class="text-on-surface-variant font-body text-body-1">
            Ingresa tus credenciales para gestionar tu restaurante.
          </p>
        </header>

        <v-alert v-if="registeredSuccess" type="success" variant="tonal" class="mb-6 rounded-lg" density="compact">
          Registro exitoso. Ya puedes iniciar sesión.
        </v-alert>

        <v-form ref="formRef" @submit.prevent="handleLogin" class="mt-8">
          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Rol de Acceso
            </label>
            <v-select
              v-model="selectedRole"
              :items="roles"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[roleRequired]"
            />
          </div>

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Email
            </label>
            <v-text-field
              v-model="email"
              prepend-inner-icon="mdi-email-outline"
              placeholder="tu@restaurante.com"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required(), emailRule]"
            />
          </div>

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Contraseña
            </label>
            <v-text-field
              v-model="password"
              prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :error-messages="credentialsError || undefined"
              :rules="[required()]"
            >
              <template #append-inner>
                <v-icon
                  :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </v-text-field>
          </div>

          <CaptchaField ref="captchaRef" />

          <div class="d-flex align-center justify-space-between mb-8">
            <v-checkbox v-model="rememberMe" label="Recordarme" color="primary" hide-details density="compact"
              class="font-body text-body-2" />
            <a href="#" class="text-primary font-weight-bold text-body-2 text-decoration-none hover-underline">
              Olvidé mi contraseña
            </a>
          </div>

          <v-btn block size="x-large" class="primary-gradient-btn rounded-lg font-weight-bold elevation-0" height="64"
            type="submit" :loading="authStore.loading">
            <span class="text-white">Iniciar Sesión</span>
            <v-icon right color="white" class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
        </v-form>

        <div class="mt-12 pt-10 border-t-ghost text-center">
          <p class="text-on-surface-variant text-body-2 font-body mb-4">
            ¿No tienes una cuenta?
          </p>
          <v-btn
            variant="text"
            color="secondary"
            class="font-weight-bold text-body-2 group uppercase tracking-widest"
            size="small"
            to="/register"
          >
            Registrarme
            <v-icon right class="group-hover-translate">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <footer class="mt-auto pt-12 text-center">
        <p class="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
          © 2024 Earth & Hearth · Inspirado por el Altiplano
        </p>
      </footer>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import { resetAppDataInitialized } from '../composables/useAppInit';
import { required, email as emailRule, roleRequired } from '../utils/validationRules';
import { isCaptchaRelatedError, isCredentialsError } from '../utils/authErrors';
import CaptchaField from '../components/auth/CaptchaField.vue';
import illimaniImg from '../assets/illimani.jpg';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref(null);
const captchaRef = ref(null);
const email = ref('');
const password = ref('');
const selectedRole = ref('Cliente');
const roles = ['Admin', 'Camarero', 'Cliente'];
const showPassword = ref(false);
const rememberMe = ref(false);
const credentialsError = ref('');

const registeredSuccess = computed(() => route.query.registered === '1');

const handleLogin = async () => {
  credentialsError.value = '';
  captchaRef.value?.clearServerError();

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const result = await authStore.login(
    email.value,
    password.value,
    selectedRole.value,
    captchaRef.value.captchaId,
    captchaRef.value.answer,
  );

  if (result.success) {
    resetAppDataInitialized();
    router.push('/');
    return;
  }

  const message = result.message || authStore.error || 'Error al iniciar sesión';

  if (isCaptchaRelatedError(message)) {
    captchaRef.value?.setServerError(message);
    captchaRef.value?.loadCaptcha();
  } else if (isCredentialsError(message)) {
    credentialsError.value = message;
  } else {
    credentialsError.value = message;
  }
};
</script>

<style scoped>
.hero-section {
  position: relative;
}

.absolute {
  position: absolute;
}

.bottom-16 {
  bottom: 4rem;
}

.left-16 {
  left: 4rem;
}

.max-w-xl {
  max-width: 36rem;
}

.z-10 {
  z-index: 10;
}

.p-8 {
  padding: 2rem;
}

.hero-gradient {
  background: linear-gradient(to top,
      rgba(28, 28, 25, 0.8) 0%,
      rgba(133, 52, 31, 0.2) 50%,
      transparent 100%);
}

.auth-card-width {
  max-width: 440px;
}

.primary-gradient-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-container)) !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
}

.primary-gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(133, 52, 31, 0.2) !important;
}

.primary-gradient-btn:active {
  transform: translateY(0);
}

.border-t-ghost {
  border-top: 1px solid var(--outline-variant);
}

.h-1-5 {
  height: 6px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-underline:hover {
  text-decoration: underline !important;
}

.group-hover-translate {
  transition: transform 0.2s ease;
}

.v-btn:hover .group-hover-translate {
  transform: translateX(4px);
}

:deep(.custom-input.v-field--variant-filled) {
  border-radius: 8px !important;
}

:deep(.custom-input.v-field--variant-filled .v-field__overlay) {
  background-color: var(--surface-container-high) !important;
  opacity: 1 !important;
}

:deep(.custom-input.v-field--variant-filled .v-field__outline) {
  display: none;
}

:deep(.custom-input.v-field--focused::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary);
  transform: scaleX(1);
  transition: transform 0.3s ease;
}

.font-label {
  font-family: var(--font-body);
  letter-spacing: 0.1em;
}

.bg-surface {
  background-color: var(--surface) !important;
}

.bg-surface-container-low {
  background-color: var(--surface-container-low) !important;
}
</style>
