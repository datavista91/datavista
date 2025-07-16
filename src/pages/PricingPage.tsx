import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { useNavigate } from 'react-router-dom'

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

const PricingPage = () => {
   const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
   const [processingPlan, setProcessingPlan] = useState<string | null>(null)
   const { user } = useAuth()
   const { subscription, loading: subLoading, isFree, isPro, isEnterprise } = useSubscription()
   const navigate = useNavigate()

   const handleUpgrade = async (planId: string) => {
      if (planId === 'free') return

      if (!user) {
         alert('Please sign in to upgrade your plan')
         navigate('/signin')
         return
      }

      setProcessingPlan(planId)

      try {
         if (planId === 'pro' || planId === 'enterprise') {
            // Generate Dodo payment link
            const productId =
               planId === 'pro'
                  ? import.meta.env.VITE_DODO_PRO_PRODUCT_ID
                  : import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID

            if (!productId) {
               throw new Error(`Product ID not configured for ${planId} plan`)
            }

            const baseUrl = 'https://test.checkout.dodopayments.com'
            const redirectUrl = `${window.location.origin}/payment-success`

            const params = new URLSearchParams({
               quantity: '1',
               redirect_url: redirectUrl,
               email: user.email || '',
               metadata_userId: user.id,
               metadata_planType: planId,
               metadata_timestamp: new Date().toISOString(),
            })

            const paymentUrl = `${baseUrl}/buy/${productId}?${params.toString()}`

            // Store payment attempt
            const paymentAttempt = {
               userId: user.id,
               email: user.email,
               planType: planId,
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
   }

   // Filter plans based on subscription
   let visiblePlans = plans
   if (subLoading) {
      // Show loader while subscription is loading
      return (
         <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500'></div>
            <span className='ml-4 text-lg text-gray-700'>Loading your subscription...</span>
         </div>
      )
   } else if (isFree) {
      visiblePlans = plans
   } else if (isPro) {
      visiblePlans = plans.filter(p => p.id !== 'free')
   } else if (isEnterprise) {
      visiblePlans = plans.filter(p => p.id === 'enterprise')
   }

   // Mark current plan, add disabled property for TS
   type PlanWithDisabled = typeof plans[0] & { disabled: boolean }
   const mappedPlans: PlanWithDisabled[] = visiblePlans.map(p => {
      let buttonText = p.buttonText
      let disabled = false
      if ((isFree && p.id === 'free') || (isPro && p.id === 'pro') || (isEnterprise && p.id === 'enterprise')) {
         buttonText = 'Current Plan'
         disabled = true
      }
      return { ...p, buttonText, disabled }
   })
   visiblePlans = mappedPlans

   return (
      <div className='min-h-screen bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300'>
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
                  <h1 className='text-xl font-semibold text-gray-900'>Choose Your Plan</h1>
                  <div></div>
               </div>
            </div>
         </div> */}

         {/* Pricing Content */}
         <div className='py-12'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className='text-center max-w-3xl mx-auto mb-16'
               >
                  <h2
                     className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'
                     style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                     Simple, Transparent Pricing
                  </h2>
                  <p className='mt-4 text-lg text-gray-600'>Choose the perfect plan for your data needs</p>

                  {/* <div className='mt-8 flex justify-center'>
                     <div className='relative bg-white/25 p-1 rounded-full flex'>
                        <button
                           onClick={() => setBillingPeriod('monthly')}
                           className={`relative py-2 px-6 rounded-full text-sm font-medium ${
                              billingPeriod === 'monthly' ? 'text-white' : 'text-gray-800 hover:text-gray-900'
                           }`}
                        >
                           Monthly
                        </button>
                        <button
                           onClick={() => setBillingPeriod('annual')}
                           className={`relative py-2 px-6 rounded-full text-sm font-medium ${
                              billingPeriod === 'annual' ? 'text-white' : 'text-gray-800 hover:text-gray-900'
                           }`}
                        >
                           Annual <span className='text-green-600 font-bold'>-20%</span>
                        </button>
                        <div
                           className={`absolute inset-0 m-1 pointer-events-none transition-all duration-300 ease-in-out ${
                              billingPeriod === 'annual' ? 'translate-x-full' : 'translate-x-0'
                           }`}
                           style={{
                              width: 'calc(50% - 0.5rem)',
                              borderRadius: '9999px',
                              background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                           }}
                        />
                     </div>
                  </div> */}
               </motion.div>{' '}
               <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                  {(visiblePlans as PlanWithDisabled[]).map((plan, index) => (
                     <motion.div
                        key={plan.name}
                        custom={index}
                        variants={cardVariants}
                        initial='hidden'
                        animate='visible'
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`relative rounded-2xl overflow-hidden ${
                           plan.mostPopular
                              ? 'border-2 border-purple-500 shadow-xl'
                              : 'border border-gray-200 shadow-md'
                        } bg-white/60`}
                     >
                        {plan.mostPopular && (
                           <div className='absolute top-0 right-0 left-0 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold text-center'>
                              Most Popular
                           </div>
                        )}

                        <div className={`px-6 py-8 ${plan.mostPopular ? 'pt-10' : ''}`}>
                           <h3 className='text-xl font-semibold text-gray-900'>{plan.name}</h3>
                           <div className='mt-4 flex items-baseline'>
                              <span className='text-4xl font-bold text-gray-900'>
                                 ${billingPeriod === 'annual' ? (parseInt(plan.price) * 0.8).toFixed(0) : plan.price}
                              </span>
                              <span className='ml-1 text-gray-600'>/month</span>
                           </div>
                           {billingPeriod === 'annual' && (
                              <div className='mt-1 text-sm text-green-800 font-medium'>Billed annually</div>
                           )}
                           <p className='mt-2 text-gray-600'>{plan.description}</p>

                           <ul className='mt-6 space-y-3'>
                              {plan.features.map((feature, i) => (
                                 <li
                                    key={i}
                                    className='flex items-start'
                                 >
                                    <div className='flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-purple-100 text-purple-600'>
                                       <Check className='w-3.5 h-3.5' />
                                    </div>
                                    <span className='ml-2 text-sm text-gray-600'>{feature}</span>
                                 </li>
                              ))}
                           </ul>

                           <motion.button
                              whileHover={{ scale: processingPlan === plan.id ? 1 : 1.02 }}
                              whileTap={{ scale: processingPlan === plan.id ? 1 : 0.98 }}
                              className={`mt-8 w-full py-3 px-4 rounded-md flex items-center justify-center text-center font-medium transition-colors ${
                                 plan.id === 'free'
                                    ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                                    : plan.mostPopular
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              } ${processingPlan === plan.id || plan.disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={plan.disabled || processingPlan === plan.id}
                           >
                              {processingPlan === plan.id ? (
                                 <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2'></div>
                                    Processing...
                                 </>
                              ) : (
                                 <>
                                    {plan.buttonText}
                                    <ChevronRight className='ml-1 w-4 h-4' />
                                 </>
                              )}
                           </motion.button>
                        </div>
                     </motion.div>
                  ))}
               </div>{' '}
               <div className='mt-16 text-center'>
                  <h3 className='text-lg font-medium text-gray-900'>Need a custom solution?</h3>
                  <p className='mt-2 text-gray-600'>
                     Contact our sales team for a tailored package that meets your specific requirements.
                  </p>
                  <button className='mt-4 inline-flex items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
                     Contact Sales
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}

export default PricingPage
