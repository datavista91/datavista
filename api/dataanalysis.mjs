import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import fs from 'fs/promises'

const exampleCsvPath = './public/public_response.csv'

const loader = new CSVLoader(exampleCsvPath)

const llm = new ChatGoogleGenerativeAI({
   apiKey: 'AIzaSyAkubTFvZStnYklfDae2b_i7rW7f8_mxhU',
   model: 'gemini-2.0-flash-lite',
   temperature: 0,
   maxRetries: 2,
   // other params...
})

async function main() {
   //    const aiMsg = await llm.invoke([
   //       [
   //          'system',
   //          'You are a Data Analysis Expert. Analyze the Data you recieved and Generate insights and recommendations.',
   //       ],
   //       [
   //          'human',
   //          `Date,Product,Category,Units Sold,Unit Price,Total Sales,Payment Method
   // 2025-06-01,Espresso,Drink,34,2.5,85,Cash
   // 2025-06-01,Cappuccino,Drink,28,3.0,84,Card
   // 2025-06-01,Blueberry Muffin,Food,15,2.0,30,Cash
   // 2025-06-02,Latte,Drink,40,3.5,140,Card
   // 2025-06-02,Chocolate Croissant,Food,12,2.5,30,Cash
   // 2025-06-02,Americano,Drink,22,2.0,44,Card
   // 2025-06-03,Espresso,Drink,30,2.5,75,Cash
   // 2025-06-03,Latte,Drink,35,3.5,122.5,Card
   // 2025-06-03,Blueberry Muffin,Food,18,2.0,36,Cash
   // 2025-06-03,Chocolate Croissant,Food,10,2.5,25,Card`,
   //       ],
   //    ])
   //    aiMsg
   //    console.log(aiMsg.content.trim())
   const docs = await loader.load()
   // console.log(docs[0])
   // console.log(docs)
   console.log(docs.length)
   const newArr = docs.map((doc) => doc.pageContent)
   // console.log('newarr', newArr)
   const combined = newArr.join('\n')
   // console.log('combined', combined)

   const aiMsg = await llm.invoke([
      [
         'system',
         `You are a Data Analysis Expert. Analyze the Data you recieved and Generate insights and recommendations.
         You will recieve an array of rows of CSV data. You will then respond with an Smart Insights and Recommendations, based on that data and your analysis.`,
      ],
      ['human', combined],
   ])
   console.log(aiMsg.content.trim())

   // Write insights to public/insights.json for frontend consumption
   await fs.writeFile('./public/insights.json', JSON.stringify({ insights: aiMsg.content.trim() }, null, 2))
   console.log('Insights written to public/insights.json')
}

main()
