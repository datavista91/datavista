import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does DataVista handle my data?',
    answer: 'Your data is processed and analyzed entirely within your browser. We do not store or access your raw data on our servers. This ensures your sensitive information remains confidential and secure.'
  },
  {
    question: 'Can I export my visualizations and reports?',
    answer: 'Yes! DataVista allows you to export your visualizations and insights in multiple formats including PDF reports, PowerPoint presentations, and image files. Premium plans offer additional export options and customization features.'
  },
  {
    question: 'What file formats are supported for data upload?',
    answer: 'DataVista supports CSV, Excel (XLS, XLSX), Google Sheets, and JSON formats. We\'re constantly working to expand our supported file types based on user feedback.'
  },
  {
    question: 'Is there a limit to how much data I can upload?',
    answer: 'Free accounts can upload files up to 5MB in size. Pro accounts increase this limit to 50MB, and Enterprise accounts can upload files up to 500MB. For larger datasets, we recommend chunking the data or contacting our support team for custom solutions.'
  },
  {
    question: 'Do I need to know programming or data science to use DataVista?',
    answer: 'Not at all! DataVista is designed to be accessible to everyone, regardless of technical background. Our AI-powered system automatically analyzes your data and generates insights without requiring any coding or data science expertise.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account settings page. After cancellation, you\'ll continue to have access to premium features until the end of your current billing period.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about DataVista
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            Still have questions? We're here to help.
          </p>
          <button className="mt-4 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
