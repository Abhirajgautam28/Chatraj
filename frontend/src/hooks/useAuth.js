import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { useApi } from './useApi';
import { clearCsrfCache } from '../config/axios';

/**
 * Hook to handle authentication logic.
 */
export const useAuth = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const { request, loading } = useApi();

    const login = useCallback(async (email, password, recaptchaToken = null) => {
        const { data, error } = await request({
            url: '/api/users/login',
            method: 'POST',
            data: { email, password, recaptchaToken }
        });

        if (data && data.token) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true };
        }
        return { success: false, error };
    }, [request, setUser]);

    const register = useCallback(async (userData) => {
        const { data, error } = await request({
            url: '/api/users/register',
            method: 'POST',
            data: userData
        });

        return { data, error };
    }, [request]);

    const verifyOtp = useCallback(async (otpData) => {
        const { data, error } = await request({
            url: '/api/users/verify-otp',
            method: 'POST',
            data: otpData
        });

        if (data && data.token) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true, data };
        }
        return { success: false, error };
    }, [request, setUser]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        clearCsrfCache();
        navigate('/login', { replace: true });
    }, [setUser, navigate]);

    return { login, register, verifyOtp, logout, loading };
};
