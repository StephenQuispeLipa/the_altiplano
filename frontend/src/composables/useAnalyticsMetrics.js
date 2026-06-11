import { ref, computed } from 'vue';
import { useOrdersStore } from '../stores/useOrdersStore';
import { useMenuStore } from '../stores/useMenuStore';
import { useDishesStore } from '../stores/useDishesStore';
import { useComboStore } from '../stores/useComboStore';
import { useClientsStore } from '../stores/useClientsStore';
import { useAnalyticsStore } from '../stores/useAnalyticsStore';
import { todayISO } from '../utils/menuDate';
import {
    filterOrdersByDays,
    filterOrdersByDate,
    getPeriodSummary,
    getDailyBreakdown,
    getSalesByCategory,
    getTopDishes,
    getTopCombos,
    getPeakHours,
    getOrdersByStatus,
    getTopClients,
    getMenuAlerts,
    getTodayMenuStats,
    getTodayRevenue,
    getUnpaidOrders,
    getActiveOrders,
    buildReportSnapshot,
} from '../utils/analyticsMetrics';

export function useAnalyticsMetrics(initialDays = 30) {
    const periodDays = ref(initialDays);

    const ordersStore = useOrdersStore();
    const menuStore = useMenuStore();
    const dishesStore = useDishesStore();
    const comboStore = useComboStore();
    const clientsStore = useClientsStore();
    const analyticsStore = useAnalyticsStore();

    const periodOrders = computed(() =>
        filterOrdersByDays(ordersStore.orders, periodDays.value)
    );

    const todayOrders = computed(() =>
        filterOrdersByDate(ordersStore.orders, todayISO())
    );

    const todayMenu = computed(() =>
        menuStore.getEnrichedMenu(todayISO())
    );

    const summary = computed(() => getPeriodSummary(periodOrders.value));
    const todaySummary = computed(() => getPeriodSummary(todayOrders.value));
    const dailyBreakdown = computed(() => getDailyBreakdown(periodOrders.value, periodDays.value));
    const salesByCategory = computed(() => getSalesByCategory(periodOrders.value));
    const topDishes = computed(() => getTopDishes(periodOrders.value, dishesStore.dishes, 5));
    const topCombos = computed(() => getTopCombos(periodOrders.value, comboStore.combos, 3));
    const peakHours = computed(() => getPeakHours(periodOrders.value));
    const ordersByStatus = computed(() => getOrdersByStatus(periodOrders.value));
    const topClients = computed(() => getTopClients(periodOrders.value, clientsStore.clients, 5));
    const menuAlerts = computed(() => getMenuAlerts(todayMenu.value));
    const todayMenuStats = computed(() => getTodayMenuStats(todayMenu.value));
    const todayRevenue = computed(() => getTodayRevenue(ordersStore.orders));
    const unpaidPeriodOrders = computed(() => getUnpaidOrders(periodOrders.value));
    const activeOrders = computed(() => getActiveOrders(ordersStore.orders));

    const starDish = computed(() => topDishes.value[0] ?? null);

    const dailyBreakdownChart = computed(() => {
        const days = dailyBreakdown.value;
        const maxRevenue = Math.max(...days.map(d => d.revenue), 0);
        const maxOrders = Math.max(...days.map(d => d.orders), 0);
        const useRevenue = maxRevenue > 0;

        return days.map(d => {
            let percent = 0;
            if (useRevenue) {
                percent = Math.round((d.revenue / maxRevenue) * 100);
                if (d.revenue > 0 && percent < 12) percent = 12;
            } else if (maxOrders > 0) {
                percent = Math.round((d.orders / maxOrders) * 100);
                if (d.orders > 0 && percent < 12) percent = 12;
            }

            const isPeak = useRevenue
                ? d.revenue === maxRevenue && maxRevenue > 0
                : d.orders === maxOrders && maxOrders > 0;

            return { ...d, percent, isPeak };
        });
    });

    const reportSnapshot = computed(() =>
        buildReportSnapshot({
            periodDays: periodDays.value,
            orders: ordersStore.orders,
            dishes: dishesStore.dishes,
            combos: comboStore.combos,
            clients: clientsStore.clients,
            menuEntries: todayMenu.value,
            satisfactionScore: analyticsStore.satisfactionScore,
        })
    );

    return {
        periodDays,
        summary,
        todaySummary,
        dailyBreakdown,
        dailyBreakdownChart,
        salesByCategory,
        topDishes,
        topCombos,
        peakHours,
        ordersByStatus,
        topClients,
        menuAlerts,
        todayMenuStats,
        todayRevenue,
        unpaidPeriodOrders,
        activeOrders,
        starDish,
        reportSnapshot,
        satisfactionScore: computed(() => analyticsStore.satisfactionScore),
        microChartData: computed(() => analyticsStore.microChartData),
    };
}
