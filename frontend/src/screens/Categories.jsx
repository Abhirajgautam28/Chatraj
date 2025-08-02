import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'animate.css';

const Categories = () => {
  const navigate = useNavigate();

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
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/projects/category-counts', {
      headers: {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setProjectCounts(data || {}))
      .catch(() => setProjectCounts({}));
  }, []);

  const handleCategoryClick = (categoryTitle) => {
    navigate("/dashboard", { state: { selectedCategory: categoryTitle } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 to-gray-900">
      <main className="relative flex items-center justify-center min-h-screen">
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

        <div className="w-full max-w-7xl p-8">
          <h1 className="mb-12 text-5xl font-extrabold tracking-tight text-center text-white animate__animated animate__fadeInDown">
            Explore Categories
          </h1>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat, index) => {
              const count = projectCounts[cat.title] ?? 0;
              return (
                <div
                  key={index}
                  onClick={() => handleCategoryClick(cat.title)}
                  className="relative p-6 transition-all duration-300 transform bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:border-blue-500"
                  style={{ minHeight: 220 }}
                >
                  {count > 0 && (
                    <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-bl-lg rounded-tr-lg">
                      {count}
                    </span>
                  )}
                  <div className="flex items-center justify-center w-16 h-16 mb-4 text-white bg-gray-700 rounded-full">
                    <i className={`${cat.icon} text-3xl`}></i>
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">{cat.title}</h2>
                  <p className="text-sm text-gray-400">{cat.description}</p>
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