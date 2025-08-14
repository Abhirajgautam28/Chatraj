import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';

const Categories = () => {
  const navigate = useNavigate();

  // State for search/filter and view toggle
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
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
    <div className="min-h-screen bg-gradient-to-r from-blue-800 to-gray-900">
      <main className="relative z-10 flex flex-col items-center min-h-screen">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/logout', { replace: true });
          }}
          className="fixed z-50 flex items-center justify-center px-4 py-2 text-white transition-all transform bg-blue-600 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 top-4 right-4 hover:scale-110 animate__animated animate__bounceIn"
        >
          <i className="text-2xl ri-logout-box-r-line"></i>
        </button>
        <button
          onClick={() => navigate('/welcome-chatraj')}
          className="fixed flex items-center gap-2 px-4 py-2 text-white transition-all transform bg-blue-600 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 top-4 right-24 hover:scale-110 animate__animated animate__bounceIn"
        >
          <i className="text-2xl ri-robot-2-line"></i>
        </button>

        <div className="w-full max-w-7xl p-6">
          <h1 className="mb-8 text-4xl font-bold text-center text-white animate__animated animate__fadeInDown">
            Explore Categories
          </h1>
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
            </div>
          </div>
          {/* Recently Accessed */}
          {recent.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-blue-200 mb-2">Recently Accessed</h2>
              <div className="flex flex-wrap gap-3">
                {recent.map((catTitle, i) => {
                  const cat = categories.find(c => c.title === catTitle);
                  if (!cat) return null;
                  const count = projectCounts[cat.title] ?? 0;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => handleCategoryClick(cat.title)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-blue-700 text-white hover:bg-blue-700 hover:text-white transition shadow-md"
                    >
                      <i className={`${cat.icon} text-xl`}></i>
                      <span>{cat.title}</span>
                      {count > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 rounded-full">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Category grid/list */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase())).map((cat, index) => {
                const count = projectCounts[cat.title] ?? 0;
                return (
                  <div
                    key={index}
                    onClick={() => handleCategoryClick(cat.title)}
                    className="relative p-4 transition-all duration-300 transform bg-gray-800 border border-gray-700 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-600"
                    style={{ minHeight: 160 }}
                  >
                    {count > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                        {count}
                      </span>
                    )}
                    <div className="flex items-center justify-center w-12 h-12 mb-3 text-white bg-gray-700 rounded-lg">
                      <i className={`${cat.icon} text-2xl`}></i>
                    </div>
                    <h2 className="mb-1 text-lg font-semibold text-white">{cat.title}</h2>
                    <p className="text-xs text-gray-400">{cat.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {categories.filter(cat => cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase())).map((cat, index) => {
                const count = projectCounts[cat.title] ?? 0;
                return (
                  <div
                    key={index}
                    onClick={() => handleCategoryClick(cat.title)}
                    className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:border-blue-600 transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 text-white bg-gray-700 rounded-lg">
                      <i className={`${cat.icon} text-2xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white">{cat.title}</h2>
                      <p className="text-xs text-gray-400">{cat.description}</p>
                    </div>
                    {count > 0 && (
                      <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Categories;