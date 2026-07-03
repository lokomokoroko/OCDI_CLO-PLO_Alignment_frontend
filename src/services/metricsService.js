import api from './api.js';

export async function fetchMetrics(page, params = {}) {
    const query = new URLSearchParams({ page, ...params }).toString();
    const response = await api.get(`/api/metrics/?${query}`);
    return response.data;
}

export async function fetchTerritoryFilterOptions() {
    const response = await api.get('/api/territoryfilteroptions/');
    return response.data;
}