import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white py-20 md:py-32">
      <div className="absolute inset-0 bg-[url('https://mocha-cdn.com/opacity-10-grid.png')] bg-center opacity-30"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <h1 
                className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Transform Your Data Into <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Powerful Insights</span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                DataVista instantly turns your raw data into AI-powered analytics, visualizations and presentation-ready reports. No code needed.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center rounded-md bg-white px-6 py-3 text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Log in
                </button>
              </div>
            </motion.div>

            <div className="mt-12 flex items-center gap-x-6">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br ${
                    ['from-blue-500 to-purple-500', 
                    'from-pink-500 to-red-500', 
                    'from-green-500 to-teal-500', 
                    'from-yellow-500 to-orange-500'][i]
                  }`}>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">1,000+</span> data experts use DataVista
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                <img 
                  src="https://mocha-cdn.com/dashboard-preview.png" 
                  alt="DataVista Dashboard" 
                  className="w-full h-auto"
                  style={{ maxWidth: '550px' }} 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
