import { auth } from '../firebase'

class DodoPaymentsService {
   constructor() {
      this.baseUrl = 'https://test.checkout.dodopayments.com'
      this.productIds = {
         pro: import.meta.env.VITE_DODO_PRO_PRODUCT_ID,
         'pro-annual': import.meta.env.VITE_DODO_PRO_PRODUCT_ID_ANNUALLY,
         enterprise: import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID,
         'enterprise-annual': import.meta.env.VITE_DODO_ENTERPRISE_PRODUCT_ID_ANNUALLY,
      }
      this.redirectUrl = `${import.meta.env.VITE_PRODUCTION_URL || window.location.origin}/payment-success`
   }

   /**
    * Generate static payment link for DODO checkout
    * @param {string} planType - 'pro', 'pro-annual', 'enterprise', or 'enterprise-annual'
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
    * @param {string} planType - 'pro', 'pro-annual', 'enterprise', or 'enterprise-annual'
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
    * @param {string} planType - 'pro', 'pro-annual', 'enterprise', or 'enterprise-annual'
    * @returns {Object} Plan details
    */
   getPlanConfig(planType) {
      const configs = {
         pro: {
            name: 'Pro',
            price: 49,
            currency: 'USD',
            billing: 'monthly',
            features: {
               datasetLimit: 'unlimited',
               aiRequestsPerDay: 500,
               advancedInsights: true,
               customCharts: true,
               prioritySupport: true,
               teamCollaboration: 3,
            },
         },
         'pro-annual': {
            name: 'Pro Annual',
            price: 39,
            currency: 'USD',
            billing: 'annual',
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
            billing: 'monthly',
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
         'enterprise-annual': {
            name: 'Enterprise Annual',
            price: 159,
            currency: 'USD',
            billing: 'annual',
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

   /**
    * Get the correct plan type based on billing period
    * @param {string} basePlan - 'pro' or 'enterprise'
    * @param {string} billingPeriod - 'monthly' or 'annual'
    * @returns {string} Complete plan type
    */
   getFullPlanType(basePlan, billingPeriod) {
      if (billingPeriod === 'annual') {
         return `${basePlan}-annual`
      }
      return basePlan
   }

   /**
    * Get the base plan from full plan type
    * @param {string} fullPlanType - e.g., 'pro-annual' or 'pro'
    * @returns {string} Base plan type
    */
   getBasePlanType(fullPlanType) {
      return fullPlanType.replace('-annual', '')
   }

   /**
    * Check if plan type is annual
    * @param {string} planType - The plan type to check
    * @returns {boolean} True if annual plan
    */
   isAnnualPlan(planType) {
      return planType.includes('-annual')
   }
}

// Export singleton instance
export default new DodoPaymentsService()
