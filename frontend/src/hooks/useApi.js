import { useState, useCallback } from 'react';
import axios from '../config/axios';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const call = useCallback(async (method, url, data = null, config = {}) => {
        setLoading(true);
        const start = performance.now();
        try {
            const response = await axios({ method, url, data, ...config });
            const duration = performance.now() - start;
            if (duration > 1000) console.warn(`[PERF] Slow API Call: ${url} took ${duration.toFixed(0)}ms`);
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { call, loading, error };
};
