import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/config';

import { BaseRequestConfig } from '@/types/common/apiRequest';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

apiClient.interceptors.request.use(
    (config: any) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: any) => {
        // Return the response as is, preserving the original format
        return response?.data;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

const handleError = (error: any) => {
    // Log detailed error information
    console.error('API Error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        name: error?.name,
        code: error?.code
    });
    
    // Log full error response for debugging
    if (error?.response?.data) {
        console.error('Full error response data:', error.response.data);
    }

    if (error?.message === 'Network Error') {
        throw new Error('Network error occurred - this might be a CORS issue. Please check that the backend is running and CORS is configured correctly.');
    }

    if (error?.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = '/login';
        return;
    }

    throw error;
};

export const postRequest = async <T>(endpoint: string, data: any, options: Partial<BaseRequestConfig> = {}): Promise<T> => {
    try {
        const response = await apiClient.post<T>(endpoint, data, options);
        return response as T; // The interceptor already returns response.data
    } catch (error) {
        throw handleError(error);
    }
};

export const getRequest = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await apiClient.get<T>(endpoint);
        return response as T; // The interceptor already returns response.data
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteRequest = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await apiClient.delete<T>(endpoint);
        return response as T; // The interceptor already returns response.data
    } catch (error) {
        throw handleError(error);
    }
};

export const putRequest = async <T>(endpoint: string, data: any, options: Partial<BaseRequestConfig> = {}): Promise<T> => {
    try {
        const response = await apiClient.put<T>(endpoint, data, options);
        return response as T; // The interceptor already returns response.data
    } catch (error) {
        console.error('PUT Request Failed:', {
            endpoint,
            requestData: data,
            error
        });
        throw handleError(error);
    }
};

export default apiClient;
