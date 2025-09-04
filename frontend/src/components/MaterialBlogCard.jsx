import React from 'react';
import { Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const MaterialBlogCard = ({ blog, darkMode }) => (
  <div
    className={`rounded-xl shadow-md bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full border border-gray-200 dark:border-gray-800 max-w-md mx-auto`}
    style={{ minWidth: 0 }}
  >
    <div className="p-0">
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} className="rounded-t-xl w-full h-48 object-cover" />
      )}
    </div>
    <div className="flex-1 flex flex-col p-5">
      <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-300 line-clamp-2">{blog.title}</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{blog.summary || blog.content?.slice(0, 120) + '...'}</p>
      <div className="flex items-center gap-2 mt-auto">
        <i className="ri-user-3-line text-lg text-blue-400 dark:text-blue-300" />
        <span className="text-gray-500 dark:text-gray-300 text-xs">{blog.authorName || 'Unknown Author'}</span>
        <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
        <i className="ri-calendar-line text-lg text-blue-400 dark:text-blue-300" />
        <span className="text-gray-500 dark:text-gray-300 text-xs">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</span>
      </div>
      <Link to={`/blogs/${blog._id}`} className="mt-4">
        <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium shadow transition-all duration-150">
          Read More <i className="ri-arrow-right-line ml-1"></i>
        </button>
      </Link>
    </div>
  </div>
);

export default MaterialBlogCard;
