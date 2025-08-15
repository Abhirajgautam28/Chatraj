import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import axios from '../config/axios';

const ProjectShowcase = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/projects/showcase')
      .then((res) => {
        if (Array.isArray(res.data.projects)) {
          setProjects(res.data.projects);
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
        Project Showcase
      </Typography>
      <Grid container spacing={2}>
        {Array.isArray(projects) &&
          projects.map((project) => (
            <Grid item xs={12} sm={6} key={project._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h4">
                    {project.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {project.category}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default ProjectShowcase;
