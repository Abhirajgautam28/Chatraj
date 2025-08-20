import { useState, useEffect } from 'react';
import axios from '../config/axios';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Paper,
} from '@mui/material';

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
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                User Leaderboard
            </Typography>
            <List>
                {Array.isArray(users) && users.map((user, index) => (
                    <ListItem key={user._id} secondaryAction={
                        <Typography variant="h6" color="primary">{user.projects ? user.projects.length : 0}</Typography>
                    }>
                        <ListItemAvatar>
                            <Avatar>{index + 1}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                            secondary={user.email}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default UserLeaderboard;
