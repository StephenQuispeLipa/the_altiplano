<template>
  <v-container fluid class="pa-0 animate-fade-in">
    <v-row align="center" class="mb-10">
      <v-col cols="12" md="8">
        <h2 class="font-headline text-h4 font-weight-bold text-primary">Catálogo de Platillos</h2>
        <p class="text-on-surface-variant text-body-2 mt-1 opacity-80">
          Administra el catálogo maestro. El precio y stock se configuran al agregar al menú del día.
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right">
        <v-btn
          color="primary"
          class="rounded-xl font-weight-bold px-6 py-3 h-auto elevation-4"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          Añadir platillo
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por nombre"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" md="7">
        <div class="d-flex flex-wrap align-center gap-2">
          <v-btn
            v-for="cat in categoryFilters"
            :key="cat"
            :variant="activeCategory === cat ? 'flat' : 'text'"
            :color="activeCategory === cat ? 'primary' : 'on-surface-variant'"
            :class="['rounded-pill font-weight-bold px-5', activeCategory !== cat ? 'bg-surface-container-low' : '']"
            size="small"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="dish in filteredDishes"
        :key="dish.id"
        cols="6"
        lg="2"
      >
        <v-card
          variant="flat"
          color="surface-container-low"
          class="rounded-xl overflow-hidden platillo-card h-100 d-flex flex-column"
        >
          <CroppedImage :src="dish.image" :placeholder="placeholder">
            <v-chip
              color="secondary"
              size="x-small"
              variant="flat"
              class="platillo-card-chip font-weight-bold text-uppercase"
            >
              {{ getCategoryLabel(dish.type) }}
            </v-chip>
          </CroppedImage>
          <v-card-text class="pa-4 flex-grow-1 d-flex flex-column">
            <h4 class="font-headline text-subtitle-1 font-weight-bold line-clamp-2 mb-2">{{ dish.name }}</h4>
            <div class="mb-4">
              <span class="d-block text-[10px] uppercase font-weight-bold opacity-40">Vendidos (histórico)</span>
              <span class="font-weight-bold text-caption">{{ dish.total_orders_history }}</span>
            </div>
            <div class="d-flex gap-2 mt-auto">
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                class="rounded-lg flex-grow-1 font-weight-bold"
                prepend-icon="mdi-pencil"
                @click="openEdit(dish)"
              >
                Editar
              </v-btn>
              <v-btn
                size="small"
                variant="tonal"
                color="error"
                class="rounded-lg flex-grow-1 font-weight-bold"
                prepend-icon="mdi-delete"
                @click="confirmDelete(dish)"
              >
                Eliminar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <p v-if="filteredDishes.length === 0" class="text-center text-on-surface-variant opacity-70 py-12">
      {{ hasActiveFilters ? 'No hay platillos que coincidan con tu búsqueda.' : 'No hay platillos en el catálogo.' }}
    </p>

    <PlatilloFormDialog
      v-model="formDialogOpen"
      :dish="editingDish"
      @save="handleSave"
    />

    <v-dialog v-model="deleteDialog.show" max-width="400" persistent>
      <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
        <div class="bg-error pa-6 text-center">
          <v-icon size="40" color="white" class="mb-2">mdi-delete-alert</v-icon>
          <h3 class="font-headline text-h6 text-white font-weight-bold">Eliminar platillo</h3>
        </div>
        <v-card-text class="pa-6 text-center text-body-1">
          ¿Eliminar <strong>{{ deleteDialog.dish?.name }}</strong>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-divider class="opacity-10" />
        <v-card-actions class="pa-6">
          <v-btn variant="text" class="rounded-xl font-weight-bold" @click="deleteDialog.show = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn color="error" variant="flat" class="rounded-xl font-weight-bold px-6" @click="handleDelete">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top">
      <span class="font-weight-bold">{{ snackbar.text }}</span>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDishesStore } from '../../stores/useDishesStore';
import { useMenuStore } from '../../stores/useMenuStore';
import { useComboStore } from '../../stores/useComboStore';
import { DISH_CATEGORIES, getCategoryLabel, getCategoryType } from '../../constants/dishCategories';
import { todayISO } from '../../utils/menuDate';
import PlatilloFormDialog from '../../components/admin/PlatilloFormDialog.vue';
import CroppedImage from '../../components/common/CroppedImage.vue';
import silpanchoImg from '../../assets/silpancho.jpg';

const ALL_CATEGORY = 'Todos';
const dishesStore = useDishesStore();
const menuStore = useMenuStore();
const comboStore = useComboStore();
const placeholder = silpanchoImg;

const searchQuery = ref('');
const activeCategory = ref(ALL_CATEGORY);
const categoryFilters = [ALL_CATEGORY, ...DISH_CATEGORIES.map(c => c.label)];

const filteredDishes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const type = activeCategory.value === ALL_CATEGORY ? null : getCategoryType(activeCategory.value);
  return dishesStore.dishes.filter(dish => {
    if (type && dish.type !== type) return false;
    if (query && !dish.name.toLowerCase().includes(query)) return false;
    return true;
  });
});

const hasActiveFilters = computed(() =>
  searchQuery.value.trim().length > 0 || activeCategory.value !== ALL_CATEGORY,
);

const formDialogOpen = ref(false);
const editingDish = ref(null);
const deleteDialog = ref({ show: false, dish: null });
const snackbar = ref({ show: false, text: '', color: 'success' });

function showSnackbar(text, color = 'success') {
  snackbar.value = { show: true, text, color };
}

function openCreate() {
  editingDish.value = null;
  formDialogOpen.value = true;
}

function openEdit(dish) {
  editingDish.value = dish;
  formDialogOpen.value = true;
}

async function handleSave(payload) {
  try {
    if (payload.id) {
      await dishesStore.updateDish(payload.id, {
        name: payload.name,
        type: payload.type,
        image: payload.image,
      });
      showSnackbar('Platillo actualizado.');
    } else {
      await dishesStore.addDish({
        name: payload.name,
        type: payload.type,
        image: payload.image,
      });
      showSnackbar('Platillo creado.');
    }
    formDialogOpen.value = false;
  } catch (err) {
    showSnackbar(err.message || 'Error al guardar.', 'error');
  }
}

function confirmDelete(dish) {
  deleteDialog.value = { show: true, dish };
}

async function handleDelete() {
  const dish = deleteDialog.value.dish;
  if (!dish) return;

  if (menuStore.isDishOnMenu(todayISO(), dish.id)) {
    showSnackbar('No se puede eliminar: está en el menú de hoy.', 'error');
    deleteDialog.value.show = false;
    return;
  }
  if (await comboStore.isDishReferenced(dish.id)) {
    showSnackbar('No se puede eliminar: está referenciado en un combo.', 'error');
    deleteDialog.value.show = false;
    return;
  }
  if ((dish.total_orders_history ?? 0) > 0) {
    showSnackbar('No se puede eliminar: el platillo tiene pedidos registrados.', 'error');
    deleteDialog.value.show = false;
    return;
  }

  try {
    await dishesStore.deleteDish(dish.id);
    showSnackbar('Platillo eliminado.');
  } catch (err) {
    showSnackbar(err.message || 'Error al eliminar.', 'error');
  }
  deleteDialog.value.show = false;
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.platillo-card {
  transition: all 0.3s ease;
}

.platillo-card:hover {
  background-color: var(--surface-container-highest) !important;
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.platillo-card-chip {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
