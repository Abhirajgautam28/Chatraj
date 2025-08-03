import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "ChatRaj has been a game-changer for our team. The AI-powered code suggestions and real-time collaboration have significantly improved our productivity.",
    author: "John Doe",
    title: "Software Engineer, Google"
  },
  {
    quote: "I love the clean and modern UI of ChatRaj. It's so easy to use and has all the features I need to be productive.",
    author: "Jane Smith",
    title: "Frontend Developer, Microsoft"
  },
  {
    quote: "The multi-language support in ChatRaj is amazing. I can now collaborate with my team in my preferred language.",
    author: "Peter Jones",
    title: "Backend Developer, Amazon"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-800 dark:text-white">What Our Users Say</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800"
            >
              <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">&quot;{testimonial.quote}&quot;</p>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
