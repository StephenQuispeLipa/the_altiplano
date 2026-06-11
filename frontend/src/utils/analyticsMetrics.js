import { todayISO } from './menuDate';

const HOUR_SLOTS = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: String(hour),
}));

const WEEKDAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function toDateKey(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function filterOrdersByDays(orders, days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders.filter(o => o.createdAt >= cutoff);
}

export function filterOrdersByDate(orders, dateKey) {
    return orders.filter(o => toDateKey(o.createdAt) === dateKey);
}

export function getPeriodSummary(orders) {
    const count = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const paidOrders = orders.filter(o => o.isPaid);
    const takeawayOrders = orders.filter(o => o.isTakeaway);
    const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const unpaidRevenue = revenue - paidRevenue;

    return {
        orderCount: count,
        revenue,
        avgTicket: count > 0 ? Math.round(revenue / count) : 0,
        paidCount: paidOrders.length,
        unpaidCount: count - paidOrders.length,
        paidRevenue,
        unpaidRevenue,
        paidPercent: count > 0 ? Math.round((paidOrders.length / count) * 100) : 0,
        takeawayCount: takeawayOrders.length,
        dineInCount: count - takeawayOrders.length,
        takeawayPercent: count > 0 ? Math.round((takeawayOrders.length / count) * 100) : 0,
    };
}

export function getDailyBreakdown(orders, days) {
    const map = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = toDateKey(d.getTime());
        map[key] = { date: key, orders: 0, revenue: 0 };
    }

    orders.forEach(o => {
        const key = toDateKey(o.createdAt);
        if (!map[key]) {
            map[key] = { date: key, orders: 0, revenue: 0 };
        }
        map[key].orders += 1;
        map[key].revenue += o.total || 0;
    });

    return Object.values(map).map(row => ({
        ...row,
        avgTicket: row.orders > 0 ? Math.round(row.revenue / row.orders) : 0,
        label: formatShortDate(row.date),
        shortLabel: formatWeekdayLetter(row.date),
    }));
}

function formatShortDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric' });
}

function formatWeekdayLetter(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return WEEKDAY_LETTERS[new Date(y, m - 1, d).getDay()];
}

export function getSalesByCategory(orders) {
    const map = {};
    orders.forEach(order => {
        order.detalle_platos?.forEach(line => {
            const type = line.type || 'Otro';
            if (!map[type]) map[type] = { type, units: 0, revenue: 0 };
            map[type].units += 1;
            map[type].revenue += line.price || 0;
        });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

export function getTopDishes(orders, dishes, limit = 5) {
    const map = {};
    orders.forEach(order => {
        order.detalle_platos?.forEach(line => {
            if (line.type === 'Combo') return;
            if (!map[line.id]) {
                const dish = dishes.find(d => d.id === line.id);
                map[line.id] = {
                    id: line.id,
                    name: line.name,
                    type: line.type || dish?.type || 'Otro',
                    units: 0,
                    revenue: 0,
                    image: dish?.image,
                };
            }
            map[line.id].units += 1;
            map[line.id].revenue += line.price || 0;
        });
    });
    return Object.values(map).sort((a, b) => b.units - a.units).slice(0, limit);
}

export function getTopCombos(orders, combos, limit = 5) {
    const map = {};
    orders.forEach(order => {
        order.detalle_platos?.forEach(line => {
            if (line.type !== 'Combo') return;
            if (!map[line.id]) {
                const combo = combos.find(c => c.id === line.id);
                map[line.id] = {
                    id: line.id,
                    name: line.name,
                    units: 0,
                    revenue: 0,
                    image: combo?.image,
                };
            }
            map[line.id].units += 1;
            map[line.id].revenue += line.price || 0;
        });
    });
    return Object.values(map).sort((a, b) => b.units - a.units).slice(0, limit);
}

export function getPeakHours(orders) {
    const slotMap = Object.fromEntries(
        HOUR_SLOTS.map(s => [s.hour, { label: s.label, hour: s.hour, dining: 0, delivery: 0 }])
    );

    orders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        const slot = slotMap[hour];
        if (!slot) return;
        if (order.isTakeaway) slot.delivery += 1;
        else slot.dining += 1;
    });

    const slots = HOUR_SLOTS.map(s => slotMap[s.hour]);
    const maxCount = Math.max(...slots.map(s => s.dining + s.delivery), 1);

    return slots.map(s => {
        const total = s.dining + s.delivery;
        return {
            ...s,
            total,
            diningPct: Math.round((s.dining / maxCount) * 100),
            deliveryPct: Math.round((s.delivery / maxCount) * 100),
        };
    });
}

export function getOrdersByStatus(orders) {
    const map = {};
    orders.forEach(o => {
        const status = o.status || 'Desconocido';
        map[status] = (map[status] || 0) + 1;
    });
    const total = orders.length || 1;
    return Object.entries(map).map(([status, count]) => ({
        status,
        count,
        percent: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
}

export function getTopClients(orders, clients, limit = 5) {
    const map = {};
    orders.forEach(o => {
        if (!o.clientId) return;
        if (!map[o.clientId]) {
            const client = clients.find(c => c.id === o.clientId);
            map[o.clientId] = {
                id: o.clientId,
                name: client?.name ?? 'Cliente',
                phone: client?.phone ?? '',
                orders: 0,
                revenue: 0,
            };
        }
        map[o.clientId].orders += 1;
        map[o.clientId].revenue += o.total || 0;
    });
    return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, limit);
}

export function getMenuAlerts(menuEntries, lowStockThreshold = 5) {
    const soldOut = menuEntries.filter(e => e.stock === 0);
    const lowStock = menuEntries.filter(e => e.stock > 0 && e.stock <= lowStockThreshold);
    return { soldOut, lowStock };
}

export function getTodayMenuStats(menuEntries) {
    const topSold = [...menuEntries]
        .filter(e => e.soldToday > 0)
        .sort((a, b) => b.soldToday - a.soldToday)
        .slice(0, 5);

    const estimatedRevenue = menuEntries.reduce(
        (sum, e) => sum + e.soldToday * e.price,
        0
    );

    return { topSold, estimatedRevenue, totalSold: menuEntries.reduce((s, e) => s + e.soldToday, 0) };
}

export function getTodayRevenue(orders) {
    const today = todayISO();
    return filterOrdersByDate(orders, today).reduce((sum, o) => sum + (o.total || 0), 0);
}

export function getUnpaidOrders(orders) {
    return orders.filter(o => !o.isPaid);
}

export function getActiveOrders(orders) {
    return orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado');
}

export function buildReportSnapshot({
    periodDays,
    orders,
    dishes,
    combos,
    clients,
    menuEntries,
    satisfactionScore,
}) {
    const periodOrders = filterOrdersByDays(orders, periodDays);
    const today = todayISO();
    const todayOrders = filterOrdersByDate(orders, today);

    return {
        periodDays,
        generatedAt: new Date().toISOString(),
        summary: getPeriodSummary(periodOrders),
        todaySummary: getPeriodSummary(todayOrders),
        dailyBreakdown: getDailyBreakdown(periodOrders, periodDays),
        salesByCategory: getSalesByCategory(periodOrders),
        topDishes: getTopDishes(periodOrders, dishes, 10),
        topCombos: getTopCombos(periodOrders, combos, 5),
        peakHours: getPeakHours(periodOrders),
        ordersByStatus: getOrdersByStatus(periodOrders),
        topClients: getTopClients(periodOrders, clients, 10),
        menuAlerts: getMenuAlerts(menuEntries),
        todayMenuStats: getTodayMenuStats(menuEntries),
        satisfactionScore,
        unpaidOrders: getUnpaidOrders(periodOrders),
        activeOrders: getActiveOrders(orders),
    };
}
