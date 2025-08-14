import { useState, useEffect } from 'react';
import axios from '../config/axios';

const UserLeaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/users/leaderboard')
            .then(res => {
                if (Array.isArray(res.data.users)) {
                    setUsers(res.data.users);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">User Leaderboard</h3>
            <ul className="space-y-4">
                {Array.isArray(users) && users.map((user, index) => (
                    <li key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{index + 1}</span>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{user.projects ? user.projects.length : 0}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserLeaderboard;
