import React from 'react';
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

  const handleCategoryClick = (categoryTitle) => {
    console.log("Category clicked:", categoryTitle);
    navigate("/", { state: { selectedCategory: categoryTitle } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 to-gray-900">
      <main className="relative flex items-center justify-center min-h-screen">
        <button
          onClick={() => navigate('/welcome-chatraj')}
          className="fixed flex items-center gap-2 px-4 py-2 text-white transition-all transform bg-blue-600 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 top-4 right-4 hover:scale-110 animate__animated animate__bounceIn"
        >
          <i className="text-2xl ri-robot-2-line"></i>
        </button>

        <div className="w-full max-w-6xl p-4">
          <h1 className="mb-6 text-2xl font-bold text-center text-white animate__animated animate__fadeInDown">
            Explore Categories
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(cat.title)}
                className="flex flex-col items-center justify-center p-2 text-white transition transform bg-gray-700 rounded-md hover:bg-gray-600 hover:scale-105"
              >
                <i className={`${cat.icon} text-5xl mb-2`}></i>
                <h2 className="text-lg font-semibold text-center">{cat.title}</h2>
                <p className="text-sm text-center">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;