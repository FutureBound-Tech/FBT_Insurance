import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { policyId, sumAssured, term, age, gender, leadId } = req.body

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { category: true },
    })

    if (!policy) return res.status(404).json({ message: 'Policy not found' })

    // Premium calculation logic
    const isTermPlan = policy.category.name === 'Term Insurance'
    const isPension = policy.category.name === 'Pension/Annuity'

    // Base rates per thousand sum assured
    let baseRate = isTermPlan ? 1.5 : isPension ? 12.0 : 8.0

    // Age factor (premiums increase with age)
    const ageFactor = 1 + ((age - 25) * 0.04)

    // Gender factor
    const genderFactor = gender === 'female' ? 0.95 : 1.0

    // Term factor
    const termFactor = term / 20

    // Calculate premium
    const yearlyPremium = (sumAssured / 1000) * baseRate * ageFactor * genderFactor * termFactor
    const monthlyPremium = yearlyPremium / 12
    const halfYearlyPremium = yearlyPremium * 0.51
    const quarterlyPremium = yearlyPremium * 0.26

    const totalPremiumPaid = yearlyPremium * term

    // Estimate maturity amount
    let estimatedMaturityAmount: number | null = null
    if (!isTermPlan) {
      const bonusRate = isPension ? 0.04 : 0.045 // 4-4.5% bonus rate
      const bonus = sumAssured * bonusRate * term
      estimatedMaturityAmount = sumAssured + bonus
    }

    // Tax savings
    const taxSavings80C = Math.min(yearlyPremium, 150000) * 0.3 // 30% tax bracket
    const taxSavings80D = 0 // Only for health plans

    // Save calculation
    if (leadId) {
      await prisma.premiumCalculation.create({
        data: {
          leadId,
          policyId,
          sumAssured,
          term,
          age,
          gender,
          monthlyPremium: Math.round(monthlyPremium),
          yearlyPremium: Math.round(yearlyPremium),
          totalPremiumPaid: Math.round(totalPremiumPaid),
          estimatedMaturityAmount: estimatedMaturityAmount ? Math.round(estimatedMaturityAmount) : null,
          taxSavings80C: Math.round(taxSavings80C),
          taxSavings80D: 0,
        },
      })
    }

    res.json({
      policyId,
      policyName: policy.name,
      sumAssured,
      term,
      age,
      gender,
      premiumBreakdown: {
        monthly: Math.round(monthlyPremium),
        quarterly: Math.round(quarterlyPremium),
        halfYearly: Math.round(halfYearlyPremium),
        yearly: Math.round(yearlyPremium),
      },
      totalPremiumPaid: Math.round(totalPremiumPaid),
      estimatedMaturityAmount,
      taxBenefits: {
        section80C: Math.round(taxSavings80C),
        section80D: taxSavings80D,
        totalTaxSavings: Math.round(taxSavings80C + taxSavings80D),
      },
      returnOnInvestment: estimatedMaturityAmount
        ? Math.round(((estimatedMaturityAmount - totalPremiumPaid) / totalPremiumPaid) * 100)
        : null,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
