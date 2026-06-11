<template>
  <v-card
    variant="flat"
    color="surface-container-low"
    class="menu-item-card rounded-xl overflow-hidden"
    :class="{ 'menu-item-card--disabled': disabled }"
  >
    <div class="menu-item-card__image-wrap">
      <v-img
        :src="image || placeholder"
        cover
        class="menu-item-card__image"
      />
      <div v-if="disabled" class="menu-item-card__sold-out">
        <span class="menu-item-card__sold-out-label">AGOTADO</span>
      </div>
      <div v-else-if="quantity > 0" class="menu-item-card__overlay">
        <span class="menu-item-card__count">{{ quantity }}</span>
      </div>
    </div>

    <v-card-text class="menu-item-card__body pa-4">
      <h4 class="font-headline text-subtitle-1 font-weight-bold line-clamp-2 mb-1">{{ name }}</h4>
      <span class="font-headline text-subtitle-2 text-primary font-weight-bold">Bs {{ price }}</span>
    </v-card-text>

    <div class="menu-item-card__actions pa-3 pt-0 d-flex justify-center gap-2">
      <v-btn
        icon="mdi-minus"
        size="small"
        variant="flat"
        color="surface-container-high"
        :disabled="disabled || quantity === 0"
        @click.stop="$emit('decrement')"
      />
      <v-btn
        icon="mdi-plus"
        size="small"
        variant="flat"
        color="primary"
        :disabled="disabled"
        @click.stop="$emit('increment')"
      />
    </div>
  </v-card>
</template>

<script setup>
import silpanchoImg from '../../assets/silpancho.jpg';

defineProps({
  image: { type: String, default: '' },
  name: { type: String, required: true },
  price: { type: [Number, String], required: true },
  quantity: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
});

defineEmits(['increment', 'decrement']);

const placeholder = silpanchoImg;
</script>

<style scoped>
.menu-item-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 280px;
}

.menu-item-card--disabled {
  pointer-events: none;
}

.menu-item-card--disabled .menu-item-card__image {
  filter: grayscale(0.6);
}

.menu-item-card__image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
  overflow: hidden;
}

.menu-item-card__image {
  width: 100%;
  height: 100%;
}

.menu-item-card__overlay,
.menu-item-card__sold-out {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item-card__overlay {
  background: rgba(28, 28, 25, 0.45);
}

.menu-item-card__sold-out {
  background: rgba(28, 28, 25, 0.55);
}

.menu-item-card__sold-out-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fff;
  background: rgba(133, 52, 31, 0.92);
  padding: 6px 14px;
  border-radius: 4px;
}

.menu-item-card__count {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.menu-item-card__body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
