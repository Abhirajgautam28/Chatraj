import React, { useState, useCallback, useMemo } from 'react';
import axios from '../config/axios';
import { useToast } from '../context/toast.context';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { showToast } = useToast();

    const request = useCallback(async (config, options = {}) => {
        const {
            showSuccessToast = false,
            showErrorToast = true,
            successMessage = 'Action completed',
            errorMessage = 'An error occurred'
        } = options;

        setLoading(true);
        setError(null);

        try {
            const response = await axios(config);
            const result = response.data;
            const actualData = result.success ? result.data : result;

            setData(actualData);
            if (showSuccessToast) showToast(result.message || successMessage, 'success');
            return { data: actualData, error: null, fullResponse: result };
        } catch (err) {
            const msg = err.response?.data?.message || err.message || errorMessage;
            setError(msg);
            if (showErrorToast) showToast(msg, 'error');
            return { data: null, error: msg };
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    return { request, loading, error, data, setData };
};
