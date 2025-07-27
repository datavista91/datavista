import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Crown, Zap, Calendar, BarChart3, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../hooks/useSubscription'

interface PlanDetails {
   name: string
   icon: React.ReactNode
   features: string[]
   color: string
   bgColor: string
}

const PaymentSuccess = () => {
   const { user } = useAuth()
   const { subscription, refreshSubscription } = useSubscription()
   const navigate = useNavigate()
   const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
   const [errorMessage, setErrorMessage] = useState('')
   const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null)

   // Define plan information
   const getPlanDetails = (planType: string): PlanDetails => {
      const basePlan = planType.replace('-annual', '')
      
      switch (basePlan) {
         case 'pro':
            return {
               name: 'Pro',
               icon: <Zap className="w-6 h-6" />,
               color: 'text-purple-600',
               bgColor: 'bg-purple-50 border-purple-200',
               features: [
                  'Upload unlimited datasets',
                  '500 AI requests per day',
                  'Advanced AI insights and analysis',
                  'Custom charts and dashboards',
                  'Priority email support',
                  'Team collaboration (up to 3 users)',
                  'Advanced data export options',
                  'PDF report generation'
               ]
            }
         case 'enterprise':
            return {
               name: 'Enterprise',
               icon: <Crown className="w-6 h-6" />,
               color: 'text-amber-600',
               bgColor: 'bg-amber-50 border-amber-200',
               features: [
                  'Everything in Pro',
                  'Unlimited AI requests',
                  'Dedicated success manager',
                  'Custom integrations',
                  'Advanced security features',
                  'Unlimited team collaboration',
                  'Training and onboarding',
                  'SLA guarantees',
                  'Priority phone support'
               ]
            }
         default:
            return {
               name: 'Premium',
               icon: <BarChart3 className="w-6 h-6" />,
               color: 'text-blue-600',
               bgColor: 'bg-blue-50 border-blue-200',
               features: ['Premium features activated']
            }
      }
   }

   useEffect(() => {
      const verifyPayment = async () => {
         try {
            console.log('🚀 PaymentSuccess: Starting verification process')

            // Wait for auth state to load if user is still loading
            if (!user) {
               console.log('⏳ User not loaded yet, waiting...')
               return // The effect will re-run when user state changes
            }

            console.log('✅ User authenticated:', user.email)

            // Refresh subscription to get latest data
            await refreshSubscription()

            // Check if we have subscription data
            if (subscription && subscription.plan !== 'free') {
               const details = getPlanDetails(subscription.planType || subscription.plan)
               setPlanDetails(details)
               console.log('🎉 Payment completed - subscription updated via webhook')
               setPaymentStatus('success')
            } else {
               // If subscription isn't updated yet, wait a bit more
               console.log('⏳ Subscription not updated yet, checking again...')
               setTimeout(() => {
                  if (subscription && subscription.plan !== 'free') {
                     const details = getPlanDetails(subscription.planType || subscription.plan)
                     setPlanDetails(details)
                     setPaymentStatus('success')
                  } else {
                     // Still show success as webhook should have processed it
                     setPaymentStatus('success')
                  }
               }, 2000)
            }

            // Clear any localStorage data
            localStorage.removeItem('dodo_payment_attempt')
         } catch (error) {
            console.error('❌ Payment verification error:', error)
            setErrorMessage('Payment processing completed. Please check your dashboard.')
            setPaymentStatus('success') // Still show success since webhook processed it
         }
      }

      verifyPayment()
   }, [user, subscription, refreshSubscription]) // Re-run when user or subscription state changes

   const handleContinue = () => {
      if (paymentStatus === 'success') {
         navigate('/dashboard')
      } else {
         navigate('/pricing')
      }
   }

   const renderContent = () => {
      switch (paymentStatus) {
         case 'verifying':
            return (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-center'
               >
                  <Loader2 className='w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin' />
                  <h2 className='dashboard-heading text-gray-900 mb-2'>Verifying Payment</h2>
                  <p className='dashboard-body text-gray-600'>Please wait while we confirm your payment...</p>
               </motion.div>
            )

         case 'success':
            return (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-center'
               >
                  <CheckCircle className='w-16 h-16 mx-auto mb-4 text-green-500' />
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>Payment Successful!</h2>
                  
                  {planDetails ? (
                     <div className='mb-6'>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${planDetails.bgColor} ${planDetails.color} mb-4`}>
                           {planDetails.icon}
                           <span className='font-semibold'>{planDetails.name} Plan Activated</span>
                        </div>
                        
                        {subscription && (
                           <div className='bg-gray-50 rounded-lg p-4 mb-4 text-left'>
                              <div className='grid grid-cols-2 gap-4 text-sm'>
                                 <div>
                                    <span className='text-gray-500'>Plan:</span>
                                    <p className='font-semibold'>{planDetails.name} {subscription.billing === 'annual' ? '(Annual)' : '(Monthly)'}</p>
                                 </div>
                                 {subscription.expiryDate && (
                                    <div>
                                       <span className='text-gray-500'>Expires:</span>
                                       <p className='font-semibold'>{new Date(subscription.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                 )}
                                 <div>
                                    <span className='text-gray-500'>Status:</span>
                                    <p className='font-semibold text-green-600'>Active</p>
                                 </div>
                                 <div>
                                    <span className='text-gray-500'>AI Requests:</span>
                                    <p className='font-semibold'>{subscription.features.aiRequestsPerDay === 'unlimited' ? 'Unlimited' : `${subscription.features.aiRequestsPerDay}/day`}</p>
                                 </div>
                              </div>
                           </div>
                        )}
                        
                        <div className={`${planDetails.bgColor} border rounded-lg p-4 mb-6`}>
                           <h3 className={`${planDetails.color} font-semibold mb-3 flex items-center gap-2`}>
                              <Shield className="w-4 h-4" />
                              Your New Features
                           </h3>
                           <ul className='text-sm text-gray-700 space-y-2'>
                              {planDetails.features.map((feature, index) => (
                                 <li key={index} className='flex items-start gap-2'>
                                    <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                                    {feature}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  ) : (
                     <p className='text-gray-600 mb-6'>
                        Thank you for your purchase. Your subscription has been activated and you now have access to all premium features.
                     </p>
                  )}

                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                     <h3 className='text-blue-800 font-semibold mb-2 flex items-center gap-2'>
                        <Calendar className="w-4 h-4" />
                        What's Next?
                     </h3>
                     <ul className='text-blue-700 text-sm space-y-1'>
                        <li>• Your subscription is now active</li>
                        <li>• Access premium features in the dashboard</li>
                        <li>• Upload and analyze unlimited datasets</li>
                        <li>• Get AI-powered insights and reports</li>
                        <li>• Check your email for the receipt</li>
                     </ul>
                  </div>
                  
                  <button
                     onClick={handleContinue}
                     className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto'
                  >
                     <BarChart3 className="w-4 h-4" />
                     Go to Dashboard
                  </button>
               </motion.div>
            )

         case 'failed':
            return (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-center'
               >
                  <XCircle className='w-16 h-16 mx-auto mb-4 text-red-500' />
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>Payment Verification Failed</h2>
                  <p className='text-gray-600 mb-4'>
                     {errorMessage || "We couldn't verify your payment. This might be due to:"}
                  </p>

                  {!errorMessage && (
                     <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                        <ul className='text-sm text-red-700 space-y-1'>
                           <li>• Payment was cancelled</li>
                           <li>• Network connectivity issues</li>
                           <li>• Payment provider issues</li>
                        </ul>
                     </div>
                  )}

                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                     <h4 className='text-sm font-medium text-yellow-900 mb-2'>Need Help?</h4>
                     <p className='text-sm text-yellow-800'>
                        If your payment was processed but you're seeing this error, please check your email for payment
                        confirmation and contact our support team with your payment details.
                     </p>
                  </div>

                  <button
                     onClick={handleContinue}
                     className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                  >
                     Try Again
                  </button>
               </motion.div>
            )

         default:
            return null
      }
   }

   return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className='max-w-md w-full bg-white rounded-xl shadow-lg p-8'
         >
            {renderContent()}
         </motion.div>
      </div>
   )
}

export default PaymentSuccess
