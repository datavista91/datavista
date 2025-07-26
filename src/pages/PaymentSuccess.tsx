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
            console.log('🚀 PaymentSuccess: Starting verification process')
            console.log('🔍 User object:', user)
            
            // If no user is logged in, redirect to login
            if (!user) {
               console.log('⚠️ No user logged in, redirecting to login')
               navigate('/signin')
               return
            }

            // Try to get payment ID from URL parameter or search params
            const paymentIdToVerify = paymentId || 
                                    searchParams.get('payment_id') || 
                                    searchParams.get('paymentId') ||
                                    searchParams.get('transaction_id') ||
                                    searchParams.get('transactionId') ||
                                    searchParams.get('order_id') ||
                                    searchParams.get('orderId') ||
                                    searchParams.get('id')
            
            console.log('🔍 PaymentSuccess debugging:', {
               urlPaymentId: paymentId,
               searchParams: Object.fromEntries(searchParams.entries()),
               finalPaymentId: paymentIdToVerify,
               currentUrl: window.location.href,
               allPossibleIds: {
                  payment_id: searchParams.get('payment_id'),
                  paymentId: searchParams.get('paymentId'),
                  transaction_id: searchParams.get('transaction_id'),
                  transactionId: searchParams.get('transactionId'),
                  order_id: searchParams.get('order_id'),
                  orderId: searchParams.get('orderId'),
                  id: searchParams.get('id'),
               },
               possibleStatus: {
                  status: searchParams.get('status'),
                  payment_status: searchParams.get('payment_status'),
                  success: searchParams.get('success'),
                  result: searchParams.get('result'),
               }
            })
            
            if (!paymentIdToVerify) {
               console.log('❌ No payment ID found in URL or localStorage')
               console.log('🔄 Attempting to verify most recent payment for user...')
               
               // Try to verify the most recent payment for this user first
               try {
                  console.log('📞 Calling /api/verify-recent-payment with userId:', user.id)
                  const response = await fetch('/api/verify-recent-payment', {
                     method: 'POST',
                     headers: {
                        'Content-Type': 'application/json',
                     },
                     body: JSON.stringify({
                        userId: user.id
                     })
                  })
                  
                  console.log('📞 Response status:', response.status)
                  const result = await response.json()
                  console.log('📞 Response result:', result)
                  
                  if (response.ok && result.success) {
                     console.log('✅ Found recent payment:', result.payment)
                     setPaymentDetails(result.payment)
                     setPaymentStatus('success')
                     localStorage.removeItem('dodo_payment_attempt')
                     return
                  } else {
                     console.log('❌ No recent payment found:', result)
                  }
               } catch (recentPaymentError) {
                  console.log('❌ Could not verify recent payment:', recentPaymentError)
               }
               
               // Fallback to localStorage for backward compatibility
               console.log('🔍 Checking localStorage for dodo_payment_attempt...')
               const storedAttempt = localStorage.getItem('dodo_payment_attempt')
               console.log('🔍 Stored attempt:', storedAttempt)
               
               if (storedAttempt) {
                  const paymentAttempt = JSON.parse(storedAttempt)
                  console.log('⚠️ Using localStorage fallback')
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
               
               console.log('❌ All verification methods failed')
               setErrorMessage('Payment verification failed. If your payment was successful, please check your email for confirmation.')
               setPaymentStatus('failed')
               return
            }

            console.log('🔍 Verifying payment:', paymentIdToVerify)

            // Call our verification API
            try {
               console.log('📞 Calling /api/verify-payment with:', { paymentId: paymentIdToVerify, userId: user.id })
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

               console.log('📞 verify-payment Response status:', response.status)
               const result = await response.json()
               console.log('📞 verify-payment Response result:', result)

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
            } catch (apiError) {
               console.error('❌ API call error:', apiError)
               setErrorMessage('Failed to verify payment. Please try again.')
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

   // Debug function to manually test recent payment verification
   const testRecentPayment = async () => {
      console.log('🧪 Manual test: Recent payment verification')
      console.log('🔍 Current user:', user)
      
      if (!user) {
         console.log('❌ No user for manual test')
         return
      }
      
      try {
         console.log('📞 Manual API call to /api/verify-recent-payment')
         const response = await fetch('/api/verify-recent-payment', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               userId: user.id
            })
         })
         
         console.log('📞 Manual test response status:', response.status)
         const result = await response.json()
         console.log('📞 Manual test response result:', result)
         
         if (response.ok && result.success) {
            console.log('✅ Manual test SUCCESS:', result.payment)
            setPaymentDetails(result.payment)
            setPaymentStatus('success')
         } else {
            console.log('❌ Manual test FAILED:', result)
         }
      } catch (error) {
         console.error('❌ Manual test ERROR:', error)
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
                  
                  {/* Debug button - remove in production */}
                  <button
                     onClick={testRecentPayment}
                     className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                     🧪 Debug: Test Recent Payment
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
