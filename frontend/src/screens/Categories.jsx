import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { ThemeContext } from '../context/theme.context.jsx';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Button,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Menu,
    Chip,
    Icon,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fab,
} from '@mui/material';
import {
    GridView,
    ViewList,
    ViewCompact,
    ViewModule,
    ViewQuilt,
    SortByAlpha,
    BarChart,
    History,
    Computer,
    DarkMode,
    LightMode,
    ArrowDownward,
    ArrowUpward,
    Logout,
    SmartToy,
} from '@mui/icons-material';

const Categories = () => {
    const navigate = useNavigate();
    const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

    const [search, setSearch] = useState("");
    const [view, setView] = useState("grid");
    const [sort, setSort] = useState('alphabetical');
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('categoriesThemeMode');
        return saved === 'dark' || saved === 'light' ? saved : 'system';
    });
    const [tileSize, setTileSize] = useState('md');
    const [projectCounts, setProjectCounts] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);

    useEffect(() => {
        if (theme === 'system') {
            // Follow context
        } else {
            setIsDarkMode(theme === 'dark');
        }
        localStorage.setItem('categoriesThemeMode', theme);
    }, [theme, setIsDarkMode]);

    useEffect(() => {
        axios.get('/api/projects/category-counts')
            .then(res => setProjectCounts(res.data || {}))
            .catch(() => setProjectCounts({}));
    }, []);

    const handleMenuClick = (event, menu) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(menu);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setOpenMenu(null);
    };

    const handleCategoryClick = (categoryTitle) => {
        navigate(`/dashboard/${categoryTitle}`);
    };

    const categories = [
        { title: 'DSA', description: 'Data Structures & Algorithms', icon: 'ri-bar-chart-fill' },
        { title: 'Frontend Development', description: 'UI coding & client-side logic', icon: 'ri-code-box-line' },
        { title: 'Backend Development', description: 'Server-side logic & integration', icon: 'ri-server-line' },
        { title: 'Fullstack Development', description: 'End-to-end solutions', icon: 'ri-stack-line' },
        { title: 'Code Review & Optimization', description: 'Improve and refactor code', icon: 'ri-git-pull-request-line' },
        { title: 'Testing & QA', description: 'Automated tests & quality checks', icon: 'ri-test-tube-line' },
        { title: 'API Development', description: 'Design and integrate APIs', icon: 'ri-terminal-box-line' },
        { title: 'Database Engineering', description: 'Design and manage databases', icon: 'ri-database-2-line' },
        { title: 'Software Architecture', description: 'Design scalable systems', icon: 'ri-building-3-line' },
        { title: 'Version Control & Git', description: 'Source control best practices', icon: 'ri-git-branch-line' },
        { title: 'Agile Project Management', description: 'Planning & task management', icon: 'ri-calendar-line' },
        { title: 'CI/CD Automation', description: 'Build and deploy pipelines', icon: 'ri-settings-2-line' },
        { title: 'Debugging & Troubleshooting', description: 'Identify and fix issues', icon: 'ri-bug-line' },
        { title: 'Documentation Generation', description: 'Auto-generate docs & comments', icon: 'ri-book-2-line' },
        { title: 'Code Refactoring', description: 'Improve structure without changing behavior', icon: 'ri-scissors-cut-line' }
    ];

    const viewOptions = [
        { key: 'grid', label: 'Grid', icon: <GridView /> },
        { key: 'list', label: 'List', icon: <ViewList /> },
        { key: 'compact', label: 'Compact', icon: <ViewCompact /> },
        { key: 'cards', label: 'Cards', icon: <ViewModule /> },
        { key: 'minimal', label: 'Minimal', icon: <ViewQuilt /> },
        { key: 'detailed', label: 'Detailed', icon: <ViewList /> },
    ];

    const sortOptions = [
        { key: 'alphabetical', label: 'A-Z', icon: <SortByAlpha /> },
        { key: 'reverse', label: 'Z-A', icon: <SortByAlpha /> },
        { key: 'projects', label: 'Most Projects', icon: <BarChart /> },
        { key: 'recent', label: 'Recently Accessed', icon: <History /> },
    ];

    const themeOptions = [
        { key: 'system', label: 'System', icon: <Computer /> },
        { key: 'dark', label: 'Dark', icon: <DarkMode /> },
        { key: 'light', label: 'Light', icon: <LightMode /> },
    ];

    const tileSizeOptions = [
        { key: 'sm', label: 'Small', icon: <ArrowDownward /> },
        { key: 'md', label: 'Medium', icon: <Icon className="ri-arrow-left-right-line" /> },
        { key: 'lg', label: 'Large', icon: <ArrowUpward /> },
    ];

    let filteredCategories = categories
        .filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === 'alphabetical') return a.title.localeCompare(b.title);
            if (sort === 'reverse') return b.title.localeCompare(a.title);
            if (sort === 'projects') return (projectCounts[b.title] || 0) - (projectCounts[a.title] || 0);
            return 0;
        });

    const renderCategories = () => {
        // This is a simplified version. For a full implementation, you would create different render paths for each view.
        return (
            <Grid container spacing={tileSize === 'sm' ? 2 : tileSize === 'lg' ? 4 : 3}>
                <AnimatePresence>
                    {filteredCategories.map((cat, index) => (
                        <Grid item key={index} xs={12} sm={6} md={view === 'grid' ? 4 : 12} lg={view === 'grid' ? 3 : 12}>
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card onClick={() => handleCategoryClick(cat.title)} sx={{ cursor: 'pointer' }}>
                                    <CardContent>
                                        <ListItemIcon><Icon className={cat.icon} /></ListItemIcon>
                                        <Typography variant="h6">{cat.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
                                        {projectCounts[cat.title] > 0 && <Chip label={projectCounts[cat.title]} size="small" color="primary" sx={{ mt: 1 }} />}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{
                minHeight: '100vh',
                background: (theme) => isDarkMode
                    ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.background.default}, ${theme.palette.primary.dark})`
                    : `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.background.default}, ${theme.palette.primary.light})`,
            }}>
                <Container sx={{ py: 4 }}>
                    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Fab color="primary" aria-label="chat" onClick={() => navigate('/welcome-chatraj')}><SmartToy /></Fab>
                        <Fab color="secondary" aria-label="logout" onClick={() => { localStorage.removeItem('token'); navigate('/logout', { replace: true }); }}><Logout /></Fab>
                    </Box>

                    <Typography variant="h3" component="h1" align="center" gutterBottom>
                        Explore Categories
                    </Typography>

                    <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ flexGrow: 1 }}
                        />
                        <Button variant="outlined" onClick={(e) => handleMenuClick(e, 'view')}>View</Button>
                        <Button variant="outlined" onClick={(e) => handleMenuClick(e, 'sort')}>Sort</Button>
                        <Button variant="outlined" onClick={(e) => handleMenuClick(e, 'theme')}>Theme</Button>
                        <Button variant="outlined" onClick={(e) => handleMenuClick(e, 'tileSize')}>Size</Button>
                    </Paper>

                    <Menu anchorEl={anchorEl} open={openMenu === 'view'} onClose={handleMenuClose}>
                        {viewOptions.map(opt => <MenuItem key={opt.key} onClick={() => { setView(opt.key); handleMenuClose(); }}>{opt.icon}{opt.label}</MenuItem>)}
                    </Menu>
                    <Menu anchorEl={anchorEl} open={openMenu === 'sort'} onClose={handleMenuClose}>
                        {sortOptions.map(opt => <MenuItem key={opt.key} onClick={() => { setSort(opt.key); handleMenuClose(); }}>{opt.icon}{opt.label}</MenuItem>)}
                    </Menu>
                    <Menu anchorEl={anchorEl} open={openMenu === 'theme'} onClose={handleMenuClose}>
                        {themeOptions.map(opt => <MenuItem key={opt.key} onClick={() => { setTheme(opt.key); handleMenuClose(); }}>{opt.icon}{opt.label}</MenuItem>)}
                    </Menu>
                    <Menu anchorEl={anchorEl} open={openMenu === 'tileSize'} onClose={handleMenuClose}>
                        {tileSizeOptions.map(opt => <MenuItem key={opt.key} onClick={() => { setTileSize(opt.key); handleMenuClose(); }}>{opt.icon}{opt.label}</MenuItem>)}
                    </Menu>

                    {renderCategories()}
                </Container>
            </Box>
        </motion.div>
    );
};

export default Categories;