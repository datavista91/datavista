import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
   const { user, isLoading } = useAuth()
   const navigate = useNavigate()
   const [isNavOpen, setIsNavOpen] = useState(false)
   const [isContactModalOpen, setIsContactModalOpen] = useState(false)

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

   const pricingPlans = [
      {
         name: 'Free',
         price: 0,
         period: '/month',
         isPopular: false,
         features: [
            'Upload up to 5 datasets',
            'Basic visualizations',
            'Export as PDF',
            'Community support',
            '10 AI requests/day',
         ],
         buttonText: 'Current Plan',
         buttonStyle: 'disabled',
         disabled: true,
      },
      {
         name: 'Standard',
         price: 49,
         period: '/month',
         isPopular: true,
         features: [
            'Everything in Free',
            'Upload unlimited datasets',
            'Advanced AI insights (500 requests/day)',
            'Custom charts and dashboards',
            'Priority email support',
            'Team collaboration (up to 3 users)',
            'Advanced data export options',
         ],
         buttonText: 'Upgrade to Standard',
         buttonStyle: 'primary',
      },
      {
         name: 'Enterprise',
         price: 199,
         period: '/month',
         isPopular: false,
         features: [
            'Everything in Standard',
            'Unlimited AI requests',
            'Dedicated success manager',
            'Custom integrations',
            'Advanced security features',
            'Team collaboration (unlimited)',
            'Training and onboarding',
            'SLA guarantees',
         ],
         buttonText: 'Contact Sales',
         buttonStyle: 'secondary',
      },
   ]

   useEffect(() => {
      // Load professional fonts - Gilroy ExtraBold for headings, Inter for body
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Load Gilroy font for headings
      const gilroyLink = document.createElement('link')
      gilroyLink.href = 'https://fonts.cdnfonts.com/css/gilroy-bold'
      gilroyLink.rel = 'stylesheet'
      document.head.appendChild(gilroyLink)

      return () => {
         document.head.removeChild(link)
         document.head.removeChild(gilroyLink)
      }
   }, [user, navigate])

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
         className='bg-white text-gray-900 min-h-screen'
         style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: '1.5',
         }}
      >
         {/* Contact Modal */}
         {isContactModalOpen && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4'>
               <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                  <div className='p-6 border-b border-gray-200'>
                     <div className='flex justify-between items-center'>
                        <h2
                           className='text-2xl font-bold text-gray-900 tracking-tight'
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                        >
                           GET IN TOUCH
                        </h2>
                        <button
                           onClick={() => setIsContactModalOpen(false)}
                           className='text-gray-400 hover:text-gray-600 transition-colors'
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
                                 d='M6 18L18 6M6 6l12 12'
                              />
                           </svg>
                        </button>
                     </div>
                  </div>

                  <div className='p-6'>
                     <div className='grid md:grid-cols-2 gap-8'>
                        {/* Contact Information */}
                        <div className='space-y-6'>
                           <h3 className='text-lg font-medium text-gray-900 mb-4'>Our Team</h3>

                           <div className='space-y-4'>
                              <div className='flex items-start space-x-3'>
                                 <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <svg
                                       className='w-4 h-4 text-blue-600'
                                       fill='currentColor'
                                       viewBox='0 0 20 20'
                                    >
                                       <path
                                          fillRule='evenodd'
                                          d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                                          clipRule='evenodd'
                                       />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className='font-medium text-gray-900'>RamaKrushna Mohapatra</p>
                                    <p className='text-sm text-gray-600'>CEO</p>
                                    <p className='text-sm text-blue-600'>itsramakrushna@gmail.com</p>
                                 </div>
                              </div>

                              <div className='flex items-start space-x-3'>
                                 <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <svg
                                       className='w-4 h-4 text-blue-600'
                                       fill='currentColor'
                                       viewBox='0 0 20 20'
                                    >
                                       <path
                                          fillRule='evenodd'
                                          d='M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
                                          clipRule='evenodd'
                                       />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className='font-medium text-gray-900'>Nakul Srivastava</p>
                                    <p className='text-sm text-gray-600'>Developer</p>
                                    <p className='text-sm text-blue-600'>imnakul44@gmail.com</p>
                                 </div>
                              </div>

                              <div className='flex items-start space-x-3'>
                                 <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <svg
                                       className='w-4 h-4 text-blue-600'
                                       fill='currentColor'
                                       viewBox='0 0 20 20'
                                    >
                                       <path
                                          fillRule='evenodd'
                                          d='M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
                                          clipRule='evenodd'
                                       />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className='font-medium text-gray-900'>Dattu Goud</p>
                                    <p className='text-sm text-gray-600'>Developer</p>
                                    <p className='text-sm text-blue-600'>dattudattakumar369@gmail.com</p>
                                 </div>
                              </div>

                              <div className='flex items-start space-x-3'>
                                 <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                                    <svg
                                       className='w-4 h-4 text-blue-600'
                                       fill='currentColor'
                                       viewBox='0 0 20 20'
                                    >
                                       <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                                       <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                                    </svg>
                                 </div>
                                 <div>
                                    <p className='font-medium text-gray-900'>General Inquiries</p>
                                    <p className='text-sm text-gray-600'>DataVista Team</p>
                                    <p className='text-sm text-blue-600'>datavista91@gmail.com</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                           <h3 className='text-lg font-medium text-gray-900 mb-4'>Send us a message</h3>
                           <form
                              className='space-y-4'
                              onSubmit={handleContactSubmit}
                           >
                              <div className='grid grid-cols-2 gap-4'>
                                 <div>
                                    <label
                                       htmlFor='firstName'
                                       className='block text-sm font-medium text-gray-700 mb-1'
                                    >
                                       First Name
                                    </label>
                                    <input
                                       type='text'
                                       id='firstName'
                                       name='firstName'
                                       value={contactForm.firstName}
                                       onChange={handleContactChange}
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                       placeholder='John'
                                       required
                                    />
                                 </div>
                                 <div>
                                    <label
                                       htmlFor='lastName'
                                       className='block text-sm font-medium text-gray-700 mb-1'
                                    >
                                       Last Name
                                    </label>
                                    <input
                                       type='text'
                                       id='lastName'
                                       name='lastName'
                                       value={contactForm.lastName}
                                       onChange={handleContactChange}
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                       placeholder='Doe'
                                    />
                                 </div>
                              </div>
                              <div>
                                 <label
                                    htmlFor='email'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                 >
                                    Email
                                 </label>
                                 <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    placeholder='john@example.com'
                                    required
                                 />
                              </div>
                              <div>
                                 <label
                                    htmlFor='subject'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                 >
                                    Subject
                                 </label>
                                 <input
                                    type='text'
                                    id='subject'
                                    name='subject'
                                    value={contactForm.subject}
                                    onChange={handleContactChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    placeholder='How can we help?'
                                    required
                                 />
                              </div>
                              <div>
                                 <label
                                    htmlFor='message'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                 >
                                    Message
                                 </label>
                                 <textarea
                                    id='message'
                                    name='message'
                                    rows={4}
                                    value={contactForm.message}
                                    onChange={handleContactChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                                    placeholder='Tell us more about your needs...'
                                    required
                                 ></textarea>
                              </div>
                              <button
                                 type='submit'
                                 className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium'
                                 disabled={contactLoading}
                              >
                                 {contactLoading ? 'Sending...' : 'Send Message'}
                              </button>
                              {contactSuccess && <p className='text-green-600 text-sm'>Message sent successfully!</p>}
                              {contactError && <p className='text-red-600 text-sm'>{contactError}</p>}
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Navigation */}
         <nav className='bg-white border-b border-gray-200 sticky top-0 z-40'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='flex justify-between items-center h-16'>
                  {/* Brand */}
                  <div className='flex items-center'>
                     <span
                        className='text-2xl font-bold text-gray-900 tracking-tight'
                        style={{ fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif' }}
                     >
                        DataVista
                     </span>
                  </div>

                  {/* Desktop Navigation */}
                  <div className='hidden md:flex items-center space-x-8'>
                     <button
                        onClick={() => scrollToSection('hero')}
                        className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                     >
                        Home
                     </button>
                     <button
                        onClick={() => scrollToSection('features')}
                        className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                     >
                        Features
                     </button>
                     <button
                        onClick={() => scrollToSection('testimonials')}
                        className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                     >
                        Testimonials
                     </button>
                     <button
                        onClick={() => scrollToSection('pricing')}
                        className='text-gray-700 hover:text-blue-600 transition-colors font-medium'
                     >
                        Pricing
                     </button>
                     {isLoading ? (
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                     ) : user ? (
                        <button
                           onClick={() => navigate('/dashboard')}
                           className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium'
                        >
                           Dashboard
                        </button>
                     ) : (
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium'
                        >
                           Sign In
                        </button>
                     )}
                  </div>

                  {/* Mobile menu button */}
                  <button
                     onClick={() => setIsNavOpen(!isNavOpen)}
                     className='md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors'
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
                  <div className='md:hidden py-4 border-t border-gray-200'>
                     <div className='flex flex-col space-y-3'>
                        <button
                           onClick={() => scrollToSection('hero')}
                           className='text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2'
                        >
                           Home
                        </button>
                        <button
                           onClick={() => scrollToSection('features')}
                           className='text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2'
                        >
                           Features
                        </button>
                        <button
                           onClick={() => scrollToSection('testimonials')}
                           className='text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2'
                        >
                           Testimonials
                        </button>
                        <button
                           onClick={() => scrollToSection('pricing')}
                           className='text-left text-gray-700 hover:text-blue-600 transition-colors font-medium py-2'
                        >
                           Pricing
                        </button>
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium w-fit'
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
            className='py-20 bg-white'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16'>
                  <h1
                     className='text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                     }}
                  >
                     TRANSFORM YOUR DATA INTO
                     <span className='text-blue-600 block mt-2'>POWERFUL INSIGHTS</span>
                  </h1>

                  <p className='text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-normal'>
                     Unlock the full potential of your data with AI-powered analytics, stunning visualizations, and
                     automated insights that drive smarter business decisions.
                  </p>

                  {/* CTA Buttons */}
                  <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
                     {isLoading ? (
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                     ) : user ? (
                        <button
                           onClick={() => navigate('/dashboard')}
                           className='bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-md'
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                        >
                           GO TO DASHBOARD
                        </button>
                     ) : (
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-md'
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                        >
                           GET STARTED
                        </button>
                     )}
                     <button
                        onClick={() => scrollToSection('features')}
                        className='border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-bold hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-colors'
                        style={{
                           fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                           letterSpacing: '-0.01em',
                        }}
                     >
                        DEMO
                     </button>
                  </div>
               </div>

               {/* Dashboard Preview Image */}
               <div className='max-w-5xl mx-auto'>
                  <div className='relative bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200'>
                     {/* Tab-style top border */}
                     <div className='bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center space-x-2'>
                        <div className='flex space-x-2'>
                           <div className='w-3 h-3 rounded-full bg-red-400'></div>
                           <div className='w-3 h-3 rounded-full bg-yellow-400'></div>
                           <div className='w-3 h-3 rounded-full bg-green-400'></div>
                        </div>
                        <div className='flex-1 text-center'>
                           <span className='text-sm text-gray-600 font-medium'>DataVista Dashboard</span>
                        </div>
                     </div>
                     <img
                        src='/dashboard2.avif'
                        alt='DataVista Dashboard Preview'
                        className='w-full h-auto'
                        loading='eager'
                     />
                  </div>
               </div>

               {/* About DataVista */}
               <div className='mt-20 max-w-4xl mx-auto text-center'>
                  <p
                     className='text-xl text-gray-600 leading-relaxed font-normal'
                     style={{ lineHeight: '1.6' }}
                  >
                     DataVista is the next-generation data analytics platform that combines artificial intelligence with
                     intuitive design to help businesses of all sizes make sense of their data. From automated insights
                     to beautiful visualizations, we make data analysis accessible to everyone.
                  </p>
               </div>
            </div>
         </section>

         {/* Features Section */}
         <section
            id='features'
            className='py-20 bg-gray-50'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16'>
                  <h2
                     className='text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                     }}
                  >
                     WHY CHOOSE DATAVISTA?
                  </h2>
                  <p className='text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed'>
                     Powerful features designed to transform your data into actionable insights
                  </p>
               </div>

               <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {features.map((feature, index) => (
                     <div
                        key={index}
                        className='bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300'
                     >
                        <div className='mb-6'>
                           <img
                              src={feature.image}
                              alt={feature.title}
                              className='w-full h-48 object-cover rounded-lg'
                              loading='lazy'
                           />
                        </div>
                        <h3
                           className='text-xl font-bold text-gray-900 mb-4 tracking-tight'
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                        >
                           {feature.title}
                        </h3>
                        <p
                           className='text-gray-600 leading-relaxed font-normal'
                           style={{ lineHeight: '1.6' }}
                        >
                           {feature.description}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Testimonials Section */}
         <section
            id='testimonials'
            className='py-20 bg-white'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16'>
                  <h2
                     className='text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                     }}
                  >
                     WHAT OUR USERS SAY
                  </h2>
                  <p className='text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed'>
                     See how DataVista is transforming businesses worldwide
                  </p>
               </div>

               <div className='grid md:grid-cols-3 gap-8'>
                  {testimonials.map((testimonial, index) => (
                     <div
                        key={index}
                        className='bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300'
                     >
                        <div className='flex items-center mb-6'>
                           <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className='w-12 h-12 rounded-full object-cover mr-4'
                              loading='lazy'
                           />
                           <div>
                              <h4 className='font-semibold text-gray-900'>{testimonial.name}</h4>
                              <p className='text-gray-600 text-sm'>{testimonial.role}</p>
                           </div>
                        </div>
                        <p className='text-gray-700 leading-relaxed mb-4'>{testimonial.content}</p>
                        <div className='flex text-blue-500'>
                           {[...Array(5)].map((_, i) => (
                              <svg
                                 key={i}
                                 className='w-4 h-4 fill-current'
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
            className='py-20 bg-gray-50'
         >
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16'>
                  <h2
                     className='text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                     }}
                  >
                     SIMPLE PRICING
                  </h2>
                  <p className='text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed'>
                     Choose the plan that's right for your business
                  </p>
               </div>

               <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                  {pricingPlans.map((plan, index) => (
                     <div
                        key={index}
                        className={`bg-white rounded-lg p-8 hover:shadow-lg transition-shadow duration-300 relative ${
                           plan.isPopular ? 'border-2 border-blue-600 shadow-lg' : 'border border-gray-200'
                        }`}
                     >
                        {plan.isPopular && (
                           <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                              <span className='bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium'>
                                 Most Popular
                              </span>
                           </div>
                        )}

                        <h3
                           className='text-2xl font-bold mb-6 text-gray-900 tracking-tight'
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                        >
                           {plan.name.toUpperCase()}
                        </h3>

                        <div className='mb-8'>
                           <span
                              className='text-4xl font-bold text-gray-900'
                              style={{
                                 fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              }}
                           >
                              ${plan.price}
                           </span>
                           <span className='text-gray-600 font-normal'>{plan.period}</span>
                        </div>

                        <ul className='space-y-4 mb-8'>
                           {plan.features.map((feature, featureIndex) => (
                              <li
                                 key={featureIndex}
                                 className='flex items-center text-gray-700 font-normal'
                                 style={{ lineHeight: '1.5' }}
                              >
                                 <svg
                                    className='w-5 h-5 text-blue-500 mr-3 flex-shrink-0'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                 >
                                    <path
                                       fillRule='evenodd'
                                       d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                       clipRule='evenodd'
                                    />
                                 </svg>
                                 {feature}
                              </li>
                           ))}
                        </ul>

                        <button
                           className={`w-full py-4 rounded-lg font-bold transition-colors tracking-tight ${
                              plan.buttonStyle === 'primary'
                                 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                 : plan.buttonStyle === 'secondary'
                                 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                 : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                           }`}
                           style={{
                              fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                              letterSpacing: '-0.01em',
                           }}
                           disabled={plan.disabled}
                        >
                           {plan.buttonText.toUpperCase()}
                        </button>
                     </div>
                  ))}
               </div>

               <div className='mt-20 text-center'>
                  <h3
                     className='text-xl font-bold text-gray-900 mb-3 tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.01em',
                     }}
                  >
                     NEED A CUSTOM SOLUTION?
                  </h3>
                  <p className='text-gray-600 mb-6 font-normal leading-relaxed max-w-2xl mx-auto'>
                     Contact us for a tailored package that meets your specific requirements.
                  </p>
                  <button
                     className='inline-flex items-center px-8 py-3 border-2 border-gray-300 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 transition-colors tracking-tight'
                     style={{
                        fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.01em',
                     }}
                     onClick={() => setIsContactModalOpen(true)}
                  >
                     CONTACT US
                  </button>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className='py-8 border-t border-gray-200 bg-white'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
               <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
                  <div className='flex items-center space-x-2'>
                     <span
                        className='text-xl font-bold text-gray-900 tracking-tight'
                        style={{ fontFamily: '"Gilroy ExtraBold", "Inter", system-ui, sans-serif' }}
                     >
                        DataVista
                     </span>
                  </div>

                  <p className='text-gray-600 text-sm'>© 2025 DataVista. All rights reserved.</p>

                  <div className='flex items-center space-x-6'>
                     {/* <button
                        onClick={() => setIsContactModalOpen(true)}
                        className='text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium'
                     >
                        Contact
                     </button> */}
                     <a
                        href='https://twitter.com/datavista'
                        className='text-gray-600 hover:text-blue-600 transition-colors'
                        aria-label='Twitter'
                     >
                        <svg
                           className='w-5 h-5'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                        </svg>
                     </a>
                     <a
                        href='https://linkedin.com/company/datavista'
                        className='text-gray-600 hover:text-blue-600 transition-colors'
                        aria-label='LinkedIn'
                     >
                        <svg
                           className='w-5 h-5'
                           fill='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
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
