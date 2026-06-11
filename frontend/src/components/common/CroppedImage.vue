<template>
  <div class="cropped-image" :style="wrapStyle">
    <v-img
      :src="src || placeholder"
      :alt="alt"
      cover
      class="cropped-image__img"
      :class="imgClass"
    />
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ratio: { type: String, default: '4/3' },
  placeholder: { type: String, default: '' },
  imgClass: { type: String, default: '' },
});

const wrapStyle = computed(() => ({
  aspectRatio: props.ratio,
}));
</script>

<style scoped>
.cropped-image {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.cropped-image__img {
  width: 100%;
  height: 100%;
}
</style>
