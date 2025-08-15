import { useState, useEffect } from 'react';
import axios from '../config/axios';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Box,
    Divider,
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
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                User Leaderboard
            </Typography>
            <List>
                {Array.isArray(users) && users.map((user, index) => (
                    <div key={user._id}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>{index + 1}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${user.firstName} ${user.lastName}`}
                                secondary={user.email}
                            />
                            <Typography variant="h6" color="primary">
                                {user.projects ? user.projects.length : 0}
                            </Typography>
                        </ListItem>
                        {index < users.length - 1 && <Divider variant="inset" component="li" />}
                    </div>
                ))}
            </List>
        </Paper>
    );
};

export default UserLeaderboard;
