import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import PropTypes from 'prop-types';

const UserAuth = ({ children }) => {

    const { user } = useContext(UserContext)
    const [ loading, setLoading ] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        // If there's no token in localStorage, the user is definitely not logged in.
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        // If there is a token, but the user object isn't populated in the context yet,
        // we wait. The UserContext is responsible for verifying the token and fetching the user.
        // If the token is invalid, the context will clear it, and this component will re-run,
        // catching the !token case above.
        if (user) {
            setLoading(false);
        }

        // We don't navigate away if there's a token but no user yet.
        // We just stay in the loading state.
    }, [user, token, navigate]);

    if (loading) {
        // While loading, we can show a spinner or a blank screen.
        // This prevents the child components from rendering prematurely.
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <>
            {children}</>
    )
}

UserAuth.propTypes = {
    children: PropTypes.node.isRequired,
};

export default UserAuth