import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          <div className="absolute inset-0 bg-[url('https://mocha-cdn.com/opacity-10-grid.png')] bg-center"></div>
          
          <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:py-32 lg:px-16">
            <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-2 lg:gap-x-12">
              <div>
                <h2 
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Ready to transform your data workflow?
                </h2>
                <p className="mt-6 text-lg text-purple-100">
                  Join thousands of data professionals who use DataVista to unlock insights and create impactful presentations.
                </p>
                
                <ul className="mt-8 space-y-3">
                  {['No coding required', 'Immediate insights', 'Beautiful visualizations', 'Easy-to-share reports'].map((item, index) => (
                    <li key={index} className="flex items-center text-purple-100">
                      <svg className="h-5 w-5 mr-2 text-purple-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => navigate('/signup')}
                    className="rounded-md bg-white px-6 py-3 text-base font-medium text-purple-700 shadow-sm hover:bg-purple-50 focus:outline-none"
                  >
                    Get started for free <ArrowRight className="inline ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="relative rounded-2xl bg-white/10 backdrop-blur p-2">
                  <img 
                    src="https://images.unsplash.com/photo-1638183377142-8989e58db7d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" 
                    alt="Analytics dashboard" 
                    className="w-full max-w-md rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
