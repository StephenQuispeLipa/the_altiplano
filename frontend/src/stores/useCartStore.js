import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDishesStore } from './useDishesStore';
import { useComboStore } from './useComboStore';
import { useMenuStore } from './useMenuStore';
import { todayISO } from '../utils/menuDate';

function comboLineKey(comboId, selections) {
    const sorted = Object.keys(selections).sort().map(k => `${k}:${selections[k]}`).join('|');
    return `${comboId}__${sorted}`;
}

export const useCartStore = defineStore('cart', () => {
    const lines = ref([]);

    const totalItems = computed(() =>
        lines.value.reduce((sum, line) => sum + line.quantity, 0)
    );

    function getDishQuantity(dishId) {
        return lines.value
            .filter(l => l.type === 'dish' && l.dishId === dishId)
            .reduce((sum, l) => sum + l.quantity, 0);
    }

    function getComboQuantity(comboId) {
        return lines.value
            .filter(l => l.type === 'combo' && l.comboId === comboId)
            .reduce((sum, l) => sum + l.quantity, 0);
    }

    function addDish(dishId) {
        const existing = lines.value.find(l => l.type === 'dish' && l.dishId === dishId);
        if (existing) {
            existing.quantity += 1;
        } else {
            lines.value.push({ type: 'dish', dishId, quantity: 1 });
        }
    }

    function removeDish(dishId) {
        const idx = lines.value.findIndex(l => l.type === 'dish' && l.dishId === dishId);
        if (idx === -1) return;
        if (lines.value[idx].quantity > 1) {
            lines.value[idx].quantity -= 1;
        } else {
            lines.value.splice(idx, 1);
        }
    }

    function addCombo(comboId, selections) {
        const key = comboLineKey(comboId, selections);
        const existing = lines.value.find(l => l.type === 'combo' && l.lineKey === key);
        if (existing) {
            existing.quantity += 1;
        } else {
            lines.value.push({
                type: 'combo',
                comboId,
                selections: { ...selections },
                lineKey: key,
                quantity: 1,
            });
        }
    }

    function removeComboLine(lineKey) {
        const idx = lines.value.findIndex(l => l.type === 'combo' && l.lineKey === lineKey);
        if (idx === -1) return;
        if (lines.value[idx].quantity > 1) {
            lines.value[idx].quantity -= 1;
        } else {
            lines.value.splice(idx, 1);
        }
    }

    function incrementLine(line) {
        if (line.type === 'dish') {
            addDish(line.dishId);
        } else {
            addCombo(line.comboId, line.selections);
        }
    }

    function decrementLine(line) {
        if (line.type === 'dish') {
            removeDish(line.dishId);
        } else {
            removeComboLine(line.lineKey);
        }
    }

    const cartItems = computed(() => {
        const dishesStore = useDishesStore();
        const comboStore = useComboStore();
        const menuStore = useMenuStore();
        const today = todayISO();

        return lines.value.map(line => {
            if (line.type === 'dish') {
                const menuItem = menuStore.getMenuItem(today, line.dishId);
                const dish = dishesStore.getById(line.dishId);
                if (!menuItem || !dish) return null;
                return {
                    ...line,
                    name: dish.name,
                    image: dish.image,
                    unitPrice: menuItem.price,
                    lineTotal: menuItem.price * line.quantity,
                };
            }

            const combo = comboStore.getComboById(line.comboId);
            if (!combo) return null;

            const selectionNames = combo.slots.map(slot => {
                const dishId = line.selections[slot.id];
                if (dishId) {
                    const dish = dishesStore.getById(dishId);
                    return { slotLabel: slot.label, dishName: dish?.name ?? 'Desconocido', dishId };
                }
                return { slotLabel: slot.label, dishName: null, dishId: null, pending: true };
            });

            return {
                ...line,
                name: combo.name,
                image: combo.image,
                unitPrice: combo.basePrice,
                lineTotal: combo.basePrice * line.quantity,
                selectionNames,
            };
        }).filter(Boolean);
    });

    const totalPrice = computed(() =>
        cartItems.value.reduce((sum, item) => sum + item.lineTotal, 0)
    );

    function clearCart() {
        lines.value = [];
    }

    function toOrderPayload() {
        const dishesStore = useDishesStore();
        const comboStore = useComboStore();
        const menuStore = useMenuStore();
        const today = todayISO();
        const detalle = [];

        for (const line of lines.value) {
            if (line.type === 'dish') {
                const menuItem = menuStore.getMenuItem(today, line.dishId);
                const dish = dishesStore.getById(line.dishId);
                if (menuItem && dish) {
                    for (let i = 0; i < line.quantity; i++) {
                        detalle.push({
                            id: dish.id,
                            name: dish.name,
                            price: menuItem.price,
                            type: dish.type,
                        });
                    }
                }
            } else {
                const combo = comboStore.getComboById(line.comboId);
                for (let i = 0; i < line.quantity; i++) {
                    detalle.push({
                        id: line.comboId,
                        name: combo?.name ?? 'Combo',
                        price: combo?.basePrice ?? 0,
                        type: 'Combo',
                    });
                    Object.values(line.selections).forEach(dishId => {
                        const dish = dishesStore.getById(dishId);
                        if (dish) {
                            detalle.push({ id: dish.id, name: dish.name, price: 0, type: dish.type });
                        }
                    });
                }
            }
        }

        return { detalle_platos: detalle, total: totalPrice.value };
    }

    function getStockToDecrease() {
        const counts = {};
        for (const line of lines.value) {
            if (line.type === 'dish') {
                counts[line.dishId] = (counts[line.dishId] || 0) + line.quantity;
            } else {
                Object.values(line.selections).forEach(dishId => {
                    counts[dishId] = (counts[dishId] || 0) + line.quantity;
                });
            }
        }
        return counts;
    }

    return {
        lines,
        totalItems,
        totalPrice,
        cartItems,
        getDishQuantity,
        getComboQuantity,
        addDish,
        removeDish,
        addCombo,
        removeComboLine,
        incrementLine,
        decrementLine,
        clearCart,
        toOrderPayload,
        getStockToDecrease,
        comboLineKey,
    };
});
