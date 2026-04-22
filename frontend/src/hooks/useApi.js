import { useState, useCallback } from 'react';
import axiosInstance from '../config/axios';
import { useToast } from '../context/toast.context';

/**
 * Custom hook for standardized API requests with loading/error states and toast notifications.
 *
 * @returns {Object} { request, loading, error }
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    const request = useCallback(async (method, url, data = null, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const config = {
                method,
                url,
                data,
                ...options
            };

            const response = await axiosInstance(config);

            if (options.successMessage) {
                addToast(options.successMessage, 'success');
            }

            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong';
            setError(message);

            if (!options.hideErrorToast) {
                addToast(message, 'error');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    return { request, loading, error };
};

export default useApi;
