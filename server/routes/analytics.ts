import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// Dashboard — single endpoint with all data the frontend needs
router.get('/dashboard', async (_req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalLeads,
      newLeadsThisMonth,
      newLeadsLastMonth,
      convertedThisMonth,
      convertedLastMonth,
      leadsByStatus,
      leadsBySource,
      leadsBySector,
      recentLeads,
      pendingFollowUps,
      leadsRaw,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.lead.count({ where: { status: 'converted', updatedAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { status: 'converted', updatedAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.lead.groupBy({ by: ['leadSource'], _count: { id: true } }),
      prisma.lead.groupBy({ by: ['sector'], _count: { id: true }, where: { sector: { not: null } } }),
      prisma.lead.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      prisma.followUp.findMany({ where: { status: 'pending' }, take: 5, orderBy: { scheduledAt: 'asc' }, include: { lead: { select: { fullName: true } } } }),
      prisma.lead.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, status: true }, orderBy: { createdAt: 'asc' } }),
    ])

    // Stats
    const conversionRate = totalLeads > 0 ? Math.round((leadsByStatus.find(s => s.status === 'converted')?._count.id || 0) / totalLeads * 100 * 10) / 10 : 0
    const growth = (current: number, previous: number) => previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0

    const stats = {
      totalLeads,
      newLeadsThisMonth,
      convertedThisMonth,
      conversionRate,
      leadsGrowth: growth(newLeadsThisMonth, newLeadsLastMonth),
      newLeadsGrowth: growth(newLeadsThisMonth, newLeadsLastMonth),
      convertedGrowth: growth(convertedThisMonth, convertedLastMonth),
      conversionGrowth: 0,
    }

    // Conversion funnel
    const funnelStatuses = ['new', 'interested', 'in_progress', 'follow_up', 'converted', 'lost']
    const conversionFunnel = funnelStatuses.map(status => {
      const found = leadsByStatus.find(s => s.status === status)
      return { status, count: found?._count.id || 0 }
    })

    // Leads over time (last 30 days)
    const grouped: Record<string, { leads: number; conversions: number }> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      grouped[key] = { leads: 0, conversions: 0 }
    }
    for (const lead of leadsRaw) {
      const key = lead.createdAt.toISOString().split('T')[0]
      if (grouped[key]) {
        grouped[key].leads++
        if (lead.status === 'converted') grouped[key].conversions++
      }
    }
    const leadsOverTime = Object.entries(grouped).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      leads: data.leads,
      conversions: data.conversions,
    }))

    // Sources & sectors
    const leadsBySourceFormatted = leadsBySource.map(s => ({ source: s.leadSource || 'Direct', count: s._count.id }))
    const leadsBySectorFormatted = leadsBySector.map(s => ({ sector: s.sector || 'Other', count: s._count.id }))

    // Recent leads mapped for dashboard
    const recentLeadsFormatted = recentLeads.map(l => ({
      id: l.id,
      name: l.fullName,
      phone: l.phone,
      sector: l.sector || '-',
      status: l.status,
      score: l.leadScore,
      createdAt: l.createdAt,
    }))

    // Pending follow-ups
    const pendingFollowUpsFormatted = pendingFollowUps.map(fu => ({
      id: fu.id,
      lead: { name: (fu as any).lead?.fullName || 'Unknown' },
      type: fu.type,
      scheduledAt: fu.scheduledAt,
    }))

    // Today's tasks (follow-ups scheduled for today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysTasks = await prisma.followUp.findMany({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
        status: 'pending',
      },
      include: { lead: { select: { fullName: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    })

    const todaysTasksFormatted = todaysTasks.map(t => ({
      id: t.id,
      lead: { name: t.lead?.fullName || 'Unknown' },
      type: t.type,
      scheduledAt: t.scheduledAt,
    }))

    res.json({
      stats,
      conversionFunnel,
      leadsOverTime,
      leadsBySource: leadsBySourceFormatted,
      leadsBySector: leadsBySectorFormatted,
      recentLeads: recentLeadsFormatted,
      pendingFollowUps: pendingFollowUpsFormatted,
      todaysTasks: todaysTasksFormatted,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Conversion funnel (standalone)
router.get('/funnel', async (_req, res) => {
  try {
    const statuses = ['new', 'interested', 'in_progress', 'follow_up', 'converted', 'lost']
    const counts = await Promise.all(
      statuses.map(s => prisma.lead.count({ where: { status: s } }))
    )
    res.json({
      funnel: [
        { stage: 'New Leads', count: counts[0], color: '#3b82f6' },
        { stage: 'Interested', count: counts[1], color: '#eab308' },
        { stage: 'In Progress', count: counts[2], color: '#8b5cf6' },
        { stage: 'Follow Up', count: counts[3], color: '#f97316' },
        { stage: 'Converted', count: counts[4], color: '#10b981' },
        { stage: 'Lost', count: counts[5], color: '#ef4444' },
      ],
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Leads over time (standalone)
router.get('/leads-over-time', async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const leads = await prisma.lead.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    })
    const grouped: Record<string, { total: number; converted: number }> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      grouped[d.toISOString().split('T')[0]] = { total: 0, converted: 0 }
    }
    for (const lead of leads) {
      const key = lead.createdAt.toISOString().split('T')[0]
      if (grouped[key]) { grouped[key].total++; if (lead.status === 'converted') grouped[key].converted++ }
    }
    res.json({
      chartData: Object.entries(grouped).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        leads: data.total,
        converted: data.converted,
      })),
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Top policies (standalone)
router.get('/top-policies', async (_req, res) => {
  try {
    const topPolicies = await prisma.policyRecommendation.groupBy({
      by: ['policyId'], _count: { id: true }, _avg: { matchScore: true },
      orderBy: { _count: { id: 'desc' } }, take: 10,
    })
    const withDetails = await Promise.all(
      topPolicies.map(async (rec) => {
        const policy = await prisma.policy.findUnique({
          where: { id: rec.policyId },
          select: { name: true, planNumber: true, category: { select: { name: true } } },
        })
        return { ...policy, recommendationCount: rec._count.id, avgMatchScore: Math.round(rec._avg.matchScore || 0) }
      })
    )
    res.json({ topPolicies: withDetails })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
