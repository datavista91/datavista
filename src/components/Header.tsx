import { Bell, LogOut, User, CheckCircle, Crown, Zap, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { useSubscription } from '../hooks/useSubscription'

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

const Header = () => {
   const { user, logout } = useAuth()
   const { isPro, isEnterprise } = useSubscription()
   const [showUserMenu, setShowUserMenu] = useState(false)
   const [showNotificationPanel, setShowNotificationPanel] = useState(false)
   const [notifications, setNotifications] = useState<any[]>([])
   const [unreadCount, setUnreadCount] = useState(0)
   const [selectedNotification, setSelectedNotification] = useState<any>(null)
   // Fetch notifications from Firebase Feedback collection and sync with localStorage
   useEffect(() => {
      const fetchNotifications = async () => {
         const db = getFirestore()
         const feedbackRef = collection(db, 'feedbacks')
         const snapshot = await getDocs(feedbackRef)
         const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
         // Get read status from localStorage
         const userKey = `notifications_${user?.email}`
         const local = JSON.parse(localStorage.getItem(userKey) || '{}')
         const merged = fetched.map((n) => ({ ...n, read: local[n.id]?.read || false }))
         setNotifications(merged)
         setUnreadCount(merged.filter((n) => !n.read).length)
      }
      if (user?.email) fetchNotifications()
   }, [user?.email])

   // Save read status to localStorage
   const markAsRead = (id: string) => {
      const userKey = `notifications_${user?.email}`
      const local = JSON.parse(localStorage.getItem(userKey) || '{}')
      local[id] = { read: true }
      localStorage.setItem(userKey, JSON.stringify(local))
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount(notifications.filter((n) => !n.read && n.id !== id).length)
   }

   const markAllAsRead = () => {
      const userKey = `notifications_${user?.email}`
      const local: { [key: string]: { read: boolean } } = {}
      notifications.forEach((n) => {
         local[n.id] = { read: true }
      })
      localStorage.setItem(userKey, JSON.stringify(local))
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
   }
   const [activeSectionHeader, setActiveSectionHeader] = useState('Dashboard')
   const [activeSectionDescription, setActiveSectionDescription] = useState('AI Powered Analytics Dashboard')
   const location = useLocation()

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

   useEffect(() => {
      // Set active section based on current path
      const path = location.pathname.split('/')[1] || 'dashboard'

      setActiveSectionHeader(mapActiveSectionHeader[path as keyof typeof mapActiveSectionHeader] || 'Dashboard')
      setActiveSectionDescription(
         mapActiveSectionDescription[path as keyof typeof mapActiveSectionDescription] ||
            'AI Powered Analytics Dashboard'
      )
   }, [window.location.pathname])

   // ...existing code...

   return (
      <header className='bg-white border-b border-gray-200 shadow-sm'>
         <div className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between '>
            <div>
               <h1 className='dashboard-heading text-gray-900'>
                  {activeSectionHeader.charAt(0).toUpperCase() + activeSectionHeader.slice(1)}
               </h1>
               <p className='dashboard-small-text text-gray-600'>{activeSectionDescription}</p>
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
               <button
                  className='relative text-gray-500 hover:text-gray-700 focus:outline-none'
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
               >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                     <span className='absolute -top-1 right-0 block h-3 w-3 rounded-full bg-blue-500 border-2 border-white'></span>
                  )}
               </button>

               {/* Notification Panel */}
               {showNotificationPanel && (
                  <div className='absolute right-16 top-14 w-96 max-h-[60vh] overflow-y-auto rounded-lg shadow-lg bg-white border border-blue-100 z-20'>
                     <div className='flex justify-between items-center px-4 py-2 border-b bg-blue-50'>
                        <span className='dashboard-section-title text-blue-700'>Notifications</span>
                        <button
                           className='dashboard-small-text text-blue-600 hover:underline'
                           onClick={markAllAsRead}
                        >
                           Read All
                        </button>
                     </div>
                     {notifications.length === 0 ? (
                        <div className='p-4 text-gray-500 dashboard-body'>No notifications</div>
                     ) : (
                        notifications.map((n) => (
                           <div
                              key={n.id}
                              className={`flex items-start px-4 py-3 border-b last:border-b-0 cursor-pointer ${
                                 n.read ? 'bg-white' : 'bg-blue-50'
                              }`}
                              onClick={() => {
                                 setSelectedNotification(n)
                                 markAsRead(n.id)
                              }}
                           >
                              <div className='flex-1'>
                                 <div className='dashboard-section-title text-gray-900'>{n.title || 'Notification'}</div>
                                 <div className='text-gray-600 dashboard-small-text'>{n.message || n.content}</div>
                                 <div className='text-gray-400 dashboard-small-text mt-1'>
                                    {n.date
                                       ? new Date(n.date.seconds ? n.date.seconds * 1000 : n.date).toLocaleString()
                                       : ''}
                                 </div>
                              </div>
                              {!n.read && (
                                 <span className='ml-2 mt-1'>
                                    <CheckCircle
                                       size={16}
                                       className='text-blue-400'
                                    />
                                 </span>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               )}

               {/* Custom Notification Modal */}
               {selectedNotification && (
                  <div className='fixed inset-0 z-50 flex items-center justify-center '>
                     <div
                        className='fixed inset-0 bg-black bg-opacity-30 '
                        onClick={() => setSelectedNotification(null)}
                     ></div>
                     <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-blue-200 relative z-10'>
                        <h2 className='dashboard-heading text-blue-700 mb-2'>
                           {selectedNotification.title || 'Notification'}
                        </h2>
                        <p className='dashboard-body text-gray-700 mb-4'>
                           {selectedNotification.message || selectedNotification.content}
                        </p>
                        <div className='dashboard-small-text text-gray-400 mb-4'>
                           {selectedNotification.date
                              ? new Date(
                                   selectedNotification.date.seconds
                                      ? selectedNotification.date.seconds * 1000
                                      : selectedNotification.date
                                ).toLocaleString()
                              : ''}
                        </div>
                        <button
                           className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dashboard-body font-medium'
                           onClick={() => setSelectedNotification(null)}
                        >
                           Close
                        </button>
                     </div>
                  </div>
               )}

               <div className='relative'>
                  <button
                     onClick={() => setShowUserMenu(!showUserMenu)}
                     className='h-8 w-8 rounded-full border-2 border-blue-600 flex items-center justify-center text-white overflow-hidden'
                  >
                     {user?.photoURL ? (
                        <img
                           src={user.photoURL}
                           alt={user.name || 'User'}
                           className='h-10 w-10 rounded-full object-cover'
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
                           <div className='px-4 py-2 dashboard-body text-gray-700 border-b border-gray-100'>
                              <div className='dashboard-section-title'>{user?.name}</div>
                              <div className='dashboard-small-text text-gray-500'>{user?.email}</div>

                              {/* Plan Indicator in Menu */}
                              <div
                                 className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full dashboard-small-text font-medium mt-2 ${planInfo.bgColor} ${planInfo.textColor}`}
                              >
                                 {planInfo.icon}
                                 <span>{planInfo.name} Plan</span>
                              </div>
                           </div>
                           <button
                              onClick={logout}
                              className='w-full text-left px-4 py-2 dashboard-body text-gray-700 hover:bg-gray-100 flex items-center'
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
