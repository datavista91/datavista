import { useState, useMemo, memo } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import dodoPaymentsService from '../services/dodoPaymentsService'

const plans = [
   {
      id: 'free',
      name: 'Free',
      price: '0',
      description: 'Perfect for trying out DataVista',
      features: [
         'Upload up to 5 datasets',
         'Basic visualizations',
         'Export as PDF',
         'Community support',
         '10 AI requests/day',
      ],
      mostPopular: false,
      buttonText: 'Current Plan',
      color: 'gray',
      icon: '🚀',
   },
   {
      id: 'pro',
      name: 'Pro',
      price: '49',
      description: 'For professionals and small teams',
      features: [
         'Everything in Free',
         'Upload unlimited datasets',
         'Advanced AI insights (500 requests/day)',
         'Custom charts and dashboards',
         'Priority email support',
         'Team collaboration (up to 3 users)',
         'Advanced data export options',
      ],
      mostPopular: true,
      buttonText: 'Upgrade to Pro',
      color: 'blue',
      icon: '⚡',
   },
   {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199',
      description: 'For organizations with advanced needs',
      features: [
         'Everything in Pro',
         'Unlimited AI requests',
         'Dedicated success manager',
         'Custom integrations',
         'Advanced security features',
         'Team collaboration (unlimited)',
         'Training and onboarding',
         'SLA guarantees',
      ],
      mostPopular: false,
      buttonText: 'Upgrade to Enterprise',
      color: 'indigo',
      icon: '👑',
   },
]

// Animation variants
const cardVariants = {
   hidden: { opacity: 0, y: 50 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
         delay: i * 0.1,
         duration: 0.5,
         ease: 'easeOut',
      },
   }),
}

const PricingPage = memo(() => {
   const [processingPlan, setProcessingPlan] = useState<string | null>(null)
   const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
   const { user } = useAuth()
   const { loading: subLoading, isFree, isPro, isEnterprise } = useSubscription()
   const navigate = useNavigate()

   // Memoize the visible plans calculation to prevent unnecessary re-renders
   const visiblePlans = useMemo(() => {
      if (subLoading) return []
      
      let filteredPlans = plans
      if (isFree) {
         filteredPlans = plans
      } else if (isPro) {
         filteredPlans = plans.filter((p) => p.id !== 'free')
      } else if (isEnterprise) {
         filteredPlans = plans.filter((p) => p.id === 'enterprise')
      }

      // Mark current plan, add disabled property for TS
      type PlanWithDisabled = (typeof plans)[0] & { disabled: boolean }
      const mappedPlans: PlanWithDisabled[] = filteredPlans.map((p) => {
         let buttonText = p.buttonText
         let disabled = false
         if ((isFree && p.id === 'free') || (isPro && p.id === 'pro') || (isEnterprise && p.id === 'enterprise')) {
            buttonText = 'Current Plan'
            disabled = true
         }
         return { ...p, buttonText, disabled }
      })
      
      return mappedPlans
   }, [subLoading, isFree, isPro, isEnterprise])

   // Memoize the handleUpgrade function to prevent unnecessary re-renders
   const handleUpgrade = useMemo(() => async (planId: string) => {
      if (planId === 'free') return

      if (!user) {
         alert('Please sign in to upgrade your plan')
         navigate('/signin')
         return
      }

      setProcessingPlan(planId)

      try {
         if (planId === 'pro' || planId === 'enterprise') {
            // Determine the product ID based on billing period
            let productId: string
            let actualPlanType: string

            if (billingPeriod === 'annual') {
               productId =
                  planId === 'pro'
                     ? import.meta.env.VITE_DODO_PRO_PRODUCT_ID_ANNUALLY
                     : import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID_ANNUALLY
               actualPlanType = `${planId}-annual`
            } else {
               productId =
                  planId === 'pro'
                     ? import.meta.env.VITE_DODO_PRO_PRODUCT_ID
                     : import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID
               actualPlanType = planId
            }

            if (!productId) {
               throw new Error(`Product ID not configured for ${planId} plan (${billingPeriod})`)
            }

            // Use the centralized payment service to generate the payment URL
            const paymentUrl = dodoPaymentsService.generatePaymentLink(actualPlanType, user.email || '', user.id)

            // Store payment attempt
            const paymentAttempt = {
               userId: user.id,
               email: user.email,
               planType: actualPlanType,
               billingPeriod: billingPeriod,
               timestamp: new Date().toISOString(),
               status: 'initiated',
            }
            localStorage.setItem('dodo_payment_attempt', JSON.stringify(paymentAttempt))

            console.log('🚀 Redirecting to Dodo payment:', paymentUrl)
            window.location.href = paymentUrl
         } else {
            // Handle enterprise contact
            window.open('mailto:sales@datavista.com?subject=Enterprise Plan Inquiry', '_blank')
         }
      } catch (error) {
         console.error('❌ Payment initiation error:', error)
         alert('Failed to initiate payment. Please try again.')
      } finally {
         setProcessingPlan(null)
      }
   }, [user, billingPeriod, navigate])

   // Show loading state
   if (subLoading) {
      return (
         <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500'></div>
            <span className='ml-4 text-lg text-gray-700'>Loading your subscription...</span>
         </div>
      )
   }

   return (
      <div
         className='min-h-screen bg-white text-gray-900'
         style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'linear-gradient(135deg, #f8fafb 0%, #f4f6f8 100%)',
         }}
      >
         {/* Header */}
         {/* <div className='bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
               <div className='flex items-center justify-between h-16'>
                  <button
                     onClick={() => navigate('/dashboard')}
                     className='flex items-center text-purple-600 hover:text-purple-700 transition-colors'
                  >
                     <ArrowLeft className='h-5 w-5 mr-2' />
                     Back to Dashboard
                  </button>
                  <h1 className='dashboard-heading text-gray-900'>Choose Your Plan</h1>
                  <div></div>
               </div>
            </div>
         </div> */}

         {/* Pricing Content */}
         <div className='py-20'>
            <div className='mx-auto max-w-6xl px-6 lg:px-8'>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className='text-center max-w-3xl mx-auto mb-8'
               >
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
                     Choose the perfect plan for your data needs
                  </p>

                  <div className='mt-8 flex justify-center pb-12'>
                     <div
                        className='inline-flex rounded-full bg-gray-100 p-1 border border-gray-200 shadow-sm'
                        style={{ width: '300px' }}
                     >
                        <button
                           onClick={() => setBillingPeriod('monthly')}
                           className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                              billingPeriod === 'monthly'
                                 ? 'bg-blue-600 text-white shadow-md'
                                 : 'text-gray-700 hover:bg-gray-200'
                           }`}
                           type='button'
                           aria-pressed={billingPeriod === 'monthly'}
                        >
                           Monthly
                        </button>
                        <button
                           onClick={() => setBillingPeriod('annual')}
                           className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 relative ${
                              billingPeriod === 'annual'
                                 ? 'bg-blue-600 text-white shadow-md'
                                 : 'text-gray-700 hover:bg-gray-200'
                           }`}
                           type='button'
                           aria-pressed={billingPeriod === 'annual'}
                        >
                           Annual
                           {billingPeriod === 'annual' && (
                              <span className='absolute -top-4 -right-16 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium'>
                                 Save 20%
                              </span>
                           )}
                        </button>
                     </div>
                  </div>
               </motion.div>

               <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
                  {visiblePlans.map((plan, index) => {
                     return (
                     <motion.div
                        key={plan.name}
                        custom={index}
                        variants={cardVariants}
                        initial='hidden'
                        animate='visible'
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`bg-white rounded-lg p-8 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out relative ${
                           plan.mostPopular ? 'border-2 border-blue-600 shadow-lg scale-105' : 'border border-gray-200'
                        }`}
                     >
                        {plan.mostPopular && (
                           <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                              <span className='bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium'>
                                 Most Popular
                              </span>
                           </div>
                        )}

                        <div className='px-0 py-0'>
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
                                       $
                                       {billingPeriod === 'annual' && plan.id !== 'free'
                                          ? Math.round(parseInt(plan.price) * 0.8).toString()
                                          : plan.price}
                                    </span>
                                    <span
                                       className='text-gray-600 font-normal ml-1'
                                       style={{ fontSize: '16px' }}
                                    >
                                       /month
                                    </span>
                                 </div>
                                 {billingPeriod === 'annual' && plan.id !== 'free' && (
                                    <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium'>
                                       billed annually
                                    </span>
                                 )}
                              </div>
                           </div>
                           <p
                              className='text-gray-600 mb-8 font-normal'
                              style={{ fontSize: '16px', lineHeight: '1.5' }}
                           >
                              {plan.description}
                           </p>

                           <ul className='space-y-4 mb-8'>
                              {plan.features.map((feature: string, i: number) => (
                                 <li
                                    key={i}
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

                           <motion.button
                              whileHover={{ scale: processingPlan === plan.id ? 1 : 1.02 }}
                              whileTap={{ scale: processingPlan === plan.id ? 1 : 0.98 }}
                              className={`w-full py-4 rounded-lg font-bold transition-all duration-300 min-h-[48px] ${
                                 plan.id === 'free'
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : plan.mostPopular
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                              } ${processingPlan === plan.id || plan.disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
                              style={{
                                 fontFamily: '"Avenir Next Bold", "Inter", system-ui, sans-serif',
                                 fontSize: '16px',
                                 lineHeight: '1.4',
                              }}
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={plan.disabled || processingPlan === plan.id}
                           >
                              {processingPlan === plan.id ? (
                                 <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2 inline-block'></div>
                                    Processing...
                                 </>
                              ) : (
                                 <>
                                    {plan.buttonText.toUpperCase()}
                                    <ChevronRight className='ml-1 w-4 h-4 inline-block' />
                                 </>
                              )}
                           </motion.button>
                        </div>
                     </motion.div>
                     )
                  })}
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
                  >
                     CONTACT SALES
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
})

PricingPage.displayName = 'PricingPage'

export default PricingPage
