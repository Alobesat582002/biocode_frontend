
import axios from 'axios';


let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };


const AUTH_WHITELIST = [
    '/api/users/login/',
    '/api/users/register/',
    '/api/users/token/refresh/',
    '/api/users/password-reset/request/',
    '/api/users/password-reset/confirm/',
];

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const isWhitelisted = AUTH_WHITELIST.some((path) =>
        config.url?.includes(path)
    );

    if (!isWhitelisted && accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        error ? prom.reject(error) : prom.resolve(token);
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        const isWhitelisted = AUTH_WHITELIST.some((path) =>
            originalRequest.url?.includes(path)
        );

        if (error.response?.status !== 401 || isWhitelisted || originalRequest._retry) {
            return Promise.reject(error);
        }


        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return axiosInstance(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            const { data } = await axiosInstance.post('/api/users/token/refresh/', {
                refresh: refreshToken
            });

            setAccessToken(data.access);
            processQueue(null, data.access);

            originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            clearAccessToken();
            localStorage.removeItem('refresh_token');

            window.dispatchEvent(new CustomEvent('auth:logout'));

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;