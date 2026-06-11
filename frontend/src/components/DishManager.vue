<template>
  <v-container class="px-0">
    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="1" class="rounded-lg h-100 mb-4">
          <v-card-title class="bg-surface d-flex justify-space-between align-center py-3">
            <span>Catálogo y Stock de Platillos</span>
          </v-card-title>
          <v-card-text class="pt-0">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">Nombre</th>
                  <th class="text-left font-weight-bold">Tipo</th>
                  <th class="text-right font-weight-bold">Precio (Bs)</th>
                  <th class="text-right font-weight-bold">Stock Diario</th>
                  <th class="text-center font-weight-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dish in dishes" :key="dish.id">
                  <td>{{ dish.name }}</td>
                  <td><v-chip size="small" :color="getTypeColor(dish.type)" variant="flat">{{ dish.type }}</v-chip></td>
                  <td class="text-right font-weight-bold">{{ dish.price }}</td>
                  <td class="text-right">
                    <v-chip :color="dish.stock_daily === 0 ? 'error' : 'success'" size="small">
                      {{ dish.stock_daily }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="editDish(dish)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="1" class="rounded-lg h-100">
          <v-card-title class="bg-surface py-3">
            <span>Gestión de Combos</span>
          </v-card-title>
          <v-card-text>
            <div v-for="combo in combos" :key="combo.id" class="mb-4">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="font-weight-bold">{{ combo.name }}</span>
                <v-chip color="secondary" size="small">{{ combo.basePrice }} Bs</v-chip>
              </div>
              <p class="text-caption text-grey mb-2">Precio Base. Excepciones de menú manejadas automáticamente.</p>
              <v-btn size="small" prepend-icon="mdi-currency-usd" variant="outlined" color="primary" @click="editCombo(combo)">Actualizar Precio</v-btn>
              <v-divider class="mt-4"></v-divider>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Edit Dish -->
    <v-dialog v-model="editDialog.show" max-width="400" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">Editar Platillo</v-card-title>
        <v-card-text class="pt-6">
          <v-text-field v-model.number="editDialog.dish.stock_daily" label="Stock Diario Disponible" type="number" min="0" density="comfortable" variant="outlined"></v-text-field>
          <v-text-field v-model.number="editDialog.dish.price" label="Precio (Bs)" type="number" min="0" density="comfortable" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog.show = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" @click="saveDish">Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Edit Combo -->
    <v-dialog v-model="comboDialog.show" max-width="400" persistent>
      <v-card>
        <v-card-title class="bg-secondary text-white">Editar Combo</v-card-title>
        <v-card-text class="pt-6">
          <div class="mb-4 font-weight-bold">{{ comboDialog.combo?.name }}</div>
          <v-text-field v-model.number="comboDialog.combo.basePrice" label="Precio Base (Bs)" type="number" min="0" density="comfortable" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions class="pb-4 px-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="comboDialog.show = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" @click="saveCombo">Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useDishesStore } from '../stores/useDishesStore';
import { useComboStore } from '../stores/useComboStore';

const dishesStore = useDishesStore();
const comboStore = useComboStore();

const dishes = dishesStore.dishes;
const combos = comboStore.combos;

const editDialog = ref({ show: false, dish: null });
const comboDialog = ref({ show: false, combo: null });
const snackbar = ref({ show: false, text: '', color: 'success' });

function getTypeColor(type) {
  switch(type) {
    case 'Entrada': return 'accent';
    case 'Sopa': return 'warning';
    case 'Segundo': return 'primary';
    case 'Postre': return 'secondary';
    default: return 'grey';
  }
}

function editDish(dish) {
  editDialog.value = {
    show: true,
    dish: { ...dish } // clon
  };
}

function saveDish() {
  const target = dishesStore.dishes.find(d => d.id === editDialog.value.dish.id);
  if (target) {
    target.stock_daily = editDialog.value.dish.stock_daily;
    target.price = editDialog.value.dish.price;
  }
  editDialog.value.show = false;
  snackbar.value = { show: true, text: 'Stock / Precio actualizado correctamente', color: 'success' };
}

function editCombo(combo) {
  comboDialog.value = {
    show: true,
    combo: { ...combo }
  };
}

function saveCombo() {
  comboStore.updateComboPrice(comboDialog.value.combo.id, comboDialog.value.combo.basePrice);
  comboDialog.value.show = false;
  snackbar.value = { show: true, text: 'Combo actualizado correctamente', color: 'success' };
}
</script>
