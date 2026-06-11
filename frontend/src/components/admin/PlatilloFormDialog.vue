<template>
  <v-dialog :model-value="modelValue" max-width="480" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
      <div class="bg-primary pa-6">
        <h3 class="font-headline text-h5 text-white font-weight-bold">
          {{ isEdit ? 'Editar platillo' : 'Nuevo platillo' }}
        </h3>
      </div>

      <v-card-text class="pa-6">
        <div class="d-flex justify-center mb-6">
          <div class="platillo-photo-wrap" @click="triggerFileInput">
            <v-img
              :src="form.image || placeholder"
              cover
              class="platillo-photo"
            />
            <div class="platillo-photo-overlay">
              <v-icon color="white" size="28">mdi-camera</v-icon>
            </div>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="d-none"
            @change="onFileSelected"
          />
        </div>

        <v-text-field
          v-model="form.name"
          label="Nombre del platillo"
          variant="outlined"
          rounded="lg"
          :error-messages="nameError"
          class="mb-4"
        />

        <v-select
          v-model="form.type"
          :items="categoryItems"
          item-title="label"
          item-value="type"
          label="Categoría"
          variant="outlined"
          rounded="lg"
          :error-messages="typeError"
        />
      </v-card-text>

      <v-divider class="opacity-10" />

      <v-card-actions class="pa-6">
        <v-btn variant="text" class="rounded-xl font-weight-bold" @click="close">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-8" @click="save">
          {{ isEdit ? 'Guardar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <ImageCropperDialog
      v-model="cropperOpen"
      :image-src="pendingCropSrc"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import ImageCropperDialog from '../cliente/ImageCropperDialog.vue';
import { DISH_CATEGORIES } from '../../constants/dishCategories';
import { processProfilePhotoFile } from '../../utils/profilePhoto';
import silpanchoImg from '../../assets/silpancho.jpg';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  dish: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'save']);

const placeholder = silpanchoImg;
const categoryItems = DISH_CATEGORIES;
const form = ref({ name: '', type: '', image: '' });
const nameError = ref('');
const typeError = ref('');
const fileInputRef = ref(null);
const cropperOpen = ref(false);
const pendingCropSrc = ref('');

const isEdit = computed(() => !!props.dish?.id);

watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.dish) {
      form.value = {
        name: props.dish.name,
        type: props.dish.type,
        image: props.dish.image,
      };
    } else {
      form.value = { name: '', type: '', image: '' };
    }
    nameError.value = '';
    typeError.value = '';
  }
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function onFileSelected(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const result = await processProfilePhotoFile(file);
  if (!result.success) {
    nameError.value = result.message;
    return;
  }
  nameError.value = '';

  if (result.needsCrop) {
    pendingCropSrc.value = result.dataUrl;
    cropperOpen.value = true;
  } else {
    form.value.image = result.dataUrl;
  }
}

function onCropConfirm(dataUrl) {
  form.value.image = dataUrl;
  cropperOpen.value = false;
  pendingCropSrc.value = '';
}

function onCropCancel() {
  cropperOpen.value = false;
  pendingCropSrc.value = '';
}

function validate() {
  let valid = true;
  nameError.value = form.value.name?.trim() ? '' : 'El nombre es obligatorio.';
  typeError.value = form.value.type ? '' : 'La categoría es obligatoria.';
  if (nameError.value) valid = false;
  if (typeError.value) valid = false;
  return valid;
}

function save() {
  if (!validate()) return;
  emit('save', {
    id: props.dish?.id,
    name: form.value.name.trim(),
    type: form.value.type,
    image: form.value.image || placeholder,
  });
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.platillo-photo-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.platillo-photo {
  width: 100%;
  height: 100%;
}

.platillo-photo-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(28, 28, 25, 0.35);
  opacity: 0;
  transition: opacity 0.2s;
}

.platillo-photo-wrap:hover .platillo-photo-overlay {
  opacity: 1;
}
</style>
