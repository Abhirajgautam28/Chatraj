import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import axios, { clearCsrfCache } from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import NewProjectModal from '../components/NewProjectModal';

const Dashboard = () => {
  useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { categoryName: rawCategoryName } = useParams();
  const categoryName = rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined;

  const createProject = (e) => {
    e.preventDefault();
    axios.post('/api/projects/create', {
      name: projectName,
      category: categoryName || 'DSA' // Default to DSA if no category
    })
      .then((res) => {
        setProjects(prev => [...prev, res.data.project]);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => {
        console.error('Project creation failed:', error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearCsrfCache();
    navigate('/logout', { replace: true });
  };

  useEffect(() => {
    axios.get('/api/projects/all')
      .then((res) => {
        if (Array.isArray(res.data.projects)) {
          if (categoryName) {
            setProjects(res.data.projects.filter(p => p.category === categoryName));
          } else {
            setProjects(res.data.projects);
          }
        } else {
          setProjects([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch projects:', err);
        setProjects([]);
      });
  }, [categoryName]);

  return (
    <main className="relative min-h-screen p-4 bg-transparent">
      <div className="container relative z-10 mx-auto">
        <motion.button
          onClick={handleLogout}
          className="absolute z-50 flex items-center gap-2 px-3 py-2 text-white transition bg-gray-700 rounded-md top-4 right-4 hover:bg-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <i className="ri-logout-box-r-line"></i>
          <span>Logout</span>
        </motion.button>
        <motion.div
          className="w-full max-w-4xl p-8 transition duration-500 transform bg-gray-800 rounded-lg shadow-2xl"
          initial={{ opacity: 0, scale: 0.97, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="mb-6 text-2xl font-bold text-center text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {categoryName ? `${categoryName} Projects` : 'Your Projects'}
          </motion.h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 transition duration-300 transform bg-gray-700 rounded-md shadow-lg hover:bg-gray-600 group"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ scale: 1.06, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)', backgroundColor: '#374151' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="font-medium text-white">New Project</span>
              <i className="ml-2 text-white ri-link"></i>
            </motion.button>

            <AnimatePresence>
              {projects.map((project, idx) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={idx}
                  onClick={() => {
                    navigate(`/project`, {
                      state: { project }
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <NewProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectName={projectName}
          setProjectName={setProjectName}
          onSubmit={createProject}
        />
      </div>
    </main>
  );
};

export default Dashboard;
