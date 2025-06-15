import { ChartBar, FileUp, Presentation, Share2, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
   {
      icon: <FileUp className='h-6 w-6 text-purple-600' />,
      title: 'One-Click Data Import',
      description: 'Simply upload your CSV, Excel, or Google Sheets files and get instant analysis.',
   },
   {
      icon: <Sparkles className='h-6 w-6 text-indigo-600' />,
      title: 'AI-Powered Analysis',
      description: 'Our AI analyzes your data to discover patterns, trends, and actionable insights.',
   },
   {
      icon: <ChartBar className='h-6 w-6 text-blue-600' />,
      title: 'Interactive Visualizations',
      description: 'Explore your data through beautiful, customizable charts and dashboards.',
   },
   {
      icon: <Presentation className='h-6 w-6 text-teal-600' />,
      title: 'Presentation Ready',
      description: 'Generate polished reports and presentations with a single click.',
   },
   {
      icon: <Zap className='h-6 w-6 text-amber-600' />,
      title: 'Real-time Collaboration',
      description: 'Work together with your team on data projects in real-time.',
   },
   {
      icon: <Share2 className='h-6 w-6 text-red-600' />,
      title: 'Easy Sharing',
      description: 'Share insights with stakeholders through secure, customizable links.',
   },
]

const container = {
   hidden: { opacity: 0 },
   show: {
      opacity: 1,
      transition: {
         staggerChildren: 0.1,
      },
   },
}

// Additional animation for hover effect
const hoverAnimation = {
   rest: { scale: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
   hover: {
      scale: 1.03,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' },
   },
}

const FeaturesSection = () => {
   return (
      <section className='bg-white py-24'>
         <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='text-center max-w-3xl mx-auto'>
               <h2
                  className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
               >
                  Turn Data into Decisions
               </h2>
               <p className='mt-4 text-lg text-gray-600'>
                  DataVista streamlines your workflow from raw data to actionable insights
               </p>
            </div>

            <motion.div
               className='mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3'
               variants={container}
               initial='hidden'
               whileInView='show'
               viewport={{ once: true, amount: 0.1 }}
            >
               {features.map((feature, index) => (
                  <motion.div
                     key={index}
                     // variants={item}
                     initial='rest'
                     whileHover='hover'
                     animate='rest'
                     variants={hoverAnimation}
                     className='relative rounded-2xl border border-gray-200 bg-white p-8'
                  >
                     <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50'>
                        {feature.icon}
                     </div>
                     <h3 className='text-xl font-semibold text-gray-900'>{feature.title}</h3>
                     <p className='mt-2 text-gray-600'>{feature.description}</p>
                  </motion.div>
               ))}
            </motion.div>
         </div>
      </section>
   )
}

export default FeaturesSection
