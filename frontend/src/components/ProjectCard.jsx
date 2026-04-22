import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const ProjectCard = memo(({ project, idx, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
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
  );
});

ProjectCard.displayName = 'ProjectCard';

ProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    users: PropTypes.array.isRequired,
  }).isRequired,
  idx: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ProjectCard;
