
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    // No hover animation needed for Material UI style
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col justify-between min-h-[260px]"
            onClick={() => navigate(`/blogs/${blog._id}`)}
        >
            <div className="p-6 flex flex-col gap-2 flex-grow">
                <h2 className="mb-1 text-2xl font-bold text-blue-700 dark:text-blue-300 truncate">{blog.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">By {blog.author.firstName} {blog.author.lastName}</p>
                <p className="text-gray-700 dark:text-gray-200 text-base line-clamp-3 flex-grow">{blog.content.substring(0, 150)}...</p>
            </div>
            <div className="flex items-center justify-between px-6 pb-4">
                <span className="font-medium text-blue-600 dark:text-blue-400 text-base cursor-pointer">Read More &rarr;</span>
                <div className="flex items-center text-base">
                    <i className="mr-1 ri-heart-fill text-red-500"></i> {blog.likes.length}
                </div>
            </div>
        </div>
    );
};

BlogCard.propTypes = {
    blog: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        author: PropTypes.shape({
            firstName: PropTypes.string.isRequired,
            lastName: PropTypes.string.isRequired,
        }).isRequired,
        likes: PropTypes.array.isRequired,
    }).isRequired,
};

export default BlogCard;
