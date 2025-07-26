import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

interface PaymentDetails {
   id: string
   status: string
   planType: string
   amount: number
   timestamp: string
}

const PaymentSuccess = () => {
   const { user } = useAuth()
   const navigate = useNavigate()
   const { paymentId } = useParams()
   const [searchParams] = useSearchParams()
   const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
   const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
   const [errorMessage, setErrorMessage] = useState('')

   useEffect(() => {
      const verifyPayment = async () => {
         try {
            // If no user is logged in, redirect to login
            if (!user) {
               console.log('⚠️ No user logged in, redirecting to login')
               navigate('/signin')
               return
            }

            // Try to get payment ID from URL parameter or search params
            const paymentIdToVerify = paymentId || searchParams.get('payment_id') || searchParams.get('paymentId')
            
            if (!paymentIdToVerify) {
               // Fallback to localStorage for backward compatibility
               const storedAttempt = localStorage.getItem('dodo_payment_attempt')
               if (storedAttempt) {
                  const paymentAttempt = JSON.parse(storedAttempt)
                  console.log('⚠️ No payment ID in URL, using localStorage fallback')
                  setPaymentDetails({
                     id: 'unknown',
                     status: 'success',
                     planType: paymentAttempt.planType,
                     amount: 0,
                     timestamp: paymentAttempt.timestamp
                  })
                  setPaymentStatus('success')
                  localStorage.removeItem('dodo_payment_attempt')
                  return
               }
               
               console.log('❌ No payment ID found in URL or localStorage')
               setErrorMessage('Payment ID not found. Please check your payment confirmation email or contact support.')
               setPaymentStatus('failed')
               return
            }

            console.log('🔍 Verifying payment:', paymentIdToVerify)

            // Call our verification API
            const response = await fetch('/api/verify-payment', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  paymentId: paymentIdToVerify,
                  userId: user.id
               })
            })

            const result = await response.json()

            if (response.ok && result.success) {
               console.log('✅ Payment verified successfully:', result.payment)
               setPaymentDetails(result.payment)
               setPaymentStatus('success')
               
               // Clear any old localStorage data
               localStorage.removeItem('dodo_payment_attempt')
            } else {
               console.log('❌ Payment verification failed:', result)
               setErrorMessage(result.error || 'Payment verification failed')
               setPaymentStatus('failed')
            }
            
         } catch (error) {
            console.error('❌ Payment verification error:', error)
            setErrorMessage('Failed to verify payment. Please try again.')
            setPaymentStatus('failed')
         }
      }

      verifyPayment()
   }, [user, paymentId, searchParams, navigate])

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
                  className="text-center"
               >
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                  <p className="text-gray-600">Please wait while we confirm your payment...</p>
               </motion.div>
            )

         case 'success':
            return (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
               >
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                     Thank you for your purchase. Your subscription has been activated.
                  </p>
                  
                  {paymentDetails && (
                     <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between">
                              <span className="text-gray-600">Plan:</span>
                              <span className="font-medium text-gray-900">
                                 {paymentDetails.planType?.replace('-annual', '')} 
                                 {paymentDetails.planType?.includes('-annual') && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                       Annual (20% off)
                                    </span>
                                 )}
                              </span>
                           </div>
                           {paymentDetails.amount > 0 && (
                              <div className="flex justify-between">
                                 <span className="text-gray-600">Amount:</span>
                                 <span className="font-medium text-gray-900">${paymentDetails.amount}</span>
                              </div>
                           )}
                           <div className="flex justify-between">
                              <span className="text-gray-600">Payment ID:</span>
                              <span className="font-mono text-sm text-gray-500">{paymentDetails.id}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="text-gray-500">
                                 {new Date(paymentDetails.timestamp).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                     </div>
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                     <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                     <ul className="text-sm text-green-700 space-y-1">
                        <li>• Access your premium features in the dashboard</li>
                        <li>• Upload and analyze unlimited datasets</li>
                        <li>• Get AI-powered insights and reports</li>
                        <li>• Priority customer support</li>
                     </ul>
                  </div>
                  <button
                     onClick={handleContinue}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                     Go to Dashboard
                  </button>
               </motion.div>
            )

         case 'failed':
            return (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
               >
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
                  <p className="text-gray-600 mb-4">
                     {errorMessage || 'We couldn\'t verify your payment. This might be due to:'}
                  </p>
                  
                  {!errorMessage && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <ul className="text-sm text-red-700 space-y-1">
                           <li>• Payment was cancelled</li>
                           <li>• Network connectivity issues</li>
                           <li>• Payment provider issues</li>
                        </ul>
                     </div>
                  )}
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                     <h4 className="text-sm font-medium text-yellow-900 mb-2">Need Help?</h4>
                     <p className="text-sm text-yellow-800">
                        If your payment was processed but you're seeing this error, please check your email 
                        for payment confirmation and contact our support team with your payment details.
                     </p>
                  </div>
                  
                  <button
                     onClick={handleContinue}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
         >
            {renderContent()}
         </motion.div>
      </div>
   )
}

export default PaymentSuccess
