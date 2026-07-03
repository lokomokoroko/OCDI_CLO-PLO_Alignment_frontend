import api from './api.js';

export const fetchMDCodes = async () => {
  	try {
		const response = await api.get('/api/md-assignments/');
		return response.data;
  	} catch (error) {
		const errorMessage = error.response?.data?.detail || 'Failed to fetch MD codes';
		console.error("Error fetching MD codes:", errorMessage);
		throw new Error(errorMessage);
  	}
};