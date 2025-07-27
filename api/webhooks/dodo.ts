import { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK with better error handling
let adminApp: any
let db: any

async function initializeFirebaseAdmin() {
   if (getApps().length === 0) {
      try {
         const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
         const privateKey = process.env.FIREBASE_PRIVATE_KEY
         const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

         let serviceAccount: any

         if (projectId && privateKey && clientEmail) {
            serviceAccount = {
               type: 'service_account',
               project_id: projectId,
               private_key: privateKey.replace(/\\n/g, '\n'),
               client_email: clientEmail,
            }
         } else {
            const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            if (!serviceAccountKey) {
               throw new Error('Firebase credentials not found')
            }

            let cleanedKey = serviceAccountKey.trim()
            if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
               cleanedKey = cleanedKey.slice(1, -1)
            }
            cleanedKey = cleanedKey.replace(/\\"/g, '"')

            serviceAccount = JSON.parse(cleanedKey)
            
            const requiredFields = ['project_id', 'private_key', 'client_email']
            const missingFields = requiredFields.filter((field) => !serviceAccount[field])
            if (missingFields.length > 0) {
               throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
            }

            if (serviceAccount.private_key) {
               serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
            }
         }

         adminApp = initializeApp({
            credential: cert(serviceAccount),
         })
         db = getFirestore(adminApp)

         return { adminApp, db }
      } catch (error: any) {
         console.error('Failed to initialize Firebase Admin:', error.message)
         throw error
      }
   } else {
      adminApp = getApps()[0]
      db = getFirestore(adminApp)
      return { adminApp, db }
   }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
   res.setHeader('Access-Control-Allow-Origin', '*')
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-dodo-signature')

   if (req.method === 'OPTIONS') {
      return res.status(200).end()
   }

   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
   }

   try {
      await initializeFirebaseAdmin()

      const signature = req.headers['x-dodo-signature'] as string
      const webhookSecret = process.env.DODO_WEBHOOK_KEY

      if (!webhookSecret) {
         return res.status(500).json({ error: 'Webhook secret not configured' })
      }

      const event = req.body

      if (!event || !event.type) {
         return res.status(400).json({ error: 'Invalid webhook payload' })
      }

      switch (event.type) {
         case 'payment.succeeded':
            await handlePaymentSuccess(event.data)
            break
         case 'payment.failed':
            await handlePaymentFailed(event.data)
            break
         default:
            console.log('Unhandled webhook event type:', event.type)
      }

      res.status(200).json({
         received: true,
         processed: true,
         eventType: event.type,
         timestamp: new Date().toISOString(),
      })
   } catch (error: any) {
      console.error('Webhook processing error:', error.message)
      res.status(500).json({
         error: 'Webhook processing failed',
         details: error.message,
         timestamp: new Date().toISOString(),
      })
   }
}

async function handlePaymentSuccess(paymentData: any) {
   try {
      const { metadata, total_amount, payment_id, currency, customer } = paymentData

      if (!metadata) {
         throw new Error('Missing payment metadata')
      }

      const { userId, planType } = metadata
      const userEmail = customer?.email || 'unknown'

      if (!userId || !planType) {
         throw new Error('Missing required metadata: userId or planType')
      }

      const expiryDate = new Date()
      const isAnnualPlan = planType.includes('-annual')

      if (isAnnualPlan) {
         expiryDate.setDate(expiryDate.getDate() + 365)
      } else {
         expiryDate.setDate(expiryDate.getDate() + 30)
      }

      const basePlanType = planType.replace('-annual', '')

      const planFeatures: any = {
         pro: {
            datasetLimit: 'unlimited',
            aiRequestsPerDay: 500,
            advancedInsights: true,
            customCharts: true,
            prioritySupport: true,
            teamCollaboration: 3,
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
            slaGuarantees: true,
         },
      }

      const userRef = db.collection('users').doc(userId)

      const subscriptionData = {
         subscription: {
            plan: basePlanType,
            planType: planType,
            billing: isAnnualPlan ? 'annual' : 'monthly',
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            features: planFeatures[basePlanType] || {},
            lastUpdated: new Date().toISOString(),
         },
         usage: {
            aiRequestsToday: 0,
            aiRequestsThisMonth: 0,
            datasetsUploaded: 0,
            lastResetDate: new Date().toISOString(),
         },
      }

      await userRef.set(subscriptionData, { merge: true })

      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)

      const paymentHistoryData = {
         paymentId: payment_id,
         amount: total_amount,
         currency: currency || 'USD',
         planType: planType,
         basePlan: basePlanType,
         billing: isAnnualPlan ? 'annual' : 'monthly',
         status: 'completed',
         timestamp: new Date().toISOString(),
         provider: 'dodo',
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString(),
         },
      }

      await paymentHistoryRef.set(paymentHistoryData)

      const globalPaymentRef = db.collection('payments').doc(payment_id)
      const globalPaymentData = {
         paymentId: payment_id,
         userId: userId,
         userEmail: userEmail,
         amount: total_amount,
         currency: currency || 'USD',
         planType: planType,
         basePlan: basePlanType,
         billing: isAnnualPlan ? 'annual' : 'monthly',
         status: 'paid',
         timestamp: new Date().toISOString(),
         provider: 'dodo',
         metadata: metadata,
      }

      await globalPaymentRef.set(globalPaymentData)

      console.log('Payment processing completed:', {
         userId,
         planType,
         paymentId: payment_id,
         amount: total_amount,
      })
   } catch (error: any) {
      console.error('Payment success processing error:', error)
      throw error
   }
}

async function handlePaymentFailed(paymentData: any) {
   try {
      const { metadata, payment_id, failure_reason } = paymentData

      if (!metadata) {
         throw new Error('Missing payment metadata')
      }

      const { userId, planType } = metadata

      if (!userId) {
         throw new Error('Missing required metadata: userId')
      }

      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)

      const failedPaymentData = {
         paymentId: payment_id,
         planType,
         status: 'failed',
         timestamp: new Date().toISOString(),
         provider: 'dodo',
         failureReason: failure_reason,
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString(),
         },
      }

      await paymentHistoryRef.set(failedPaymentData)

      console.log('Failed payment recorded:', {
         userId,
         planType,
         paymentId: payment_id,
         failureReason: failure_reason,
      })
   } catch (error: any) {
      console.error('Payment failure processing error:', error)
      throw error
   }
}
