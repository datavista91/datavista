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
    const { paymentId, userId } = req.body

    console.log('🔍 Payment verification request:', { paymentId, userId })

    if (!paymentId || !userId) {
      console.log('❌ Missing required parameters:', { paymentId: !!paymentId, userId: !!userId })
      return res.status(400).json({ error: 'Payment ID and User ID are required' })
    }

    // Check if this payment exists in our database (from webhook)
    console.log('🔎 Checking payment in Firestore:', paymentId)
    const paymentRef = db.collection('payments').doc(paymentId)
    const paymentDoc = await paymentRef.get()

    if (!paymentDoc.exists) {
      console.log('❌ Payment not found in Firestore:', paymentId)
      
      // Let's also check if there are any payments for this user
      const userPaymentsQuery = await db.collection('payments')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
      
      console.log('🔍 Recent payments for user:', userId, 'Count:', userPaymentsQuery.size)
      userPaymentsQuery.forEach(doc => {
        console.log('📄 Payment doc:', doc.id, doc.data())
      })
      
      return res.status(404).json({ error: 'Payment not found' })
    }

    const paymentData = paymentDoc.data()

    if (!paymentData) {
      return res.status(404).json({ error: 'Payment data not found' })
    }

    // Verify the payment belongs to the requesting user
    if (paymentData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Check payment status
    if (paymentData.status === 'paid') {
      return res.status(200).json({
        success: true,
        payment: {
          id: paymentId,
          status: paymentData.status,
          planType: paymentData.planType,
          amount: paymentData.amount,
          timestamp: paymentData.timestamp,
        }
      })
    } else {
      return res.status(200).json({
        success: false,
        payment: {
          id: paymentId,
          status: paymentData.status,
        }
      })
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
