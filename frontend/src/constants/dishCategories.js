export const DISH_CATEGORIES = [
    { label: 'Entradas', type: 'Entrada' },
    { label: 'Sopas', type: 'Sopa' },
    { label: 'Platos Fuertes', type: 'Segundo' },
    { label: 'Bebidas', type: 'Bebida' },
    { label: 'Postres', type: 'Postre' },
];

export const ALL_MENU_TAB = 'Todo el Menú';
export const COMBOS_TAB = 'Combos';

export function getCategoryLabel(type) {
    return DISH_CATEGORIES.find(c => c.type === type)?.label ?? type;
}

export function getCategoryType(label) {
    if (label === ALL_MENU_TAB || label === COMBOS_TAB) return null;
    return DISH_CATEGORIES.find(c => c.label === label)?.type ?? null;
}
