import { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { useToast } from '../context/toast.context';
import axios, { clearCsrfCache } from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { logger } from '../utils/logger';

const Dashboard = () => {
  useContext(UserContext);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { categoryName: rawCategoryName } = useParams();

  const categoryName = useMemo(() =>
    rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined
  , [rawCategoryName]);

  const createProject = useCallback((e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    axios.post('/api/projects/create', {
      name: projectName,
      category: categoryName
    })
      .then((res) => {
        showToast('Project created successfully', 'success');
        setProjects(prev => [...prev, res.data.project]);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => {
        showToast('Failed to create project', 'error');
        logger.error(error);
      });
  }, [projectName, categoryName, showToast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    clearCsrfCache();
    navigate('/logout', { replace: true });
    showToast('Logged out successfully', 'info');
  }, [navigate, showToast]);

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
        logger.error('Fetch projects error:', err);
        setProjects([]);
      });
  }, [categoryName]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return (
    <main className="relative min-h-screen p-4 bg-transparent overflow-x-hidden">
      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <i className="ri-layout-grid-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {categoryName ? `${categoryName} Projects` : 'Dashboard'}
              </h1>
              <p className="text-gray-400 text-sm">Manage your collaborative spaces</p>
            </div>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <i className="ri-logout-box-r-line"></i>
            <span>Logout</span>
          </motion.button>
        </div>

        <motion.div
          className="w-full max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 bg-gray-800/40 border border-gray-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-sm"
              />
              <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="ri-add-circle-line text-xl"></i>
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode='popLayout'>
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  idx={idx}
                  onClick={() => navigate(`/project`, { state: { project } })}
                />
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && searchTerm && (
              <motion.div
                className="col-span-full py-20 text-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-600">
                  <i className="ri-search-line text-4xl"></i>
                </div>
                <p className="text-gray-400">No projects found matching &quot;{searchTerm}&quot;</p>
              </motion.div>
            )}

            {projects.length === 0 && !searchTerm && (
              <motion.div
                className="col-span-full py-20 text-center space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-400">You haven&apos;t created any projects yet.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-500 hover:underline"
                >
                  Create your first project
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        <CreateProjectModal
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
