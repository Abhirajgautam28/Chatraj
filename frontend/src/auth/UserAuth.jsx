import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const UserAuth = ({ children }) => {

    const { user } = useContext(UserContext)
    const [ loading, setLoading ] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!token || !user) {
                    navigate('/login', { replace: true });
                    return;
                }
                setLoading(false);
            } catch (error) {
                console.error('Auth error:', error);
                navigate('/', { replace: true });
            }
        };

        checkAuth();
    }, [user, navigate, token]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            {children}</>
    )
}

export default UserAuth