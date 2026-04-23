import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { useToast } from '../context/toast.context';
import { clearCsrfCache } from "../config/axios";
import { useNavigate, useParams } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useApi } from '../hooks/useApi';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { categoryName: rawCategoryName } = useParams();

  const { request: fetchProjects, loading: fetchLoading, data: projectsData, setData: setProjectsData } = useApi();
  const { request: createProjectRequest, loading: createLoading } = useApi();
  const { request: deleteProjectRequest } = useApi();
  const { request: leaveProjectRequest } = useApi();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState(null);

  const categoryName = useMemo(() =>
    rawCategoryName ? decodeURIComponent(rawCategoryName) : undefined
  , [rawCategoryName]);

  const handleCreateProject = useCallback(async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const { data } = await createProjectRequest({
      url: '/api/projects/create',
      method: 'POST',
      data: { name: projectName, category: categoryName }
    }, { showSuccessToast: true, successMessage: 'Project created successfully' });

    if (data) {
      setProjectsData(prev => ({
        ...prev,
        projects: [...(prev?.projects || []), data.project]
      }));
      setIsModalOpen(false);
      setProjectName('');
    }
  }, [projectName, categoryName, createProjectRequest, setProjectsData]);

  const handleDeleteProject = async () => {
    if (!confirmDeleteId) return;
    const { error } = await deleteProjectRequest({
        url: `/api/projects/${confirmDeleteId}`,
        method: 'DELETE'
    }, { showSuccessToast: true, successMessage: 'Project deleted' });

    if (!error) {
        setProjectsData(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p._id !== confirmDeleteId)
        }));
    }
    setConfirmDeleteId(null);
  };

  const handleLeaveProject = async () => {
    if (!confirmLeaveId) return;
    const { error } = await leaveProjectRequest({
        url: `/api/projects/${confirmLeaveId}/leave`,
        method: 'POST'
    }, { showSuccessToast: true, successMessage: 'Left project' });

    if (!error) {
        setProjectsData(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p._id !== confirmLeaveId)
        }));
    }
    setConfirmLeaveId(null);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    clearCsrfCache();
    navigate('/logout', { replace: true });
    showToast('Logged out successfully', 'info');
  }, [navigate, showToast]);

  useEffect(() => {
    fetchProjects({ url: '/api/projects/all', method: 'GET' });
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const allProjects = projectsData?.projects || [];
    let filtered = allProjects;
    if (categoryName) {
        filtered = filtered.filter(p => p.category === categoryName);
    }
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [projectsData, categoryName, searchTerm]);

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

          {fetchLoading && filteredProjects.length === 0 ? (
             <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your projects...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode='popLayout'>
                {filteredProjects.map((project, idx) => (
                    <ProjectCard
                        key={project._id}
                        project={project}
                        idx={idx}
                        currentUserId={user?._id}
                        onClick={() => navigate(`/project`, { state: { project } })}
                        onDelete={(id) => setConfirmDeleteId(id)}
                        onLeave={(id) => setConfirmLeaveId(id)}
                    />
                ))}
                </AnimatePresence>

                {filteredProjects.length === 0 && (
                <motion.div
                    className="col-span-full py-20 text-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-600">
                    <i className="ri-search-line text-4xl"></i>
                    </div>
                    <p className="text-gray-400">
                        {searchTerm ? `No projects found matching "${searchTerm}"` : "You haven't created any projects yet."}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-500 hover:underline"
                        >
                            Create your first project
                        </button>
                    )}
                </motion.div>
                )}
            </div>
          )}
        </motion.div>

        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectName={projectName}
          setProjectName={setProjectName}
          onSubmit={handleCreateProject}
          isSubmitting={createLoading}
        />

        <ConfirmationModal
            isOpen={!!confirmDeleteId}
            onClose={() => setConfirmDeleteId(null)}
            onConfirm={handleDeleteProject}
            title="Delete Project"
            message="Are you sure you want to delete this project? This action cannot be undone."
            type="danger"
        />

        <ConfirmationModal
            isOpen={!!confirmLeaveId}
            onClose={() => setConfirmLeaveId(null)}
            onConfirm={handleLeaveProject}
            title="Leave Project"
            message="Are you sure you want to leave this project?"
            type="warning"
        />
      </div>
    </main>
  );
};

export default Dashboard;
