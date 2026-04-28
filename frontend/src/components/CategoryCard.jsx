import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const CategoryCard = memo(({ cat, index, view, tileSize, count, onClick }) => {
  const isSmall = tileSize === 'sm';
  const isLarge = tileSize === 'lg';

  if (view === 'grid') {
    return (
      <motion.div
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg cursor-pointer group transition-all ${isSmall ? 'min-h-[100px]' : isLarge ? 'min-h-[240px]' : 'min-h-[160px]'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 10px 25px -5px rgba(59,130,246,0.2)',
          backgroundColor: '#1e293b',
          borderColor: '#2563eb',
        }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          className="mb-4 text-4xl text-blue-500 group-hover:text-blue-400"
          whileHover={{ rotate: 12, scale: 1.1 }}
        >
          <i className={cat.icon}></i>
        </motion.div>
        <span className={`font-bold text-gray-900 dark:text-white group-hover:text-white text-center ${isSmall ? 'text-sm' : isLarge ? 'text-2xl' : 'text-lg'}`}>{cat.title}</span>
        {count > 0 && (
          <span className="mt-2 px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-lg shadow-blue-600/30">
            {count} Projects
          </span>
        )}
      </motion.div>
    );
  }

  if (view === 'list') {
    return (
      <motion.div
        onClick={onClick}
        className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm cursor-pointer group hover:bg-blue-600 transition-all ${isSmall ? 'py-2' : isLarge ? 'py-8' : ''}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        whileHover={{ x: 10, scale: 1.01 }}
      >
        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
          <i className={`${cat.icon} text-2xl`}></i>
        </div>
        <div className="flex-1">
          <h2 className={`font-bold text-gray-900 dark:text-white group-hover:text-white ${isSmall ? 'text-base' : isLarge ? 'text-2xl' : 'text-lg'}`}>{cat.title}</h2>
          <p className={`text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-100 ${isSmall ? 'hidden' : ''}`}>{cat.description}</p>
        </div>
        {count > 0 && (
          <span className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full border border-white/20">
            {count}
          </span>
        )}
      </motion.div>
    );
  }

  if (view === 'compact') {
    return (
      <motion.div
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm cursor-pointer group transition-all ${isSmall ? 'min-h-[60px]' : isLarge ? 'min-h-[160px]' : 'min-h-[100px]'}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, backgroundColor: '#2563eb', borderColor: '#2563eb' }}
      >
        <i className={`${cat.icon} text-xl text-blue-500 group-hover:text-white mb-1`}></i>
        <span className={`font-semibold text-gray-900 dark:text-white group-hover:text-white text-center truncate w-full px-1 ${isSmall ? 'text-xs' : isLarge ? 'text-lg' : 'text-sm'}`}>{cat.title}</span>
      </motion.div>
    );
  }

  // Default to 'detailed' or fallback card
  return (
    <motion.div
      onClick={onClick}
      className={`flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm cursor-pointer group transition-all hover:shadow-xl hover:border-blue-500/50 ${isSmall ? 'py-3' : isLarge ? 'py-12' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
        <i className={`${cat.icon} text-3xl`}></i>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h2 className={`font-extrabold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors ${isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-xl'}`}>{cat.title}</h2>
          {count > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-lg">{count}</span>}
        </div>
        <p className={`text-gray-500 dark:text-gray-400 leading-relaxed ${isSmall ? 'text-xs' : isLarge ? 'text-lg' : 'text-sm'}`}>{cat.description}</p>
      </div>
      <i className="ri-arrow-right-s-line text-2xl text-gray-300 group-hover:text-blue-500 group-hover:translate-x-2 transition-all"></i>
    </motion.div>
  );
});

CategoryCard.displayName = 'CategoryCard';

CategoryCard.propTypes = {
  cat: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  view: PropTypes.string.isRequired,
  tileSize: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CategoryCard;
