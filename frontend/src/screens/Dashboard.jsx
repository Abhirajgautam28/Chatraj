import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Typography, Grid, Card, CardActionArea, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Fab
} from '@mui/material';
import { Add, Logout, People } from '@mui/icons-material';

const Dashboard = () => {
    useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const { categoryName } = useParams();

    const createProject = (e) => {
        e.preventDefault();
        axios.post('/api/projects/create', { name: projectName, category: categoryName })
            .then((res) => {
                setProjects(prev => [...prev, res.data.project]);
                setIsModalOpen(false);
                setProjectName('');
            })
            .catch((error) => console.log(error));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/logout', { replace: true });
    };

    useEffect(() => {
        axios.get('/api/projects/all')
            .then((res) => {
                if (Array.isArray(res.data.projects)) {
                    const filteredProjects = categoryName ? res.data.projects.filter(p => p.category === categoryName) : res.data.projects;
                    setProjects(filteredProjects);
                } else {
                    setProjects([]);
                }
            })
            .catch(err => {
                console.log(err);
                setProjects([]);
            });
    }, [categoryName]);

    return (
        <Box sx={{ minHeight: '100vh', p: 4, background: 'linear-gradient(to right, #1e3a8a, #111827)' }}>
            <Container>
                <Fab color="secondary" onClick={handleLogout} sx={{ position: 'absolute', top: 16, right: 16 }}><Logout /></Fab>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Paper sx={{ p: 4, bgcolor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 4 }}>
                        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: 'white' }}>
                            {categoryName ? `${categoryName} Projects` : 'Your Projects'}
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardActionArea onClick={() => setIsModalOpen(true)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Add sx={{ fontSize: 40 }} />
                                            <Typography>New Project</Typography>
                                        </CardActionArea>
                                    </Card>
                                </motion.div>
                            </Grid>
                            <AnimatePresence>
                                {projects.map((project, idx) => (
                                    <Grid item xs={12} sm={6} md={4} key={project._id}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Card sx={{ height: '100%' }}>
                                                <CardActionArea onClick={() => navigate(`/project`, { state: { project } })} sx={{ height: '100%' }}>
                                                    <CardContent>
                                                        <Typography variant="h6">{project.name}</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                            <People sx={{ mr: 1 }} />
                                                            <Typography variant="body2">{project.users.length} Collaborators</Typography>
                                                        </Box>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    </Paper>
                </motion.div>
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Project Name"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={createProject} variant="contained">Create</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default Dashboard;