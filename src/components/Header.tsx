import { Bell, LogOut, Menu, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
   toggleSidebar: () => void
}

const mapActiveSectionHeader = {
   dashboard: 'Dashboard',
   visualizations: 'Visualizations',
   reports: 'Smart Reports',
   share: 'Presentations',
   history: 'Analysis History',
}

const mapActiveSectionDescription = {
   dashboard: 'AI Powered Analytics Dashboard',
   visualizations: 'Data visualizations and charts',
   reports: 'AI-powered insights and analysis',
   share: 'AI-generated presentations and reports',
   history: 'Analytics history and saved results',
}

const Header = ({ toggleSidebar }: HeaderProps) => {
   const { user, logout } = useAuth()
   const [showUserMenu, setShowUserMenu] = useState(false)
   const [activeSectionHeader, setActiveSectionHeader] = useState('Dashboard')
   const [activeSectionDescription, setActiveSectionDescription] = useState('AI Powered Analytics Dashboard')
   const location = useLocation()

   useEffect(() => {
      const link = document.createElement('link')
      link.href =
         'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      return () => {
         document.head.removeChild(link)
      }
   }, [])

   useEffect(() => {
      // Set active section based on current path
      const path = location.pathname.split('/')[1] || 'dashboard'

      setActiveSectionHeader(mapActiveSectionHeader[path as keyof typeof mapActiveSectionHeader] || 'Dashboard')
      setActiveSectionDescription(
         mapActiveSectionDescription[path as keyof typeof mapActiveSectionDescription] ||
            'AI Powered Analytics Dashboard'
      )
   }, [window.location.pathname])

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Handle search input change
      console.log('Search:', e.target.value)
   }

   return (
      <header className='bg-white border-b border-gray-200 shadow-sm'>
         <div className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between '>
            <div>
               <h1
                  className='text-lg font-bold text-gray-900'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
               >
                  {activeSectionHeader.charAt(0).toUpperCase() + activeSectionHeader.slice(1)}
               </h1>
               <p className='text-gray-600 text-xs'>{activeSectionDescription}</p>
            </div>

            {/* {location.pathname.split('/')[1] === 'history' && (
               <div className='hidden md:flex ml-4 md:ml-0'>
                  <div className='relative'>
                     <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Search className='h-4 w-4 text-gray-400' />
                     </div>
                     <input
                        type='text'
                        placeholder='Search...'
                        className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition duration-150 ease-in-out sm:text-sm'
                        onChange={handleSearchChange}
                     />
                  </div>
               </div>
            )} */}

            <div className='flex items-center space-x-4'>
               <button className='text-gray-500 hover:text-gray-700 focus:outline-none'>
                  <Bell size={20} />
               </button>

               <div className='relative'>
                  <button
                     onClick={() => setShowUserMenu(!showUserMenu)}
                     className='h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden'
                  >
                     {user?.photoURL ? (
                        <img
                           src={user.photoURL}
                           alt={user.name || 'User'}
                           className='h-8 w-8 rounded-full object-cover'
                        />
                     ) : user?.name ? (
                        <span className='text-sm font-medium'>{user.name.charAt(0)}</span>
                     ) : (
                        <User size={16} />
                     )}
                  </button>

                  {showUserMenu && (
                     <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                        <div className='py-1'>
                           <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-100'>
                              <div className='font-medium'>{user?.name}</div>
                              <div className='text-gray-500'>{user?.email}</div>
                           </div>
                           <button
                              onClick={logout}
                              className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                           >
                              <LogOut
                                 size={16}
                                 className='mr-2 text-gray-500'
                              />
                              Sign out
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </header>
   )
}

export default Header
