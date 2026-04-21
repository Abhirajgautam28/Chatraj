import { useState, useCallback } from 'react';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';
import { logger } from '../utils/logger';

/**
 * A custom hook for standardized API calls.
 * Provides loading, error, and data states, along with a 'request' function.
 */
export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { showToast } = useToast();

    const request = useCallback(async (config, options = {}) => {
        const {
            showErrorToast = true,
            showSuccessToast = false,
            successMessage = 'Action completed successfully',
            errorMessage = 'An error occurred'
        } = options;

        setLoading(true);
        setError(null);

        try {
            const response = await axios(config);
            setData(response.data);

            if (showSuccessToast) {
                showToast(response.data.message || successMessage, 'success');
            }

            return { data: response.data, error: null };
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || errorMessage;
            setError(msg);
            logger.error(`API Error [${config.method || 'GET'} ${config.url}]:`, msg);

            if (showErrorToast) {
                showToast(msg, 'error');
            }

            return { data: null, error: msg };
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    return { request, loading, error, data, setData };
};
