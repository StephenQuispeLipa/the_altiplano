<script setup>
import { computed } from 'vue';
import {
  evaluatePasswordStrength,
  strengthColor,
  strengthProgress,
  strengthLabel,
} from '../../utils/passwordStrength';

const password = defineModel({ type: String, default: '' });

defineProps({
  label: { type: String, default: 'Contraseña' },
  showRules: { type: Boolean, default: true },
});
const color = computed(() => strengthColor(strength.value));
const progress = computed(() => strengthProgress(strength.value));
const strengthText = computed(() => strengthLabel(strength.value));

const passwordRules = computed(() => [
  (v) => !!v || 'Campo obligatorio.',
  (v) => !v || evaluatePasswordStrength(v) !== 'débil' || 'La contraseña es demasiado débil.',
]);
</script>

<template>
  <div class="password-strength-field mb-6">
    <label class="font-label text-caption font-weight-bold text-on-surface-variant mb-2 d-block ml-1 uppercase tracking-widest">
      {{ label }}
    </label>
    <v-text-field
      v-model="password"
      prepend-inner-icon="mdi-lock-outline"
      type="password"
      placeholder="••••••••"
      variant="filled"
      bg-color="surface-container-high"
      color="primary"
      density="comfortable"
      class="custom-input rounded-lg"
      hide-details="auto"
      :rules="showRules ? passwordRules : []"
    />
    <div v-if="password" class="mt-2">
      <div class="d-flex justify-space-between text-caption mb-1">
        <span class="text-on-surface-variant">Fortaleza:</span>
        <span :class="`text-${color}`" class="font-weight-bold">{{ strengthText }}</span>
      </div>
      <v-progress-linear :model-value="progress" :color="color" height="6" rounded />
    </div>
  </div>
</template>
