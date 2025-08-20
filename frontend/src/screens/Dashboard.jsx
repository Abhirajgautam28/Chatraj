import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Modal,
    TextField,
    IconButton
} from '@mui/material';
import { Add, Logout, Group } from '@mui/icons-material';

const Dashboard = () => {
  useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { categoryName: rawCategoryName } = useParams();
  const categoryName = rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined;

  const createProject = (e) => {
    e.preventDefault();
  axios.post('/api/projects/create', {
      name: projectName,
      category: categoryName
    })
      .then((res) => {
        console.log(res);
        setProjects(prev => [...prev, res.data.project]);
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
    axios.get('/api/projects/all')
      .then((res) => {
        if (Array.isArray(res.data.projects)) {
          if (categoryName) {
            setProjects(res.data.projects.filter(p => p.category === categoryName));
          } else {
            setProjects(res.data.projects);
          }
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
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
                {categoryName ? `${categoryName} Projects` : 'Your Projects'}
            </Typography>
            <Button
                variant="contained"
                startIcon={<Logout />}
                onClick={handleLogout}
            >
                Logout
            </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
                <CardActionArea
                    onClick={() => setIsModalOpen(true)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                    <Add sx={{ fontSize: 40 }} />
                    <Typography>New Project</Typography>
                </CardActionArea>
            </Card>
          </Grid>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card>
                    <CardActionArea
                        onClick={() => {
                            navigate(`/project`, {
                            state: { project }
                            });
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" component="h2">{project.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Group />
                                <Typography sx={{ ml: 1 }}>
                                    Collaborators: {project.users.length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="create-project-modal-title"
        aria-describedby="create-project-modal-description"
      >
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        }}>
            <Typography id="create-project-modal-title" variant="h6" component="h2">
                Create New Project
            </Typography>
            <Box component="form" onSubmit={createProject} sx={{ mt: 2 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="projectName"
                    label="Project Name"
                    name="projectName"
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancel</Button>
                    <Button type="submit" variant="contained">Create</Button>
                </Box>
            </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;