<template>
  <v-row no-gutters class="fill-height overflow-hidden bg-surface">
    <v-col cols="12" md="6" lg="7" class="d-none d-md-flex relative hero-section">
      <v-img :src="illimaniImg" cover class="fill-height" alt="Nevado Illimani, La Paz">
        <div class="absolute inset-0 hero-gradient"></div>
        <div class="absolute bottom-16 left-16 max-w-xl z-10 p-8">
          <p class="font-display text-white text-h2 font-weight-bold leading-tight tracking-tight mb-6">
            Únete a The Altiplano
          </p>
          <div class="h-1-5 w-24 bg-primary rounded-pill"></div>
        </div>
      </v-img>
    </v-col>

    <v-col cols="12" md="6" lg="5"
      class="bg-surface-container-low d-flex flex-column align-center justify-center pa-8 pa-md-16">
      <div class="auth-card-width w-100">
        <header class="text-center text-md-left mb-10">
          <div class="d-flex flex-column align-center align-md-start mb-6">
            <span class="font-display font-weight-black text-h4 tracking-tighter text-primary">
              The Altiplano
            </span>
          </div>
          <h1 class="font-display text-h3 font-weight-bold text-on-surface mb-3">
            Crear cuenta
          </h1>
          <p class="text-on-surface-variant font-body text-body-1">
            Regístrate como cliente para realizar pedidos.
          </p>
        </header>

        <v-form ref="formRef" @submit.prevent="handleRegister">
          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Nombre completo
            </label>
            <v-text-field
              v-model="name"
              prepend-inner-icon="mdi-account-outline"
              placeholder="Tu nombre"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required()]"
            />
          </div>

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Teléfono
            </label>
            <v-text-field
              v-model="phone"
              prepend-inner-icon="mdi-phone-outline"
              placeholder="70000000"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required(), phoneMin7]"
            />
          </div>

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Dirección
            </label>
            <v-text-field
              v-model="address"
              prepend-inner-icon="mdi-map-marker-outline"
              placeholder="Tu dirección"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required()]"
            />
          </div>

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Email
            </label>
            <v-text-field
              v-model="email"
              prepend-inner-icon="mdi-email-outline"
              placeholder="tu@email.com"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required(), emailRule]"
            />
          </div>

          <PasswordStrengthField v-model="password" />

          <div class="mb-6">
            <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
              Confirmar contraseña
            </label>
            <v-text-field
              v-model="confirmPassword"
              prepend-inner-icon="mdi-lock-check-outline"
              type="password"
              placeholder="••••••••"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              density="comfortable"
              class="custom-input rounded-lg"
              hide-details="auto"
              :rules="[required(), confirmPasswordRule(password)]"
            />
          </div>

          <CaptchaField ref="captchaRef" />

          <v-btn
            block
            size="x-large"
            class="primary-gradient-btn rounded-lg font-weight-bold elevation-0 mb-4"
            height="64"
            type="submit"
            :loading="authStore.loading"
            :disabled="!isPasswordAcceptable(password)"
          >
            <span class="text-white">Registrarme</span>
          </v-btn>

          <v-alert v-if="authStore.error" type="error" variant="tonal" class="rounded-lg" density="compact">
            {{ authStore.error }}
          </v-alert>
        </v-form>

        <div class="mt-10 pt-8 border-t-ghost text-center">
          <p class="text-on-surface-variant text-body-2 font-body mb-2">
            ¿Ya tienes cuenta?
          </p>
          <v-btn variant="text" color="secondary" class="font-weight-bold" to="/login">
            Iniciar sesión
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import {
  required,
  email as emailRule,
  phoneMin7,
  confirmPasswordRule,
} from '../utils/validationRules';
import { isPasswordAcceptable } from '../utils/passwordStrength';
import CaptchaField from '../components/auth/CaptchaField.vue';
import PasswordStrengthField from '../components/auth/PasswordStrengthField.vue';
import illimaniImg from '../assets/illimani.jpg';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref(null);
const captchaRef = ref(null);
const name = ref('');
const phone = ref('');
const address = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid || !isPasswordAcceptable(password.value)) return;

  const result = await authStore.register({
    name: name.value,
    phone: phone.value,
    address: address.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    captchaId: captchaRef.value.captchaId,
    captchaAnswer: captchaRef.value.answer,
  });

  if (result.success) {
    router.push({ path: '/login', query: { registered: '1' } });
  } else {
    captchaRef.value?.loadCaptcha();
  }
};
</script>

<style scoped>
.hero-section { position: relative; }
.absolute { position: absolute; }
.bottom-16 { bottom: 4rem; }
.left-16 { left: 4rem; }
.max-w-xl { max-width: 36rem; }
.z-10 { z-index: 10; }
.p-8 { padding: 2rem; }
.hero-gradient {
  background: linear-gradient(to top, rgba(28, 28, 25, 0.8) 0%, rgba(133, 52, 31, 0.2) 50%, transparent 100%);
}
.auth-card-width { max-width: 440px; }
.primary-gradient-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-container)) !important;
}
.border-t-ghost { border-top: 1px solid var(--outline-variant); }
.h-1-5 { height: 6px; }
.font-label { font-family: var(--font-body); letter-spacing: 0.1em; }
.bg-surface { background-color: var(--surface) !important; }
.bg-surface-container-low { background-color: var(--surface-container-low) !important; }
:deep(.custom-input.v-field--variant-filled) { border-radius: 8px !important; }
:deep(.custom-input.v-field--variant-filled .v-field__overlay) {
  background-color: var(--surface-container-high) !important;
  opacity: 1 !important;
}
:deep(.custom-input.v-field--variant-filled .v-field__outline) { display: none; }
</style>
