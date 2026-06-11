<script setup>
import { computed, onMounted } from 'vue';
import { useCaptcha } from '../../composables/useCaptcha';

const { captchaId, captchaText, answer, loading, error, loadCaptcha } = useCaptcha();

defineExpose({
  get captchaId() {
    return captchaId.value;
  },
  get answer() {
    return answer.value;
  },
  loadCaptcha,
});

const captchaChars = computed(() => captchaText.value.split(''));

onMounted(loadCaptcha);
</script>

<template>
  <div class="captcha-field mb-6">
    <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
      Verificación CAPTCHA
    </label>
    <p class="text-caption text-on-surface-variant mb-3">
      Escribe el texto que ves en la imagen.
    </p>
    <div class="d-flex align-center gap-3 mb-3">
      <div class="captcha-display" aria-hidden="true">
        <span
          v-for="(char, index) in captchaChars"
          :key="index"
          class="captcha-char"
          :style="{ transform: `rotate(${((index % 3) - 1) * 8}deg) translateY(${index % 2 === 0 ? -2 : 2}px)` }"
        >
          {{ char }}
        </span>
        <div class="captcha-noise captcha-noise--1" />
        <div class="captcha-noise captcha-noise--2" />
        <div class="captcha-noise captcha-noise--3" />
      </div>
      <v-btn
        icon="mdi-refresh"
        variant="tonal"
        size="small"
        :loading="loading"
        aria-label="Refrescar CAPTCHA"
        @click="loadCaptcha"
      />
    </div>
    <v-text-field
      v-model="answer"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      placeholder="Texto del CAPTCHA"
      variant="filled"
      bg-color="surface-container-high"
      color="primary"
      density="comfortable"
      class="custom-input rounded-lg"
      hide-details="auto"
      :rules="[(v) => !!v?.toString().trim() || 'Ingresa el texto del CAPTCHA.']"
    />
    <p v-if="error" class="text-error text-caption mt-1">{{ error }}</p>
  </div>
</template>

<style scoped>
.captcha-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 160px;
  min-height: 56px;
  padding: 12px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f0eb 0%, #e8dfd6 100%);
  border: 1px dashed rgba(133, 52, 31, 0.35);
  overflow: hidden;
  user-select: none;
}

.captcha-char {
  display: inline-block;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #5c3d2e;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
}

.captcha-noise {
  position: absolute;
  pointer-events: none;
  background: rgba(133, 52, 31, 0.25);
}

.captcha-noise--1 {
  top: 30%;
  left: 0;
  right: 0;
  height: 1px;
  transform: rotate(-8deg);
}

.captcha-noise--2 {
  top: 55%;
  left: 10%;
  right: 10%;
  height: 1px;
  transform: rotate(12deg);
}

.captcha-noise--3 {
  top: 0;
  bottom: 0;
  left: 45%;
  width: 1px;
  transform: rotate(15deg);
  opacity: 0.4;
}
</style>
