import { Link } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
    return (
        <div
            className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800"
        >
            <div className="p-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                </h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                    By {blog.author.firstName} {blog.author.lastName}
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    {blog.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between">
                    <Link
                        to={`/blogs/${blog._id}`}
                        className="text-blue-500 hover:underline"
                    >
                        Read More
                    </Link>
                    <div className="flex items-center">
                        <i className="mr-1 ri-heart-line"></i> {blog.likes.length}
                    </div>
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
