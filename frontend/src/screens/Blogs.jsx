import { useEffect, useState, useRef } from 'react';
import axios from '../config/axios';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import 'remixicon/fonts/remixicon.css';
import { Button, Card, CardHeader, CardBody, CardFooter, Image, Select, SelectItem } from "@heroui/react";
import HeroAnimation from "../components/HeroAnimation";

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('/api/blogs');
                setBlogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    useEffect(() => {
        if (!loading) {
            anime({
                targets: heroRef.current,
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1500,
                easing: 'easeOutExpo'
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '.blog-card',
                            translateY: [100, 0],
                            opacity: [0, 1],
                            delay: anime.stagger(100),
                            easing: 'easeOutExpo'
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => {
                if (containerRef.current) {
                    observer.unobserve(containerRef.current);
                }
            };
        }
    }, [loading]);

    const handleMouseEnter = (e) => {
        anime({
            targets: e.currentTarget,
            scale: 1.05,
            duration: 300,
            easing: 'easeOutExpo'
        });
    };

    const handleMouseLeave = (e) => {
        anime({
            targets: e.currentTarget,
            scale: 1,
            duration: 300,
            easing: 'easeOutExpo'
        });
    };

    const topics = ["Tech", "Health", "Travel", "Food", "Lifestyle"];
    const sortOptions = ["Newest", "Oldest", "Popularity"];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div ref={containerRef}>
                <div ref={heroRef} className="relative h-screen flex flex-col justify-center items-center text-center">
                    <HeroAnimation />
                    <h1 className="text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">The Dev's Diary</h1>
                    <p className="text-2xl text-gray-300">
                        Journeys in code, creativity, and community.
                    </p>
                </div>

                <div className="container px-4 py-16 mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex gap-4">
                            <Select placeholder="Filter by Topic" className="w-48">
                                {topics.map((topic) => (
                                    <SelectItem key={topic} value={topic}>
                                        {topic}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select placeholder="Sort by" className="w-48">
                                {sortOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <Button as={Link} href="/blogs/create" color="primary" variant="shadow" size="lg">
                            <i className="ri-add-line mr-2"></i> Create New Post
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center text-2xl font-semibold">Loading...</div>
                    ) : (
                        <div className="blogs-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {blogs.map((blog) => (
                                <div key={blog._id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="blog-card">
                                <Card isPressable isHoverable className="w-full h-full bg-gray-800">
                                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                        <p className="text-tiny uppercase font-bold">{blog.author.firstName} {blog.author.lastName}</p>
                                        <small className="text-default-500">{new Date(blog.createdAt).toLocaleDateString()}</small>
                                        <h4 className="font-bold text-large">{blog.title}</h4>
                                    </CardHeader>
                                    <CardBody className="overflow-visible py-2">
                                        <Image
                                            alt="Card background"
                                            className="object-cover rounded-xl"
                                            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                            width={270}
                                        />
                                    </CardBody>
                                     <CardFooter className="justify-between">
                                        <Link to={`/blogs/${blog._id}`}>
                                            <Button color="primary" variant="light">
                                                Read More
                                            </Button>
                                        </Link>
                                        <div className="flex items-center text-lg">
                                            <i className="mr-2 ri-heart-fill text-red-500"></i> {blog.likes.length}
                                        </div>
                                    </CardFooter>
                                </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
