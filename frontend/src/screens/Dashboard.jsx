import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from "../config/axios";
import { useNavigate, useLocation } from 'react-router-dom';
import 'animate.css';

const Dashboard = () => {
  useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory || null;

  const createProject = (e) => {
    e.preventDefault();
    axios.post('/projects/create', {
      name: projectName,
      category: selectedCategory
    })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    navigate('/logout', { replace: true });
  };

  useEffect(() => {
    const url = selectedCategory ? `/projects/all?category=${selectedCategory}` : '/projects/all';
    axios.get(url)
      .then((res) => {
        if (selectedCategory) {
          const filteredProjects = res.data.projects.filter(project => project.category === selectedCategory);
          setProjects(filteredProjects);
        } else {
          setProjects(res.data.projects);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [selectedCategory]);

  return (
    <main className="relative min-h-screen p-4 bg-gradient-to-r from-blue-800 to-gray-900 animate__animated animate__fadeIn">
      <div className="container relative mx-auto">
        <button
          onClick={handleLogout}
          className="absolute z-50 flex items-center gap-2 px-3 py-2 text-white transition bg-gray-700 rounded-md top-4 right-4 hover:bg-gray-600"
        >
          <i className="ri-logout-box-r-line"></i>
          <span>Logout</span>
        </button>
        <div className="w-full max-w-4xl p-8 transition duration-500 transform bg-gray-800 rounded-lg shadow-2xl hover:scale-105">
          <h1 className="mb-6 text-2xl font-bold text-center text-white animate__animated animate__fadeInDown">
            {selectedCategory ? `${selectedCategory} Projects` : 'Your Projects'}
          </h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 transition duration-300 transform bg-gray-700 rounded-md shadow-lg hover:bg-gray-600 animate__animated animate__fadeIn"
            >
              <span className="font-medium text-white">New Project</span>
              <i className="ml-2 text-white ri-link"></i>
            </button>

            {projects.map((project) => (
              <div key={project._id}
                onClick={() => {
                  navigate(`/project`, {
                    state: { project }
                  });
                }}
                className="flex flex-col gap-2 p-6 transition duration-300 transform bg-gray-700 rounded-md shadow-sm cursor-pointer hover:-translate-y-1 hover:scale-105 hover:bg-gray-600 animate__animated animate__fadeIn"
              >
                <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-300">
                    <i className="ri-user-line"></i> Collaborators:
                  </p>
                  <span className="font-bold text-white">{project.users.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 animate__animated animate__fadeIn">
            <div className="w-full max-w-md p-8 transition duration-300 transform bg-gray-800 rounded-lg shadow-2xl hover:scale-105 animate__animated animate__fadeInUp">
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;