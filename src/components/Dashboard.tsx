import { useState } from 'react'
import { ChartBar, ChartPie, CloudUpload, FileText, TrendingUp } from 'lucide-react'
import FileUploader from './FileUploader'
import DataPreview from './DataPreview'
import InsightCard from './InsightCard'
import ChartPanel from './ChartPanel'
import { useData } from '../context/DataContext'
import { motion } from 'framer-motion'

const Dashboard = () => {
   const { data, hasData } = useData()
   const [activeSection, setActiveSection] = useState('upload')

   // Sample insights for demonstration
   const sampleInsights = [
      {
         title: 'Key Trends',
         description: 'Sales are growing 24% month-over-month with strongest performance in Q4.',
         icon: (
            <TrendingUp
               size={20}
               className='text-emerald-500'
            />
         ),
         color: 'emerald',
      },
      {
         title: 'Distribution Analysis',
         description: 'Product A accounts for 42% of total revenue across all regions.',
         icon: (
            <ChartPie
               size={20}
               className='text-blue-500'
            />
         ),
         color: 'blue',
      },
      {
         title: 'Performance Metrics',
         description: 'Customer acquisition cost has decreased by 18% since implementing new strategy.',
         icon: (
            <ChartBar
               size={20}
               className='text-purple-500'
            />
         ),
         color: 'purple',
      },
      {
         title: 'Recommendations',
         description: 'Consider reallocating 15% of marketing budget from Channel B to Channel A.',
         icon: (
            <FileText
               size={20}
               className='text-amber-500'
            />
         ),
         color: 'amber',
      },
   ]

   return (
      <div className='h-full'>
         {!hasData ? (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className='flex h-full items-center justify-center'
            >
               <FileUploader />
            </motion.div>
         ) : (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.5 }}
               className='space-y-6'
            >
               <div className='flex flex-col md:flex-row md:items-center md:justify-between bg-yellow-500'>
                  <div>
                     <h1
                        className='text-2xl font-bold text-gray-900'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                     >
                        Dashboard
                     </h1>
                     <p className='text-gray-600'>Your AI-powered analytics and insights</p>
                  </div>
                  <div className='mt-4 md:mt-0 flex space-x-3'>
                     <button className='px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
                        Download PDF
                     </button>
                     <button className='px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700'>
                        Create Presentation
                     </button>
                  </div>
               </div>

               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {sampleInsights.map((insight, index) => (
                     <InsightCard
                        key={index}
                        title={insight.title}
                        description={insight.description}
                        icon={insight.icon}
                        color={insight.color}
                     />
                  ))}
               </div>

               <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='border-b border-gray-200'>
                     <nav className='flex'>
                        <button
                           onClick={() => setActiveSection('data')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'data'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Data Preview
                        </button>
                        <button
                           onClick={() => setActiveSection('charts')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'charts'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Visualizations
                        </button>
                        <button
                           onClick={() => setActiveSection('upload')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'upload'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Upload New
                        </button>
                     </nav>
                  </div>
                  <div className='p-4'>
                     {activeSection === 'data' && <DataPreview />}
                     {activeSection === 'charts' && <ChartPanel />}
                     {activeSection === 'upload' && (
                        <div className='py-8 flex justify-center'>
                           <FileUploader compact />
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         )}
      </div>
   )
}

export default Dashboard
