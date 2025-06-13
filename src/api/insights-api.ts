// Simple Express API to serve insights data
import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'

const app = express()
app.use(cors())

app.get('/api/insights', async (req, res) => {
   try {
      const data = await fs.readFile('./src/api/insights.json', 'utf-8')
      res.json(JSON.parse(data))
   } catch (e) {
      res.status(404).json({ error: 'No insights found' })
   }
})

const PORT = 5174
app.listen(PORT, () => {
   console.log(`Insights API running on http://localhost:${PORT}/api/insights`)
})
