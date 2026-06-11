import { ref } from 'vue';

const isBootstrapping = ref(false);
const bootstrapError = ref(null);

export function useAppBootstrap() {
  return {
    isBootstrapping,
    bootstrapError,
  };
}

export function startBootstrap() {
  isBootstrapping.value = true;
  bootstrapError.value = null;
}

export function finishBootstrap() {
  isBootstrapping.value = false;
  bootstrapError.value = null;
}

export function failBootstrap(message) {
  isBootstrapping.value = false;
  bootstrapError.value = message || 'No se pudo conectar con el servidor.';
}

export async function retryBootstrap(initFn) {
  startBootstrap();
  try {
    await initFn();
    finishBootstrap();
    return true;
  } catch (err) {
    failBootstrap(err.message);
    return false;
  }
}
