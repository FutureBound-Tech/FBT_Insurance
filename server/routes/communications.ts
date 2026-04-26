import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// List communications
router.get('/', async (req, res) => {
  try {
    const { leadId } = req.query
    const where: any = {}
    if (leadId) where.leadId = leadId

    const communications = await prisma.communication.findMany({
      where,
      include: {
        lead: { select: { fullName: true, phone: true } },
        admin: { select: { name: true } },
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    })

    res.json({ communications })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Send communication
router.post('/', async (req, res) => {
  try {
    const { leadId, type, messageContent, adminId } = req.body

    const communication = await prisma.communication.create({
      data: {
        leadId,
        type,
        messageContent,
        adminId: adminId || null,
        status: 'sent',
      },
    })

    await prisma.activityLog.create({
      data: {
        leadId,
        action: 'communication_sent',
        details: { type, messageContent: messageContent.substring(0, 100) },
      },
    })

    res.status(201).json(communication)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// WhatsApp templates
router.get('/templates', async (_req, res) => {
  try {
    const templates = [
      {
        id: 'intro',
        name: 'Introduction',
        message: 'Hi {name}, I am your LIC agent. Based on your profile, I have some excellent policy recommendations for you. Would you like to know more?',
        category: 'initial',
      },
      {
        id: 'follow_up',
        name: 'Follow Up',
        message: 'Hi {name}, just following up on our conversation about insurance planning. Have you had a chance to review the policies I shared?',
        category: 'follow_up',
      },
      {
        id: 'tax_saving',
        name: 'Tax Saving Reminder',
        message: 'Hi {name}, the financial year is ending soon. You can save up to ₹46,800 in taxes with LIC policies under Section 80C. Shall I explain?',
        category: 'seasonal',
      },
      {
        id: 'birthday',
        name: 'Birthday Reminder',
        message: 'Happy Birthday {name}! As you celebrate another year, consider securing your family\'s future with a comprehensive LIC plan. Premium increases with age.',
        category: 'personal',
      },
      {
        id: 'policy_recommendation',
        name: 'Policy Recommendation',
        message: 'Hi {name}, based on your profile (Age: {age}, Income: {income}), I recommend {policy_name} with Sum Assured of {sum_assured}. Monthly premium is just {premium}. Would you like a detailed explanation?',
        category: 'recommendation',
      },
      {
        id: 'meeting_request',
        name: 'Meeting Request',
        message: 'Hi {name}, I would love to meet you for a 30-minute insurance planning session. When would be a good time? I can visit your office or meet at a convenient location.',
        category: 'action',
      },
    ]

    res.json({ templates })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
