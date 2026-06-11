<template>
  <v-dialog :model-value="modelValue" max-width="480" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
      <div class="bg-primary pa-6">
        <h3 class="font-headline text-h5 text-white font-weight-bold">
          {{ isEdit ? 'Editar en menú' : 'Agregar al menú' }}
        </h3>
        <p v-if="selectedDate" class="text-white text-body-2 opacity-80 mt-1">{{ formatMenuDate(selectedDate) }}</p>
      </div>

      <v-card-text class="pa-6">
        <v-autocomplete
          v-if="!isEdit"
          v-model="form.dishId"
          :items="availableDishes"
          item-title="name"
          item-value="id"
          label="Buscar platillo"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          rounded="lg"
          :error-messages="dishError"
          class="mb-4"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="getCategoryLabel(item.raw.type)" />
          </template>
        </v-autocomplete>

        <v-text-field
          v-else
          :model-value="entry?.name"
          label="Platillo"
          variant="outlined"
          rounded="lg"
          readonly
          class="mb-4"
        />

        <v-text-field
          v-model.number="form.price"
          label="Precio (Bs)"
          type="number"
          min="0"
          variant="outlined"
          rounded="lg"
          :error-messages="priceError"
          class="mb-4"
        />

        <v-text-field
          v-model.number="form.stock"
          label="Stock disponible"
          type="number"
          min="0"
          variant="outlined"
          rounded="lg"
          :error-messages="stockError"
        />
      </v-card-text>

      <v-divider class="opacity-10" />

      <v-card-actions class="pa-6">
        <v-btn variant="text" class="rounded-xl font-weight-bold" @click="close">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-8" @click="save">
          {{ isEdit ? 'Guardar' : 'Agregar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useDishesStore } from '../../stores/useDishesStore';
import { useMenuStore } from '../../stores/useMenuStore';
import { getCategoryLabel } from '../../constants/dishCategories';
import { formatMenuDate } from '../../utils/menuDate';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  entry: { type: Object, default: null },
  selectedDate: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue', 'save']);

const dishesStore = useDishesStore();
const menuStore = useMenuStore();

const form = ref({ dishId: null, price: 0, stock: 0 });
const dishError = ref('');
const priceError = ref('');
const stockError = ref('');

const isEdit = computed(() => !!props.entry?.id);

const availableDishes = computed(() => {
  const onMenu = new Set(
    menuStore.getEntriesForDate(props.selectedDate).map(e => e.dishId)
  );
  return dishesStore.dishes.filter(d => !onMenu.has(d.id));
});

watch(() => props.modelValue, (open) => {
  if (open) {
    if (props.entry) {
      form.value = {
        dishId: props.entry.dishId,
        price: props.entry.price,
        stock: props.entry.stock,
      };
    } else {
      form.value = { dishId: null, price: 0, stock: 0 };
    }
    dishError.value = '';
    priceError.value = '';
    stockError.value = '';
  }
});

function validate() {
  let valid = true;
  if (!isEdit.value && !form.value.dishId) {
    dishError.value = 'Selecciona un platillo.';
    valid = false;
  } else {
    dishError.value = '';
  }
  if (form.value.price === '' || form.value.price < 0) {
    priceError.value = 'Ingresa un precio válido.';
    valid = false;
  } else {
    priceError.value = '';
  }
  if (form.value.stock === '' || form.value.stock < 0) {
    stockError.value = 'Ingresa un stock válido.';
    valid = false;
  } else {
    stockError.value = '';
  }
  return valid;
}

function save() {
  if (!validate()) return;
  emit('save', {
    entryId: props.entry?.id,
    dishId: form.value.dishId,
    price: form.value.price,
    stock: form.value.stock,
  });
}

function close() {
  emit('update:modelValue', false);
}
</script>
