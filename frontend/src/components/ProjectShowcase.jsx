import { useState, useEffect } from 'react';
import axios from '../config/axios';

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/projects/showcase')
            .then(res => {
                setProjects(res.data.projects);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Project Showcase</h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {projects.map(project => (
                    <div key={project._id} className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
                        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">{project.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{project.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectShowcase;
