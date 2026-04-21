import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../config/axios';
import Card from './Card';
import { logger } from '../utils/logger';

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/projects/showcase')
            .then(res => {
                if (Array.isArray(res.data.projects)) {
                    setProjects(res.data.projects);
                }
                setLoading(false);
            })
            .catch(err => {
                logger.error('Project Showcase fetch error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading showcase...</div>;
    }

    return (
        <Card className="bg-white dark:bg-card-dark-mode-gradient">
            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="ri-rocket-line text-blue-500"></i>
                Top Projects
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {projects.length > 0 ? (
                    projects.map(project => (
                        <div key={project._id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                            <h4 className="mb-1 text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.name}
                            </h4>
                            <div className="flex items-center justify-between mt-3">
                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                                    {project.category}
                                </span>
                                <div className="flex items-center text-gray-400 text-xs">
                                    <i className="ri-user-line mr-1"></i>
                                    {project.users?.length || 0}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-4 text-gray-500 italic">No projects available for showcase.</div>
                )}
            </div>
        </Card>
    );
};

ProjectShowcase.propTypes = {
    // No props passed currently
};

export default ProjectShowcase;
