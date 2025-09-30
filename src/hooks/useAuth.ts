import Cookies from 'js-cookie';
import type { AuthData } from '@/types/common/useAuth';

export const saveAuthData = (data: AuthData, remember: boolean = false): void => {
    const { token, user, type } = data;
    
    // Save token in cookie
    Cookies.set('token', token, { 
        expires: remember ? 30 : 1,
        secure: true,
        sameSite: 'Strict'
    });
    
    // Save user data
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', type);
    // Trigger storage event
    window.dispatchEvent(new Event('storage'));
};

export const clearAuthData = (): void => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    // Trigger storage event
    window.dispatchEvent(new Event('storage'));
};
