// Vercel serverless function to serve insights data
import { promises as fs } from 'fs'
import path from 'path'

export default async function handler(req, res) {
   try {
      const filePath = path.join(process.cwd(), 'public', 'insights.json')
      const data = await fs.readFile(filePath, 'utf-8')
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(data)
   } catch (e) {
      res.status(404).json({ error: 'No insights found' })
   }
}
