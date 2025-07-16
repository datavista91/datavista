import { useEffect, useState, useRef } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
   const { user, isLoading } = useAuth()
   const navigate = useNavigate()
   const [currentFeature, setCurrentFeature] = useState(0)
   const [featureAnimKey, setFeatureAnimKey] = useState(0)
   const prevFeature = useRef(0)
   const [isNavOpen, setIsNavOpen] = useState(false)
   // const [loading, setLoading] = useState(true)

   // Contact form state
   const [contactForm, setContactForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
   })
   const [contactLoading, setContactLoading] = useState(false)
   const [contactSuccess, setContactSuccess] = useState(false)
   const [contactError, setContactError] = useState('')

   const features = [
      {
         title: 'Smart Reports',
         description:
            'Discover hidden patterns in your data with AI-powered analytics that reveal actionable insights automatically.',
         image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      },
      {
         title: 'Useful Insights',
         description:
            'Make data-driven decisions with machine learning models that provide precise forecasts and trend analysis.',
         image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
      },
      {
         title: 'Chart Visualizations',
         description:
            'Transform complex data into beautiful, interactive charts and graphs that tell compelling stories.',
         image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      },
      {
         title: 'Presentations',
         description:
            'Create stunning presentations from your data analysis with automated slide generation and professional templates.',
         image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      },
      {
         title: 'Chat with AI - Custom Results',
         description:
            'Get instant answers and custom analysis by chatting with our AI assistant about your specific data needs.',
         image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      },
   ]

   const testimonials = [
      {
         name: 'Sarah Johnson',
         role: 'Data Analyst at TechCorp',
         content: 'DataVista transformed how we analyze our data. The AI insights saved us weeks of manual work.',
         avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      },
      {
         name: 'Michael Chen',
         role: 'Business Intelligence Manager',
         content: 'The visualization capabilities are outstanding. Our presentations have never looked better.',
         avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      },
      {
         name: 'Emily Rodriguez',
         role: 'Marketing Director',
         content: "DataVista's predictive analytics helped us increase our ROI by 40%. Absolutely game-changing.",
         avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      },
   ]

   useEffect(() => {
      // if (user) {
      //    navigate('/dashboard', { replace: true })
      // }

      // Load professional fonts
      const link = document.createElement('link')
      link.href =
         'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      return () => {
         document.head.removeChild(link)
      }
   }, [user, navigate])

   useEffect(() => {
      const handleScroll = () => {
         const featuresSection = document.getElementById('features')
         if (featuresSection) {
            const rect = featuresSection.getBoundingClientRect()
            const sectionHeight = rect.height
            const viewportHeight = window.innerHeight

            // Improved scroll logic for better feature transitions
            if (rect.top <= 0 && rect.bottom >= viewportHeight) {
               const scrollProgress = Math.abs(rect.top) / (sectionHeight - viewportHeight)
               const featureIndex = Math.floor(scrollProgress * features.length)
               const newFeature = Math.max(0, Math.min(features.length - 1, featureIndex))
               if (newFeature !== prevFeature.current) {
                  setFeatureAnimKey((k) => k + 1)
                  prevFeature.current = newFeature
               }
               setCurrentFeature(newFeature)
            }
         }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
   }, [features.length])

   const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId)
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' })
      }
      setIsNavOpen(false)
   }

   // Handle contact form input
   const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setContactForm((prev) => ({ ...prev, [name]: value }))
   }

   // Submit contact form to Firestore
   const handleContactSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setContactLoading(true)
      setContactSuccess(false)
      setContactError('')
      try {
         await addDoc(collection(db, 'contact'), contactForm)
         setContactSuccess(true)
         setContactForm({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      } catch (err: any) {
         setContactError('Failed to send. Please try again.')
      }
      setContactLoading(false)
   }

   return (
      <div
         className='bg-black text-white'
         style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
      >
         {/* Navigation */}
         <nav className='fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-gray-800'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='flex justify-between items-center h-16'>
                  {/* Logo */}
                  <div className='flex items-center space-x-2'>
                     {/* <div className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center'>
                        <svg
                           width='20'
                           height='20'
                           viewBox='0 0 24 24'
                           fill='white'
                        >
                           <path d='M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z' />
                        </svg>
                     </div> */}

                     <img
                        src='/logo2.svg'
                        alt='DataVista Logo'
                        className='w-8 h-8'
                     />

                     <span
                        className='text-2xl font-semibold text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        DataVista
                     </span>
                  </div>

                  {/* Desktop Navigation */}
                  <div className='hidden md:flex items-center sm:space-x-5 lg:space-x-10'>
                     <button
                        onClick={() => scrollToSection('hero')}
                        className='text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Home
                     </button>
                     <button
                        onClick={() => scrollToSection('features')}
                        className='text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Features
                     </button>
                     <button
                        onClick={() => scrollToSection('testimonials')}
                        className='text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Testimonials
                     </button>
                     <button
                        onClick={() => scrollToSection('pricing')}
                        className='text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Pricing
                     </button>
                     <button
                        onClick={() => scrollToSection('contact')}
                        className='text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Contact
                     </button>
                     {isLoading ? (
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2'></div>
                     ) : user ? (
                        <button
                           onClick={() => navigate('/dashboard')}
                           className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Dashboard
                        </button>
                     ) : (
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Sign In
                        </button>
                     )}
                  </div>

                  {/* Mobile menu button */}
                  <button
                     onClick={() => setIsNavOpen(!isNavOpen)}
                     className='md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors'
                  >
                     <svg
                        className='w-6 h-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                     >
                        <path
                           strokeLinecap='round'
                           strokeLinejoin='round'
                           strokeWidth={2}
                           d={isNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                        />
                     </svg>
                  </button>
               </div>

               {/* Mobile Navigation */}
               {isNavOpen && (
                  <div className='md:hidden py-6 border-t border-gray-800'>
                     <div className='flex flex-col space-y-4'>
                        <button
                           onClick={() => scrollToSection('hero')}
                           className='text-left text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        >
                           Home
                        </button>
                        <button
                           onClick={() => scrollToSection('features')}
                           className='text-left text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        >
                           Features
                        </button>
                        <button
                           onClick={() => scrollToSection('testimonials')}
                           className='text-left text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        >
                           Testimonials
                        </button>
                        <button
                           onClick={() => scrollToSection('pricing')}
                           className='text-left text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        >
                           Pricing
                        </button>
                        <button
                           onClick={() => scrollToSection('contact')}
                           className='text-left text-gray-300 hover:text-blue-400 transition-colors font-medium'
                        >
                           Contact
                        </button>
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-fit'
                        >
                           Sign In
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </nav>

         {/* Hero Section */}
         <section
            id='hero'
            className='min-h-screen flex items-center justify-center pt-32 pb-8 bg-gradient-to-br from-black via-gray-900 to-black'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8 text-center'>
               <div className='mb-16'>
                  <h1
                     className='text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-10 leading-tight'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Transform Your Data Into
                     <span className='text-blue-400 block mt-6'>Powerful Insights</span>
                  </h1>

                  <p
                     className='text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Unlock the full potential of your data with AI-powered analytics, stunning visualizations, and
                     automated insights that drive smarter business decisions.
                  </p>
               </div>

               {/* Dashboard Preview Image */}
               <div className='mb-10 relative max-w-6xl mx-auto'>
                  <div className='bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700 hover:border-blue-600/30 transition-all duration-500'>
                     <img
                        // src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                        src='/dashboard2.avif'
                        alt='DataVista Dashboard Preview'
                        className='w-full h-auto rounded-2xl shadow-lg'
                        loading='eager'
                     />
                  </div>
               </div>

               {/* About DataVista */}
               <div className='mb-8 max-w-5xl mx-auto'>
                  <p
                     className='text-lg text-gray-400 mb-10 leading-relaxed'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     DataVista is the next-generation data analytics platform that combines artificial intelligence with
                     intuitive design to help businesses of all sizes make sense of their data. From automated insights
                     to beautiful visualizations, we make data analysis accessible to everyone.
                  </p>
               </div>

               {/* CTA Buttons */}
               <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-8'>
                  {isLoading ? (
                     <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2'></div>
                  ) : user ? (
                     <button
                        onClick={() => navigate('/login')}
                        className='bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Dashboard
                     </button>
                  ) : (
                     <button
                        onClick={() => navigate('/login')}
                        className='bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Start Now
                     </button>
                  )}
                  <button
                     onClick={() => scrollToSection('features')}
                     className='border-2 border-gray-600 text-gray-300 px-12 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-400 transition-all duration-300'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Watch Demo
                  </button>
               </div>
            </div>
         </section>

         {/* Features Section with Fixed Scroll Effect */}
         <section
            id='features'
            className='pt-24 relative bg-gradient-to-br from-black via-gray-900 to-black'
            style={{ height: '600vh' }}
         >
            <div className='sticky top-0 h-screen flex items-center justify-center py-8'>
               <div className='max-w-7xl mx-auto px-6 lg:px-8 w-full'>
                  <div className='text-center mb-16 mt-8'>
                     <h2
                        className='text-4xl md:text-6xl font-bold text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Why Us?
                     </h2>
                  </div>
                  <div className='grid lg:grid-cols-2 gap-20 items-center h-full'>
                     {/* Content Side */}
                     {/* <div className='space-y-12'> */}
                     <div
                        key={featureAnimKey}
                        className='bg-gray-900/90 backdrop-blur-sm p-10 rounded-3xl border border-gray-700 hover:border-blue-600/30 transition-all duration-500 h-96 animate-fade-slide-up'
                     >
                        <h2
                           className='text-4xl md:text-6xl font-bold mb-10 text-white'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           {features[currentFeature].title}
                        </h2>
                        <p
                           className='text-xl text-gray-300 leading-relaxed'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           {features[currentFeature].description}
                        </p>
                     </div>

                     {/* Image Side */}
                     <div
                        key={featureAnimKey + '-img'}
                        className='relative animate-fade-slide-up'
                     >
                        <img
                           src={features[currentFeature].image}
                           alt={features[currentFeature].title}
                           className='w-full h-96 object-cover rounded-2xl shadow-2xl transition-all duration-500'
                           loading='lazy'
                        />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Testimonials Section */}
         <section
            id='testimonials'
            className='py-24 bg-gradient-to-br from-black via-gray-900 to-black'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-20'>
                  <h2
                     className='text-4xl md:text-6xl font-bold text-white mb-8'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     What Our Users Say
                  </h2>
                  <p
                     className='text-xl text-gray-400 max-w-3xl mx-auto'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     See how DataVista is transforming businesses worldwide
                  </p>
               </div>

               <div className='grid md:grid-cols-3 gap-8'>
                  {testimonials.map((testimonial, index) => (
                     <div
                        key={index}
                        className='bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-blue-600/50 transition-all duration-300 hover:scale-105'
                     >
                        <div className='flex items-center mb-6'>
                           <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className='w-14 h-14 rounded-full object-cover mr-4'
                              loading='lazy'
                           />
                           <div>
                              <h4
                                 className='font-semibold text-white'
                                 style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                              >
                                 {testimonial.name}
                              </h4>
                              <p
                                 className='text-gray-400 text-sm'
                                 style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                              >
                                 {testimonial.role}
                              </p>
                           </div>
                        </div>
                        <p
                           className='text-gray-300 leading-relaxed'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           {testimonial.content}
                        </p>
                        <div className='mt-6 flex text-blue-400'>
                           {[...Array(5)].map((_, i) => (
                              <svg
                                 key={i}
                                 className='w-5 h-5 fill-current'
                                 viewBox='0 0 20 20'
                              >
                                 <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                              </svg>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Pricing Section */}
         <section
            id='pricing'
            className='py-24 bg-gradient-to-br from-black via-gray-900 to-black'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-20'>
                  <h2
                     className='text-4xl md:text-6xl font-bold text-white mb-8'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Simple Pricing
                  </h2>
                  <p
                     className='text-xl text-gray-400 max-w-3xl mx-auto'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Choose the plan that's right for your business
                  </p>
               </div>

               <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                  {/* Free Plan */}
                  <div className='bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300'>
                     <h3
                        className='text-2xl font-bold mb-6 text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Free
                     </h3>
                     <div className='mb-8'>
                        <span
                           className='text-4xl font-bold text-white'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           $0
                        </span>
                        <span
                           className='text-gray-400'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           /month
                        </span>
                     </div>
                     <ul className='space-y-4 mb-8'>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Upload up to 5 datasets
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Basic visualizations
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Export as PDF
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Community support
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           10 AI requests/day
                        </li>
                     </ul>
                     <button
                        className='w-full bg-gray-700 text-white py-3 rounded-lg font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        disabled
                     >
                        Current Plan
                     </button>
                  </div>

                  {/* Pro Plan - Highlighted */}
                  <div className='bg-blue-600/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-blue-600 relative transform scale-105'>
                     <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                        <span
                           className='bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Most Popular
                        </span>
                     </div>
                     <h3
                        className='text-2xl font-bold mb-6 text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Pro
                     </h3>
                     <div className='mb-8'>
                        <span
                           className='text-4xl font-bold text-white'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           $49
                        </span>
                        <span
                           className='text-gray-400'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           /month
                        </span>
                     </div>
                     <ul className='space-y-4 mb-8'>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Everything in Free
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Upload unlimited datasets
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Advanced AI insights (500 requests/day)
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Custom charts and dashboards
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Priority email support
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Team collaboration (up to 3 users)
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Advanced data export options
                        </li>
                     </ul>
                     <button
                        className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Upgrade to Pro
                     </button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className='bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300'>
                     <h3
                        className='text-2xl font-bold mb-6 text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Enterprise
                     </h3>
                     <div className='mb-8'>
                        <span
                           className='text-4xl font-bold text-white'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           $199
                        </span>
                        <span
                           className='text-gray-400'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           /month
                        </span>
                     </div>
                     <ul className='space-y-4 mb-8'>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Everything in Pro
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Unlimited AI requests
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Dedicated success manager
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Custom integrations
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Advanced security features
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Team collaboration (unlimited)
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           Training and onboarding
                        </li>
                        <li
                           className='flex items-center text-gray-300'
                           style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                        >
                           SLA guarantees
                        </li>
                     </ul>
                     <button
                        className='w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        Upgrade to Enterprise
                     </button>
                  </div>
               </div>
               <div className='mt-16 text-center'>
                  <h3
                     className='text-lg font-medium text-white'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Need a custom solution?
                  </h3>
                  <p
                     className='mt-2 text-gray-400'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Contact us for a tailored package that meets your specific requirements.
                  </p>
                  <button
                     className='mt-4 inline-flex items-center px-6 py-2.5 border border-gray-700 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 transition-colors'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     onClick={() => scrollToSection('contact')}
                  >
                     Contact Us
                  </button>
               </div>
            </div>
         </section>

         {/* Contact Section */}
         <section
            id='contact'
            className='py-24 bg-gradient-to-br from-black via-gray-900 to-black'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-12'>
                  <h2
                     className='text-4xl md:text-6xl font-bold text-white mb-4'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Get In Touch
                  </h2>
                  <p
                     className='text-xl text-gray-400 max-w-3xl mx-auto'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     Have questions? We'd love to hear from you.
                  </p>
               </div>

               <div className='grid lg:grid-cols-2 gap-16 items-center'>
                  {/* Contact Information */}
                  <div className='space-y-12'>
                     <div className='space-y-8'>
                        <div className='flex items-center space-x-6'>
                           <div className='w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center'>
                              <svg
                                 className='w-8 h-8 text-blue-400'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z'
                                 />
                              </svg>
                           </div>
                           <div>
                              <p className='font-semibold text-white text-xl font-sans'>CEO</p>
                              <p className='text-gray-400 text-lg font-sans'>RamaKrushna Mohapatra</p>
                              <p className='text-blue-400 text-sm font-sans'>itsramakrushna@gmail.com</p>
                           </div>
                        </div>

                        <div className='flex items-center space-x-6'>
                           <div className='w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center'>
                              <svg
                                 className='w-8 h-8 text-blue-400'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
                                 />
                              </svg>
                           </div>
                           <div>
                              <p className='font-semibold text-white text-xl font-sans'>Developer</p>
                              <p className='text-gray-400 text-lg font-sans'>Nakul Srivastava</p>
                              <p className='text-blue-400 text-sm font-sans'>imnakul44@gmail.com</p>
                           </div>
                        </div>

                        <div className='flex items-center space-x-6'>
                           <div className='w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center'>
                              <svg
                                 className='w-8 h-8 text-blue-400'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
                                 />
                              </svg>
                           </div>
                           <div>
                              <p className='font-semibold text-white text-xl font-sans'>Developer</p>
                              <p className='text-gray-400 text-lg font-sans'>Dattu Goud</p>
                              <p className='text-blue-400 text-sm font-sans'>dattudattakumar369@gmail.com</p>
                           </div>
                        </div>

                        <div className='flex items-center space-x-6'>
                           <div className='w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center'>
                              <svg
                                 className='w-8 h-8 text-blue-400'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                                 />
                              </svg>
                           </div>
                           <div>
                              <p className='font-semibold text-white text-xl font-sans'>General Inquiries</p>
                              <p className='text-gray-400 text-lg font-sans'>DataVista Team</p>
                              <p className='text-blue-400 text-sm font-sans'>datavista91@gmail.com</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Contact Form */}
                  <div className='bg-gray-900/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700'>
                     <form
                        className='space-y-4'
                        onSubmit={handleContactSubmit}
                     >
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                           <div>
                              <label
                                 htmlFor='firstName'
                                 className='block text-sm font-medium text-gray-300 mb-2 font-sans'
                              >
                                 First Name
                              </label>
                              <input
                                 type='text'
                                 id='firstName'
                                 name='firstName'
                                 value={contactForm.firstName}
                                 onChange={handleContactChange}
                                 className='w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-sans'
                                 placeholder='John'
                                 required
                              />
                           </div>
                           <div>
                              <label
                                 htmlFor='lastName'
                                 className='block text-sm font-medium text-gray-300 mb-2 font-sans'
                              >
                                 Last Name
                              </label>
                              <input
                                 type='text'
                                 id='lastName'
                                 name='lastName'
                                 value={contactForm.lastName}
                                 onChange={handleContactChange}
                                 className='w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-sans'
                                 placeholder='Doe'
                              />
                           </div>
                        </div>
                        <div>
                           <label
                              htmlFor='email'
                              className='block text-sm font-medium text-gray-300 mb-2 font-sans'
                           >
                              Email
                           </label>
                           <input
                              type='email'
                              id='email'
                              name='email'
                              value={contactForm.email}
                              onChange={handleContactChange}
                              className='w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-sans'
                              placeholder='john@example.com'
                              required
                           />
                        </div>
                        <div>
                           <label
                              htmlFor='subject'
                              className='block text-sm font-medium text-gray-300 mb-2 font-sans'
                           >
                              Subject
                           </label>
                           <input
                              type='text'
                              id='subject'
                              name='subject'
                              value={contactForm.subject}
                              onChange={handleContactChange}
                              className='w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-sans'
                              placeholder='How can we help?'
                              required
                           />
                        </div>
                        <div>
                           <label
                              htmlFor='message'
                              className='block text-sm font-medium text-gray-300 mb-2 font-sans'
                           >
                              Message
                           </label>
                           <textarea
                              id='message'
                              name='message'
                              rows={5}
                              value={contactForm.message}
                              onChange={handleContactChange}
                              className='w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none font-sans'
                              placeholder='Tell us more about your needs...'
                              required
                           ></textarea>
                        </div>
                        <button
                           type='submit'
                           className='w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg font-sans'
                           disabled={contactLoading}
                        >
                           {contactLoading ? 'Sending...' : 'Send Message'}
                        </button>
                        {contactSuccess && <p className='text-green-400 mt-2'>Message sent successfully!</p>}
                        {contactError && <p className='text-red-400 mt-2'>{contactError}</p>}
                     </form>
                  </div>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className='py-5 border-t border-gray-800 bg-black'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0'>
                  <div className='flex items-center space-x-4'>
                     <img
                        src='/logo2.svg'
                        alt='DataVista Logo'
                        className='w-10 h-10'
                     />
                     <span
                        className='text-2xl font-bold text-white'
                        style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                     >
                        DataVista
                     </span>
                  </div>

                  <p
                     className='text-gray-400 text-sm'
                     style={{ fontFamily: 'IBM Plex Sans, system-ui, sans-serif' }}
                  >
                     © 2025 DataVista. All rights reserved.
                  </p>

                  <div className='flex space-x-6'>
                     <a
                        href='https://twitter.com/datavista'
                        className='text-gray-400 hover:text-blue-400 transition-colors'
                        aria-label='Twitter'
                     >
                        <svg
                           className='w-6 h-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                        </svg>
                     </a>
                     <a
                        href='https://linkedin.com/company/datavista'
                        className='text-gray-400 hover:text-blue-400 transition-colors'
                        aria-label='LinkedIn'
                     >
                        <svg
                           className='w-6 h-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
                        </svg>
                     </a>
                     {/* <a
                        href='https://github.com/datavista'
                        className='text-gray-400 hover:text-blue-400 transition-colors'
                        aria-label='GitHub'
                     >
                        <svg
                           className='w-6 h-6'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path
                              fillRule='evenodd'
                              d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                              clipRule='evenodd'
                           />
                        </svg>
                     </a> */}
                  </div>
               </div>
            </div>
         </footer>
      </div>
   )
}

export default LandingPage
