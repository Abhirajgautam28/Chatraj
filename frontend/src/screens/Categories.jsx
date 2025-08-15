import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';

const Categories = () => {
  const navigate = useNavigate();

  // State for search/filter and view toggle
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid, list, compact
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
          {/* Search and view toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full md:w-80 px-4 py-2 rounded-lg border border-blue-200 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 items-center justify-end">
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-200'} transition`}
                onClick={() => setView('grid')}
              >
                <i className="ri-grid-fill mr-1"></i> Grid
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-200'} transition`}
                onClick={() => setView('list')}
              >
                <i className="ri-list-check-2 mr-1"></i> List
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium ${view === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-200'} transition`}
                onClick={() => setView('compact')}
                aria-label="Compact"
              >
                <i className="ri-layout-column-line mr-1"></i> Compact
              </button>
            </div>
          </div>
          {/* Recently Accessed */}
          {recent.length > 0 && (
            <motion.div className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-blue-200 mb-2">Recently Accessed</h2>
              <div className="flex flex-wrap gap-3">
                {recent.map((catTitle, i) => {
                  const cat = categories.find(c => c.title === catTitle);
                  if (!cat) return null;
                  const count = projectCounts[cat.title] ?? 0;
                  return (
                    <motion.button
                      key={cat.title}
                      onClick={() => handleCategoryClick(cat.title)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-blue-700 text-white hover:bg-blue-700 hover:text-white transition shadow-md"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      whileHover={{ scale: 1.08, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)', backgroundColor: '#1e293b' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <i className={`${cat.icon} text-xl`}></i>
                      <span>{cat.title}</span>
                      {count > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 rounded-full">{count}</span>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
          {/* Category grid/list */}
          {view === 'grid' ? (
            <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <AnimatePresence>
                {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase())).map((cat, index) => {
                  const count = projectCounts[cat.title] ?? 0;
                  return (
                    <motion.div
                      key={index}
                      onClick={() => handleCategoryClick(cat.title)}
                      className="relative p-4 transition-all duration-300 transform bg-gray-800 border border-gray-700 rounded-xl shadow-md cursor-pointer group"
                      style={{ minHeight: 160 }}
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
                        className="flex items-center justify-center w-12 h-12 mb-3 text-white bg-gray-700 rounded-lg group-hover:bg-blue-700 transition-colors duration-300"
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 12, scale: 1.12 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <i className={`${cat.icon} text-2xl group-hover:text-blue-200 transition-colors duration-300`}></i>
                      </motion.div>
                      <h2 className="mb-1 text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{cat.title}</h2>
                      <p className="text-xs text-gray-400 group-hover:text-blue-200 transition-colors duration-300">{cat.description}</p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : view === 'list' ? (
            <motion.div className="flex flex-col gap-4">
              <AnimatePresence>
                {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase())).map((cat, index) => {
                  const count = projectCounts[cat.title] ?? 0;
                  return (
                    <motion.div
                      key={index}
                      onClick={() => handleCategoryClick(cat.title)}
                      className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-md cursor-pointer group transition-all"
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
                        className="flex items-center justify-center w-12 h-12 text-white bg-gray-700 rounded-lg group-hover:bg-blue-700 transition-colors duration-300"
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 12, scale: 1.12 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        <i className={`${cat.icon} text-2xl group-hover:text-blue-200 transition-colors duration-300`}></i>
                      </motion.div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{cat.title}</h2>
                        <p className="text-xs text-gray-400 group-hover:text-blue-200 transition-colors duration-300">{cat.description}</p>
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
          ) : (
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <AnimatePresence>
                {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase())).map((cat, index) => {
                  const count = projectCounts[cat.title] ?? 0;
                  return (
                    <motion.div
                      key={index}
                      onClick={() => handleCategoryClick(cat.title)}
                      className="flex flex-col items-center justify-center p-2 bg-gray-800 border border-gray-700 rounded-lg shadow cursor-pointer group transition-all min-h-[90px]"
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
                      <span className="text-xs font-semibold text-white mb-0.5 text-center">{cat.title}</span>
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
          )}
        </div>
      </main>
  </motion.div>
  );
};

export default Categories;