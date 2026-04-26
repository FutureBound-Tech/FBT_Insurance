import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// List leads with filters
router.get('/', async (req, res) => {
  try {
    const { status, sector, source, search, page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const where: any = {}
    if (status) where.status = status
    if (sector) where.sector = sector
    if (source) where.leadSource = source
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { communications: true, followUps: true, policyRecommendations: true } },
        },
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.lead.count({ where }),
    ])

    // Map DB fields to frontend names
    const mappedLeads = leads.map(l => ({
      ...l,
      name: l.fullName,
      score: l.leadScore,
    }))

    res.json({ leads: mappedLeads, total, page: parseInt(page as string), limit: parseInt(limit as string) })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, phone: true } },
        policyRecommendations: { include: { policy: true }, orderBy: { matchScore: 'desc' } },
        premiumCalculations: { include: { policy: true }, orderBy: { calculatedAt: 'desc' } },
        communications: { orderBy: { sentAt: 'desc' }, take: 20 },
        followUps: { orderBy: { scheduledAt: 'desc' }, take: 10 },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })

    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Create lead
router.post('/', async (req, res) => {
  try {
    const data = req.body
    const lead = await prisma.lead.create({ data })

    await prisma.activityLog.create({
      data: { leadId: lead.id, action: 'lead_created', details: { source: data.leadSource || 'website' } },
    })

    res.status(201).json(lead)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const oldLead = await prisma.lead.findUnique({ where: { id } })
    if (!oldLead) return res.status(404).json({ message: 'Lead not found' })

    const lead = await prisma.lead.update({ where: { id }, data })

    if (oldLead.status !== data.status) {
      await prisma.activityLog.create({
        data: { leadId: id, action: 'status_changed', details: { from: oldLead.status, to: data.status } },
      })
    }

    res.json(lead)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
    res.json({ message: 'Lead deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Bulk update status
router.post('/bulk-update', async (req, res) => {
  try {
    const { leadIds, status } = req.body
    await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { status } })

    for (const leadId of leadIds) {
      await prisma.activityLog.create({
        data: { leadId, action: 'bulk_status_update', details: { newStatus: status } },
      })
    }

    res.json({ message: `${leadIds.length} leads updated` })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
