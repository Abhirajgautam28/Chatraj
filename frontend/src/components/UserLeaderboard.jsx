import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../config/axios';
import Card from './Card';
import { logger } from '../utils/logger';

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
                logger.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading leaderboard...</div>;
    }

    return (
        <Card className="bg-white dark:bg-card-dark-mode-gradient">
            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="ri-trophy-line text-yellow-500"></i>
                User Leaderboard
            </h3>
            <ul className="space-y-4">
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <li key={user._id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold w-6 ${index < 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {user.projects ? (Array.isArray(user.projects) ? user.projects.length : user.projects) : 0}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-gray-400">Projects</span>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-center py-4 text-gray-500 italic">No users found.</li>
                )}
            </ul>
        </Card>
    );
};

UserLeaderboard.propTypes = {
    // No props passed currently
};

export default UserLeaderboard;
