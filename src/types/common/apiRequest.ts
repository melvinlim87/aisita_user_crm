export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
    time?: string;
}

export interface BaseRequestConfig {
    url: string;
    method?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    params?: any;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
    _retry?: boolean;
}