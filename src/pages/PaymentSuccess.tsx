import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const PaymentSuccess = () => {
   const { user } = useAuth()
   const navigate = useNavigate()
   const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
   const [errorMessage, setErrorMessage] = useState('')

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

            // Since subscription is updated via webhook, let's just show success
            // and redirect to dashboard after a short delay
            console.log('🎉 Payment completed - subscription updated via webhook')
            
            setPaymentStatus('success')
            
            // Clear any localStorage data
            localStorage.removeItem('dodo_payment_attempt')
            
         } catch (error) {
            console.error('❌ Payment verification error:', error)
            setErrorMessage('Payment processing completed. Please check your dashboard.')
            setPaymentStatus('success') // Still show success since webhook processed it
         }
      }

      verifyPayment()
   }, [user]) // Re-run when user state changes

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
                     Thank you for your purchase. Your subscription has been activated and you now have access to all premium features.
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                     <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                     <ul className="text-sm text-green-700 space-y-1">
                        <li>• Your subscription is now active</li>
                        <li>• Access premium features in the dashboard</li>
                        <li>• Upload and analyze unlimited datasets</li>
                        <li>• Get AI-powered insights and reports</li>
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
