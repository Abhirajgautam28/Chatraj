import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ProjectCard = ({ project, onClick, index }) => {
  return (
    <motion.div
      onClick={onClick}
      className="flex flex-col gap-2 p-6 transition duration-300 transform bg-gray-700 rounded-md shadow-sm cursor-pointer group"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ scale: 1.045, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)', backgroundColor: '#374151' }}
      whileTap={{ scale: 0.98 }}
    >
      <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
        {project.name}
      </h2>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-300">
          <i className="ri-user-line"></i> Collaborators:
        </p>
        <span className="font-bold text-white">{project.users?.length || 0}</span>
      </div>
    </motion.div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default ProjectCard;
