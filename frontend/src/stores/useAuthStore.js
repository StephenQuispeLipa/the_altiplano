import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '../api/auth';
import { getToken, setToken } from '../api/client';

export const useAuthStore = defineStore('auth', () => {
  const currentRole = ref(null);
  const currentUser = ref(null);
  const currentClientId = ref(null);
  const currentStaffId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  function applyUser(user) {
    currentUser.value = user;
    currentRole.value = user.role;
    if (user.role === 'Cliente') {
      currentClientId.value = user.id;
      currentStaffId.value = null;
    } else {
      currentStaffId.value = user.id;
      currentClientId.value = null;
    }
  }

  async function login(email, password, role, captchaId, captchaAnswer) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authApi.login(email, password, role, captchaId, captchaAnswer);
      setToken(result.accessToken);
      applyUser(result.user);
      return { success: true };
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!getToken()) return false;
    loading.value = true;
    error.value = null;
    try {
      const user = await authApi.fetchMe();
      applyUser(user);
      return true;
    } catch {
      setToken(null);
      currentRole.value = null;
      currentUser.value = null;
      currentClientId.value = null;
      currentStaffId.value = null;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload) {
    loading.value = true;
    error.value = null;
    try {
      const result = await authApi.register(payload);
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message || 'Error al registrarse';
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      if (getToken()) await authApi.logout();
    } catch {
      // ignore
    }
    setToken(null);
    currentRole.value = null;
    currentUser.value = null;
    currentClientId.value = null;
    currentStaffId.value = null;
  }

  function setRole(role) {
    if (role && ['Admin', 'Camarero', 'Cliente'].includes(role)) {
      currentRole.value = role;
    } else {
      currentRole.value = null;
    }
  }

  return {
    currentRole,
    currentUser,
    currentClientId,
    currentStaffId,
    loading,
    error,
    login,
    register,
    logout,
    fetchMe,
    setRole,
  };
});
