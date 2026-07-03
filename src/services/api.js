import axios from 'axios';

const API_URL = "http://localhost:8000/";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Endpoints that should never trigger an auto-logout redirect
const AUTH_ENDPOINTS = ['/api/token/', '/api/password-reset/', '/api/password-reset-confirm/'];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        // Never auto-redirect for login or password reset pages —
        // let the calling code handle the error itself
        const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => requestUrl.includes(ep));
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        // If the refresh token itself is expired, log out
        if (error.response?.status === 401 && requestUrl.includes('/api/token/refresh/')) {
            handleLogout();
            return Promise.reject(error);
        }

        // Try a silent token refresh once, then retry the original request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post('/api/token/refresh/', {});
                return api(originalRequest);
            } catch (refreshError) {
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        // For any other 401/403 outside of auth checks, log out
        const isAccountCheck = requestUrl.includes('/api/account/');
        if ((error.response?.status === 403 || error.response?.status === 401) && !isAccountCheck) {
            handleLogout();
        }

        return Promise.reject(error);
    }
);

function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
}

export default api;