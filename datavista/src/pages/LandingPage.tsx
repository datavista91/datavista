import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import PricingSection from '../components/landing/PricingSection'
import FAQSection from '../components/FAQSection'
import CTASection from '../components/landing/CTASection'

const LandingPage = () => {
   const { user } = useAuth()
   const navigate = useNavigate()

   useEffect(() => {
      // Redirect to dashboard if already logged in
      if (user) {
         navigate('/dashboard', { replace: true })
      }
      // Load fonts
      const link = document.createElement('link')
      link.href =
         'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      return () => {
         document.head.removeChild(link)
      }
   }, [user, navigate])

   return (
      <div className='bg-white'>
         {/* Header */}
         <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200'>
            <nav className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between'>
               <div className='flex items-center'>
                  <a
                     href='/'
                     className='flex items-center space-x-2'
                  >
                     <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg'>
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
                        <span
                           className='font-bold text-lg'
                           style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                           DataVista
                        </span>
                     </div>
                  </a>
               </div>
               <div className='flex items-center space-x-4'>
                  <button
                     onClick={() => navigate('/login')}
                     className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors'
                  >
                     Sign in with Google
                  </button>
               </div>
            </nav>
         </header>
         <main className='pt-16'>
            <HeroSection />
            <div id='features'>
               <FeaturesSection />
            </div>
            <div id='testimonials'>
               <TestimonialsSection />
            </div>
            <div id='pricing'>
               <PricingSection />
            </div>
            <FAQSection />
            <CTASection />
         </main>
         <footer className='bg-gray-50 border-t border-gray-200'>
            <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
               <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
                  <div>
                     <h3 className='font-semibold text-gray-900'>Product</h3>
                     <ul className='mt-4 space-y-2'>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Features
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Pricing
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Templates
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Enterprise
                           </a>
                        </li>
                     </ul>
                  </div>
                  <div>
                     <h3 className='font-semibold text-gray-900'>Resources</h3>
                     <ul className='mt-4 space-y-2'>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Documentation
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Guides
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              API
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Blog
                           </a>
                        </li>
                     </ul>
                  </div>
                  <div>
                     <h3 className='font-semibold text-gray-900'>Company</h3>
                     <ul className='mt-4 space-y-2'>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              About
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Careers
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Contact
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Partners
                           </a>
                        </li>
                     </ul>
                  </div>
                  <div>
                     <h3 className='font-semibold text-gray-900'>Legal</h3>
                     <ul className='mt-4 space-y-2'>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Privacy
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Terms
                           </a>
                        </li>
                        <li>
                           <a
                              href='#'
                              className='text-gray-600 hover:text-gray-900'
                           >
                              Security
                           </a>
                        </li>
                     </ul>
                  </div>
               </div>
               <div className='mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between'>
                  <p className='text-gray-500 text-sm'>&copy; 2025 DataVista, Inc. All rights reserved.</p>
                  <div className='mt-4 md:mt-0 flex space-x-6'>
                     <a
                        href='#'
                        className='text-gray-400 hover:text-gray-500'
                     >
                        <span className='sr-only'>Twitter</span>
                        <svg
                           className='h-6 w-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                           aria-hidden='true'
                        >
                           <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                        </svg>
                     </a>
                     <a
                        href='#'
                        className='text-gray-400 hover:text-gray-500'
                     >
                        <span className='sr-only'>LinkedIn</span>
                        <svg
                           className='h-6 w-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                           aria-hidden='true'
                        >
                           <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
                        </svg>
                     </a>
                     <a
                        href='#'
                        className='text-gray-400 hover:text-gray-500'
                     >
                        <span className='sr-only'>GitHub</span>
                        <svg
                           className='h-6 w-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                           aria-hidden='true'
                        >
                           <path
                              fillRule='evenodd'
                              d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                              clipRule='evenodd'
                           />
                        </svg>
                     </a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   )
}

export default LandingPage
