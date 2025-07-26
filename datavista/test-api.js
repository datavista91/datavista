/**
 * Test script to verify the server-side API integration
 */

console.log('🧪 Testing server-side API integration...')

// Test data for analysis
const testAnalysisData = {
   summary: {
      overview: {
         totalRows: 100,
         totalColumns: 5,
         columns: ['Date', 'Product', 'Sales', 'Category', 'Region']
      },
      statistics: {
         Sales: {
            type: 'numeric',
            mean: 1250.50,
            min: 100,
            max: 5000,
            stdDev: 750.25
         },
         Category: {
            type: 'categorical',
            unique: 3,
            topValues: [['Electronics', 45], ['Clothing', 30], ['Books', 25]]
         }
      },
      dataQuality: {
         missingValues: { Product: 2, Category: 1 },
         duplicates: 3
      }
   },
   sample: [
      { Date: '2024-01-01', Product: 'Laptop', Sales: 1200, Category: 'Electronics', Region: 'North' },
      { Date: '2024-01-02', Product: 'Shirt', Sales: 50, Category: 'Clothing', Region: 'South' },
      { Date: '2024-01-03', Product: 'Book', Sales: 25, Category: 'Books', Region: 'East' }
   ],
   fileName: 'test_data.csv',
   fileSize: 8192
}

// Test the API endpoint
async function testAPI() {
   try {
      const response = await fetch('/api/chat', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            message: 'Analyze this data and provide key insights',
            analysisData: testAnalysisData
         })
      })

      if (!response.ok) {
         const errorData = await response.json()
         console.error('❌ API Error:', errorData)
         return
      }

      const result = await response.json()
      console.log('✅ API Response received:')
      console.log('📊 Response Type:', result.responseType)
      console.log('📝 Title:', result.title)
      console.log('💬 Message Preview:', result.message.substring(0, 200) + '...')
      
      if (result.actionData) {
         console.log('🎯 Action Data Available:', Object.keys(result.actionData))
      }
      
      console.log('✨ Server-side API integration successful!')
   } catch (error) {
      console.error('❌ Test failed:', error)
   }
}

export { testAPI, testAnalysisData }
