<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <div class="d-flex justify-space-between align-start flex-wrap gap-4 mb-10">
      <div>
        <h1 class="font-headline text-h3 font-weight-bold text-primary mb-2">Mi Perfil</h1>
        <p class="text-on-surface-variant font-body text-body-1 opacity-80">
          Información de tu cuenta de trabajo
        </p>
      </div>
      <v-btn
        v-if="employee"
        color="primary"
        class="rounded-xl font-weight-bold"
        prepend-icon="mdi-pencil-outline"
        @click="openEditModal"
      >
        Editar perfil
      </v-btn>
    </div>

    <v-card v-if="employee" variant="flat" color="surface-container-low" class="rounded-xl pa-8 max-w-lg">
      <div class="d-flex align-center mb-8 profile-identity">
        <v-avatar color="primary-container" size="96" class="flex-shrink-0">
          <v-img v-if="employee.photo" :src="employee.photo" cover alt="Foto de perfil" />
          <span v-else class="font-headline text-h3 text-white font-weight-bold">
            {{ initials }}
          </span>
        </v-avatar>
        <div class="ms-6 avatar-text-block">
          <h2 class="font-headline text-h5 font-weight-bold">{{ employee.name }}</h2>
          <p class="text-on-surface-variant text-body-2 mt-1">{{ employee.role }}</p>
        </div>
      </div>

      <v-divider class="opacity-10 mb-6" />

      <div class="profile-field mb-6">
        <div class="text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
          Nombre completo
        </div>
        <div class="font-body text-body-1 font-weight-medium">{{ employee.name }}</div>
      </div>

      <div class="profile-field mb-6">
        <div class="text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
          Correo electrónico
        </div>
        <div class="font-body text-body-1 font-weight-medium">{{ employee.email }}</div>
      </div>

      <div class="profile-field mb-6">
        <div class="text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
          Teléfono
        </div>
        <div class="font-body text-body-1 font-weight-medium">{{ employee.phone }}</div>
      </div>

      <div class="profile-field">
        <div class="text-caption font-weight-bold uppercase tracking-widest text-on-surface-variant opacity-70 mb-1">
          Rol
        </div>
        <v-chip color="secondary-container" size="small" variant="flat" class="font-weight-bold">
          {{ employee.role }}
        </v-chip>
      </div>
    </v-card>

    <v-alert v-else variant="tonal" color="tertiary" class="rounded-xl">
      No se encontró información del empleado.
    </v-alert>

    <v-dialog v-model="editDialog" max-width="520" persistent>
      <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
        <div class="bg-primary pa-6">
          <h3 class="font-headline text-h5 text-white font-weight-bold">Editar perfil</h3>
          <p class="text-white text-body-2 opacity-80 mt-1">Actualiza tu información personal</p>
        </div>

        <v-card-text class="pa-6">
          <div class="text-center mb-6">
            <v-avatar color="primary-container" size="96" class="mb-4">
              <v-img v-if="editForm.photo" :src="editForm.photo" cover alt="Vista previa" />
              <span v-else class="font-headline text-h3 text-white font-weight-bold">
                {{ editInitials }}
              </span>
            </v-avatar>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="d-none"
              @change="onPhotoSelected"
            />

            <div class="d-flex gap-2 justify-center flex-wrap">
              <v-btn
                variant="flat"
                color="surface-container-high"
                class="rounded-xl font-weight-bold"
                prepend-icon="mdi-camera-outline"
                @click="triggerPhotoUpload"
              >
                Subir fotografía
              </v-btn>
              <v-btn
                v-if="editForm.photo"
                variant="text"
                color="error"
                class="rounded-xl font-weight-bold"
                prepend-icon="mdi-delete-outline"
                @click="removePhoto"
              >
                Quitar foto
              </v-btn>
            </div>
            <p class="text-caption text-on-surface-variant mt-2 opacity-80">
              Máximo 5 MB · JPG, PNG, WebP o GIF
            </p>
          </div>

          <v-form ref="editFormRef" @submit.prevent="requestConfirm">
            <v-text-field
              v-model="editForm.name"
              label="Nombre completo"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              class="rounded-lg mb-4"
              :rules="[v => !!v?.trim() || 'El nombre es obligatorio']"
            />
            <v-text-field
              v-model="editForm.email"
              label="Correo electrónico"
              type="email"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              class="rounded-lg mb-4"
              :rules="[
                v => !!v?.trim() || 'El correo es obligatorio',
                v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() ?? '') || 'Correo inválido',
              ]"
            />
            <v-text-field
              v-model="editForm.phone"
              label="Teléfono"
              variant="filled"
              bg-color="surface-container-high"
              color="primary"
              class="rounded-lg"
              :rules="[v => !!v?.trim() || 'El teléfono es obligatorio']"
            />
          </v-form>
        </v-card-text>

        <v-divider class="opacity-10" />

        <v-card-actions class="pa-6">
          <v-btn variant="text" class="rounded-xl font-weight-bold" @click="editDialog = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-8" @click="requestConfirm">
            Guardar cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ImageCropperDialog
      v-model="cropperOpen"
      :image-src="pendingCropSrc"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <v-dialog v-model="confirmDialog" max-width="400" persistent>
      <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
        <div class="bg-primary pa-6 text-center">
          <v-icon size="40" color="white" class="mb-2">mdi-account-edit-outline</v-icon>
          <h3 class="font-headline text-h6 text-white font-weight-bold">Confirmar cambios</h3>
        </div>
        <v-card-text class="pa-6 text-center text-body-1">
          ¿Deseas guardar los cambios en tu perfil?
        </v-card-text>
        <v-divider class="opacity-10" />
        <v-card-actions class="pa-6">
          <v-btn variant="text" class="rounded-xl font-weight-bold" @click="confirmDialog = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-6" @click="saveProfile">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top">
      <div class="d-flex align-center gap-3">
        <v-icon>{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        <span class="font-weight-bold">{{ snackbar.text }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStaffStore } from '../../stores/useStaffStore';
import ImageCropperDialog from '../../components/cliente/ImageCropperDialog.vue';
import { processProfilePhotoFile } from '../../utils/profilePhoto';

const authStore = useAuthStore();
const staffStore = useStaffStore();

const editDialog = ref(false);
const confirmDialog = ref(false);
const cropperOpen = ref(false);
const editFormRef = ref(null);
const fileInputRef = ref(null);
const pendingCropSrc = ref('');
const editForm = ref({ name: '', email: '', phone: '', photo: '' });
const snackbar = ref({ show: false, text: '', color: 'success' });

const employee = computed(() => staffStore.getStaffById(authStore.currentStaffId));

const initials = computed(() => getInitials(employee.value?.name));
const editInitials = computed(() => getInitials(editForm.value.name));

function getInitials(name) {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function showFeedback(message, success) {
  snackbar.value = { show: true, text: message, color: success ? 'success' : 'error' };
}

function openEditModal() {
  if (!employee.value) return;
  editForm.value = {
    name: employee.value.name,
    email: employee.value.email,
    phone: employee.value.phone,
    photo: employee.value.photo ?? '',
  };
  editDialog.value = true;
}

function triggerPhotoUpload() {
  fileInputRef.value?.click();
}

async function onPhotoSelected(event) {
  const file = event.target.files?.[0];
  event.target.value = '';

  const result = await processProfilePhotoFile(file);
  if (!result.success) {
    showFeedback(result.message, false);
    return;
  }

  if (result.needsCrop) {
    pendingCropSrc.value = result.dataUrl;
    cropperOpen.value = true;
  } else {
    editForm.value.photo = result.dataUrl;
    showFeedback('Fotografía cargada correctamente.', true);
  }
}

function onCropConfirm(dataUrl) {
  editForm.value.photo = dataUrl;
  pendingCropSrc.value = '';
  showFeedback('Fotografía recortada y cargada correctamente.', true);
}

function onCropCancel() {
  pendingCropSrc.value = '';
}

function removePhoto() {
  editForm.value.photo = '';
}

async function requestConfirm() {
  const { valid } = await editFormRef.value.validate();
  if (!valid) return;
  confirmDialog.value = true;
}

async function saveProfile() {
  const result = await staffStore.updateStaff(authStore.currentStaffId, { ...editForm.value });

  confirmDialog.value = false;
  editDialog.value = false;

  showFeedback(result.message, result.success);
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.max-w-lg {
  max-width: 520px;
}
</style>
