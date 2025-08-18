
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';
import 'remixicon/fonts/remixicon.css';
import PropTypes from 'prop-types';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    // Animate card on hover
    const handleMouseEnter = (e) => {
        anime({
            targets: e.currentTarget,
            scale: 1.04,
            boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)',
            duration: 350,
            easing: 'easeOutExpo',
        });
    };
    const handleMouseLeave = (e) => {
        anime({
            targets: e.currentTarget,
            scale: 1,
            boxShadow: '0 4px 16px 0 rgba(59,130,246,0.13)',
            duration: 350,
            easing: 'easeOutExpo',
        });
    };
    return (
        <div
            className="overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900 rounded-3xl shadow-2xl group transition-transform duration-300 cursor-pointer hover:shadow-blue-500/30"
            onClick={() => navigate(`/blogs/${blog._id}`)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="p-8 flex flex-col gap-4">
                <h2 className="mb-2 text-3xl font-extrabold text-white group-hover:text-blue-400 transition-colors duration-300">
                    {blog.title}
                </h2>
                <p className="mb-2 text-lg text-blue-200">
                    By {blog.author.firstName} {blog.author.lastName}
                </p>
                <p className="mb-4 text-gray-300 text-lg">
                    {blog.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300 text-lg cursor-pointer">
                        Read More &rarr;
                    </span>
                    <div className="flex items-center text-lg">
                        <i className="mr-2 ri-heart-fill text-red-500"></i> {blog.likes.length}
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
