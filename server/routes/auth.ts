import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lic2026agent'
const JWT_SECRET = process.env.JWT_SECRET || 'fbt-insurance-secret-key-2026'

router.post('/login', (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = jwt.sign(
      { role: 'agent', name: 'LIC Agent', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, user: { name: 'LIC Agent', role: 'agent' } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any

    res.json({ valid: true, user: { name: decoded.name || 'LIC Agent', role: decoded.role } })
  } catch {
    res.status(401).json({ valid: false })
  }
})

export default router
