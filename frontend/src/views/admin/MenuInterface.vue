<template>
    <v-container fluid class="pa-0 animate-fade-in">
        <v-alert
            v-if="!isEditable"
            type="info"
            variant="tonal"
            density="compact"
            class="rounded-xl mb-6"
            icon="mdi-eye"
        >
            Vista de solo lectura — solo puedes modificar el menú del día actual.
        </v-alert>

        <v-row align="end" class="mb-8">
            <v-col cols="12" lg="8">
                <div class="d-flex flex-wrap align-center gap-2 pb-2">
                    <v-btn
                        v-for="cat in categories"
                        :key="cat"
                        :variant="activeCategory === cat ? 'flat' : 'text'"
                        :color="activeCategory === cat ? 'primary' : 'on-surface-variant'"
                        :class="['rounded-pill font-weight-bold px-6', activeCategory !== cat ? 'bg-surface-container-low' : '']"
                        @click="activeCategory = cat"
                    >
                        {{ cat }}
                    </v-btn>
                </div>
            </v-col>
            <v-col cols="12" lg="4" class="text-lg-right">
                <v-btn
                    v-if="isEditable && !isCombosTab"
                    color="primary"
                    class="rounded-xl font-weight-bold px-6 py-3 h-auto elevation-4"
                    prepend-icon="mdi-plus"
                    @click="openAddToMenu"
                >
                    Agregar al menú
                </v-btn>
                <v-btn
                    v-if="isEditable && isCombosTab"
                    color="primary"
                    class="rounded-xl font-weight-bold px-6 py-3 h-auto elevation-4"
                    prepend-icon="mdi-plus"
                    @click="openCreateCombo"
                >
                    Nuevo combo
                </v-btn>
            </v-col>
        </v-row>

        <div class="section-header mb-8">
            <div class="section-header__primary">
                <h3 class="font-headline text-h4 font-weight-bold text-primary section-header__title">{{ activeCategory }}</h3>
                <v-menu v-model="dateMenuOpen" class="section-header__date" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                        <button
                            type="button"
                            class="date-picker-field"
                            v-bind="menuProps"
                        >
                            <v-icon size="20" color="primary">mdi-calendar-month-outline</v-icon>
                            <span class="date-picker-field__value">{{ formatMenuDateShort(selectedDate) }}</span>
                            <v-icon size="18" class="date-picker-field__chevron">mdi-chevron-down</v-icon>
                        </button>
                    </template>
                    <v-date-picker
                        v-model="selectedDatePicker"
                        @update:model-value="onDatePicked"
                    />
                </v-menu>
            </div>
            <div class="section-header__secondary">
                <v-divider class="opacity-15 section-header__divider"></v-divider>
                <span class="font-label text-caption text-on-surface-variant font-weight-medium tracking-widest uppercase">
                    {{ sectionCountLabel }}
                </span>
            </div>
        </div>

        <!-- Menú del día -->
        <div v-if="!isCombosTab" class="mb-16">
            <v-row>
                <v-col v-for="item in filteredMenu" :key="item.id" cols="12" sm="6" md="4" lg="3">
                    <v-card variant="flat" color="surface-container-low"
                        class="rounded-xl overflow-hidden menu-card h-100 d-flex flex-column">
                        <div class="relative h-48">
                            <v-img :src="item.image || placeholder" cover
                                class="h-100 transition-transform"></v-img>
                            <v-chip v-if="item.type" color="secondary" size="x-small" variant="flat"
                                class="absolute top-4 right-4 font-weight-bold tracking-widest text-uppercase opacity-80">
                                {{ getCategoryLabel(item.type) }}
                            </v-chip>
                        </div>
                        <v-card-text class="pa-6 flex-grow-1 d-flex flex-column">
                            <div class="d-flex justify-space-between align-start mb-2">
                                <h4 class="font-headline text-h6 font-weight-bold line-clamp-1">{{ item.name }}</h4>
                                <span class="font-headline text-subtitle-1 text-primary font-weight-bold">Bs {{ item.price }}</span>
                            </div>
                            <div class="d-flex gap-4 mt-1 mb-4">
                                <div>
                                    <span class="d-block text-[10px] uppercase font-weight-bold opacity-40">Stock actual</span>
                                    <span class="font-weight-bold text-caption">{{ item.stock }} un.</span>
                                </div>
                                <div>
                                    <span class="d-block text-[10px] uppercase font-weight-bold opacity-40">Vendidos hoy</span>
                                    <span class="font-weight-bold text-caption text-on-surface-variant">{{ item.soldToday }}</span>
                                </div>
                            </div>

                            <v-divider class="opacity-10 mb-4 mt-auto"></v-divider>
                            <div class="d-flex justify-space-between align-center">
                                <span
                                    :class="['d-flex align-center gap-2 text-[10px] font-weight-bold', item.stock > 0 ? 'text-secondary' : 'text-stone-400']">
                                    <v-icon size="8"
                                        :color="item.stock > 0 ? 'secondary' : 'stone-300'">mdi-circle</v-icon>
                                    {{ item.stock > 0 ? 'DISPONIBLE' : 'AGOTADO' }}
                                </span>
                                <div v-if="isEditable" class="d-flex gap-2">
                                    <v-btn icon="mdi-pencil" variant="text" size="x-small" color="primary"
                                        @click="openEditEntry(item)"></v-btn>
                                    <v-btn icon="mdi-delete" variant="text" size="x-small" color="error"
                                        @click="confirmRemoveEntry(item)"></v-btn>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <p v-if="filteredMenu.length === 0" class="text-center text-on-surface-variant opacity-70 py-12">
                No hay platillos en el menú para esta categoría.
            </p>
        </div>

        <!-- Combos -->
        <div v-else class="mb-16">
            <v-row>
                <v-col v-for="combo in comboStore.combos" :key="combo.id" cols="12" sm="6" md="4" lg="3">
                    <v-card variant="flat" color="surface-container-low"
                        class="rounded-xl overflow-hidden menu-card h-100 d-flex flex-column">
                        <div class="relative h-48">
                            <v-img :src="combo.image || placeholder" cover class="h-100"></v-img>
                        </div>
                        <v-card-text class="pa-6 flex-grow-1 d-flex flex-column">
                            <div class="d-flex justify-space-between align-start mb-2">
                                <h4 class="font-headline text-h6 font-weight-bold line-clamp-1">{{ combo.name }}</h4>
                                <span class="font-headline text-subtitle-1 text-primary font-weight-bold">Bs {{ combo.basePrice }}</span>
                            </div>
                            <div class="mb-4">
                                <span class="d-block text-[10px] uppercase font-weight-bold opacity-40">Ítems</span>
                                <span class="font-weight-bold text-caption">{{ combo.slots.length }} opciones configurables</span>
                            </div>
                            <ul class="text-caption text-on-surface-variant mb-4 pl-4">
                                <li v-for="slot in combo.slots" :key="slot.id">{{ slot.label }} ({{ slot.allowedDishIds.length }} opciones)</li>
                            </ul>
                            <v-divider class="opacity-10 mb-4 mt-auto"></v-divider>
                            <div class="d-flex justify-space-between align-center">
                                <span class="d-flex align-center gap-2 text-[10px] font-weight-bold text-secondary">
                                    <v-icon size="8" color="secondary">mdi-circle</v-icon>
                                    {{ combo.slots.length }} ÍTEMS
                                </span>
                                <div v-if="isEditable" class="d-flex gap-2">
                                    <v-btn icon="mdi-pencil" variant="text" size="x-small" color="primary"
                                        @click="openEditCombo(combo)"></v-btn>
                                    <v-btn icon="mdi-delete" variant="text" size="x-small" color="error"
                                        @click="confirmDeleteCombo(combo)"></v-btn>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <MenuEntryFormDialog
            v-model="entryDialogOpen"
            :entry="editingEntry"
            :selected-date="selectedDate"
            @save="handleEntrySave"
        />

        <ComboFormDialog
            v-model="comboDialogOpen"
            :combo="editingCombo"
            @save="handleComboSave"
        />

        <v-dialog v-model="removeDialog.show" max-width="400" persistent>
            <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
                <div class="bg-error pa-6 text-center">
                    <h3 class="font-headline text-h6 text-white font-weight-bold">Quitar del menú</h3>
                </div>
                <v-card-text class="pa-6 text-center">
                    ¿Quitar <strong>{{ removeDialog.item?.name }}</strong> del menú de hoy?
                </v-card-text>
                <v-divider class="opacity-10" />
                <v-card-actions class="pa-6">
                    <v-btn variant="text" class="rounded-xl font-weight-bold" @click="removeDialog.show = false">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn color="error" variant="flat" class="rounded-xl font-weight-bold px-6" @click="handleRemoveEntry">
                        Quitar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteComboDialog.show" max-width="400" persistent>
            <v-card class="rounded-xl overflow-hidden" color="surface-container-low">
                <div class="bg-error pa-6 text-center">
                    <h3 class="font-headline text-h6 text-white font-weight-bold">Eliminar combo</h3>
                </div>
                <v-card-text class="pa-6 text-center">
                    ¿Eliminar el combo <strong>{{ deleteComboDialog.combo?.name }}</strong>?
                </v-card-text>
                <v-divider class="opacity-10" />
                <v-card-actions class="pa-6">
                    <v-btn variant="text" class="rounded-xl font-weight-bold" @click="deleteComboDialog.show = false">Cancelar</v-btn>
                    <v-spacer />
                    <v-btn color="error" variant="flat" class="rounded-xl font-weight-bold px-6" @click="handleDeleteCombo">
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
import { ref, computed, watch } from 'vue'
import { useMenuStore } from '../../stores/useMenuStore'
import { useComboStore } from '../../stores/useComboStore'
import {
    ALL_MENU_TAB,
    COMBOS_TAB,
    DISH_CATEGORIES,
    getCategoryLabel,
    getCategoryType,
} from '../../constants/dishCategories'
import { todayISO, isToday } from '../../utils/menuDate'
import MenuEntryFormDialog from '../../components/admin/MenuEntryFormDialog.vue'
import ComboFormDialog from '../../components/admin/ComboFormDialog.vue'
import silpanchoImg from '../../assets/silpancho.jpg'

const menuStore = useMenuStore()
const comboStore = useComboStore()
const placeholder = silpanchoImg

const selectedDate = ref(todayISO())
const selectedDatePicker = ref(new Date())
const dateMenuOpen = ref(false)
const activeCategory = ref(ALL_MENU_TAB)
const categories = [ALL_MENU_TAB, ...DISH_CATEGORIES.map(c => c.label), COMBOS_TAB]

const entryDialogOpen = ref(false)
const editingEntry = ref(null)
const comboDialogOpen = ref(false)
const editingCombo = ref(null)
const removeDialog = ref({ show: false, item: null })
const deleteComboDialog = ref({ show: false, combo: null })
const snackbar = ref({ show: false, text: '', color: 'success' })

const isCombosTab = computed(() => activeCategory.value === COMBOS_TAB)
const isEditable = computed(() => isToday(selectedDate.value))

const menuItems = computed(() => menuStore.getEnrichedMenu(selectedDate.value))

const filteredMenu = computed(() => {
    const type = getCategoryType(activeCategory.value)
    if (!type) return menuItems.value
    return menuItems.value.filter(item => item.type === type)
})

const sectionCountLabel = computed(() => {
    if (isCombosTab.value) return `${comboStore.combos.length} Combos`
    return `${filteredMenu.value.length} Platos`
})

function formatMenuDateShort(date) {
    if (isToday(date)) return 'Hoy'
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function onDatePicked(value) {
    if (!value) return
    const dt = value instanceof Date ? value : new Date(value)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    selectedDate.value = `${y}-${m}-${d}`
    dateMenuOpen.value = false
}

function showSnackbar(text, color = 'success') {
    snackbar.value = { show: true, text, color }
}

function openAddToMenu() {
    editingEntry.value = null
    entryDialogOpen.value = true
}

function openEditEntry(item) {
    editingEntry.value = item
    entryDialogOpen.value = true
}

watch(selectedDate, (date) => {
    menuStore.fetchMenu(date).catch(() => {});
}, { immediate: true });

async function handleEntrySave(payload) {
    if (payload.entryId) {
        const result = await menuStore.updateEntry(selectedDate.value, payload.entryId, {
            price: payload.price,
            stock: payload.stock,
        })
        if (!result.ok) {
            showSnackbar(result.error, 'error')
            return
        }
        showSnackbar('Entrada actualizada.')
    } else {
        const result = await menuStore.addEntry(selectedDate.value, {
            dishId: payload.dishId,
            price: payload.price,
            stock: payload.stock,
        })
        if (!result.ok) {
            showSnackbar(result.error, 'error')
            return
        }
        showSnackbar('Platillo agregado al menú.')
    }
    entryDialogOpen.value = false
}

function confirmRemoveEntry(item) {
    removeDialog.value = { show: true, item }
}

async function handleRemoveEntry() {
    const item = removeDialog.value.item
    if (!item) return
    const result = await menuStore.removeEntry(selectedDate.value, item.id)
    if (!result.ok) {
        showSnackbar(result.error, 'error')
    } else {
        showSnackbar('Platillo quitado del menú.')
    }
    removeDialog.value.show = false
}

function openCreateCombo() {
    editingCombo.value = null
    comboDialogOpen.value = true
}

function openEditCombo(combo) {
    editingCombo.value = combo
    comboDialogOpen.value = true
}

async function handleComboSave(payload) {
    try {
        if (payload.id) {
            await comboStore.updateCombo(payload.id, payload)
            showSnackbar('Combo actualizado.')
        } else {
            await comboStore.addCombo(payload)
            showSnackbar('Combo creado.')
        }
        comboDialogOpen.value = false
    } catch (err) {
        showSnackbar(err.message || 'Error al guardar combo.', 'error')
    }
}

function confirmDeleteCombo(combo) {
    deleteComboDialog.value = { show: true, combo }
}

async function handleDeleteCombo() {
    const combo = deleteComboDialog.value.combo
    if (!combo) return
    try {
        await comboStore.deleteCombo(combo.id)
        deleteComboDialog.value.show = false
        showSnackbar('Combo eliminado.')
    } catch (err) {
        showSnackbar(err.message || 'Error al eliminar combo.', 'error')
    }
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.menu-card {
    transition: all 0.3s ease;
}

.menu-card:hover {
    background-color: var(--surface-container-highest) !important;
    transform: translateY(-4px);
}

.menu-card:hover .v-img {
    transform: scale(1.1);
}

.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.date-picker-field {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border: none;
    border-radius: 12px;
    background-color: rgb(var(--v-theme-surface-container-high));
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.06);
}

.date-picker-field:hover {
    background-color: rgb(var(--v-theme-surface-container-highest));
}

.date-picker-field__value {
    font-family: var(--font-headline);
    font-size: 0.95rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
}

.date-picker-field__chevron {
    color: rgba(var(--v-theme-on-surface-variant), 0.6);
    margin-left: 4px;
}

.section-header__primary {
    display: flex;
    align-items: center;
    gap: 24px;
}

.section-header__secondary {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
}

.section-header__divider {
    flex-grow: 1;
}

@media (min-width: 960px) {
    .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .section-header__primary {
        flex-shrink: 0;
        gap: 16px;
    }

    .section-header__secondary {
        flex-grow: 1;
        margin-top: 0;
    }
}

@media (max-width: 959.98px) {
    .section-header__primary {
        justify-content: space-between;
        gap: 20px;
    }

    .section-header__title {
        flex: 1;
        min-width: 0;
        padding-right: 8px;
    }

    .section-header__date {
        flex-shrink: 0;
    }
}
</style>
