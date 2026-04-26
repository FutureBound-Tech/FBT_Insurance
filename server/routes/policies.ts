import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// List policies
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, minAge, maxAge, isActive } = req.query

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (isActive !== undefined) where.isActive = isActive === 'true'
    if (minAge) where.minAge = { lte: parseInt(minAge as string) }
    if (maxAge) where.maxAge = { gte: parseInt(maxAge as string) }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const policies = await prisma.policy.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    })

    const categories = await prisma.policyCategory.findMany({
      include: { _count: { select: { policies: true } } },
    })

    res.json({ policies, categories })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get single policy
router.get('/:id', async (req, res) => {
  try {
    const policy = await prisma.policy.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    })
    if (!policy) return res.status(404).json({ message: 'Policy not found' })
    res.json(policy)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
