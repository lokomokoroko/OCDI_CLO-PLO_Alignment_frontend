import api from './api.js';

export const fetchProgress = async () => {
    const response = await api.get('/api/progress/');
    return response.data;
};

export const fetchReports = async (page = 1, ordering = '-datetime_reported') => {
    try {
        const response = await api.get(`/api/reports/?page=${page}&ordering=${ordering}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
};

export const createReport = async (reportData) => {
    try {
        const response = await api.post('/api/reports/', reportData);
        return response.data;
    } catch (error) {
        console.error('Error creating report:', error.response?.data);
        throw { response: error.response?.data, status: error.response?.status };
    }
};

export const updateReport = async (id, reportData) => {
    try {
        const response = await api.put(`/api/reports/${id}/`, reportData);
        return response.data;
    } catch (error) {
        console.error('Error updating report:', error.response?.data);
        throw { response: error.response?.data, status: error.response?.status };
    }
};

export const deleteReport = async (id) => {
    try {
        await api.delete(`/api/reports/${id}/`);
        return true;
    } catch (error) {
        console.error('Error deleting report:', error.response?.data);
        throw error;
    }
};