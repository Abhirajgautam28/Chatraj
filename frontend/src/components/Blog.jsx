import { motion } from 'framer-motion';

const blogPosts = [
  {
    title: "The Future of AI in Software Development",
    date: "July 20, 2024",
    excerpt: "In this post, we explore the latest advancements in AI and how they are shaping the future of software development.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "A Deep Dive into Real-time Collaboration",
    date: "July 15, 2024",
    excerpt: "Learn how real-time collaboration can improve your team's productivity and how to implement it in your own projects.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    title: "The Importance of a Good UI/UX",
    date: "July 10, 2024",
    excerpt: "A good UI/UX is essential for any successful product. In this post, we discuss the key principles of a good UI/UX and how to apply them to your own projects.",
    image: "https://images.unsplash.com/photo-1551288049-5da7b85e491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  }
];

const Blog = () => {
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">From Our Blog</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-700"
            >
              <img src={post.image} alt={post.title} className="object-cover w-full h-48" />
              <div className="p-6">
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{post.date}</p>
                <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{post.excerpt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
