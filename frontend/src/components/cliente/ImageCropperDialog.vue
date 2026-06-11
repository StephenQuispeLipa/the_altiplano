<template>
  <v-dialog :model-value="modelValue" max-width="480" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
      <div class="bg-primary pa-5">
        <h3 class="font-headline text-h6 text-white font-weight-bold">Recortar fotografía</h3>
        <p class="text-white text-body-2 opacity-80 mt-1">Ajusta el encuadre cuadrado (1:1)</p>
      </div>

      <v-card-text class="pa-4">
        <div
          ref="viewportRef"
          class="cropper-viewport"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <canvas ref="canvasRef" class="cropper-canvas" />
          <div class="cropper-frame" :style="frameStyle" />
        </div>

        <div class="d-flex align-center justify-center gap-4 mt-4">
          <v-btn icon="mdi-minus" size="small" variant="flat" color="surface-container-high" :disabled="zoom <= minZoom" @click="changeZoom(-0.1)" />
          <span class="text-caption font-weight-bold text-on-surface-variant">Zoom</span>
          <v-btn icon="mdi-plus" size="small" variant="flat" color="surface-container-high" :disabled="zoom >= maxZoom" @click="changeZoom(0.1)" />
        </div>

        <p class="text-caption text-center text-on-surface-variant mt-3 opacity-80">
          Arrastra la imagen para moverla en cualquier dirección
        </p>
      </v-card-text>

      <v-divider class="opacity-10" />

      <v-card-actions class="pa-4">
        <v-btn variant="text" class="rounded-xl font-weight-bold" @click="cancel">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" class="rounded-xl font-weight-bold px-6" @click="applyCrop">
          Usar foto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  imageSrc: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const OUTPUT_SIZE = 400;
const VIEWPORT_H = 320;
const maxZoom = 3;
const minZoom = 1;

const viewportRef = ref(null);
const canvasRef = ref(null);
const image = ref(null);
const frameSize = ref(260);
const baseScale = ref(1);
const zoom = ref(1);
const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

const displayScale = computed(() => baseScale.value * zoom.value);

const frameStyle = computed(() => {
  const viewport = viewportRef.value;
  const fw = viewport?.clientWidth ?? 400;
  const left = (fw - frameSize.value) / 2;
  const top = (VIEWPORT_H - frameSize.value) / 2;
  return {
    width: `${frameSize.value}px`,
    height: `${frameSize.value}px`,
    left: `${left}px`,
    top: `${top}px`,
  };
});

watch(() => props.modelValue, async (open) => {
  if (open && props.imageSrc) {
    await nextTick();
    await loadImage(props.imageSrc);
  }
});

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      image.value = img;
      initView(img);
      drawCanvas();
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

function initView(img) {
  const viewport = viewportRef.value;
  if (!viewport) return;

  const vw = viewport.clientWidth;
  frameSize.value = Math.min(vw - 32, VIEWPORT_H - 32, 280);
  baseScale.value = frameSize.value / Math.min(img.naturalWidth, img.naturalHeight);
  zoom.value = 1;
  offset.value = getCenteredOffset(img, 1);
}

function getFrameOrigin() {
  const viewport = viewportRef.value;
  const fw = viewport?.clientWidth ?? 400;
  return {
    x: (fw - frameSize.value) / 2,
    y: (VIEWPORT_H - frameSize.value) / 2,
  };
}

function getCenteredOffset(img, z) {
  const scale = baseScale.value * z;
  const displayW = img.naturalWidth * scale;
  const displayH = img.naturalHeight * scale;
  const frame = getFrameOrigin();

  return clampOffset(
    frame.x + (frameSize.value - displayW) / 2,
    frame.y + (frameSize.value - displayH) / 2,
    img,
    z,
  );
}

function clampOffset(x, y, img, z) {
  const scale = baseScale.value * z;
  const displayW = img.naturalWidth * scale;
  const displayH = img.naturalHeight * scale;
  const frame = getFrameOrigin();

  const minX = frame.x + frameSize.value - displayW;
  const maxX = frame.x;
  const minY = frame.y + frameSize.value - displayH;
  const maxY = frame.y;

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

function drawCanvas() {
  const canvas = canvasRef.value;
  const img = image.value;
  if (!canvas || !img) return;

  const scale = displayScale.value;
  const displayW = img.naturalWidth * scale;
  const displayH = img.naturalHeight * scale;

  canvas.width = displayW;
  canvas.height = displayH;
  canvas.style.width = `${displayW}px`;
  canvas.style.height = `${displayH}px`;
  canvas.style.transform = `translate(${offset.value.x}px, ${offset.value.y}px)`;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayW, displayH);
  ctx.drawImage(img, 0, 0, displayW, displayH);
}

function onPointerDown(e) {
  if (!image.value) return;
  dragging.value = true;
  viewportRef.value?.setPointerCapture(e.pointerId);
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    offsetX: offset.value.x,
    offsetY: offset.value.y,
  };
}

function onPointerMove(e) {
  if (!dragging.value || !image.value) return;

  const dx = e.clientX - dragStart.value.x;
  const dy = e.clientY - dragStart.value.y;

  const next = clampOffset(
    dragStart.value.offsetX + dx,
    dragStart.value.offsetY + dy,
    image.value,
    zoom.value,
  );

  offset.value = next;
  drawCanvas();
}

function onPointerUp(e) {
  if (!dragging.value) return;
  dragging.value = false;
  viewportRef.value?.releasePointerCapture(e.pointerId);
}

function changeZoom(delta) {
  if (!image.value) return;
  const nextZoom = Math.max(minZoom, Math.min(maxZoom, +(zoom.value + delta).toFixed(2)));
  if (nextZoom === zoom.value) return;

  const frame = getFrameOrigin();
  const scale = baseScale.value * zoom.value;
  const cropSizePx = frameSize.value / scale;
  const sx = (frame.x - offset.value.x) / scale;
  const sy = (frame.y - offset.value.y) / scale;

  zoom.value = nextZoom;

  const newScale = displayScale.value;
  offset.value = clampOffset(
    frame.x - sx * newScale,
    frame.y - sy * newScale,
    image.value,
    nextZoom,
  );
  drawCanvas();
}

function applyCrop() {
  const img = image.value;
  if (!img) return;

  const frame = getFrameOrigin();
  const scale = displayScale.value;
  const cropSize = frameSize.value / scale;
  const sx = (frame.x - offset.value.x) / scale;
  const sy = (frame.y - offset.value.y) / scale;

  const output = document.createElement('canvas');
  output.width = OUTPUT_SIZE;
  output.height = OUTPUT_SIZE;
  const ctx = output.getContext('2d');
  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  emit('confirm', output.toDataURL('image/jpeg', 0.85));
  emit('update:modelValue', false);
}

function cancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.cropper-viewport {
  position: relative;
  width: 100%;
  height: 320px;
  background: var(--surface-container-high);
  border-radius: 12px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.cropper-canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  will-change: transform;
}

.cropper-frame {
  position: absolute;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(28, 28, 25, 0.55);
  pointer-events: none;
  z-index: 2;
}
</style>
