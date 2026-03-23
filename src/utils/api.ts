import axios from 'axios';
import { store } from '../app/store';
import { logOut, updateAccessToken } from '../features/auth/slices/authSlice';

const getBaseURL = () => {
    let url = import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:8000/api/v1';
    if (!url.endsWith('/')) {
        url += '/';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to parse JWT without a library
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) {
            if (pad === 1) throw new Error('Invalid base64 string');
            base64 += new Array(5 - pad).join('=');
        }
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
};

const isTokenExpired = (token: string | null) => {
    if (!token) return true;
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;

    // Add a 10-second buffer
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now + 10;
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let refreshErrorSubscribers: ((error: any) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void, errCb: (err: any) => void) => {
    refreshSubscribers.push(cb);
    refreshErrorSubscribers.push(errCb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
    refreshErrorSubscribers = [];
};

const onRefreshError = (error: any) => {
    refreshErrorSubscribers.map((cb) => cb(error));
    refreshSubscribers = [];
    refreshErrorSubscribers = [];
};

// Request interceptor to add the access token and handle proactive refresh
api.interceptors.request.use(
    async (config) => {
        // Skip proactive refresh check for login/refresh/signup routes
        const isAuthRoute = config.url?.includes('auth/login') || config.url?.includes('auth/refresh') || config.url?.includes('auth/register');

        if (isAuthRoute) {
            return config;
        }

        let token = store.getState().auth.accessToken;
        const refreshToken = store.getState().auth.refreshToken;

        // Proactive token refresh
        if (token && isTokenExpired(token) && refreshToken) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    console.log('Token expired, attempting proactive refresh...');
                    const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
                        refresh_token: refreshToken,
                    });
                    const { access_token } = response.data;
                    store.dispatch(updateAccessToken(access_token));
                    isRefreshing = false;
                    onRefreshed(access_token);
                    token = access_token;
                } catch (error) {
                    console.error('Proactive refresh failed:', error);
                    isRefreshing = false;
                    onRefreshError(error);
                    store.dispatch(logOut());
                    // Allow the original request to proceed (it will likely fail with 401 later)
                    // Or we can reject it now
                    return Promise.reject(error);
                }
            } else {
                // Wait for the token to be refreshed
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(
                        (newToken) => {
                            config.headers.Authorization = `Bearer ${newToken}`;
                            resolve(config);
                        },
                        (err) => {
                            reject(err);
                        }
                    );
                });
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor as a fallback for 401s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = store.getState().auth.refreshToken;
            if (!refreshToken) {
                store.dispatch(logOut());
                return Promise.reject(error);
            }

            try {
                console.log('Caught 401, attempting refresh fallback...');
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
                    refresh_token: refreshToken,
                });
                const { access_token } = response.data;
                store.dispatch(updateAccessToken(access_token));
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Fallback refresh failed:', refreshError);
                store.dispatch(logOut());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getMediaURL = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = getBaseURL().replace('/api/v1/', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export default api;
