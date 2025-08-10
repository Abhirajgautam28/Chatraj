import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
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


const Categories = () => {
  const navigate = useNavigate();
  const [projectCounts, setProjectCounts] = useState({});

  useEffect(() => {
  axiosInstance.get('/api/projects/category-counts')
      .then(res => setProjectCounts(res.data || {}))
      .catch(() => setProjectCounts({}));
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    navigate(`/projects/category/${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 to-gray-900">
      <main className="flex items-center justify-center min-h-screen">
        <button
          onClick={() => navigate('/logout', { replace: true })}
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
          <h1 className="mb-10 text-4xl font-bold text-center text-white animate__animated animate__fadeInDown">
            Explore Categories
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((cat, index) => {
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
        </div>
      </main>
    </div>
  );
};

export default Categories;