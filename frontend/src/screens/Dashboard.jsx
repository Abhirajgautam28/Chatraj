import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';

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
      category: categoryName
    })
      .then((res) => {
        console.log(res);
        setProjects(prev => [...prev, res.data.project]);
        setIsModalOpen(false);
        setProjectName('');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    // Remove token and user, then redirect to logout screen
    localStorage.removeItem('token');
    navigate('/logout', { replace: true });
  };

  useEffect(() => {
    // Always fetch all projects for the user, then filter by category on the frontend
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
        console.log(err);
        setProjects([]);
      });
  }, [categoryName]);

  return (
    <main className="relative min-h-screen p-4 bg-gradient-to-r from-blue-800 to-gray-900">
      <div className="container relative mx-auto">
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
                <motion.div
                  key={project._id}
                  onClick={() => {
                    navigate(`/project`, {
                      state: { project }
                    });
                  }}
                  className="flex flex-col gap-2 p-6 transition duration-300 transform bg-gray-700 rounded-md shadow-sm cursor-pointer group"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  whileHover={{ scale: 1.045, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)', backgroundColor: '#374151' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">{project.name}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-300">
                      <i className="ri-user-line"></i> Collaborators:
                    </p>
                    <span className="font-bold text-white">{project.users.length}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-full max-w-md p-8 transition duration-300 transform bg-gray-800 rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="mb-6 text-2xl font-bold text-center text-white">
                  Create New Project
                </h2>
                <form onSubmit={createProject}>
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-400">
                      Project Name
                    </label>
                    <input
                      onChange={(e) => setProjectName(e.target.value)}
                      value={projectName}
                      type="text"
                      className="w-full p-3 text-white transition duration-300 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-5 py-2 mr-3 text-white transition duration-300 bg-gray-600 rounded hover:bg-gray-500"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Dashboard;