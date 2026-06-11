<template>
  <v-dialog :model-value="modelValue" max-width="600" persistent scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
      <div class="bg-primary pa-6 flex-shrink-0">
        <h3 class="font-headline text-h5 text-white font-weight-bold">
          {{ isEdit ? 'Editar combo' : 'Nuevo combo' }}
        </h3>
      </div>

      <v-card-text class="pa-6">
        <div class="d-flex justify-center mb-6">
          <div class="combo-photo-wrap" @click="triggerFileInput">
            <v-img
              :src="form.image || placeholder"
              cover
              class="combo-photo"
            />
            <div class="combo-photo-overlay">
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
          label="Nombre del combo"
          variant="outlined"
          rounded="lg"
          :error-messages="nameError"
          class="mb-4"
        />

        <v-text-field
          v-model.number="form.basePrice"
          label="Precio base (Bs)"
          type="number"
          min="0"
          variant="outlined"
          rounded="lg"
          :error-messages="priceError"
          class="mb-6"
        />

        <div class="d-flex align-center justify-space-between mb-4">
          <span class="font-weight-bold text-subtitle-2">Ítems del combo</span>
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            class="rounded-lg font-weight-bold"
            prepend-icon="mdi-plus"
            @click="addSlot"
          >
            Agregar ítem
          </v-btn>
        </div>

        <div
          v-for="(slot, index) in form.slots"
          :key="slot._key"
          class="slot-block pa-4 rounded-xl bg-surface-container-high mb-4"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-caption font-weight-bold uppercase tracking-widest opacity-70">
              Ítem {{ index + 1 }}
            </span>
            <v-btn
              v-if="form.slots.length > 1"
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="error"
              @click="removeSlot(index)"
            />
          </div>

          <v-text-field
            v-model="slot.label"
            label="Etiqueta (ej. Sopa, Segundo)"
            variant="outlined"
            rounded="lg"
            density="compact"
            class="mb-3"
          />

          <v-autocomplete
            :model-value="slot.allowedDishIds"
            :items="dishesStore.dishes"
            item-title="name"
            item-value="id"
            label="Opciones para el cliente"
            multiple
            chips
            closable-chips
            variant="outlined"
            rounded="lg"
            density="compact"
            @update:model-value="onSlotDishesUpdate(slot, $event)"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item
                v-bind="itemProps"
                :subtitle="item.raw ? getCategoryLabel(item.raw.type) : ''"
              />
            </template>
          </v-autocomplete>
        </div>

        <p v-if="slotsError" class="text-error text-caption mt-2">{{ slotsError }}</p>
      </v-card-text>

      <v-divider class="opacity-10 flex-shrink-0" />

      <v-card-actions class="pa-6 flex-shrink-0">
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
import { useDishesStore } from '../../stores/useDishesStore';
import { getCategoryLabel } from '../../constants/dishCategories';
import { processProfilePhotoFile } from '../../utils/profilePhoto';
import silpanchoImg from '../../assets/silpancho.jpg';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  combo: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'save']);

const dishesStore = useDishesStore();
const placeholder = silpanchoImg;
let slotKeyCounter = 0;

const form = ref({
  name: '',
  basePrice: 0,
  image: '',
  slots: [{ _key: 0, id: 'slot1', label: '', allowedDishIds: [] }],
});
const nameError = ref('');
const priceError = ref('');
const slotsError = ref('');
const fileInputRef = ref(null);
const cropperOpen = ref(false);
const pendingCropSrc = ref('');

const isEdit = computed(() => !!props.combo?.id);

function normalizeDishIds(value) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object') return entry.id ?? entry.value ?? null;
    return null;
  }).filter(Boolean);
}

function onSlotDishesUpdate(slot, value) {
  slot.allowedDishIds = normalizeDishIds(value);
}

watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.combo) {
      form.value = {
        name: props.combo.name,
        basePrice: props.combo.basePrice,
        image: props.combo.image,
        slots: props.combo.slots.map((s, i) => ({
          _key: ++slotKeyCounter,
          id: s.id || `slot${i + 1}`,
          label: s.label,
          allowedDishIds: normalizeDishIds(s.allowedDishIds),
        })),
      };
    } else {
      form.value = {
        name: '',
        basePrice: 0,
        image: '',
        slots: [{ _key: ++slotKeyCounter, id: 'slot1', label: '', allowedDishIds: [] }],
      };
    }
    nameError.value = '';
    priceError.value = '';
    slotsError.value = '';
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

function addSlot() {
  const n = form.value.slots.length + 1;
  form.value.slots.push({
    _key: ++slotKeyCounter,
    id: `slot${n}`,
    label: '',
    allowedDishIds: [],
  });
}

function removeSlot(index) {
  form.value.slots.splice(index, 1);
}

function validate() {
  let valid = true;
  nameError.value = form.value.name?.trim() ? '' : 'El nombre es obligatorio.';
  priceError.value = form.value.basePrice !== '' && form.value.basePrice >= 0
    ? ''
    : 'Ingresa un precio válido.';
  if (nameError.value) valid = false;
  if (priceError.value) valid = false;

  if (form.value.slots.length === 0) {
    slotsError.value = 'Agrega al menos un ítem.';
    valid = false;
  } else if (form.value.slots.some(s => !s.label?.trim())) {
    slotsError.value = 'Cada ítem debe tener una etiqueta.';
    valid = false;
  } else if (form.value.slots.some(s => !s.allowedDishIds?.length)) {
    slotsError.value = 'Cada ítem debe tener al menos una opción.';
    valid = false;
  } else {
    slotsError.value = '';
  }
  return valid;
}

function save() {
  if (!validate()) return;
  emit('save', {
    id: props.combo?.id,
    name: form.value.name.trim(),
    basePrice: form.value.basePrice,
    image: form.value.image || placeholder,
    slots: form.value.slots.map((s, i) => ({
      id: s.id || `slot${i + 1}`,
      label: s.label.trim(),
      allowedDishIds: normalizeDishIds(s.allowedDishIds),
    })),
  });
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.combo-photo-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.combo-photo {
  width: 100%;
  height: 100%;
}

.combo-photo-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(28, 28, 25, 0.35);
  opacity: 0;
  transition: opacity 0.2s;
}

.combo-photo-wrap:hover .combo-photo-overlay {
  opacity: 1;
}
</style>
