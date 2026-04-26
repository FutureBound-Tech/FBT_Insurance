import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth.js'
import authRouter from './routes/auth.js'
import leadsRouter from './routes/leads.js'
import policiesRouter from './routes/policies.js'
import assessmentRouter from './routes/assessment.js'
import calculatorRouter from './routes/calculator.js'
import analyticsRouter from './routes/analytics.js'
import followUpsRouter from './routes/followUps.js'
import communicationsRouter from './routes/communications.js'
import aiRouter from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Public routes (no auth needed)
app.use('/api/auth', authRouter)
app.use('/api/policies', policiesRouter)
app.use('/api/assessment', assessmentRouter)
app.use('/api/calculator', calculatorRouter)
app.use('/api/ai', aiRouter)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected routes (auth required)
app.use('/api/leads', authMiddleware, leadsRouter)
app.use('/api/analytics', authMiddleware, analyticsRouter)
app.use('/api/follow-ups', authMiddleware, followUpsRouter)
app.use('/api/communications', authMiddleware, communicationsRouter)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
