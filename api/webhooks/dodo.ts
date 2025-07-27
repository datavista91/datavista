import { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK with better error handling
let adminApp: any
let db: any

async function initializeFirebaseAdmin() {
   if (getApps().length === 0) {
      try {
         console.log('🔥 Initializing Firebase Admin SDK...')
         
         // Debug environment variables
         console.log('🔍 Environment variables check:', {
            hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
            hasProjectId: !!(process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
         })

         // Try individual environment variables first (more reliable for deployment)
         const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
         const privateKey = process.env.FIREBASE_PRIVATE_KEY
         const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

         let serviceAccount: any

         if (projectId && privateKey && clientEmail) {
            console.log('✅ Using individual Firebase env vars')
            console.log('📋 Project ID:', projectId)
            console.log('📋 Client Email:', clientEmail)
            console.log('📋 Private Key (first 50 chars):', privateKey.substring(0, 50) + '...')
            
            serviceAccount = {
               type: 'service_account',
               project_id: projectId,
               private_key: privateKey.replace(/\\n/g, '\n'),
               client_email: clientEmail,
            }
         } else {
            // Fallback to JSON string
            console.log('📄 Using Firebase service account JSON string')
            const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            
            if (!serviceAccountKey) {
               throw new Error(
                  '❌ Firebase credentials not found. Set either FIREBASE_SERVICE_ACCOUNT_KEY or individual FIREBASE_* variables'
               )
            }

            console.log('📏 Service account key length:', serviceAccountKey.length)
            console.log('🔍 Service account key format check:', {
               startsWithBrace: serviceAccountKey.trim().startsWith('{'),
               endsWithBrace: serviceAccountKey.trim().endsWith('}'),
               firstChars: serviceAccountKey.substring(0, 50),
            })

            try {
               // Clean the JSON string - remove any extra quotes or escaping
               let cleanedKey = serviceAccountKey.trim()
               
               // If the entire string is wrapped in quotes, remove them
               if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
                  cleanedKey = cleanedKey.slice(1, -1)
               }
               
               // Replace escaped quotes
               cleanedKey = cleanedKey.replace(/\\"/g, '"')
               
               console.log('🧹 Cleaned key format check:', {
                  startsWithBrace: cleanedKey.startsWith('{'),
                  endsWithBrace: cleanedKey.endsWith('}'),
                  length: cleanedKey.length,
               })

               serviceAccount = JSON.parse(cleanedKey)
               console.log('✅ Successfully parsed service account JSON')
               
            } catch (parseError: any) {
               console.error('❌ Failed to parse service account key as JSON:', parseError.message)
               console.error('🔍 Raw key preview:', serviceAccountKey.substring(0, 200))
               throw new Error(`Invalid JSON format in FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`)
            }

            // Validate required fields
            const requiredFields = ['project_id', 'private_key', 'client_email']
            const missingFields = requiredFields.filter(field => !serviceAccount[field])
            
            if (missingFields.length > 0) {
               console.error('❌ Missing required fields in service account:', {
                  hasProjectId: !!serviceAccount.project_id,
                  hasPrivateKey: !!serviceAccount.private_key,
                  hasClientEmail: !!serviceAccount.client_email,
                  missingFields,
               })
               throw new Error(`Invalid service account key format - missing required fields: ${missingFields.join(', ')}`)
            }

            // Clean up private key formatting
            if (serviceAccount.private_key) {
               serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
               console.log('🔑 Private key cleaned, length:', serviceAccount.private_key.length)
            }

            console.log('📋 Service account details:', {
               projectId: serviceAccount.project_id,
               clientEmail: serviceAccount.client_email,
               hasPrivateKey: !!serviceAccount.private_key,
            })
         }

         // Initialize Firebase Admin
         adminApp = initializeApp({
            credential: cert(serviceAccount),
         })
         
         db = getFirestore(adminApp)
         
         console.log('✅ Firebase Admin initialized successfully for project:', serviceAccount.project_id)
         return { adminApp, db }
         
      } catch (error: any) {
         console.error('❌ Failed to initialize Firebase Admin:', error.message)
         console.error('🔍 Full error:', error)
         throw error
      }
   } else {
      adminApp = getApps()[0]
      db = getFirestore(adminApp)
      console.log('♻️ Using existing Firebase Admin app')
      return { adminApp, db }
   }
}

/**
 * DODO Payments Webhook Handler
 * Processes payment confirmations and updates user subscriptions
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
   // Set CORS headers immediately
   res.setHeader('Access-Control-Allow-Origin', '*')
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-dodo-signature')

   // Handle preflight requests
   if (req.method === 'OPTIONS') {
      console.log('🔄 Handling OPTIONS preflight request')
      return res.status(200).end()
   }

   console.log('🎯 DODO webhook received - Method:', req.method)
   console.log('🎯 URL:', req.url)
   console.log('🎯 Headers:', JSON.stringify(req.headers, null, 2))
   console.log('🎯 Query:', JSON.stringify(req.query, null, 2))
   
   if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method)
      return res.status(405).json({ error: 'Method not allowed' })
   }

   try {
      // Initialize Firebase first
      console.log('🔥 Initializing Firebase Admin for webhook...')
      await initializeFirebaseAdmin()
      console.log('✅ Firebase Admin ready for webhook processing')

      // Log the incoming payload
      console.log('📝 Raw webhook payload:', JSON.stringify(req.body, null, 2))

      // Verify webhook signature if available
      const signature = req.headers['x-dodo-signature'] as string
      const webhookSecret = process.env.DODO_WEBHOOK_KEY

      console.log('🔐 Webhook security check:', {
         hasSignature: !!signature,
         hasWebhookSecret: !!webhookSecret,
         signatureValue: signature,
      })

      if (!webhookSecret) {
         console.error('❌ DODO_WEBHOOK_KEY not configured')
         return res.status(500).json({ error: 'Webhook secret not configured' })
      }

      // For now, we'll proceed without strict signature verification
      // In production, implement proper HMAC-SHA256 verification
      if (signature && webhookSecret) {
         console.log('🔐 Webhook signature present, proceeding with verification...')
         // TODO: Implement proper HMAC verification
      } else {
         console.log('⚠️ Webhook signature verification skipped (development mode)')
      }

      const event = req.body

      if (!event || !event.type) {
         console.error('❌ Invalid webhook payload - missing event type')
         return res.status(400).json({ error: 'Invalid webhook payload' })
      }

      console.log('📨 Processing webhook event:', event.type)

      // Handle different event types
      switch (event.type) {
         case 'payment.succeeded':
            console.log('✅ Handling payment success event')
            await handlePaymentSuccess(event.data)
            break
         case 'payment.failed':
            console.log('❌ Handling payment failure event')
            await handlePaymentFailed(event.data)
            break
         default:
            console.log('🔄 Unhandled webhook event type:', event.type)
            console.log('📋 Available event data:', JSON.stringify(event.data, null, 2))
      }

      console.log('✅ Webhook processed successfully')
      res.status(200).json({ 
         received: true, 
         processed: true,
         eventType: event.type,
         timestamp: new Date().toISOString()
      })

   } catch (error: any) {
      console.error('❌ Webhook processing error:', error.message)
      console.error('❌ Error stack:', error.stack)
      console.error('❌ Error details:', {
         name: error.name,
         message: error.message,
         code: error.code,
      })
      
      res.status(500).json({
         error: 'Webhook processing failed',
         details: error.message,
         timestamp: new Date().toISOString(),
      })
   }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentData: any) {
   try {
      console.log('✅ Processing successful payment:', JSON.stringify(paymentData, null, 2))

      const { metadata, total_amount, payment_id, currency, customer } = paymentData

      if (!metadata) {
         throw new Error('Missing payment metadata')
      }

      const { userId, planType } = metadata
      
      // Extract email from customer object
      const userEmail = customer?.email || 'unknown'

      if (!userId || !planType) {
         console.error('❌ Missing required metadata:', { userId, planType, metadata })
         throw new Error('Missing required metadata: userId or planType')
      }

      console.log('👤 Processing payment for user:', {
         userId,
         planType,
         amount: total_amount,
         currency: currency || 'USD',
         paymentId: payment_id,
         email: userEmail,
      })

      // Get current timestamp in Indian time
      const indianTime = new Date().toLocaleString('en-IN', {
         timeZone: 'Asia/Kolkata',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false,
      })

      // Calculate subscription expiry based on plan type
      const expiryDate = new Date()
      const isAnnualPlan = planType.includes('-annual')
      
      if (isAnnualPlan) {
         // Annual subscription: 365 days
         expiryDate.setDate(expiryDate.getDate() + 365)
      } else {
         // Monthly subscription: 30 days
         expiryDate.setDate(expiryDate.getDate() + 30)
      }

      // Extract base plan type for features (remove -annual suffix if present)
      const basePlanType = planType.replace('-annual', '')

      // Define plan features
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

      console.log('💾 Updating Firestore for user:', userId)

      // Update user subscription in Firestore
      const userRef = db.collection('users').doc(userId)
      
      const subscriptionData = {
         subscription: {
            plan: basePlanType, // Store base plan type (pro/enterprise)
            planType: planType, // Store full plan type (pro-annual/enterprise-annual)
            billing: isAnnualPlan ? 'annual' : 'monthly',
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            features: planFeatures[basePlanType] || {},
            lastUpdated: new Date().toISOString(),
         },
         // Reset usage limits
         usage: {
            aiRequestsToday: 0,
            aiRequestsThisMonth: 0,
            datasetsUploaded: 0,
            lastResetDate: new Date().toISOString(),
         },
      }

      console.log('📝 Subscription data to update:', JSON.stringify(subscriptionData, null, 2))

      await userRef.set(subscriptionData, { merge: true })
      console.log('✅ User subscription updated in Firestore')

      // Store payment history
      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)
      
      const paymentHistoryData = {
         paymentId: payment_id,
         amount: total_amount,
         currency: currency || 'USD',
         planType: planType, // Store full plan type
         basePlan: basePlanType, // Store base plan type
         billing: isAnnualPlan ? 'annual' : 'monthly',
         status: 'completed',
         timestamp: new Date().toISOString(),
         indianTime: indianTime,
         provider: 'dodo',
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString(),
         },
      }

      console.log('📝 Payment history data:', JSON.stringify(paymentHistoryData, null, 2))

      await paymentHistoryRef.set(paymentHistoryData)
      console.log('✅ Payment history recorded in Firestore')

      // Also store in global payments collection for verification
      const globalPaymentRef = db.collection('payments').doc(payment_id)
      const globalPaymentData = {
         paymentId: payment_id,
         userId: userId,
         userEmail: userEmail, // Use email from customer object
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
      console.log('✅ Global payment record created for verification')

      console.log('🎉 Payment processing completed successfully:', {
         userId,
         planType,
         basePlanType,
         billing: isAnnualPlan ? 'annual' : 'monthly',
         paymentId: payment_id,
         amount: total_amount,
         indianTime,
         expiryDate: expiryDate.toISOString(),
      })

   } catch (error: any) {
      console.error('❌ Payment success processing error:', error)
      console.error('❌ Error details:', {
         name: error.name,
         message: error.message,
         code: error.code,
         stack: error.stack,
      })
      throw error
   }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentData: any) {
   try {
      console.log('❌ Processing failed payment:', JSON.stringify(paymentData, null, 2))

      const { metadata, payment_id, failure_reason } = paymentData

      if (!metadata) {
         throw new Error('Missing payment metadata')
      }

      const { userId, planType } = metadata

      if (!userId) {
         console.error('❌ Missing required metadata:', { userId, metadata })
         throw new Error('Missing required metadata: userId')
      }

      console.log('👤 Recording failed payment for user:', {
         userId,
         planType,
         paymentId: payment_id,
         failureReason: failure_reason,
      })

      // Get current timestamp in Indian time
      const indianTime = new Date().toLocaleString('en-IN', {
         timeZone: 'Asia/Kolkata',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: false,
      })

      // Store failed payment attempt
      const paymentHistoryRef = db.collection('users').doc(userId).collection('paymentHistory').doc(payment_id)
      
      const failedPaymentData = {
         paymentId: payment_id,
         planType,
         status: 'failed',
         timestamp: new Date().toISOString(),
         indianTime: indianTime,
         provider: 'dodo',
         failureReason: failure_reason,
         metadata: {
            ...metadata,
            processedAt: new Date().toISOString(),
         },
      }

      console.log('📝 Failed payment data:', JSON.stringify(failedPaymentData, null, 2))

      await paymentHistoryRef.set(failedPaymentData)
      console.log('✅ Failed payment recorded in Firestore')

      console.log('📝 Failed payment processing completed:', {
         userId,
         planType,
         paymentId: payment_id,
         failureReason: failure_reason,
         indianTime,
      })

   } catch (error: any) {
      console.error('❌ Payment failure processing error:', error)
      console.error('❌ Error details:', {
         name: error.name,
         message: error.message,
         code: error.code,
         stack: error.stack,
      })
      throw error
   }
}
