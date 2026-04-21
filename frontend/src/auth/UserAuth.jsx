import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import PropTypes from 'prop-types';
import LoadingScreen from '../components/LoadingScreen';

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
        if (user) {
            setLoading(false);
        }
    }, [user, token, navigate]);

    if (loading) {
        // While loading, we can show a spinner or a blank screen.
        // This prevents the child components from rendering prematurely.
        return <LoadingScreen />;
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