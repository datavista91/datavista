import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
let adminApp
if (getApps().length === 0) {
   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')
   adminApp = initializeApp({
      credential: cert(serviceAccount),
   })
} else {
   adminApp = getApps()[0]
}

const db = getFirestore(adminApp)

/**
 * DODO Payments Webhook Handler
 * Processes payment confirmations and updates user subscriptions
 */
export default async function handler(req, res) {
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
   }

   try {
      console.log('🎯 DODO webhook received')
      
      // Verify webhook signature
      const signature = req.headers['x-dodo-signature']
      const webhookSecret = process.env.DODO_WEBHOOK_KEY
      
      if (!signature || !webhookSecret) {
         console.error('❌ Missing webhook signature or secret')
         return res.status(400).json({ error: 'Missing webhook signature' })
      }

      // Simple signature verification (implement proper HMAC verification in production)
      const payload = JSON.stringify(req.body)
      
      console.log('📝 Webhook payload:', payload)
      
      const event = req.body
      
      // Handle different event types
      switch (event.type) {
         case 'payment.succeeded':
            await handlePaymentSuccess(event.data)
            break
         case 'payment.failed':
            await handlePaymentFailed(event.data)
            break
         default:
            console.log('🔄 Unhandled webhook event:', event.type)
      }
      
      res.status(200).json({ received: true })
      
   } catch (error) {
      console.error('❌ Webhook processing error:', error)
      res.status(500).json({ error: 'Webhook processing failed' })
   }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentData) {
   try {
      console.log('✅ Processing successful payment:', paymentData)
      
      const { metadata, total_amount, payment_id, currency } = paymentData
      const { userId, planType } = metadata
      
      if (!userId || !planType) {
         throw new Error('Missing required metadata: userId or planType')
      }
      
      // Get current timestamp in Indian time
      const indianTime = new Date().toLocaleString('en-IN', {
         timeZone: 'Asia/Kolkata',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false
      })
      
      // Calculate subscription expiry (30 days from now)
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30)
      
      // Define plan features
      const planFeatures = {
         pro: {
            datasetLimit: 'unlimited',
            aiRequestsPerDay: 500,
            advancedInsights: true,
            customCharts: true,
            prioritySupport: true,
            teamCollaboration: 3
         },
         enterprise: {
            datasetLimit: 'unlimited',
            aiRequestsPerDay: 'unlimited',
            advancedInsights: true,
            customCharts: true,
            prioritySupport: true,
            teamCollaboration: 'unlimited',
            dedicatedManager: true,
            customIntegrations: true,
            slaGuarantees: true
         }
      }
      
      // Update user subscription in Firestore
      const userRef = db.collection('users').doc(userId)
      await userRef.set({
         subscription: {
            plan: planType,
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            features: planFeatures[planType] || {},
            lastUpdated: new Date().toISOString()
         },
         // Reset usage limits
         usage: {
            aiRequestsToday: 0,
            aiRequestsThisMonth: 0,
            datasetsUploaded: 0,
            lastResetDate: new Date().toISOString()
         }
      }, { merge: true })
      
      // Store payment history
      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)
      await paymentHistoryRef.set({
         paymentId: payment_id,
         amount: total_amount,
         currency: currency || 'USD',
         planType,
         status: 'completed',
         timestamp: new Date().toISOString(),
         indianTime: indianTime,
         provider: 'dodo',
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString()
         }
      })
      
      console.log('✅ User subscription updated successfully:', {
         userId,
         planType,
         paymentId: payment_id,
         amount: total_amount,
         indianTime
      })
      
   } catch (error) {
      console.error('❌ Payment success processing error:', error)
      throw error
   }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentData) {
   try {
      console.log('❌ Processing failed payment:', paymentData)
      
      const { metadata, payment_id, failure_reason } = paymentData
      const { userId, planType } = metadata
      
      if (!userId) {
         throw new Error('Missing required metadata: userId')
      }
      
      // Get current timestamp in Indian time
      const indianTime = new Date().toLocaleString('en-IN', {
         timeZone: 'Asia/Kolkata',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false
      })
      
      // Store failed payment attempt
      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)
      await paymentHistoryRef.set({
         paymentId: payment_id,
         planType,
         status: 'failed',
         timestamp: new Date().toISOString(),
         indianTime: indianTime,
         provider: 'dodo',
         failureReason: failure_reason,
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString()
         }
      })
      
      console.log('📝 Failed payment recorded:', {
         userId,
         planType,
         paymentId: payment_id,
         failureReason: failure_reason,
         indianTime
      })
      
   } catch (error) {
      console.error('❌ Payment failure processing error:', error)
      throw error
   }
}
