import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// List follow-ups
router.get('/', async (req, res) => {
  try {
    const { status, leadId, assignedToId, date } = req.query

    const where: any = {}
    if (status) where.status = status
    if (leadId) where.leadId = leadId
    if (assignedToId) where.assignedToId = assignedToId
    if (date) {
      const start = new Date(date as string)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      where.scheduledAt = { gte: start, lt: end }
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        lead: { select: { id: true, fullName: true, phone: true, status: true, sector: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    res.json({ followUps })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Create follow-up
router.post('/', async (req, res) => {
  try {
    const { leadId, scheduledAt, type, notes, assignedToId } = req.body

    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        scheduledAt: new Date(scheduledAt),
        type,
        notes,
        assignedToId: assignedToId || null,
      },
      include: {
        lead: { select: { fullName: true, phone: true } },
        assignedTo: { select: { name: true } },
      },
    })

    await prisma.activityLog.create({
      data: {
        leadId,
        action: 'follow_up_created',
        details: { type, scheduledAt, notes },
      },
    })

    res.status(201).json(followUp)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Update follow-up
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (data.status === 'completed') {
      data.completedAt = new Date()
    }

    const followUp = await prisma.followUp.update({
      where: { id },
      data,
      include: {
        lead: { select: { fullName: true, phone: true } },
        assignedTo: { select: { name: true } },
      },
    })

    res.json(followUp)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
