import { auth } from '../firebase'

class DodoPaymentsService {
   constructor() {
      this.baseUrl = 'https://test.checkout.dodopayments.com'
      this.productIds = {
         pro: import.meta.env.VITE_DODO_PRO_PRODUCT_ID,
         enterprise: import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID,
      }
      this.redirectUrl = `${import.meta.env.VITE_PRODUCTION_URL || window.location.origin}/payment-success`
   }

   /**
    * Generate static payment link for DODO checkout
    * @param {string} planType - 'pro' or 'enterprise'
    * @param {string} userEmail - User's email address
    * @param {string} userId - User's Firebase UID
    * @returns {string} Complete payment URL
    */
   generatePaymentLink(planType, userEmail, userId) {
      const productId = this.productIds[planType]

      if (!productId) {
         throw new Error(`Product ID not found for plan: ${planType}`)
      }

      const params = new URLSearchParams({
         quantity: '1',
         redirect_url: this.redirectUrl,
         email: userEmail,
         metadata_userId: userId,
         metadata_planType: planType,
         metadata_timestamp: new Date().toISOString(),
      })

      return `${this.baseUrl}/buy/${productId}?${params.toString()}`
   }

   /**
    * Initiate payment flow
    * @param {string} planType - 'pro' or 'enterprise'
    * @returns {Promise<void>}
    */
   async initiatePayment(planType) {
      try {
         const user = auth.currentUser
         if (!user) {
            throw new Error('User must be logged in to make a payment')
         }

         console.log('🚀 Initiating DODO payment for plan:', planType)

         const paymentUrl = this.generatePaymentLink(planType, user.email, user.uid)

         console.log('💳 Redirecting to DODO checkout:', paymentUrl)

         // Store payment attempt in localStorage for tracking
         const paymentAttempt = {
            userId: user.uid,
            email: user.email,
            planType,
            timestamp: new Date().toISOString(),
            status: 'initiated',
         }
         localStorage.setItem('dodo_payment_attempt', JSON.stringify(paymentAttempt))

         // Redirect to DODO checkout
         window.location.href = paymentUrl
      } catch (error) {
         console.error('❌ Payment initiation error:', error)
         throw error
      }
   }

   /**
    * Get plan configuration
    * @param {string} planType - 'pro' or 'enterprise'
    * @returns {Object} Plan details
    */
   getPlanConfig(planType) {
      const configs = {
         pro: {
            name: 'Pro',
            price: 49,
            currency: 'USD',
            features: {
               datasetLimit: 'unlimited',
               aiRequestsPerDay: 500,
               advancedInsights: true,
               customCharts: true,
               prioritySupport: true,
               teamCollaboration: 3,
            },
         },
         enterprise: {
            name: 'Enterprise',
            price: 199,
            currency: 'USD',
            features: {
               datasetLimit: 'unlimited',
               aiRequestsPerDay: 'unlimited',
               advancedInsights: true,
               customCharts: true,
               prioritySupport: true,
               teamCollaboration: 'unlimited',
               dedicatedManager: true,
               customIntegrations: true,
               slaGuarantees: true,
            },
         },
      }

      return configs[planType] || null
   }

   /**
    * Clear payment attempt from localStorage
    */
   clearPaymentAttempt() {
      localStorage.removeItem('dodo_payment_attempt')
   }

   /**
    * Get stored payment attempt
    * @returns {Object|null} Payment attempt data or null
    */
   getPaymentAttempt() {
      const stored = localStorage.getItem('dodo_payment_attempt')
      return stored ? JSON.parse(stored) : null
   }
}

// Export singleton instance
export default new DodoPaymentsService()
