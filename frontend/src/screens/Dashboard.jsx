import React, { useContext, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import axios, { clearCsrfCache } from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { categoryName: rawCategoryName } = useParams();
  const categoryName = useMemo(() => rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined, [rawCategoryName]);

  const createProject = (e) => {
    e.preventDefault();
    axios.post('/api/projects/create', {
      name: projectName,
      category: categoryName || 'Fullstack Development'
    })
      .then((res) => {
        setProjects(prev => [...prev, res.data.project]);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => {
        console.error("Create Project Error:", error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearCsrfCache();
    navigate('/logout', { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    // Optimized: Fetch projects for specific category from backend
    const url = categoryName ? `/api/projects/all?category=${encodeURIComponent(categoryName)}` : '/api/projects/all';
    axios.get(url)
      .then((res) => {
        setProjects(Array.isArray(res.data.projects) ? res.data.projects : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Projects Error:", err);
        setProjects([]);
        setLoading(false);
      });
  }, [categoryName]);

  return (
    <main className="relative min-h-screen p-4 bg-transparent overflow-hidden">
      <div className="container relative z-10 mx-auto">
        <motion.button
          onClick={handleLogout}
          className="absolute z-50 flex items-center gap-2 px-3 py-2 text-white transition bg-gray-700/50 backdrop-blur-md border border-gray-600 rounded-lg top-4 right-4 hover:bg-gray-600"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <i className="ri-logout-box-r-line"></i>
          <span>Logout</span>
        </motion.button>

        <motion.div
          className="w-full max-w-5xl p-8 mx-auto transition duration-500 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
             <h1 className="text-3xl font-bold text-white tracking-tight">
                {categoryName ? `${categoryName} Projects` : 'Your Engineering Workspace'}
             </h1>
             <div className="text-sm text-gray-400">
                {projects.length} Active Project{projects.length !== 1 ? 's' : ''}
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                 <i className="ri-add-line text-2xl text-blue-400 group-hover:text-white"></i>
              </div>
              <span className="font-semibold text-gray-300 group-hover:text-white">New Project</span>
            </motion.button>

            <AnimatePresence mode='popLayout'>
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="h-40 bg-gray-800/50 animate-pulse rounded-xl" />
                ))
              ) : projects.map((project, idx) => (
                <motion.div
                  key={project._id}
                  layout
                  onClick={() => navigate(`/project`, { state: { project } })}
                  className="p-6 bg-gray-800/60 border border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gray-800 transition-all group relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="ri-arrow-right-up-line text-blue-400"></i>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 truncate">{project.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex -space-x-2">
                        {project.users.slice(0, 3).map((u, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-blue-600 border-2 border-gray-800 flex items-center justify-center text-[10px] text-white">
                                {u.toString().slice(-2).toUpperCase()}
                            </div>
                        ))}
                        {project.users.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-[10px] text-white">
                                +${project.users.length - 3}
                            </div>
                        )}
                    </div>
                    <span>{project.users.length} Collaborator{project.users.length !== 1 ? 's' : ''}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md p-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Initiate Project</h2>
              <form onSubmit={createProject}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                  <input
                    autoFocus
                    onChange={(e) => setProjectName(e.target.value)}
                    value={projectName}
                    type="text"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. ChatRaj Engine"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-5 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Construct
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default React.memo(Dashboard);
