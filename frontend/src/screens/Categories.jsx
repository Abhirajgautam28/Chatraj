import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { ThemeContext } from '../context/theme.context.jsx';
import {
    Box,
    Container,
    Typography,
    TextField,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    IconButton,
    Fab,
    Menu,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Apps,
    List,
    ViewCompact,
    ViewCarousel,
    ViewStream,
    ViewDay,
    SortByAlpha,
    Functions,
    History,
    Brightness4,
    Brightness7,
    Computer,
    ArrowUpward,
    ArrowDownward,
    ArrowBack,
    ArrowForward,
    Chat,
    Logout,
    BarChart,
    Code,
    Storage,
    Layers,
    GitMerge,
    BugReport,
    Api,
    Dns,
    AccountTree,
    SyncAlt,
    Event,
    Build,
    FindInPage,
    Description,
    ContentCut,
} from '@mui/icons-material';

const Categories = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState('alphabetical');
  const [theme, setTheme] = useState('system');
  const [tileSize, setTileSize] = useState('md');
  const [projectCounts, setProjectCounts] = useState({});

  useEffect(() => {
    axios.get('/api/projects/category-counts')
      .then(res => setProjectCounts(res.data || {}))
      .catch(() => setProjectCounts({}));
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    navigate(`/dashboard/${encodeURIComponent(categoryTitle)}`);
  };

  const categories = [
    { title: 'DSA', description: 'Data Structures & Algorithms', icon: <BarChart /> },
    { title: 'Frontend Development', description: 'UI coding & client-side logic', icon: <Code /> },
    { title: 'Backend Development', description: 'Server-side logic & integration', icon: <Storage /> },
    { title: 'Fullstack Development', description: 'End-to-end solutions', icon: <Layers /> },
    { title: 'Code Review & Optimization', description: 'Improve and refactor code', icon: <GitMerge /> },
    { title: 'Testing & QA', description: 'Automated tests & quality checks', icon: <BugReport /> },
    { title: 'API Development', description: 'Design and integrate APIs', icon: <Api /> },
    { title: 'Database Engineering', description: 'Design and manage databases', icon: <Dns /> },
    { title: 'Software Architecture', description: 'Design scalable systems', icon: <AccountTree /> },
    { title: 'Version Control & Git', description: 'Source control best practices', icon: <SyncAlt /> },
    { title: 'Agile Project Management', description: 'Planning & task management', icon: <Event /> },
    { title: 'CI/CD Automation', description: 'Build and deploy pipelines', icon: <Build /> },
    { title: 'Debugging & Troubleshooting', description: 'Identify and fix issues', icon: <FindInPage /> },
    { title: 'Documentation Generation', description: 'Auto-generate docs & comments', icon: <Description /> },
    { title: 'Code Refactoring', description: 'Improve structure without changing behavior', icon: <ContentCut /> }
  ];

  let filteredCategories = categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase()));

  if (sort === 'alphabetical') {
    filteredCategories.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'reverse') {
    filteredCategories.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sort === 'projects') {
    filteredCategories.sort((a, b) => (projectCounts[b.title] ?? 0) - (projectCounts[a.title] ?? 0));
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Explore Categories
                </Typography>
                <Box>
                    <IconButton onClick={() => navigate('/welcome-chatraj')}>
                        <Chat />
                    </IconButton>
                    <IconButton onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/logout', { replace: true });
                    }}>
                        <Logout />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <TextField
                    label="Search categories"
                    variant="outlined"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ width: '300px' }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl>
                        <InputLabel>View</InputLabel>
                        <Select value={view} label="View" onChange={e => setView(e.target.value)}>
                            <MenuItem value="grid"><Apps />Grid</MenuItem>
                            <MenuItem value="list"><List />List</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Sort</InputLabel>
                        <Select value={sort} label="Sort" onChange={e => setSort(e.target.value)}>
                            <MenuItem value="alphabetical"><SortByAlpha />A-Z</MenuItem>
                            <MenuItem value="reverse"><SortByAlpha />Z-A</MenuItem>
                            <MenuItem value="projects"><Functions />Most Projects</MenuItem>
                            <MenuItem value="recent"><History />Recently Accessed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Theme</InputLabel>
                        <Select value={theme} label="Theme" onChange={e => setTheme(e.target.value)}>
                            <MenuItem value="system"><Computer />System</MenuItem>
                            <MenuItem value="dark"><Brightness4 />Dark</MenuItem>
                            <MenuItem value="light"><Brightness7 />Light</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredCategories.map((cat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card>
                            <CardActionArea onClick={() => handleCategoryClick(cat.title)}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        {cat.icon}
                                        <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                                            {cat.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {cat.description}
                                    </Typography>
                                    {projectCounts[cat.title] > 0 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                            {projectCounts[cat.title]} projects
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    </Box>
  );
};

export default Categories;