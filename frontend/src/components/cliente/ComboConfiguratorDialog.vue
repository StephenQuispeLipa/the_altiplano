<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="combo-dialog rounded-xl" color="surface-container-low">
      <div class="bg-primary pa-6 flex-shrink-0">
        <h3 class="font-headline text-h5 text-white font-weight-bold">{{ combo?.name }}</h3>
        <p class="text-white text-body-2 opacity-80 mt-1">Bs {{ combo?.basePrice }}</p>
      </div>

      <v-card-text class="combo-dialog__body pa-6">
        <v-alert
          v-if="hasPendingSlots"
          type="warning"
          variant="tonal"
          density="compact"
          class="rounded-xl mb-6"
          icon="mdi-alert-circle-outline"
        >
          Algunas opciones quedaron pendientes. Puedes agregar el combo igualmente.
        </v-alert>

        <div v-for="slot in slotOptions" :key="slot.id" class="mb-8">
          <h4 class="font-headline text-subtitle-1 font-weight-bold mb-4">{{ slot.label }}</h4>

          <p v-if="slot.dishes.length === 0" class="text-body-2 text-on-surface-variant mb-2">
            Sin opciones disponibles hoy
          </p>

          <v-radio-group
            v-else
            v-model="selections[slot.id]"
            hide-details
            color="primary"
          >
            <v-row align="stretch">
              <v-col v-for="dish in slot.dishes" :key="dish.dishId" cols="6" class="d-flex">
                <v-card
                  variant="flat"
                  :color="selections[slot.id] === dish.dishId ? 'primary-container' : 'surface-container-high'"
                  class="option-card rounded-xl overflow-hidden flex-grow-1 w-100"
                  :class="{
                    'option-card--selected': selections[slot.id] === dish.dishId,
                    'option-card--sold-out': isSoldOut(dish),
                  }"
                  @click="selectDish(slot.id, dish)"
                >
                  <div class="option-card__image-wrap">
                    <v-img
                      :src="dish.image || placeholder"
                      cover
                      class="option-card__image"
                    />
                    <div v-if="isSoldOut(dish)" class="option-card__sold-out">
                      <span class="option-card__sold-out-label">AGOTADO</span>
                    </div>
                    <div v-else class="option-card__radio">
                      <v-radio :value="dish.dishId" density="compact" hide-details />
                    </div>
                  </div>
                  <v-card-text class="option-card__body pa-3">
                    <div class="font-weight-bold text-body-2 line-clamp-2">{{ dish.name }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
      </v-card-text>

      <v-divider class="opacity-10 flex-shrink-0" />

      <v-card-actions class="pa-6 flex-shrink-0">
        <v-btn variant="text" class="rounded-xl font-weight-bold" @click="close">Cancelar</v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          class="rounded-xl font-weight-bold px-8"
          :disabled="!combo"
          @click="confirm"
        >
          Agregar al pedido
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useMenuStore } from '../../stores/useMenuStore';
import { todayISO } from '../../utils/menuDate';
import silpanchoImg from '../../assets/silpancho.jpg';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  combo: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const menuStore = useMenuStore();
const selections = ref({});
const placeholder = silpanchoImg;
const today = todayISO();

function isSoldOut(menuItem) {
  return menuItem.stock === 0;
}

const slotOptions = computed(() => {
  if (!props.combo?.slots) return [];
  const todayMenu = menuStore.getEnrichedMenu(today);
  const menuByDishId = Object.fromEntries(todayMenu.map(m => [m.dishId, m]));

  return props.combo.slots.map(slot => ({
    ...slot,
    dishes: slot.allowedDishIds
      .map(id => menuByDishId[id])
      .filter(Boolean),
  }));
});

const hasPendingSlots = computed(() =>
  slotOptions.value.some(slot => !selections.value[slot.id]),
);

function selectDish(slotId, dish) {
  if (isSoldOut(dish)) return;
  selections.value[slotId] = dish.dishId;
}

watch(() => props.modelValue, (open) => {
  if (open && props.combo) {
    selections.value = {};
    const todayMenu = menuStore.getEnrichedMenu(today);
    const menuByDishId = Object.fromEntries(todayMenu.map(m => [m.dishId, m]));

    props.combo.slots.forEach(slot => {
      const first = slot.allowedDishIds
        .map(id => menuByDishId[id])
        .find(d => d && !isSoldOut(d));
      if (first) selections.value[slot.id] = first.dishId;
    });
  }
});

function close() {
  emit('update:modelValue', false);
}

function confirm() {
  if (!props.combo) return;
  emit('confirm', { ...selections.value });
  close();
}
</script>

<style scoped>
.combo-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.combo-dialog__body {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
}

.option-card {
  display: flex;
  flex-direction: column;
  min-height: 180px;
  height: 100%;
  cursor: pointer;
}

.option-card--sold-out {
  cursor: not-allowed;
  pointer-events: none;
}

.option-card--sold-out .option-card__image {
  filter: grayscale(0.6);
}

.option-card__image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  overflow: hidden;
}

.option-card__image {
  width: 100%;
  height: 100%;
}

.option-card__radio {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(252, 249, 244, 0.9);
  border-radius: 50%;
  line-height: 0;
}

.option-card__sold-out {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(28, 28, 25, 0.55);
}

.option-card__sold-out-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fff;
  background: rgba(133, 52, 31, 0.92);
  padding: 5px 12px;
  border-radius: 4px;
}

.option-card__body {
  flex-grow: 1;
  display: flex;
  align-items: center;
  min-height: 52px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
