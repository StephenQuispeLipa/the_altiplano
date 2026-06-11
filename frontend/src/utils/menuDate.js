export function todayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function isToday(date) {
    if (!date) return false;
    return date === todayISO();
}

export function formatMenuDate(date) {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('es-BO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
