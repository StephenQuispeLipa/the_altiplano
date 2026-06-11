import { api } from './client';

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export function fetchAccessLogs(filters = {}) {
  return api.get(`/access-logs${buildQuery(filters)}`);
}
