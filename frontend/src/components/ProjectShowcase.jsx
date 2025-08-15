import { useState, useEffect } from 'react';
import axios from '../config/axios';
import {
    Paper,
    Typography,
    Grid,
    CircularProgress,
    Box,
} from '@mui/material';

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/projects/showcase')
            .then(res => {
                if (Array.isArray(res.data.projects)) {
                    setProjects(res.data.projects);
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
                Project Showcase
            </Typography>
            <Grid container spacing={2}>
                {Array.isArray(projects) && projects.map(project => (
                    <Grid item key={project._id} xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="h6" component="h4" gutterBottom>
                                {project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {project.category}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default ProjectShowcase;
