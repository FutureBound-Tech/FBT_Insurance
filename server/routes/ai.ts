import { Router } from 'express'
import { prisma } from '../db.js'

const router = Router()

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'

// AI-powered policy recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { leadId, profile } = req.body

    // Fetch all active policies from DB
    const policies = await prisma.policy.findMany({
      where: { isActive: true },
      include: { category: true },
    })

    // Build a detailed prompt for the AI
    const systemPrompt = `You are an expert LIC (Life Insurance Corporation of India) insurance advisor. 
Analyze the customer profile and recommend the best LIC policies. 
Respond ONLY with valid JSON (no markdown, no explanation).

Return format:
{
  "recommendations": [
    {
      "policyName": "exact policy name",
      "planNumber": "Plan XXXX",
      "matchScore": 85,
      "reasons": ["reason1", "reason2"],
      "suggestedSumAssured": 5000000,
      "suggestedTerm": 20,
      "estimatedMonthlyPremium": 4500
    }
  ],
  "summary": "Brief 2-3 line personalized advice"
}

Available LIC policies:
${policies.map(p => `- ${p.name} (${p.planNumber}): ${p.description}. Age: ${p.minAge}-${p.maxAge}, Term: ${p.minTerm}-${p.maxTerm} yrs, SA: ₹${p.minSumAssured}-${p.maxSumAssured}`).join('\n')}

Important LIC premium factors:
- Tabular premium rates vary by age (older = higher)
- GST: 4.5% first year, 2.25% subsequent
- Endowment plans: Bonus ₹40-48 per ₹1000 SA per year
- Death benefit: Most plans pay Sum Assured + Bonus; Jeevan Anand pays 125% of SA
- Maturity: Sum Assured + Simple Reversionary Bonus + FAB
- Mode factors: Yearly=1x, Half-Yearly=0.5065x, Quarterly=0.2575x, Monthly=0.0879x`

    const userPrompt = `Customer Profile:
- Name: ${profile.fullName || 'N/A'}
- Age: ${profile.age || 30}
- Gender: ${profile.gender || 'Male'}
- Occupation: ${profile.occupation || 'N/A'}
- Sector: ${profile.sector || 'N/A'}
- Monthly Income: ₹${profile.monthlyIncome || 50000}
- Monthly Expenses: ₹${profile.monthlyExpenses || 30000}
- Marital Status: ${profile.maritalStatus || 'Single'}
- Children: ${profile.numberOfChildren || 0}
- Dependent Parents: ${profile.dependentParents || 0}
- Existing Insurance: ${profile.existingLifeInsurance ? 'Yes' : 'None'}
- Health Status: ${profile.healthStatus || 'Good'}
- Risk Appetite: ${profile.riskAppetite || 'Moderate'}
- Investment Goals: ${(profile.investmentGoals || []).join(', ')}
- Preferred Sum Assured: ₹${profile.preferredSumAssured || 5000000}
- Preferred Term: ${profile.preferredTerm || 20} years
- Monthly Budget: ₹${profile.monthlyBudget || 5000}
- Priority: ${profile.priority || 'Balanced'}

Based on this profile, recommend the top 3-5 most suitable LIC policies with specific details.`

    let aiResult: any = null

    // Try Groq API first
    if (GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        })

        if (response.ok) {
          const data = await response.json() as any
          const content = data.choices?.[0]?.message?.content || ''
          // Parse JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            aiResult = JSON.parse(jsonMatch[0])
          }
        }
      } catch (err) {
        console.error('Groq API error:', err)
      }
    }

    // Fallback: generate rule-based recommendations
    if (!aiResult) {
      aiResult = generateRuleBasedRecommendations(profile, policies)
    }

    // Match AI recommendations to actual policy IDs and save them
    if (leadId && aiResult.recommendations) {
      for (const rec of aiResult.recommendations) {
        const matchedPolicy = policies.find(
          (p) => p.name.toLowerCase().includes(rec.policyName?.toLowerCase() || '') ||
                 p.planNumber === rec.planNumber
        )
        if (matchedPolicy) {
          await prisma.policyRecommendation.upsert({
            where: {
              leadId_policyId: { leadId, policyId: matchedPolicy.id },
            },
            update: {
              recommendedSumAssured: rec.suggestedSumAssured || 5000000,
              recommendedTerm: rec.suggestedTerm || 20,
              estimatedMonthlyPremium: rec.estimatedMonthlyPremium || 0,
              estimatedYearlyPremium: (rec.estimatedMonthlyPremium || 0) * 12,
              matchScore: rec.matchScore || 70,
              matchReasons: rec.reasons || [],
            },
            create: {
              leadId,
              policyId: matchedPolicy.id,
              recommendedSumAssured: rec.suggestedSumAssured || 5000000,
              recommendedTerm: rec.suggestedTerm || 20,
              estimatedMonthlyPremium: rec.estimatedMonthlyPremium || 0,
              estimatedYearlyPremium: (rec.estimatedMonthlyPremium || 0) * 12,
              matchScore: rec.matchScore || 70,
              matchReasons: rec.reasons || [],
            },
          })
        }
      }
    }

    res.json({
      ...aiResult,
      source: aiResult.source || (GROQ_API_KEY ? 'ai' : 'rules'),
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

function generateRuleBasedRecommendations(profile: any, policies: any[]): any {
  const age = profile.age || 30
  const income = profile.monthlyIncome || 50000
  const yearlyIncome = income * 12
  const budget = profile.monthlyBudget || 5000
  const hasChildren = (profile.numberOfChildren || 0) > 0
  const isMarried = profile.maritalStatus === 'Married'
  const risk = profile.riskAppetite || 'Moderate'

  const recommendations: any[] = []

  for (const policy of policies) {
    if (age < policy.minAge || age > policy.maxAge) continue

    let matchScore = 50
    const reasons: string[] = []
    let suggestedSA = yearlyIncome * 10
    let suggestedTerm = Math.min(25, policy.maxTerm)

    const catName = policy.category?.name || ''

    if (catName === 'Term Insurance') {
      matchScore += 20
      suggestedSA = yearlyIncome * 15
      suggestedTerm = Math.min(65 - age, policy.maxTerm)
      reasons.push(`High coverage: ₹${(suggestedSA / 100000).toFixed(0)}L for just ₹${Math.round(suggestedSA / 1000 * 1.5 * 1.02)}/month`)
      if (isMarried) { matchScore += 10; reasons.push('Essential for family financial security') }
      if (hasChildren) { matchScore += 10; reasons.push('Secures children\'s education and future') }
      if (!profile.existingLifeInsurance) { matchScore += 15; reasons.push('No existing term coverage — gap identified') }
    } else if (catName === 'Endowment') {
      matchScore += 10
      suggestedSA = yearlyIncome * 8
      reasons.push('Guaranteed maturity: SA + Bonus + FAB')
      if (risk === 'Conservative') { matchScore += 15; reasons.push('Low risk with guaranteed returns') }
      if (profile.investmentGoals?.includes('Tax Saving')) { matchScore += 5; reasons.push('Tax benefits under Section 80C') }
      if (profile.investmentGoals?.includes('Wealth Creation')) { matchScore += 5; reasons.push('Disciplined savings with bonus') }
    } else if (catName === 'Children Plans') {
      if (hasChildren) {
        matchScore += 25
        reasons.push('Secures child\'s education and marriage funds')
        suggestedTerm = Math.max(18, policy.minTerm)
      } else {
        matchScore -= 20
      }
    } else if (catName === 'Pension/Annuity') {
      if (age >= 35) {
        matchScore += 15
        reasons.push('Start retirement planning early for maximum corpus')
      }
      if (profile.investmentGoals?.includes('Retirement Planning')) { matchScore += 20; reasons.push('Matches your retirement goal') }
    } else if (catName === 'ULIP') {
      if (risk === 'Aggressive') { matchScore += 15; reasons.push('Market-linked growth potential') }
      if (age < 40) { matchScore += 5; reasons.push('Time horizon allows market recovery') }
    }

    // Budget fit
    const estMonthly = Math.round((suggestedSA / 1000) * (catName === 'Term Insurance' ? 1.5 : 8) * 1.045 / 12)
    if (estMonthly <= budget) {
      matchScore += 10
      reasons.push(`Fits your ₹${budget}/month budget`)
    }

    suggestedSA = Math.max(policy.minSumAssured, Math.min(suggestedSA, policy.maxSumAssured))
    suggestedTerm = Math.max(policy.minTerm, Math.min(suggestedTerm, policy.maxTerm))
    matchScore = Math.min(100, Math.max(0, matchScore))

    if (matchScore >= 40) {
      recommendations.push({
        policyName: policy.name,
        planNumber: policy.planNumber,
        matchScore,
        reasons: reasons.length > 0 ? reasons : ['Matches your profile'],
        suggestedSumAssured: suggestedSA,
        suggestedTerm,
        estimatedMonthlyPremium: estMonthly,
        categoryId: policy.categoryId,
        policyId: policy.id,
      })
    }
  }

  recommendations.sort((a, b) => b.matchScore - a.matchScore)

  return {
    recommendations: recommendations.slice(0, 5),
    summary: `Based on your profile (age ${age}, ₹${income.toLocaleString('en-IN')}/month income, ${isMarried ? 'married' : 'single'}), we recommend a combination of ${recommendations[0]?.policyName || 'policies'} for optimal coverage and returns.`,
    source: 'rules',
  }
}

export default router
