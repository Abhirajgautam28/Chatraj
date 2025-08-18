import { useEffect, useState, useRef } from 'react';
import { BlogThemeProvider } from '../context/blogTheme.context';
import useBlogTheme from '../context/useBlogTheme';
import PropTypes from 'prop-types';
import axios from '../config/axios';
import { useParams } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import anime from 'animejs';
import ThreeHero from '../components/ThreeHero';

// Comment subcomponent
function Comment({ comment }) {
    if (!comment) return null;
    const user = comment.user || {};
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const avatar = firstName && typeof firstName === 'string' ? firstName[0] : '?';
    return (
        <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow">
                {avatar}
            </div>
            <div>
                <p className="font-bold text-base text-blue-700 dark:text-blue-200">{firstName} {lastName}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text || ''}</p>
            </div>
        </div>
    );
}
Comment.propTypes = {
    comment: PropTypes.shape({
        user: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
        }),
        text: PropTypes.string,
    }),
};


const SingleBlogPageContent = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const { id } = useParams();
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const { isBlogDarkMode, setIsBlogDarkMode } = useBlogTheme();

    useEffect(() => {
        if (heroRef.current) {
            anime({
                targets: heroRef.current,
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 900,
                easing: 'easeOutExpo',
            });
        }
        if (contentRef.current) {
            anime({
                targets: contentRef.current.querySelectorAll('.prose > *'),
                opacity: [0, 1],
                translateY: [40, 0],
                delay: anime.stagger(120),
                duration: 800,
                easing: 'easeOutExpo',
            });
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/blogs/${id}`, { signal: controller.signal });
                if (isMounted) {
                    setBlog(response.data);
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) setLoading(false);
            }
        };
        fetchBlog();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-2xl">Loading...</div>;
    }
    if (!blog) {
        return <div className="min-h-screen flex items-center justify-center text-2xl">Blog not found.</div>;
    }

    return (
        <div className={isBlogDarkMode ? 'min-h-screen bg-gray-900 text-white transition-colors duration-300' : 'min-h-screen bg-gray-100 text-gray-900 transition-colors duration-300'}>
            <div className="flex justify-end px-4 pt-4">
                <button
                    onClick={() => setIsBlogDarkMode((prev) => !prev)}
                    className="rounded-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow hover:shadow-md transition"
                    aria-label="Toggle blog theme"
                >
                    {isBlogDarkMode ? (
                        <i className="ri-sun-line text-xl" />
                    ) : (
                        <i className="ri-moon-line text-xl" />
                    )}
                </button>
            </div>
            {/* Hero Section */}
            <section ref={heroRef} className={isBlogDarkMode ? "w-full flex flex-col items-center justify-center py-16 bg-gray-900 border-b border-gray-800 relative overflow-hidden" : "w-full flex flex-col items-center justify-center py-16 bg-white border-b border-gray-200 relative overflow-hidden"} style={{minHeight:'420px'}}>
                <ThreeHero className="absolute left-8 top-8 md:left-16 md:top-10" width={180} height={180} />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className={isBlogDarkMode ? "text-4xl md:text-5xl font-bold mb-2 text-center text-blue-200" : "text-4xl md:text-5xl font-bold mb-2 text-center text-blue-700"}>{blog.title}</h1>
                    <p className={isBlogDarkMode ? "text-lg md:text-xl text-gray-300 mb-6 text-center" : "text-lg md:text-xl text-gray-600 mb-6 text-center"}>By {blog.author?.firstName} {blog.author?.lastName}</p>
                </div>
            </section>
            {/* Blog Content */}
            <section className="container px-4 py-12 mx-auto">
                {/* ...rest of the blog content... */}
            </section>
        </div>
    );
}

const ThemedSingleBlogPage = () => (
    <BlogThemeProvider>
        <SingleBlogPageContent />
    </BlogThemeProvider>
);

export default ThemedSingleBlogPage;