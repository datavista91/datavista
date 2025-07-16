import { Bell, LogOut, Menu, Search, User, Crown, Zap, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'

interface HeaderProps {
   toggleSidebar: () => void
}

const Header = ({ toggleSidebar }: HeaderProps) => {
   const { user, logout } = useAuth()
   const { isPro, isEnterprise } = useSubscription()
   const [showUserMenu, setShowUserMenu] = useState(false)

   // Get plan display info
   const getPlanInfo = () => {
      if (isEnterprise) {
         return {
            name: 'Enterprise',
            icon: <Crown size={14} />,
            bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
            textColor: 'text-white',
         }
      }
      if (isPro) {
         return {
            name: 'Pro',
            icon: <Zap size={14} />,
            bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
            textColor: 'text-white',
         }
      }
      return {
         name: 'Free',
         icon: <Star size={14} />,
         bgColor: 'bg-gray-100',
         textColor: 'text-gray-600',
      }
   }

   const planInfo = getPlanInfo()

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

   return (
      <header className='bg-white border-b border-gray-200 shadow-sm'>
         <div className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
            <div className='flex items-center'>
               <button
                  onClick={toggleSidebar}
                  className='text-gray-600 focus:outline-none lg:hidden'
               >
                  <Menu size={20} />
               </button>
               <div className='hidden md:flex ml-4 md:ml-0'>
                  <div className='relative'>
                     <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Search className='h-4 w-4 text-gray-400' />
                     </div>
                     <input
                        type='text'
                        placeholder='Search...'
                        className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition duration-150 ease-in-out sm:text-sm'
                     />
                  </div>
               </div>
            </div>

            <div className='flex items-center space-x-4'>
               <button className='text-gray-500 hover:text-gray-700 focus:outline-none'>
                  <Bell size={20} />
               </button>

               <div className='relative'>
                  <button
                     onClick={() => setShowUserMenu(!showUserMenu)}
                     className='h-8 w-8 rounded-full border-2 border-blue-600 flex items-center justify-center text-white overflow-hidden'
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
                     <div className='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                        <div className='py-1'>
                           <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-100'>
                              <div className='font-medium'>{user?.name}</div>
                              <div className='text-gray-500 text-xs'>{user?.email}</div>

                              {/* Plan Indicator in Menu */}
                              <div
                                 className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${planInfo.bgColor} ${planInfo.textColor}`}
                              >
                                 {planInfo.icon}
                                 <span>{planInfo.name} Plan</span>
                              </div>
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
