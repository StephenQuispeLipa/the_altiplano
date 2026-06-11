<template>

  <v-card variant="flat" color="surface-container-low" class="rounded-xl order-summary-panel">

    <div class="pa-6 order-summary-panel__content">

      <h3 class="font-headline text-h5 font-weight-bold text-primary mb-6">Tu Pedido</h3>



      <div v-if="items.length === 0" class="text-center py-8 text-on-surface-variant opacity-70">

        No hay items en tu pedido

      </div>



      <div v-else class="order-summary-list order-summary-list--scroll">

        <div

          v-for="item in items"

          :key="item.type === 'dish' ? `dish-${item.dishId}` : item.lineKey"

          class="order-summary-row mb-4"

        >

          <div class="d-flex align-center gap-2 order-summary-row__qty">

            <v-btn

              icon="mdi-minus"

              size="x-small"

              variant="flat"

              color="surface-container-high"

              @click="$emit('decrement', item)"

            />

            <span class="font-weight-bold text-body-1 qty-value">{{ item.quantity }}</span>

            <v-btn

              icon="mdi-plus"

              size="x-small"

              variant="flat"

              color="primary"

              @click="$emit('increment', item)"

            />

          </div>



          <div class="d-flex align-center order-summary-row__name flex-grow-1">

            <v-avatar size="36" rounded="lg" class="flex-shrink-0">

              <v-img :src="item.image || placeholder" cover />

            </v-avatar>

            <div class="ms-4 avatar-text-block">

              <div class="font-weight-bold text-body-2">{{ item.name }}</div>

              <div v-if="item.selectionNames?.length" class="text-caption opacity-70">

                <span v-for="(sel, i) in item.selectionNames" :key="i">

                  {{ sel.slotLabel }}: {{ sel.dishName }}<span v-if="i < item.selectionNames.length - 1"> · </span>

                </span>

              </div>

            </div>

          </div>



          <div class="order-summary-row__price font-weight-bold text-primary text-body-2">

            Bs {{ item.lineTotal }}

          </div>

        </div>

      </div>



      <v-divider v-if="items.length > 0" class="my-6 opacity-10" />



      <div v-if="items.length > 0" class="d-flex justify-space-between align-center mb-6">

        <span class="font-weight-bold text-on-surface-variant">Total</span>

        <span class="font-headline text-h5 font-weight-bold text-primary">Bs {{ total }}</span>

      </div>



      <v-btn

        v-if="items.length > 0"

        color="primary"

        block

        class="rounded-xl font-weight-bold py-5 text-h6"

        append-icon="mdi-chevron-right"

        @click="$emit('submit')"

      >

        Pedir

      </v-btn>

    </div>

  </v-card>

</template>



<script setup>

import silpanchoImg from '../../assets/silpancho.jpg';



defineProps({

  items: { type: Array, default: () => [] },

  total: { type: Number, default: 0 },

});



defineEmits(['increment', 'decrement', 'submit']);



const placeholder = silpanchoImg;

</script>



<style scoped>

.order-summary-panel {

  height: fit-content;

  max-height: calc(100vh - 48px);

}



.order-summary-panel__content {

  display: flex;

  flex-direction: column;

  max-height: calc(100vh - 48px);

}



.order-summary-list--scroll {

  overflow-y: auto;

  min-height: 0;

  flex: 1 1 auto;

  scrollbar-width: thin;

  scrollbar-color: var(--surface-container-high) transparent;

}



.order-summary-list--scroll::-webkit-scrollbar {

  width: 6px;

}



.order-summary-list--scroll::-webkit-scrollbar-thumb {

  background-color: var(--surface-container-high);

  border-radius: 10px;

}



.order-summary-row {

  display: grid;

  grid-template-columns: auto 1fr auto;

  gap: 12px;

  align-items: center;

}



.order-summary-row__qty {

  min-width: 88px;

}



.qty-value {

  min-width: 20px;

  text-align: center;

}



.order-summary-row__price {

  min-width: 64px;

  text-align: right;

}

</style>


