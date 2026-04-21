import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios, { clearCsrfCache } from '../config/axios.js';
import { ThemeContext } from '../context/theme.context.jsx';
import CategoryCard from '../components/CategoryCard';
import CategoriesHeader from '../components/CategoriesHeader';

const Categories = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [tileSize, setTileSize] = useState('md');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sort, setSort] = useState('alphabetical');
  const [projectCounts, setProjectCounts] = useState({});

  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('categoriesThemeMode');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'system';
  });

  const categories = useMemo(() => [
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
  ], []);

  useEffect(() => {
    if (themeMode === 'dark') setIsDarkMode(true);
    else if (themeMode === 'light') setIsDarkMode(false);
    localStorage.setItem('categoriesThemeMode', themeMode);
  }, [themeMode, setIsDarkMode]);

  useEffect(() => {
    axios.get('/api/projects/category-counts')
      .then(res => setProjectCounts(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    clearCsrfCache();
    navigate('/logout', { replace: true });
  }, [navigate]);

  const filteredCategories = useMemo(() => {
    let cats = categories.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'alphabetical') cats.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'reverse') cats.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'projects') cats.sort((a, b) => (projectCounts[b.title] || 0) - (projectCounts[a.title] || 0));

    return cats;
  }, [categories, search, sort, projectCounts]);

  const gridCols = useMemo(() => {
    if (view === 'grid') return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    if (view === 'compact') return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    return 'grid-cols-1';
  }, [view]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (openDropdown && !event.target.closest('.dropdown-container')) {
            setOpenDropdown(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <CategoriesHeader
        search={search}
        setSearch={setSearch}
        view={view}
        setView={setView}
        tileSize={tileSize}
        setTileSize={setTileSize}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        handleLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Explore Domains</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select a category to view relevant projects</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'alphabetical', label: 'A-Z', icon: 'ri-sort-asc' },
              { key: 'projects', label: 'Most Projects', icon: 'ri-bar-chart-grouped-line' }
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${sort === s.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'}`}
              >
                <i className={s.icon}></i>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-6 ${gridCols}`}>
          <AnimatePresence mode='popLayout'>
            {filteredCategories.map((cat, index) => (
              <CategoryCard
                key={cat.title}
                cat={cat}
                index={index}
                view={view}
                tileSize={tileSize}
                count={projectCounts[cat.title] || 0}
                onClick={() => navigate(`/dashboard/${encodeURIComponent(cat.title)}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
};

export default Categories;
