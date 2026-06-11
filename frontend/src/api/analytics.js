import { api } from './client';

/** @returns {Promise<import('../types/entities.js').Review[]>} */
export function fetchReviews() {
  return api.get('/analytics/reviews');
}

/** @returns {Promise<{ satisfactionScore: number, microChartData: number[] }>} */
export function fetchSummary() {
  return api.get('/analytics/summary');
}

export function createReview(data) {
  return api.post('/analytics/reviews', data);
}
