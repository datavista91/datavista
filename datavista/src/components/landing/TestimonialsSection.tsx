import { motion } from 'framer-motion';

const testimonials = [
  {
    content: "DataVista transformed how we analyze customer data. What used to take days now takes minutes, and the insights are incredible.",
    author: "Sarah Johnson",
    position: "Director of Analytics, TechCorp",
    image: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    content: "As a researcher, I need to quickly make sense of complex datasets. DataVista not only saves me time but helps me discover patterns I would have missed.",
    author: "Dr. Michael Chen",
    position: "Data Scientist, University Research",
    image: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    content: "The presentation export feature is a game-changer. I can go from raw sales data to a boardroom-ready presentation in under 15 minutes.",
    author: "Emma Rodriguez",
    position: "VP Sales, Global Retail",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-indigo-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Trusted by Data Professionals
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our users are saying about DataVista
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl bg-white p-8 shadow-sm border border-gray-200"
            >
              <div className="absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/4 text-purple-200 opacity-50">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 0C14.327 0 0 14.327 0 32C0 49.673 14.327 64 32 64C49.673 64 64 49.673 64 32C64 14.327 49.673 0 32 0ZM16.769 41.6L16 38.4L19.2 36.8L20.8 29.6H15.2V22.4H25.6L23.2 36.8H26.4L27.169 41.6H16.769ZM41.6 41.6L40.831 38.4L44.031 36.8L45.631 29.6H40.031V22.4H50.431L48.031 36.8H51.231L52 41.6H41.6Z" />
                </svg>
              </div>
              <p className="relative text-gray-600 mb-8">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
