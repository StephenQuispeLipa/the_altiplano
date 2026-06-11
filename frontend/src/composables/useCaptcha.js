import { ref } from 'vue';
import { fetchCaptcha } from '../api/auth';

export function useCaptcha() {
  const captchaId = ref('');
  const captchaText = ref('');
  const answer = ref('');
  const loading = ref(false);
  const error = ref(null);

  async function loadCaptcha() {
    loading.value = true;
    error.value = null;
    answer.value = '';
    try {
      const data = await fetchCaptcha();
      captchaId.value = data.captchaId;
      captchaText.value = data.text;
    } catch (err) {
      error.value = err.message || 'No se pudo cargar el CAPTCHA';
    } finally {
      loading.value = false;
    }
  }

  return {
    captchaId,
    captchaText,
    answer,
    loading,
    error,
    loadCaptcha,
  };
}
