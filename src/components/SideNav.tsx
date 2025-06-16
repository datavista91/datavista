import { Link, useNavigate, useLocation } from 'react-router-dom'
import { House, X, Clock, Sparkles, BarChart3, TrendingUp, Presentation, Database } from 'lucide-react'
import { motion } from 'framer-motion'

interface SideNavProps {
   isOpen: boolean
   setIsOpen: (open: boolean) => void
}

const SideNav = ({ isOpen, setIsOpen }: SideNavProps) => {
   const navigate = useNavigate()
   const location = useLocation()

   const navItems = [
      {
         name: 'Dashboard',
         icon: <House size={20} />,
         path: '/dashboard',
         description: 'Overview & Analytics',
         color: 'text-blue-600',
         bgColor: 'bg-blue-50',
         borderColor: 'border-blue-200',
      },
      {
         name: 'Visualizations',
         icon: <BarChart3 size={20} />,
         path: '/visualizations',
         description: 'Charts & Graphs',
         color: 'text-purple-600',
         bgColor: 'bg-purple-50',
         borderColor: 'border-purple-200',
      },
      {
         name: 'Smart Reports',
         icon: <TrendingUp size={20} />,
         path: '/reports',
         description: 'AI Insights',
         color: 'text-emerald-600',
         bgColor: 'bg-emerald-50',
         borderColor: 'border-emerald-200',
      },
      {
         name: 'Presentations',
         icon: <Presentation size={20} />,
         path: '/share',
         description: 'Export & Share',
         color: 'text-indigo-600',
         bgColor: 'bg-indigo-50',
         borderColor: 'border-indigo-200',
      },
      {
         name: 'Analysis History',
         icon: <Clock size={20} />,
         path: '/history',
         description: 'Past Reports',
         color: 'text-orange-600',
         bgColor: 'bg-orange-50',
         borderColor: 'border-orange-200',
      },
   ]

   const bottomNavItems: any[] = []

   return (
      <div
         className={`${
            isOpen ? 'translate-x-0' : '-translate-x-full'
         } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out flex flex-col`}
      >         {/* Header */}
         <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
            <Link
               to='/'
               className='flex items-center space-x-2 group'
            >
               <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow'>
                  <Sparkles className='w-4 h-4 text-white' />
               </div>
               <div>
                  <h1
                     className='text-base font-bold text-gray-900'
                     style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                     DataVista
                  </h1>
                  <p className='text-xs text-gray-500'>AI Analytics</p>
               </div>
            </Link>
            <button
               onClick={() => setIsOpen(false)}
               className='md:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
            >
               <X size={16} />
            </button>
         </div>         {/* Navigation */}
         <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-hidden'>            <div className='mb-4'>
               {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                     <motion.div
                        key={item.path}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                     >
                        <Link
                           to={item.path}
                           className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                              isActive
                                 ? `${item.bgColor} ${item.color} border ${item.borderColor} shadow-sm`
                                 : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                           }`}
                        >
                           <div
                              className={`flex items-center justify-center w-7 h-7 rounded-lg mr-3 transition-colors ${
                                 isActive ? `${item.bgColor} ${item.color}` : 'text-gray-400 group-hover:text-gray-600'
                              }`}
                           >
                              {item.icon}
                           </div>
                           <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                 <span>{item.name}</span>
                                 {isActive && <div className='w-2 h-2 rounded-full bg-current opacity-60'></div>}
                              </div>
                              <p className={`text-xs mt-0.5 ${isActive ? 'text-current opacity-70' : 'text-gray-500'}`}>
                                 {item.description}
                              </p>
                           </div>
                        </Link>
                     </motion.div>
                  )
               })}
            </div>            {/* Data Status */}
            <div className='px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200'>
               <div className='flex items-center space-x-2 mb-2'>
                  <Database className='w-4 h-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-900'>Data Status</span>
               </div>
               <p className='text-xs text-emerald-700 mb-3'>Ready for analysis</p>
               <div className='w-full bg-emerald-200 rounded-full h-1.5'>
                  <div className='bg-emerald-500 h-1.5 rounded-full w-full'></div>
               </div>
            </div>
         </nav>         {/* Bottom Section */}
         <div className='border-t border-gray-200 bg-white p-4 space-y-3'>
            {bottomNavItems.map((item) => {
               const isActive = location.pathname === item.path
               return (
                  <Link
                     key={item.path}
                     to={item.path}
                     className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                     }`}
                  >
                     <div className='mr-3'>{item.icon}</div>
                     <span>{item.name}</span>
                  </Link>
               )
            })}            {/* Upgrade Section - Compact */}
            <div className='pt-2 mt-2 border-t border-gray-100'>
               <div className='p-3 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-lg text-white shadow-lg'>
                  <div className='flex items-center space-x-2 mb-2'>
                     <Sparkles className='w-4 h-4 text-yellow-300' />
                     <h4 className='font-semibold text-sm'>Upgrade to Pro</h4>
                  </div>
                  <p className='text-xs text-purple-200 mb-3 leading-relaxed'>
                     Unlock advanced analytics & premium features
                  </p>
                  <button
                     onClick={() => navigate('/pricing')}
                     className='w-full px-3 py-2 bg-white text-purple-700 rounded-md text-xs font-medium hover:bg-purple-50 transition-all duration-200 shadow-sm'
                  >
                     ✨ Upgrade Now
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}

export default SideNav
