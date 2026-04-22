import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios, { clearCsrfCache } from '../config/axios.js';
import { ThemeContext } from '../context/theme.context.jsx';
import CategoryCard from '../components/CategoryCard';
import { PROJECT_CATEGORIES } from '../config/constants';

const Categories = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [tileSize, setTileSize] = useState('md');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sort, setSort] = useState('alphabetical');
  const [projectCounts, setProjectCounts] = useState({});

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('categoriesThemeMode');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'system';
  });

  const categories = useMemo(() => PROJECT_CATEGORIES.map(title => ({
      title,
      description: `Explore projects in ${title}`,
      icon: 'ri-folders-line'
  })), []);

  useEffect(() => {
    if (theme === 'dark') setIsDarkMode(true);
    else if (theme === 'light') setIsDarkMode(false);
    localStorage.setItem('categoriesThemeMode', theme);
  }, [theme, setIsDarkMode]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <nav className="sticky top-0 z-40 h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <i className="ri-command-line text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden md:block">Categories</h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative hidden sm:block">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            title="Toggle View"
          >
            <i className={view === 'grid' ? 'ri-list-check' : 'ri-grid-fill'}></i>
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Explore Domains</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select a category to view relevant projects</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['alphabetical', 'projects'].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sort === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
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
