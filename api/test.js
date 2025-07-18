/**
 * Test endpoint to verify API routing is working
 */
export default async function handler(req, res) {
   console.log('🧪 Test endpoint called')
   console.log('Method:', req.method)
   console.log('Headers:', req.headers)
   console.log('Body:', req.body)
   
   res.status(200).json({
      message: 'API is working',
      method: req.method,
      timestamp: new Date().toISOString(),
      path: req.url
   })
}
