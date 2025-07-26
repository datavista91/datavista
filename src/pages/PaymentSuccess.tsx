import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface PaymentAttempt {
   userId: string
   email: string
   planType: string
   timestamp: string
   status: string
}

const PaymentSuccess = () => {
   const navigate = useNavigate()
   const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
   const [paymentDetails, setPaymentDetails] = useState<PaymentAttempt | null>(null)

   useEffect(() => {
      const verifyPayment = async () => {
         try {
            // Get payment attempt from localStorage
            const storedAttempt = localStorage.getItem('dodo_payment_attempt')
            const paymentAttempt = storedAttempt ? JSON.parse(storedAttempt) : null
            
            if (!paymentAttempt) {
               console.log('⚠️ No payment attempt found')
               setPaymentStatus('failed')
               return
            }

            console.log('🔍 Verifying payment attempt:', paymentAttempt)
            setPaymentDetails(paymentAttempt)

            // Simulate verification process (in real implementation, you might check with your backend)
            await new Promise(resolve => setTimeout(resolve, 2000))

            // For now, assume success if we have a payment attempt
            // In production, you would verify the payment status with your backend
            setPaymentStatus('success')
            
            // Clear the payment attempt from localStorage
            localStorage.removeItem('dodo_payment_attempt')
            
         } catch (error) {
            console.error('❌ Payment verification error:', error)
            setPaymentStatus('failed')
         }
      }

      verifyPayment()
   }, [])

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
                  <p className="text-gray-600 mb-4">
                     Thank you for upgrading to <span className="font-semibold capitalize">
                        {paymentDetails?.planType?.replace('-annual', '') || 'Pro'}</span> plan
                     {paymentDetails?.planType?.includes('-annual') && <span className="text-green-600"> (Annual)</span>}.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                     <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                     <ul className="text-sm text-green-700 space-y-1">
                        <li>• Your subscription is now active</li>
                        <li>• Enhanced features are available immediately</li>
                        <li>• Check your email for the receipt</li>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h2>
                  <p className="text-gray-600 mb-4">
                     We couldn't verify your payment. This might be due to:
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                     <ul className="text-sm text-red-700 space-y-1">
                        <li>• Payment was cancelled</li>
                        <li>• Network connectivity issues</li>
                        <li>• Payment provider issues</li>
                     </ul>
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
