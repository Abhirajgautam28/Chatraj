import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate, useParams } from 'react-router-dom';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { categoryName } = useParams();

  const createProject = (e) => {
    e.preventDefault();
    axios
      .post('/api/projects/create', {
        name: projectName,
        category: categoryName,
      })
      .then((res) => {
        setProjects((prev) => [...prev, res.data.project]);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/logout', { replace: true });
  };

  useEffect(() => {
    axios
      .get('/api/projects/all')
      .then((res) => {
        if (Array.isArray(res.data.projects)) {
          if (categoryName) {
            setProjects(
              res.data.projects.filter((p) => p.category === categoryName)
            );
          } else {
            setProjects(res.data.projects);
          }
        } else {
          setProjects([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setProjects([]);
      });
  }, [categoryName]);

  return (
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {categoryName ? `${categoryName} Projects` : 'Your Projects'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                  }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <AddIcon sx={{ fontSize: 40 }} />
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card>
                    <CardActionArea
                      sx={{p: 2}}
                      onClick={() => {
                        navigate(`/project`, {
                          state: { project },
                        });
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {project.name}
                        </Typography>
                        <Typography color="text.secondary">
                          Collaborators: {project.users.length}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </Container>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="create-project-modal-title"
        closeAfterTransition
      >
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
          <Box sx={style}>
            <Typography id="create-project-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Create New Project
            </Typography>
            <form onSubmit={createProject}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Create
                </Button>
              </Box>
            </form>
          </Box>
        </motion.div>
      </Modal>
    </Box>
  );
};

export default Dashboard;