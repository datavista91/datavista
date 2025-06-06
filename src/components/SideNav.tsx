import { Link } from 'react-router-dom'
import { ChartBar, FileText, House, Settings, Share2, X } from 'lucide-react'

interface SideNavProps {
   isOpen: boolean
   setIsOpen: (open: boolean) => void
}

const SideNav = ({ isOpen, setIsOpen }: SideNavProps) => {
   const navItems = [
      { name: 'Dashboard', icon: <House size={20} />, path: '/dashboard' },
      { name: 'Visualizations', icon: <ChartBar size={20} />, path: '/visualizations' },
      { name: 'Smart Reports', icon: <FileText size={20} />, path: '/reports' },
      { name: 'Presentations', icon: <Share2 size={20} />, path: '/share' },
      { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
   ]

   return (
      <div
         className={`${
            isOpen ? 'translate-x-0' : '-translate-x-full'
         } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-30 w-64 bg-surface border-r border-main transition-transform duration-300 ease-in-out flex flex-col`}
      >
         <div className='flex items-center justify-between p-4 border-b border-main'>
            <Link
               to='/'
               className='flex items-center space-x-2'
            >
               <div className='flex items-center justify-center w-8 h-8 bg-cyan rounded-lg'>
                  <svg
                     width={14}
                     height={14}
                     viewBox='0 0 1920 1084'
                     fill='white'
                     xmlns='http://www.w3.org/2000/svg'
                  >
                     <g clipPath='url(#clip0_6727_1730)'>
                        <path
                           d='M496.36 933.52V714.848C496.36 561.289 291.434 507.242 214.842 640.703L139.842 771.304C118.857 807.887 71.5077 820.157 35.068 798.026C-0.0838509 776.723 -9.85666 729.978 10.5223 694.373L365.525 76.1461C442.117 -57.2398 647.043 -3.26819 647.043 150.367V369.866C647.043 523.35 851.893 577.397 928.56 444.162L1140.46 75.6945C1217.12 -57.6162 1421.97 -3.56926 1421.97 149.99V371.071C1421.97 524.555 1626.67 578.602 1703.42 445.442L1780.23 312.131C1801.29 275.623 1848.64 263.353 1885.01 285.559C1920.16 307.012 1929.86 353.682 1909.4 389.287L1552.73 1008.42C1475.99 1141.58 1271.29 1087.53 1271.29 934.047V713.719C1271.29 560.235 1066.44 506.188 989.773 639.423L777.877 1007.89C701.21 1141.2 496.36 1087.15 496.36 933.595V933.52Z'
                           fill='white'
                        />
                     </g>
                     <defs>
                        <clipPath id='clip0_6727_1730'>
                           <rect
                              width='1920'
                              height='1084'
                              fill='white'
                           />
                        </clipPath>
                     </defs>
                  </svg>
               </div>
               <div>
                  <div
                     className='font-bold text-lg text-main'
                     style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                     AIDash
                  </div>
                  <div className='text-xs text-secondary'>Data Analytics</div>
               </div>
            </Link>
            <button
               onClick={() => setIsOpen(false)}
               className='md:hidden text-secondary'
            >
               <X size={20} />
            </button>
         </div>

         <nav className='mt-6 flex-1 px-2 space-y-1'>
            {navItems.map((item) => (
               <Link
                  key={item.name}
                  to={item.path}
                  className='flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-cyan/10 text-main hover:text-cyan transition-colors'
               >
                  <span className='text-secondary mr-3'>{item.icon}</span>
                  {item.name}
               </Link>
            ))}
         </nav>

         <div className='p-4'>
            <div className='p-4 bg-cyan rounded-lg text-main'>
               <h4 className='font-semibold mb-1'>Upgrade to Pro</h4>
               <p className='text-xs text-cyan-dark mb-3'>Get advanced analytics and unlimited reports</p>
               <button className='w-full py-1.5 bg-main text-cyan rounded-md text-sm font-medium'>Upgrade</button>
            </div>
         </div>
      </div>
   )
}

export default SideNav
