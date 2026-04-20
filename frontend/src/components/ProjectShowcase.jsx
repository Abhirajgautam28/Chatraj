import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import Card from './Card';

const ProjectShowcase = React.memo(() => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        axios.get('/api/projects/showcase', { signal: controller.signal })
            .then(res => {
                if (Array.isArray(res.data.projects)) {
                    setProjects(res.data.projects);
                }
                setLoading(false);
            })
            .catch(err => {
                if (err.name === 'CanceledError') return;
                console.error(err);
                setLoading(false);
            });
        return () => controller.abort();
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <Card className="bg-white dark:bg-card-dark-mode-gradient">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Project Showcase</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {Array.isArray(projects) && projects.map(project => (
                    <div key={project._id} className="p-4 bg-gray-100 rounded-lg dark:bg-gray-900/80 transition-transform duration-300 hover:scale-105">
                        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{project.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{project.category}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
});

export default ProjectShowcase;
