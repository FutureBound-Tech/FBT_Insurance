import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

// Capture partial lead (name + phone only) — saves even if user abandons assessment
router.post('/capture', async (req, res) => {
  try {
    const { fullName, phone } = req.body

    if (!phone || !fullName) {
      return res.status(400).json({ message: 'Name and phone are required' })
    }

    // Sanitize inputs
    const sanitizedName = String(fullName).trim().replace(/[<>]/g, '')
    const sanitizedPhone = String(phone).replace(/\D/g, '').slice(0, 10)

    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({ message: 'Phone must be 10 digits' })
    }

    // Upsert: create or update existing lead with basic info
    const lead = await prisma.lead.upsert({
      where: { phone: sanitizedPhone },
      update: {
        fullName: sanitizedName,
        status: 'partial',
      },
      create: {
        fullName: sanitizedName,
        phone: sanitizedPhone,
        status: 'partial',
        leadSource: 'website',
      },
    })

    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        action: 'partial_capture',
        details: { step: 'page1', fields: ['fullName', 'phone'] },
      },
    })

    res.json({ lead: { id: lead.id, fullName: lead.fullName, phone: lead.phone } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Submit assessment and get recommendations
router.post('/', async (req, res) => {
  try {
    const data = req.body
    const {
      fullName, phone, email, age, gender, occupation, companyName, sector,
      maritalStatus, numberOfChildren, dependentParents, spouseWorking, spouseIncome,
      monthlyIncome, monthlyExpenses, existingLifeInsurance, insuranceType,
      insuranceProvider, sumAssured, annualPremium, investmentGoals, riskAppetite,
      healthStatus, smoking, drinking, chronicDisease, chronicDiseaseDetails,
      familyMedicalHistory, preferredSumAssured, preferredTerm, monthlyBudget,
      priority, preferredContactTime, whatsappOptin, additionalNotes,
    } = data

    if (!phone || !fullName) {
      return res.status(400).json({ message: 'Name and phone are required' })
    }

    // Transform form data to match DB schema
    const familyMembers = {
      spouse: maritalStatus === 'Married',
      children: numberOfChildren || 0,
      parents: dependentParents || 0,
      spouseWorking: spouseWorking || false,
      spouseIncome: spouseIncome || 0,
    }

    const existingInsurance = {
      hasInsurance: existingLifeInsurance || false,
      type: insuranceType || 'None',
      provider: insuranceProvider || '',
      amount: sumAssured || 0,
      premium: annualPremium || 0,
    }

    const goals = investmentGoals || []

    // Check if lead exists
    let lead = await prisma.lead.findUnique({ where: { phone } })

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          fullName, email, age: age ? Number(age) : null, gender, occupation, companyName, sector,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : null,
          maritalStatus, familyMembers, existingInsurance,
          healthStatus, investmentGoals: goals, riskAppetite, preferredContactTime,
          status: 'interested',
          whatsappOptIn: whatsappOptin || false,
        },
      })
    } else {
      lead = await prisma.lead.create({
        data: {
          fullName, phone, email, age: age ? Number(age) : null, gender, occupation, companyName, sector,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : null,
          maritalStatus, familyMembers, existingInsurance,
          healthStatus, investmentGoals: goals, riskAppetite, preferredContactTime,
          status: 'interested',
          leadSource: 'website',
          whatsappOptIn: whatsappOptin || false,
        },
      })
    }

    // Calculate assessment score
    const score = calculateAssessmentScore(req.body)
    const leadScore = calculateLeadScore(req.body)

    await prisma.lead.update({
      where: { id: lead.id },
      data: { assessmentScore: score, leadScore },
    })

    // Get all active policies
    const allPolicies = await prisma.policy.findMany({
      where: { isActive: true },
      include: { category: true },
    })

    // Generate recommendations
    const recommendations = generateRecommendations(req.body, allPolicies)

    // Save recommendations
    for (const rec of recommendations) {
      await prisma.policyRecommendation.create({
        data: {
          leadId: lead.id,
          policyId: rec.policyId,
          recommendedSumAssured: rec.recommendedSumAssured,
          recommendedTerm: rec.recommendedTerm,
          estimatedMonthlyPremium: rec.estimatedMonthlyPremium,
          estimatedYearlyPremium: rec.estimatedYearlyPremium,
          matchScore: rec.matchScore,
          matchReasons: rec.matchReasons,
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        action: 'assessment_completed',
        details: { score, leadScore, recommendationCount: recommendations.length },
      },
    })

    const fullLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: {
        policyRecommendations: {
          include: { policy: { include: { category: true } } },
          orderBy: { matchScore: 'desc' },
        },
      },
    })

    res.json({ lead: fullLead, recommendations: fullLead?.policyRecommendations || [] })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

function calculateAssessmentScore(data: any): number {
  let score = 50 // Base score

  // Family protection awareness
  if (data.maritalStatus === 'Married') score += 10
  if ((data.numberOfChildren || 0) > 0) score += 10
  if ((data.dependentParents || 0) > 0) score += 5

  // Financial readiness
  if (Number(data.monthlyIncome) > 100000) score += 10
  if (data.investmentGoals?.includes('Retirement Planning')) score += 5
  if (data.investmentGoals?.includes('Tax Saving')) score += 5

  // Insurance gap
  if (!data.existingLifeInsurance) score += 10
  else if (Number(data.sumAssured) < Number(data.monthlyIncome) * 120) score += 5

  return Math.min(100, score)
}

function calculateLeadScore(data: any): number {
  let score = 40

  // Income factor
  const income = Number(data.monthlyIncome) || 0
  if (income > 200000) score += 20
  else if (income > 100000) score += 15
  else if (income > 50000) score += 10

  // Age factor (sweet spot 30-50)
  const age = Number(data.age) || 30
  if (age >= 30 && age <= 50) score += 15
  else if (age >= 25 && age <= 55) score += 10

  // Family factor
  if (data.maritalStatus === 'Married') score += 10
  if ((data.numberOfChildren || 0) > 0) score += 5

  // Sector factor
  if (['IT', 'Banking', 'Government'].includes(data.sector)) score += 5

  // Health
  if (data.healthStatus === 'Excellent' || data.healthStatus === 'Good') score += 5

  return Math.min(100, score)
}

function generateRecommendations(data: any, policies: any[]): any[] {
  const recommendations: any[] = []
  const age = data.age || 30
  const income = data.monthlyIncome || 50000
  const yearlyIncome = income * 12

  for (const policy of policies) {
    // Age check
    if (age < policy.minAge || age > policy.maxAge) continue

    let matchScore = 50
    const matchReasons: string[] = []

    // Calculate recommended sum assured (10-15x annual income for term, 5-8x for others)
    let recommendedSumAssured: number
    let recommendedTerm: number

    if (policy.category.name === 'Term Insurance') {
      recommendedSumAssured = Math.min(yearlyIncome * 15, policy.maxSumAssured)
      recommendedTerm = Math.min(65 - age, policy.maxTerm)
      matchScore += 15

      if (data.familyMembers?.spouse) { matchScore += 10; matchReasons.push('Essential for family protection') }
      if (data.familyMembers?.children > 0) { matchScore += 10; matchReasons.push('Secures children\'s future') }
      if (!data.existingInsurance?.hasInsurance) { matchScore += 15; matchReasons.push('No existing term coverage') }
      if (data.age >= 35) { matchScore += 5; matchReasons.push('Premium increases with age') }
    } else if (policy.category.name === 'Endowment') {
      recommendedSumAssured = Math.min(yearlyIncome * 8, policy.maxSumAssured)
      recommendedTerm = Math.min(35 - (age - 18), policy.maxTerm, policy.maxTerm)
      matchScore += 10

      if (data.investmentGoals?.savings) { matchScore += 10; matchReasons.push('Guaranteed savings component') }
      if (data.riskAppetite === 'conservative') { matchScore += 10; matchReasons.push('Low risk, guaranteed returns') }
      if (data.investmentGoals?.taxSaving) { matchScore += 5; matchReasons.push('Tax benefits under 80C') }
    } else if (policy.category.name === 'Pension/Annuity') {
      recommendedSumAssured = Math.min(yearlyIncome * 10, policy.maxSumAssured)
      recommendedTerm = Math.max(60 - age, 10)
      matchScore += 5

      if (data.investmentGoals?.retirement) { matchScore += 20; matchReasons.push('Secures retirement income') }
      if (age >= 40) { matchScore += 10; matchReasons.push('Critical retirement planning age') }
      if (data.monthlyIncome > 100000) { matchScore += 5; matchReasons.push('Higher income needs higher pension') }
    } else if (policy.category.name === 'Children Plans') {
      recommendedSumAssured = Math.min(yearlyIncome * 10, policy.maxSumAssured)
      recommendedTerm = policy.minTerm
      matchScore += 0

      if (data.familyMembers?.children > 0) {
        matchScore += 25
        matchReasons.push('Secures child\'s education and marriage')
      } else {
        matchScore -= 30 // Not relevant without children
      }
    } else if (policy.category.name === 'ULIP') {
      recommendedSumAssured = Math.min(yearlyIncome * 10, policy.maxSumAssured)
      recommendedTerm = Math.max(15, policy.minTerm)
      matchScore += 5

      if (data.riskAppetite === 'aggressive') { matchScore += 15; matchReasons.push('Market-linked growth potential') }
      if (data.investmentGoals?.wealthCreation) { matchScore += 10; matchReasons.push('Long-term wealth creation') }
      if (age < 40) { matchScore += 5; matchReasons.push('Time to ride market cycles') }
    } else {
      recommendedSumAssured = Math.min(yearlyIncome * 8, policy.maxSumAssured)
      recommendedTerm = Math.min(policy.maxTerm, 25)
    }

    // Ensure within policy limits
    recommendedSumAssured = Math.max(policy.minSumAssured, Math.min(recommendedSumAssured, policy.maxSumAssured))
    recommendedTerm = Math.max(policy.minTerm, Math.min(recommendedTerm, policy.maxTerm))

    // Estimate premium (simplified calculation)
    const baseRatePerThousand = policy.category.name === 'Term Insurance' ? 1.5 : 8.0
    const ageFactor = 1 + ((age - 25) * 0.03)
    const yearlyPremium = (recommendedSumAssured / 1000) * baseRatePerThousand * ageFactor * (recommendedTerm / 20)
    const monthlyPremium = yearlyPremium / 12

    matchScore = Math.min(100, Math.max(0, matchScore))

    // Only include policies with reasonable match
    if (matchScore >= 30) {
      recommendations.push({
        policyId: policy.id,
        policy: policy,
        recommendedSumAssured,
        recommendedTerm,
        estimatedMonthlyPremium: Math.round(monthlyPremium),
        estimatedYearlyPremium: Math.round(yearlyPremium),
        matchScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Matches your profile and requirements'],
      })
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}

export default router
