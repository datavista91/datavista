import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out DataVista',
    features: [
      'Upload up to 5 datasets',
      'Basic visualizations',
      'Export as PDF',
      'Community support'
    ],
    mostPopular: false,
    buttonText: 'Start Free',
    color: 'gray'
  },
  {
    name: 'Pro',
    price: '49',
    description: 'For professionals and small teams',
    features: [
      'Everything in Free',
      'Upload unlimited datasets',
      'Advanced AI insights',
      'Custom charts and dashboards',
      'Priority email support',
      'Team collaboration (up to 3 users)'
    ],
    mostPopular: true,
    buttonText: 'Start Pro Trial',
    color: 'purple'
  },
  {
    name: 'Enterprise',
    price: '199',
    description: 'For organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom integrations',
      'Advanced security features',
      'Team collaboration (unlimited)',
      'Training and onboarding',
      'SLA guarantees'
    ],
    mostPopular: false,
    buttonText: 'Contact Sales',
    color: 'indigo'
  }
];

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();

  const handleSignUp = (plan: string) => {
    navigate('/signup', { state: { selectedPlan: plan } });
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your data needs
          </p>
          
          <div className="mt-8 flex justify-center">
            <div className="relative bg-gray-100 p-1 rounded-full flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`relative py-2 px-6 rounded-full text-sm font-medium ${
                  billingPeriod === 'monthly'
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`relative py-2 px-6 rounded-full text-sm font-medium ${
                  billingPeriod === 'annual'
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Annual <span className="text-green-600 font-bold">-20%</span>
              </button>
              <div 
                className={`absolute inset-0 m-1 pointer-events-none transition-all duration-300 ease-in-out ${
                  billingPeriod === 'annual' ? 'translate-x-full' : 'translate-x-0'
                }`}
                style={{ 
                  width: 'calc(50% - 0.5rem)', 
                  borderRadius: '9999px',
                  background: 'linear-gradient(to right, #8b5cf6, #6366f1)' 
                }}
              />
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.mostPopular 
                  ? 'border-2 border-purple-500 shadow-xl' 
                  : 'border border-gray-200 shadow-md'
              } bg-white`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 left-0 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold text-center">
                  Most Popular
                </div>
              )}
              
              <div className={`px-6 py-8 ${plan.mostPopular ? 'pt-10' : ''}`}>
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">${billingPeriod === 'annual' ? (parseInt(plan.price) * 0.8).toFixed(0) : plan.price}</span>
                  <span className="ml-1 text-gray-600">/month</span>
                </div>
                {billingPeriod === 'annual' && (
                  <div className="mt-1 text-sm text-green-600 font-medium">
                    Billed annually
                  </div>
                )}
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-${plan.color}-100 text-${plan.color}-600`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-8 w-full py-3 px-4 rounded-md flex items-center justify-center text-center ${
                    plan.mostPopular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      : plan.name === 'Free' 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  } font-medium`}
                  onClick={() => handleSignUp(plan.name)}
                >
                  {plan.buttonText}
                  <ChevronRight className="ml-1 w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-lg font-medium text-gray-900">Need a custom solution?</h3>
          <p className="mt-2 text-gray-600">Contact our sales team for a tailored package that meets your specific requirements.</p>
          <button className="mt-4 inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
