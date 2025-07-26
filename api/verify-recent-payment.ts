import type { VercelRequest, VercelResponse } from '@vercel/node'
import admin from 'firebase-admin'

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    console.log('🔍 Recent payment verification request for user:', userId)

    if (!userId) {
      console.log('❌ Missing userId parameter')
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get the most recent payment for this user (within last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    
    console.log('🔎 Checking for payments after:', tenMinutesAgo)
    
    const recentPaymentsQuery = await db.collection('payments')
      .where('userId', '==', userId)
      .where('status', '==', 'paid')
      .where('timestamp', '>=', tenMinutesAgo)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    if (recentPaymentsQuery.empty) {
      console.log('❌ No recent payments found for user:', userId)
      return res.status(404).json({ 
        error: 'No recent payments found',
        debug: {
          userId,
          searchAfter: tenMinutesAgo,
          currentTime: new Date().toISOString()
        }
      })
    }

    const paymentDoc = recentPaymentsQuery.docs[0]
    const paymentData = paymentDoc.data()

    console.log('✅ Found recent payment:', paymentDoc.id, paymentData)

    return res.status(200).json({
      success: true,
      payment: {
        id: paymentDoc.id,
        status: paymentData.status,
        planType: paymentData.planType,
        amount: paymentData.amount || 0,
        timestamp: paymentData.timestamp,
      }
    })

  } catch (error) {
    console.error('❌ Recent payment verification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
