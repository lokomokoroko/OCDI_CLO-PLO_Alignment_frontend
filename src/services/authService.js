import api from './api';

// LOGIN
export const loginUser = async (email, password) => {
    console.log("🔐 Sending login request..."); // DEBUG

    const response = await api.post(
        '/api/token/',
        {
            email: email, // 👈 IMPORTANT (backend expects username)
            password
        },
        {
            withCredentials: true // 👈 REQUIRED for cookie auth
        }
    );

    console.log("✅ Login response:", response); // DEBUG
    return response;
};

// FORGOT PASSWORD
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/api/password_reset/', { email });
        return response.data;
    } catch (error) {
        console.error('Password Reset Request Error:', error);
        throw error;
    }
};

// RESET PASSWORD
export const confirmPasswordReset = async (uid, token, newPassword) => {
    try {
        const response = await api.post('/api/password_reset_confirm/', {
            uid,
            token,
            new_password: newPassword
        });
        return response.data;
    } catch (error) {
        console.error('Password Reset Confirmation Error:', error);
        throw error;
    }
};

// LOGOUT
export const logoutUser = async () => {
    try {
        await api.post('/api/token/logout/', {}, {
            withCredentials: true,
        });
        localStorage.clear();
        window.location.replace('/');
    } catch (error) {
        console.error('Logout Error:', error);
    }
};

// CHECK AUTH
export const isAuthenticated = async () => {
    try {
        const res = await api.get('/api/account/');
        console.log("🟢 Auth check success:", res.data); // DEBUG
        return true;
    } catch (error) {
        console.log("🔴 Auth check failed"); // DEBUG
        return false;
    }
};

// GET USER INFO
export const getAccountInfo = async () => {
    try {
        const response = await api.get('/api/account/');
        console.log("👤 Account info:", response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('Failed to fetch account info:', error);
        throw error;
    }
};