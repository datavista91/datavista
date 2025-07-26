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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🧪 Debug API: Testing Firebase connection...')
    
    // Test 1: Check if we can list payments collection
    const paymentsSnapshot = await db.collection('payments').limit(5).get()
    console.log('✅ Payments collection accessible, count:', paymentsSnapshot.size)
    
    const payments: any[] = []
    paymentsSnapshot.forEach(doc => {
      const data = doc.data()
      payments.push({
        id: doc.id,
        userId: data.userId,
        planType: data.planType,
        timestamp: data.timestamp,
        status: data.status
      })
      console.log('📄 Payment found:', doc.id, data.userId, data.planType)
    })
    
    // Test 2: Check specific user ID from webhook logs
    const testUserId = 'Q4tGUQpJISaEZ5FsBm4o2ktHJp43'
    console.log('🔍 Testing specific user ID:', testUserId)
    
    const userPayments = await db.collection('payments')
      .where('userId', '==', testUserId)
      .get()
    
    console.log('✅ User payments found:', userPayments.size)
    const userPaymentsList: any[] = []
    userPayments.forEach(doc => {
      userPaymentsList.push({
        id: doc.id,
        data: doc.data()
      })
    })

    return res.status(200).json({
      success: true,
      debug: {
        totalPayments: paymentsSnapshot.size,
        userPaymentsCount: userPayments.size,
        testUserId,
        allPayments: payments,
        userPayments: userPaymentsList,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Debug API error:', error)
    return res.status(500).json({ 
      error: 'Debug test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
