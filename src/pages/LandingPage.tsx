import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

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
            'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?q=80&w=386&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
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

   const [billingPeriod, setBillingPeriod] = useState<'month' | 'annual'>('month')
   const pricingPlans = [
      {
         name: 'Free',
         price: 0,
         period: '/lifetime',
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
         price: billingPeriod === 'month' ? 49 : 490, // Annual discounted price
         originalPrice: billingPeriod === 'annual' ? 588 : null, // Original annual price for strikethrough
         period: billingPeriod === 'month' ? '/month' : '/year',
         discount: billingPeriod === 'annual' ? '17% Off' : null,
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
         name: 'Pro',
         price: billingPeriod === 'month' ? 199 : 1990, // Annual discounted price
         originalPrice: billingPeriod === 'annual' ? 2388 : null, // Original annual price for strikethrough
         period: billingPeriod === 'month' ? '/month' : '/year',
         discount: billingPeriod === 'annual' ? '17% Off' : null,
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
         buttonText: 'Upgrade to Pro',
         buttonStyle: 'secondary',
      },
   ]

   useEffect(() => {
      // Load professional fonts - Avenir Next Bold for headings, Inter for body
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Load Avenir Next font for headings (fallback to system fonts)
      const avenirLink = document.createElement('link')
      avenirLink.href = 'https://fonts.cdnfonts.com/css/avenir-next'
      avenirLink.rel = 'stylesheet'
      document.head.appendChild(avenirLink)

      // Add custom animations
      const style = document.createElement('style')
      style.textContent = `
         @keyframes fadeInUp {
            from {
               opacity: 0;
               transform: translateY(30px);
            }
            to {
               opacity: 1;
               transform: translateY(0);
            }
         }
         
         @keyframes slideInFromLeft {
            from {
               opacity: 0;
               transform: translateX(-30px);
            }
            to {
               opacity: 1;
               transform: translateX(0);
            }
         }
         
         @keyframes slideInFromRight {
            from {
               opacity: 0;
               transform: translateX(30px);
            }
            to {
               opacity: 1;
               transform: translateX(0);
            }
         }
         
         .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
         }
         
         .animate-slideInFromLeft {
            animation: slideInFromLeft 0.8s ease-out forwards;
            opacity: 0;
         }
         
         .animate-slideInFromRight {
            animation: slideInFromRight 0.8s ease-out forwards;
            opacity: 0;
         }
         
         /* Smooth transitions for better performance */
         * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
         }
         
         /* Hardware acceleration for animations */
         .animate-fadeInUp,
         .animate-slideInFromLeft,
         .animate-slideInFromRight {
            will-change: transform, opacity;
            backface-visibility: hidden;
         }
      `
      document.head.appendChild(style)

      return () => {
         document.head.removeChild(link)
         document.head.removeChild(avenirLink)
         document.head.removeChild(style)
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
            fontSize: '17px', // +1px for better readability
            lineHeight: '1.6', // improved line height
         }}
      >
         {/* Contact Modal */}
         {isContactModalOpen && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4'>
               <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
                  <div className='p-6 border-b border-gray-200'>
                     <div className='flex justify-between items-center'>
                        <h2
                           className='font-bold text-gray-900'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '24px',
                              lineHeight: '1.3',
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
                     <div className='grid md:grid-cols-[1fr_2fr] gap-8'>
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
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base'
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
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base'
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
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base'
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
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base'
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
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base'
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
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='flex justify-between items-center h-16'>
                  {/* Brand */}
                  <div className='flex items-center'>
                     <div
                        className='text-gray-900 font-black tracking-tight'
                        style={{
                           fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                           fontSize: '24px',
                           letterSpacing: '-0.5px',
                           fontWeight: '900',
                        }}
                     >
                        Data<span className='text-blue-600'>Vista</span>
                     </div>
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
            className='py-20 relative'
            style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23e2e8f0' stroke-width='1' stroke-opacity='0.3'%3E%3Cpath d='M0 40L40 0M40 40L0 0'/%3E%3C/g%3E%3Cg stroke='%23f1f5f9' stroke-width='1' stroke-opacity='0.5'%3E%3Cpath d='M0 0h40M0 40h40M0 0v40M40 0v40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '40px 40px',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-12 animate-fadeInUp'>
                  {/* Value Proposition Pill */}
                  <div
                     className='mb-6 animate-fadeInUp'
                     style={{ animationDelay: '0.2s' }}
                  >
                     <div className='inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-6 py-3 hover:scale-105 transition-transform duration-300 ease-out'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse'></div>
                        <span
                           className='text-blue-700 font-semibold tracking-wide flex items-center gap-1'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: 'clamp(11px, 2.5vw, 14px)',
                              letterSpacing: '0.5px',
                           }}
                        >
                           🚀 NO-CODE ANALYTICS POWERED BY AI
                           <span className='ml-0.5 mb-0.5'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 width='18'
                                 height='18'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    fill='none'
                                    stroke='currentColor'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                    stroke-width='1.5'
                                    d='M7 4.5a3 3 0 0 0-2.567 4.554a3.001 3.001 0 0 0 0 5.893M7 4.5a2.5 2.5 0 0 1 5 0v15a2.5 2.5 0 0 1-5 0a3 3 0 0 1-2.567-4.553M7 4.5c0 .818.393 1.544 1 2m-3.567 8.447A3 3 0 0 1 6 13.67m11 5.83a3 3 0 0 0 2.567-4.553a3.001 3.001 0 0 0 0-5.893M17 19.5a2.5 2.5 0 0 1-5 0v-15a2.5 2.5 0 0 1 5 0a3 3 0 0 1 2.567 4.554M17 19.5c0-.818-.393-1.544-1-2m3.567-8.446A3 3 0 0 1 18 10.329'
                                    color='currentColor'
                                 />
                              </svg>
                           </span>
                        </span>
                     </div>
                  </div>

                  <h1
                     className='font-bold text-gray-900 mb-6 leading-tight tracking-tight animate-fadeInUp'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        letterSpacing: '-0.02em',
                        fontSize: 'clamp(2rem, 5vw, 5rem)',
                        lineHeight: '1.1',
                        animationDelay: '0.4s',
                     }}
                  >
                     TRANSFORM YOUR DATA INTO
                     <span className='text-blue-600 block mt-2'>POWERFUL INSIGHTS</span>
                  </h1>

                  <p
                     className='text-gray-600 max-w-4xl mx-auto font-normal mb-8 animate-fadeInUp'
                     style={{
                        lineHeight: '1.6',
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        animationDelay: '0.6s',
                     }}
                  >
                     Unlock the full potential of your data with AI-powered analytics, stunning visualizations, and
                     automated insights that drive smarter business decisions.
                  </p>

                  {/* CTA Buttons */}
                  <div
                     className='flex flex-row gap-3 justify-center items-center mb-12 animate-fadeInUp'
                     style={{ animationDelay: '0.8s' }}
                  >
                     {isLoading ? (
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                     ) : user ? (
                        <button
                           onClick={() => navigate('/dashboard')}
                           className='bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-1 sm:flex-initial'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.4',
                           }}
                        >
                           GO TO DASHBOARD
                        </button>
                     ) : (
                        <button
                           onClick={() => navigate('/login')}
                           className='bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-1 sm:flex-initial'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.4',
                           }}
                        >
                           GET STARTED
                        </button>
                     )}
                     <button
                        onClick={() => scrollToSection('features')}
                        className='border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex-1 sm:flex-initial'
                        style={{
                           fontFamily: '"Inter", system-ui, sans-serif',
                           fontSize: '15px',
                           lineHeight: '1.4',
                        }}
                     >
                        DEMO
                     </button>
                  </div>
               </div>

               {/* Dashboard Preview Image */}
               <div
                  className='max-w-5xl mx-auto animate-fadeInUp'
                  style={{ animationDelay: '1s' }}
               >
                  {/* Tablet Mockup Container */}
                  <div
                     className='relative mx-auto hover:scale-105 transition-transform duration-700 ease-out'
                     style={{ maxWidth: '800px' }}
                  >
                     {/* Tablet Frame */}
                     {/* <div className='relative bg-gray-800 rounded-[2.5rem] p-6 shadow-2xl'> */}
                     {/* Tablet Screen Bezel */}
                     <div className='bg-gray-200/80 rounded-[2rem] p-4'>
                        {/* Actual Screen */}
                        <div className='bg-white rounded-[1.5rem] overflow-hidden relative'>
                           {/* Screen Reflection Effect */}
                           <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 pointer-events-none z-10'></div>

                           {/* Dashboard Image */}
                           <img
                              src='/dashboard2.avif'
                              alt='DataVista Dashboard Preview'
                              className='w-full h-auto block'
                              loading='eager'
                           />
                        </div>
                     </div>

                     {/* Tablet Shadow */}
                     <div className='absolute inset-0 bg-gray-900/20 rounded-[2.5rem] transform translate-y-4 scale-95 -z-10'></div>
                  </div>
               </div>

               {/* About DataVista */}
               <div
                  className='mt-20 max-w-4xl mx-auto text-center animate-fadeInUp'
                  style={{ animationDelay: '1.2s' }}
               >
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

         {/* How DataVista Works Section */}
         <section
            className='py-20 relative'
            style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-12 animate-fadeInUp'>
                  <h2
                     className='font-bold text-gray-900 mb-6 tracking-tight'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        fontSize: '42px',
                        lineHeight: '1.2',
                     }}
                  >
                     HOW DATAVISTA WORKS
                  </h2>
                  <p
                     className='text-gray-600 max-w-3xl mx-auto font-normal mb-12'
                     style={{ fontSize: '18px', lineHeight: '1.5' }}
                  >
                     From data input to intelligent insights – here's how DataVista works for you
                  </p>
               </div>

               {/* Lottie Animation Container */}
               <div
                  className='flex justify-center mb-8 animate-fadeInUp'
                  style={{ animationDelay: '0.2s' }}
               >
                  <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl w-full hover:shadow-xl transition-shadow duration-300'>
                     <div className='aspect-video w-full'>
                        <DotLottieReact
                           src='https://lottie.host/7064c314-1c76-4d6d-994b-4110a11e8a8d/8qAAGMSEzb.lottie'
                           loop
                           autoplay
                           style={{ width: '100%', height: '100%' }}
                        />
                     </div>
                  </div>
               </div>

               {/* Supporting Text */}
               <div
                  className='text-center max-w-4xl mx-auto animate-fadeInUp'
                  style={{ animationDelay: '0.4s' }}
               >
                  <p
                     className='text-gray-600 leading-relaxed font-normal'
                     style={{ fontSize: '16px', lineHeight: '1.6' }}
                  >
                     Upload your data, let our AI analyze patterns, and receive actionable insights through beautiful
                     visualizations and smart reports – all in minutes, not hours.
                  </p>
               </div>
            </div>
         </section>

         {/* Features Section */}
         <section
            id='features'
            className='py-20 relative'
            style={{
               background: 'linear-gradient(135deg, #fafbfc 0%, #f6f8fa 100%)',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16 animate-fadeInUp'>
                  <h2
                     className='font-bold text-gray-900 mb-6 tracking-tight'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        fontSize: '42px',
                        lineHeight: '1.2',
                     }}
                  >
                     WHY CHOOSE DATAVISTA?
                  </h2>
                  <p
                     className='text-gray-600 max-w-3xl mx-auto font-normal'
                     style={{ fontSize: '18px', lineHeight: '1.5' }}
                  >
                     Powerful features designed to transform your data into actionable insights
                  </p>
               </div>

               <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {features.map((feature, index) => (
                     <div
                        key={index}
                        className='bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out group'
                     >
                        <div className='mb-6'>
                           <img
                              src={feature.image}
                              alt={feature.title}
                              className='w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 ease-out'
                              loading='lazy'
                           />
                        </div>
                        <h3
                           className='font-bold text-gray-900 mb-4'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '22px',
                              lineHeight: '1.3',
                           }}
                        >
                           {feature.title}
                        </h3>
                        <p
                           className='text-gray-600 font-normal'
                           style={{ fontSize: '16px', lineHeight: '1.6' }}
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
            className='py-20 relative'
            style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-16 animate-fadeInUp'>
                  <h2
                     className='font-bold text-gray-900 mb-6'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        fontSize: '42px',
                        lineHeight: '1.2',
                     }}
                  >
                     WHAT OUR USERS SAY
                  </h2>
                  <p
                     className='text-gray-600 max-w-3xl mx-auto font-normal'
                     style={{ fontSize: '18px', lineHeight: '1.5' }}
                  >
                     See how DataVista is transforming businesses worldwide
                  </p>
               </div>

               <div className='grid md:grid-cols-3 gap-8'>
                  {testimonials.map((testimonial, index) => (
                     <div
                        key={index}
                        className='bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out'
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

         {/* CTA Section */}
         <section
            className='py-20 relative overflow-hidden'
            style={{
               background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 text-center relative z-10'>
               <div className='max-w-4xl mx-auto animate-fadeInUp'>
                  <h2
                     className='text-4xl md:text-5xl font-bold mb-6 leading-tight'
                     style={{
                        fontFamily: "'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontWeight: '700',
                     }}
                  >
                     Ready to explore{' '}
                     <span
                        style={{
                           background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           backgroundClip: 'text',
                        }}
                     >
                        DataVista
                     </span>
                     ?
                  </h2>
                  <p
                     className='text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto animate-fadeInUp'
                     style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        lineHeight: '1.6',
                        animationDelay: '0.2s',
                     }}
                  >
                     Join thousands of professionals who trust DataVista for their data analysis needs. Start your
                     journey with intelligent insights today.
                  </p>
                  <div
                     className='flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp'
                     style={{ animationDelay: '0.4s' }}
                  >
                     <button
                        onClick={() => navigate('/dashboard')}
                        className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 min-h-[48px] w-full sm:w-auto'
                        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
                     >
                        Get Started Free
                     </button>
                     <button
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        className='border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 min-h-[48px] w-full sm:w-auto'
                        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
                     >
                        View Pricing
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* Pricing Section */}
         <section
            id='pricing'
            className='py-20 relative'
            style={{
               background: 'linear-gradient(135deg, #f8fafb 0%, #f4f6f8 100%)',
            }}
         >
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='text-center mb-8 animate-fadeInUp'>
                  <h2
                     className='font-bold text-gray-900 mb-6'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        fontSize: '42px',
                        lineHeight: '1.2',
                     }}
                  >
                     SIMPLE PRICING
                  </h2>
                  <p
                     className='text-gray-600 max-w-3xl mx-auto font-normal'
                     style={{ fontSize: '18px', lineHeight: '1.5' }}
                  >
                     Choose the plan that's right for your business
                  </p>
               </div>

               {/* Billing Toggle - Symmetric & Professional */}
               <div className='flex justify-center pb-12'>
                  <div
                     className='inline-flex rounded-full bg-gray-100 p-1 border border-gray-200 shadow-sm'
                     style={{ width: '300px' }}
                  >
                     <button
                        className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                           billingPeriod === 'month'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setBillingPeriod('month')}
                        type='button'
                        aria-pressed={billingPeriod === 'month'}
                     >
                        Monthly
                     </button>
                     <button
                        className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 relative ${
                           billingPeriod === 'annual'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setBillingPeriod('annual')}
                        type='button'
                        aria-pressed={billingPeriod === 'annual'}
                     >
                        Annual
                        {billingPeriod === 'annual' && (
                           <span className='absolute -top-4 -right-16 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium'>
                              Save 17%
                           </span>
                        )}
                     </button>
                  </div>
               </div>

               <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                  {pricingPlans.map((plan, index) => (
                     <div
                        key={index}
                        className={`bg-white rounded-lg p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out relative ${
                           plan.isPopular ? 'border-2 border-blue-600 shadow-lg scale-105' : 'border border-gray-200'
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
                           className='font-bold text-gray-900 mb-6'
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '24px',
                              lineHeight: '1.3',
                           }}
                        >
                           {plan.name.toUpperCase()}
                        </h3>

                        <div className='mb-8'>
                           <div className='flex items-baseline justify-between'>
                              <div className='flex items-baseline'>
                                 <span
                                    className='font-bold text-gray-900'
                                    style={{
                                       fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                                       fontSize: '36px',
                                    }}
                                 >
                                    ${plan.price}
                                 </span>
                                 <span
                                    className='text-gray-600 font-normal ml-1'
                                    style={{ fontSize: '16px' }}
                                 >
                                    {plan.period}
                                 </span>
                              </div>
                              {/* {plan.discount && (
                                 <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium'>
                                    {plan.discount}
                                 </span>
                              )} */}
                           </div>
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
                           className={`w-full py-4 rounded-lg font-bold transition-all duration-300 min-h-[48px] ${
                              plan.buttonStyle === 'primary'
                                 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                 : plan.buttonStyle === 'secondary'
                                 ? 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                                 : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                           }`}
                           style={{
                              fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                              fontSize: '16px',
                              lineHeight: '1.4',
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
                     className='font-bold text-gray-900 mb-3'
                     style={{
                        fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                        fontSize: '22px',
                        lineHeight: '1.3',
                     }}
                  >
                     NEED A CUSTOM SOLUTION?
                  </h3>
                  <p
                     className='text-gray-600 mb-6 font-normal max-w-2xl mx-auto'
                     style={{ fontSize: '16px', lineHeight: '1.5' }}
                  >
                     Contact us for a tailored package that meets your specific requirements.
                  </p>
                  <button
                     className='inline-flex items-center px-8 py-3 border-2 border-gray-300 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 transition-all duration-300'
                     style={{
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: '16px',
                        lineHeight: '1.4',
                     }}
                     onClick={() => setIsContactModalOpen(true)}
                  >
                     CONTACT US
                  </button>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className='py-8 border-t-2 border-gray-200 bg-white'>
            <div className='max-w-5xl mx-auto px-6 lg:px-8'>
               <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
                  <div className='flex items-center space-x-2'>
                     <div
                        className='text-gray-900 font-black tracking-tight'
                        style={{
                           fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                           fontSize: '20px',
                           letterSpacing: '-0.5px',
                           fontWeight: '900',
                        }}
                     >
                        Data<span className='text-blue-600'>Vista</span>
                     </div>
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
