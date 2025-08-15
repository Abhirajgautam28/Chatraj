import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import axios from '../config/axios';

const UserLeaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/users/leaderboard')
      .then((res) => {
        if (Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
        User Leaderboard
      </Typography>
      <List>
        {Array.isArray(users) &&
          users.map((user, index) => (
            <React.Fragment key={user._id}>
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
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
      </List>
    </Box>
  );
};

export default UserLeaderboard;
