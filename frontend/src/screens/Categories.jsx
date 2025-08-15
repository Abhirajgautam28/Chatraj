import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Logout as LogoutIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';

const categories = [
    { title: 'DSA', description: 'Data Structures & Algorithms', icon: <i className="ri-bar-chart-fill" /> },
    { title: 'Frontend Development', description: 'UI coding & client-side logic', icon: <i className="ri-code-box-line" /> },
    { title: 'Backend Development', description: 'Server-side logic & integration', icon: <i className="ri-server-line" /> },
    { title: 'Fullstack Development', description: 'End-to-end solutions', icon: <i className="ri-stack-line" /> },
    { title: 'Code Review & Optimization', description: 'Improve and refactor code', icon: <i className="ri-git-pull-request-line" /> },
    { title: 'Testing & QA', description: 'Automated tests & quality checks', icon: <i className="ri-test-tube-line" /> },
    { title: 'API Development', description: 'Design and integrate APIs', icon: <i className="ri-terminal-box-line" /> },
    { title: 'Database Engineering', description: 'Design and manage databases', icon: <i className="ri-database-2-line" /> },
    { title: 'Software Architecture', description: 'Design scalable systems', icon: <i className="ri-building-3-line" /> },
    { title: 'Version Control & Git', description: 'Source control best practices', icon: <i className="ri-git-branch-line" /> },
    { title: 'Agile Project Management', description: 'Planning & task management', icon: <i className="ri-calendar-line" /> },
    { title: 'CI/CD Automation', description: 'Build and deploy pipelines', icon: <i className="ri-settings-2-line" /> },
    { title: 'Debugging & Troubleshooting', description: 'Identify and fix issues', icon: <i className="ri-bug-line" /> },
    { title: 'Documentation Generation', description: 'Auto-generate docs & comments', icon: <i className="ri-book-2-line" /> },
    { title: 'Code Refactoring', description: 'Improve structure without changing behavior', icon: <i className="ri-scissors-cut-line" /> }
  ];


const Categories = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [recent, setRecent] = useState([]);
  const [projectCounts, setProjectCounts] = useState({});

  useEffect(() => {
    axios
      .get('/api/projects/category-counts')
      .then((res) => setProjectCounts(res.data || {}))
      .catch(() => setProjectCounts({}));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('recentCategories');
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    const updatedRecent = [
      categoryTitle,
      ...recent.filter((c) => c !== categoryTitle),
    ].slice(0, 5);
    setRecent(updatedRecent);
    localStorage.setItem('recentCategories', JSON.stringify(updatedRecent));
    navigate(`/dashboard/${categoryTitle}`);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Explore Categories
          </Typography>
          <Box>
            <IconButton onClick={() => navigate('/welcome-chatraj')}>
              <SmartToyIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/logout', { replace: true });
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <TextField
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            aria-label="view toggle"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {recent.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Recently Accessed</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {recent.map((catTitle) => {
                const cat = categories.find((c) => c.title === catTitle);
                if (!cat) return null;
                const count = projectCounts[cat.title] ?? 0;
                return (
                  <Chip
                    key={cat.title}
                    icon={cat.icon}
                    label={cat.title}
                    onClick={() => handleCategoryClick(cat.title)}
                    onDelete={count > 0 ? () => {} : undefined}
                    deleteIcon={count > 0 ? <Badge badgeContent={count} color="primary" /> : undefined}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        <AnimatePresence>
          {view === 'grid' ? (
            <Grid container spacing={3}>
              {filteredCategories.map((cat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={cat.title}>
                  <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <Card sx={{height: '100%'}}>
                      <CardActionArea sx={{p:2, height: '100%'}} onClick={() => handleCategoryClick(cat.title)}>
                        <CardContent sx={{textAlign: 'center'}}>
                            <Badge badgeContent={projectCounts[cat.title] || 0} color="primary">
                                <ListItemIcon sx={{fontSize: 40, justifyContent: 'center'}}>{cat.icon}</ListItemIcon>
                            </Badge>
                          <Typography variant="h6" component="h3" sx={{mt: 2}}>{cat.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List>
              {filteredCategories.map((cat, index) => (
                 <motion.div layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, delay: index * 0.05 }} key={cat.title}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleCategoryClick(cat.title)}>
                            <ListItemIcon>{cat.icon}</ListItemIcon>
                            <ListItemText primary={cat.title} secondary={cat.description} />
                            <Badge badgeContent={projectCounts[cat.title] || 0} color="primary" />
                        </ListItemButton>
                    </ListItem>
                 </motion.div>
              ))}
            </List>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Categories;