export const ORDER_STATUSES = [
  { value: 'En reserva', color: 'tertiary-container', icon: 'mdi-clock-outline' },
  { value: 'En preparación', color: 'warning-container', icon: 'mdi-fire' },
  { value: 'Entregado', color: 'success-container', icon: 'mdi-check-circle' },
  { value: 'Atrasado', color: 'error-container', icon: 'mdi-alert-circle' },
  { value: 'Cancelado', color: 'surface-container-highest', icon: 'mdi-close-circle' },
];

export function getOrderStatusColor(status) {
  return ORDER_STATUSES.find((s) => s.value === status)?.color ?? 'primary-container';
}

export function getOrderStatusIcon(status) {
  return ORDER_STATUSES.find((s) => s.value === status)?.icon ?? 'mdi-circle-medium';
}
