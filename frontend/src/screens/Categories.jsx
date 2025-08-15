import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { ThemeContext } from '../context/theme.context.jsx';

const Categories = () => {
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  // State for search/filter and view toggle
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid, list, compact, cards, minimal, detailed
  const viewOptions = [
    { key: 'grid', label: 'Grid', icon: 'ri-grid-fill' },
    { key: 'list', label: 'List', icon: 'ri-list-check-2' },
    { key: 'compact', label: 'Compact', icon: 'ri-layout-column-line' },
    { key: 'cards', label: 'Cards', icon: 'ri-layout-4-line' },
    { key: 'minimal', label: 'Minimal', icon: 'ri-layout-line' },
    { key: 'detailed', label: 'Detailed', icon: 'ri-layout-masonry-line' },
  ];
  const [showViewMenu, setShowViewMenu] = useState(false);
  // Sort dropdown
  const [sort, setSort] = useState('alphabetical');
  const sortOptions = [
    { key: 'alphabetical', label: 'A-Z', icon: 'ri-sort-asc' },
    { key: 'reverse', label: 'Z-A', icon: 'ri-sort-desc' },
    { key: 'projects', label: 'Most Projects', icon: 'ri-bar-chart-grouped-line' },
    { key: 'recent', label: 'Recently Accessed', icon: 'ri-time-line' },
  ];
  const [showSortMenu, setShowSortMenu] = useState(false);
  // Theme dropdown
  // Theme dropdown: sync with ThemeContext only
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('themeMode')) return localStorage.getItem('themeMode');
    return isDarkMode ? 'dark' : 'light';
  });
  const themeOptions = [
    { key: 'system', label: 'System', icon: 'ri-computer-line' },
    { key: 'dark', label: 'Dark', icon: 'ri-moon-line' },
    { key: 'light', label: 'Light', icon: 'ri-sun-line' },
  ];
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  // Tile size dropdown
  const [tileSize, setTileSize] = useState('md');
  const tileSizeOptions = [
    { key: 'sm', label: 'Small', icon: 'ri-arrow-down-s-line' },
    { key: 'md', label: 'Medium', icon: 'ri-arrow-left-right-line' },
    { key: 'lg', label: 'Large', icon: 'ri-arrow-up-s-line' },
  ];
  const [showTileSizeMenu, setShowTileSizeMenu] = useState(false);
  const [recent, setRecent] = useState([]);

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


  const [projectCounts, setProjectCounts] = useState({});


  // Sync theme dropdown with context and system
  useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true);
      localStorage.setItem('themeMode', 'dark');
    } else if (theme === 'light') {
      setIsDarkMode(false);
      localStorage.setItem('themeMode', 'light');
    }
    // If you want to support system mode, add logic here, but for now only dark/light
  }, [theme, setIsDarkMode]);

  useEffect(() => {
    axios.get('/api/projects/category-counts')
      .then(res => setProjectCounts(res.data || {}))
      .catch(() => setProjectCounts({}));
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    // Save to recent (max 5)
    setRecent((prev) => {
      const updated = [categoryTitle, ...prev.filter((c) => c !== categoryTitle)];
      localStorage.setItem('recentCategories', JSON.stringify(updated.slice(0, 5)));
      return updated.slice(0, 5);
    });
    navigate(`/dashboard/${categoryTitle}`);
  };

  // Load recent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentCategories');
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-blue-800 to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <main className="relative z-10 flex flex-col items-center min-h-screen">
        {/* Floating action buttons for ChatRaj and Logout */}
        <div className="fixed z-50 flex flex-col items-end gap-4 top-6 right-6">
          {/* ChatRaj Button */}
          <motion.button
            onClick={() => navigate('/welcome-chatraj')}
            className="relative flex items-center justify-center w-12 h-12 text-2xl text-white bg-blue-600 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl focus:outline-none transition-all"
            whileHover={{ scale: 1.12, rotate: -8 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Welcome ChatRaj"
          >
            <i className="ri-robot-2-line"></i>
            <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition pointer-events-none select-none shadow-lg">Welcome ChatRaj</span>
          </motion.button>
          {/* Logout Button */}
          <motion.button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/logout', { replace: true });
            }}
            className="relative flex items-center justify-center w-12 h-12 text-2xl text-white bg-blue-600 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl focus:outline-none transition-all"
            whileHover={{ scale: 1.12, rotate: 8 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Logout"
          >
            <i className="ri-logout-box-r-line"></i>
            <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 px-2 py-1 text-xs rounded bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition pointer-events-none select-none shadow-lg">Logout</span>
          </motion.button>
        </div>

        <div className="w-full max-w-7xl p-6">
          <motion.h1
            className="mb-8 text-4xl font-bold text-center text-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Explore Categories
          </motion.h1>

          {/* ...removed duplicate search bar and button design switch... */}
          {/* Search and dropdowns row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full md:w-80 px-4 py-2 rounded-lg border border-blue-200 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {/* View Dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium bg-gray-800 text-blue-200 flex items-center gap-2 transition select-none`}
                  onClick={() => setShowViewMenu(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showViewMenu}
                >
                  <i className={`${viewOptions.find(opt => opt.key === view)?.icon || ''} mr-1`}></i>
                  {viewOptions.find(opt => opt.key === view)?.label || 'View'}
                  <i className={`ri-arrow-down-s-line ml-1`}></i>
                </button>
                {showViewMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-blue-700 rounded-lg shadow-lg z-50">
                    {viewOptions.map(opt => (
                      <button
                        key={opt.key}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded-lg transition-colors ${view === opt.key ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-gray-800'} select-none`}
                        onClick={() => { setView(opt.key); setShowViewMenu(false); }}
                        aria-selected={view === opt.key}
                      >
                        <i className={`${opt.icon}`}></i> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium bg-gray-800 text-blue-200 flex items-center gap-2 transition select-none`}
                  onClick={() => setShowSortMenu(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showSortMenu}
                >
                  <i className={`${sortOptions.find(opt => opt.key === sort)?.icon || ''} mr-1`}></i>
                  {sortOptions.find(opt => opt.key === sort)?.label || 'Sort'}
                  <i className={`ri-arrow-down-s-line ml-1`}></i>
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-blue-700 rounded-lg shadow-lg z-50">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.key}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded-lg transition-colors ${sort === opt.key ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-gray-800'} select-none`}
                        onClick={() => { setSort(opt.key); setShowSortMenu(false); }}
                        aria-selected={sort === opt.key}
                      >
                        <i className={`${opt.icon}`}></i> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Theme Dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium bg-gray-800 text-blue-200 flex items-center gap-2 transition select-none`}
                  onClick={() => setShowThemeMenu(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showThemeMenu}
                >
                  <i className={`${themeOptions.find(opt => opt.key === theme)?.icon || ''} mr-1`}></i>
                  {themeOptions.find(opt => opt.key === theme)?.label || 'Theme'}
                  <i className={`ri-arrow-down-s-line ml-1`}></i>
                </button>
                {showThemeMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-blue-700 rounded-lg shadow-lg z-50">
                    {themeOptions.map(opt => (
                      <button
                        key={opt.key}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded-lg transition-colors ${theme === opt.key ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-gray-800'} select-none`}
                        onClick={() => {
                          setTheme(opt.key);
                          setShowThemeMenu(false);
                        }}
                        aria-selected={theme === opt.key}
                      >
                        <i className={`${opt.icon}`}></i> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Tile Size Dropdown */}
              <div className="relative">
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium bg-gray-800 text-blue-200 flex items-center gap-2 transition select-none`}
                  onClick={() => setShowTileSizeMenu(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showTileSizeMenu}
                >
                  <i className={`${tileSizeOptions.find(opt => opt.key === tileSize)?.icon || ''} mr-1`}></i>
                  {tileSizeOptions.find(opt => opt.key === tileSize)?.label || 'Tile Size'}
                  <i className={`ri-arrow-down-s-line ml-1`}></i>
                </button>
                {showTileSizeMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-blue-700 rounded-lg shadow-lg z-50">
                    {tileSizeOptions.map(opt => (
                      <button
                        key={opt.key}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm rounded-lg transition-colors ${tileSize === opt.key ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-gray-800'} select-none`}
                        onClick={() => { setTileSize(opt.key); setShowTileSizeMenu(false); }}
                        aria-selected={tileSize === opt.key}
                      >
                        <i className={`${opt.icon}`}></i> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Recently Accessed removed as per request */}
          {/* Category grid/list */}
          {/* Sorting logic for categories */}
          {(() => {
            let cats = categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase()));
            if (sort === 'alphabetical') {
              cats = [...cats].sort((a, b) => a.title.localeCompare(b.title));
            } else if (sort === 'reverse') {
              cats = [...cats].sort((a, b) => b.title.localeCompare(a.title));
            } else if (sort === 'projects') {
              cats = [...cats].sort((a, b) => (projectCounts[b.title] ?? 0) - (projectCounts[a.title] ?? 0));
            } else if (sort === 'recent') {
              cats = [...cats].sort((a, b) => {
                const aIdx = recent.indexOf(a.title);
                const bIdx = recent.indexOf(b.title);
                if (aIdx === -1 && bIdx === -1) return 0;
                if (aIdx === -1) return 1;
                if (bIdx === -1) return -1;
                return aIdx - bIdx;
              });
            }
            return (
              view === 'grid' ? (
                <motion.div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 ${tileSize === 'sm' ? 'gap-3' : tileSize === 'lg' ? 'gap-8' : ''}`}>
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.div
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`relative p-4 transition-all duration-300 transform bg-gray-800 border border-gray-700 rounded-xl shadow-md cursor-pointer group ${tileSize === 'sm' ? 'min-h-[100px]' : tileSize === 'lg' ? 'min-h-[220px]' : 'min-h-[160px]'}`}
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 30, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: index * 0.06 }}
                          whileHover={{
                            scale: 1.06,
                            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)',
                            backgroundColor: '#172554',
                            borderColor: '#2563eb',
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {count > 0 && (
                            <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                              {count}
                            </span>
                          )}
                          <motion.div
                            className={`flex items-center justify-center w-12 h-12 mb-3 text-white bg-gray-700 rounded-lg group-hover:bg-blue-700 transition-colors duration-300 ${tileSize === 'sm' ? 'w-8 h-8 mb-1' : tileSize === 'lg' ? 'w-16 h-16 mb-5' : ''}`}
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 12, scale: 1.12 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            <i className={`${cat.icon} text-2xl group-hover:text-blue-200 transition-colors duration-300`}></i>
                          </motion.div>
                          <h2 className={`mb-1 font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 ${tileSize === 'sm' ? 'text-base' : tileSize === 'lg' ? 'text-2xl' : 'text-lg'}`}>{cat.title}</h2>
                          <p className={`text-xs text-gray-400 group-hover:text-blue-200 transition-colors duration-300 ${tileSize === 'sm' ? 'hidden' : tileSize === 'lg' ? 'text-base' : ''}`}>{cat.description}</p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : view === 'list' ? (
                <motion.div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.div
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-md cursor-pointer group transition-all ${tileSize === 'sm' ? 'py-2' : tileSize === 'lg' ? 'py-8' : ''}`}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.4, delay: index * 0.06 }}
                          whileHover={{
                            scale: 1.06,
                            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)',
                            backgroundColor: '#172554',
                            borderColor: '#2563eb',
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className={`flex items-center justify-center w-12 h-12 text-white bg-gray-700 rounded-lg group-hover:bg-blue-700 transition-colors duration-300 ${tileSize === 'sm' ? 'w-8 h-8' : tileSize === 'lg' ? 'w-16 h-16' : ''}`}
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 12, scale: 1.12 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            <i className={`${cat.icon} text-2xl group-hover:text-blue-200 transition-colors duration-300`}></i>
                          </motion.div>
                          <div className="flex-1">
                            <h2 className={`font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 ${tileSize === 'sm' ? 'text-base' : tileSize === 'lg' ? 'text-2xl' : 'text-lg'}`}>{cat.title}</h2>
                            <p className={`text-xs text-gray-400 group-hover:text-blue-200 transition-colors duration-300 ${tileSize === 'sm' ? 'hidden' : tileSize === 'lg' ? 'text-base' : ''}`}>{cat.description}</p>
                          </div>
                          {count > 0 && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                              {count}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : view === 'compact' ? (
                <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.div
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`flex flex-col items-center justify-center p-2 bg-gray-800 border border-gray-700 rounded-lg shadow cursor-pointer group transition-all ${tileSize === 'sm' ? 'min-h-[60px]' : tileSize === 'lg' ? 'min-h-[140px]' : 'min-h-[90px]'}`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          whileHover={{
                            scale: 1.04,
                            boxShadow: '0 4px 16px 0 rgba(59,130,246,0.13)',
                            backgroundColor: '#1e293b',
                            borderColor: '#2563eb',
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <i className={`${cat.icon} text-xl text-blue-300 mb-1`}></i>
                          <span className={`font-semibold text-white mb-0.5 text-center ${tileSize === 'sm' ? 'text-xs' : tileSize === 'lg' ? 'text-lg' : 'text-xs'}`}>{cat.title}</span>
                          {count > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-blue-600 rounded-full mt-1">
                              {count}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : view === 'cards' ? (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.div
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`flex flex-col items-start p-5 bg-gray-900 border border-blue-900 rounded-2xl shadow-lg cursor-pointer group transition-all ${tileSize === 'sm' ? 'min-h-[80px]' : tileSize === 'lg' ? 'min-h-[180px]' : 'min-h-[120px]'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.15)',
                            backgroundColor: '#1e293b',
                            borderColor: '#2563eb',
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <i className={`${cat.icon} text-2xl text-blue-400`}></i>
                            <span className={`font-bold text-white ${tileSize === 'sm' ? 'text-base' : tileSize === 'lg' ? 'text-2xl' : 'text-lg'}`}>{cat.title}</span>
                            {count > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">{count}</span>
                            )}
                          </div>
                          <p className={`text-blue-200 ${tileSize === 'sm' ? 'text-xs' : tileSize === 'lg' ? 'text-lg' : 'text-sm'}`}>{cat.description}</p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : view === 'minimal' ? (
                <motion.div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`px-3 py-2 rounded bg-gray-800 text-blue-200 font-semibold border border-gray-700 hover:bg-blue-700 hover:text-white transition shadow ${tileSize === 'sm' ? 'text-xs' : tileSize === 'lg' ? 'text-lg px-5 py-3' : ''}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          whileHover={{ scale: 1.08, backgroundColor: '#2563eb', color: '#fff' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <i className={`${cat.icon} mr-1`}></i>{cat.title}
                          {count > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-600 rounded-full">{count}</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : view === 'detailed' ? (
                <motion.div className="flex flex-col gap-5">
                  <AnimatePresence>
                    {cats.map((cat, index) => {
                      const count = projectCounts[cat.title] ?? 0;
                      return (
                        <motion.div
                          key={index}
                          onClick={() => handleCategoryClick(cat.title)}
                          className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-6 bg-gray-900 border border-blue-900 rounded-2xl shadow-lg cursor-pointer group transition-all ${tileSize === 'sm' ? 'py-2' : tileSize === 'lg' ? 'py-10' : ''}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          whileHover={{
                            scale: 1.03,
                            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.13)',
                            backgroundColor: '#1e293b',
                            borderColor: '#2563eb',
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="flex items-center gap-3 mb-2 md:mb-0">
                            <i className={`${cat.icon} text-2xl text-blue-400`}></i>
                            <span className={`font-bold text-white ${tileSize === 'sm' ? 'text-base' : tileSize === 'lg' ? 'text-2xl' : 'text-lg'}`}>{cat.title}</span>
                            {count > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">{count}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-blue-200 font-medium ${tileSize === 'sm' ? 'text-xs' : tileSize === 'lg' ? 'text-lg' : 'text-base'}`}>{cat.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : null
            );
          })()}
        {/* End of main content */}
        </div>
      </main>
    </motion.div>
  );
};

export default Categories;