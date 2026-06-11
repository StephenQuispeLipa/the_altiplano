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
        <v-alert
          v-if="!isEdit && availableDishes.length === 0"
          type="info"
          variant="tonal"
          density="compact"
          class="rounded-xl mb-4"
        >
          Todos los platillos ya están en el menú de esta fecha.
        </v-alert>

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
          :disabled="availableDishes.length === 0"
          :error-messages="dishError"
          class="mb-4"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="getCategoryLabel(item?.type)" />
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
          step="0.01"
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
          step="1"
          variant="outlined"
          rounded="lg"
          :error-messages="stockError"
        />
      </v-card-text>

      <v-divider class="opacity-10" />

      <v-card-actions class="pa-6">
        <v-btn variant="text" class="rounded-xl font-weight-bold" :disabled="saving" @click="close">Cancelar</v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          class="rounded-xl font-weight-bold px-8"
          :loading="saving"
          :disabled="saving || (!isEdit && availableDishes.length === 0)"
          @click="save"
        >
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
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'save']);

const dishesStore = useDishesStore();
const menuStore = useMenuStore();

const form = ref({ dishId: null, price: null, stock: null });
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
      form.value = { dishId: null, price: null, stock: null };
    }
    dishError.value = '';
    priceError.value = '';
    stockError.value = '';
  }
});

function validate() {
  let valid = true;

  if (!isEdit.value && !form.value.dishId) {
    dishError.value = availableDishes.value.length === 0
      ? 'No hay platillos disponibles para agregar.'
      : 'Selecciona un platillo.';
    valid = false;
  } else {
    dishError.value = '';
  }

  const price = form.value.price;
  if (!Number.isFinite(price) || price <= 0) {
    priceError.value = 'Ingresa un precio mayor a 0.';
    valid = false;
  } else {
    priceError.value = '';
  }

  const stock = form.value.stock;
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    stockError.value = 'Ingresa un stock válido (número entero ≥ 0).';
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
