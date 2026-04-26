import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing policy data (preserve leads from real assessments)
  await prisma.premiumCalculation.deleteMany()
  await prisma.policyRecommendation.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.followUp.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.leadSegment.deleteMany()
  // Leads are NOT deleted — they come from real frontend assessments
  await prisma.policy.deleteMany()
  await prisma.policyCategory.deleteMany()
  await prisma.segment.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.adminUser.deleteMany()

  // Create admin user
  const admin = await prisma.adminUser.create({
    data: {
      name: 'LIC Agent',
      email: 'admin@licagentpro.com',
      passwordHash: '$2a$10$rQZ8kHaMKqBxkJ0v0mKzVO9VZ5v5H5X5K5L5M5N5O5P5Q5R5S5T5',
      role: 'admin',
      phone: '9876543210',
    },
  })

  // Create policy categories
  const categories = await Promise.all([
    prisma.policyCategory.create({ data: { name: 'Term Insurance', description: 'Pure protection plans with highest coverage at lowest premium', icon: 'shield' } }),
    prisma.policyCategory.create({ data: { name: 'Endowment', description: 'Protection + Savings with guaranteed maturity benefits', icon: 'piggy-bank' } }),
    prisma.policyCategory.create({ data: { name: 'Money Back', description: 'Periodic returns during the policy term + maturity benefit', icon: 'banknote' } }),
    prisma.policyCategory.create({ data: { name: 'Whole Life', description: 'Lifetime coverage with savings component', icon: 'heart' } }),
    prisma.policyCategory.create({ data: { name: 'ULIP', description: 'Market-linked investment + insurance plans', icon: 'trending-up' } }),
    prisma.policyCategory.create({ data: { name: 'Pension/Annuity', description: 'Retirement income plans for post-retirement security', icon: 'landmark' } }),
    prisma.policyCategory.create({ data: { name: 'Children Plans', description: 'Securing your child\'s future education and marriage', icon: 'baby' } }),
    prisma.policyCategory.create({ data: { name: 'Health/Group', description: 'Health coverage and group insurance plans', icon: 'activity' } }),
  ])

  // Create all major LIC policies
  const policies = await Promise.all([
    // Term Insurance
    prisma.policy.create({
      data: {
        name: 'Tech Term',
        planNumber: '954',
        description: 'Pure term plan with highest coverage at lowest premium. No maturity benefit, only death benefit. Best for income replacement.',
        features: ['High coverage at low premium', 'Flexible payout options', 'Critical illness rider available', 'Tax benefits under 80C & 10(10D)', 'Online purchase available', 'Cover up to 80 years'],
        minAge: 18, maxAge: 65, minSumAssured: 2500000, maxSumAssured: 99999999,
        minTerm: 10, maxTerm: 40,
        premiumFrequency: ['yearly', 'half-yearly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'No maturity benefit',
        deathBenefits: 'Sum Assured paid to nominee. Option of lump sum or monthly income.',
        loanFacility: false,
        surrenderRules: { available: false },
        bestFor: { ageGroups: ['25-45'], goals: ['family protection', 'income replacement', 'high coverage'], occupations: ['salaried', 'business', 'IT professionals'], riskLevel: 'low' },
        icon: 'shield',
        categoryId: categories[0].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'Jeevan Amar',
        planNumber: '955',
        description: 'Non-linked, non-participating term assurance plan with return of premium option.',
        features: ['Return of premium option', 'Accidental death benefit', 'Critical illness cover', 'Flexible premium payment', 'Tax benefits'],
        minAge: 18, maxAge: 65, minSumAssured: 2500000, maxSumAssured: 50000000,
        minTerm: 10, maxTerm: 40,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Return of premiums paid (if opted)',
        deathBenefits: 'Sum Assured as lump sum or monthly income',
        loanFacility: false,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['25-50'], goals: ['family protection', 'return of premium'], occupations: ['all'] },
        icon: 'shield',
        categoryId: categories[0].id,
      },
    }),

    // Endowment Plans
    prisma.policy.create({
      data: {
        name: 'Jeevan Anand',
        planNumber: '915',
        description: 'Most popular LIC plan. Combines whole life coverage with endowment benefit. Lifetime coverage even after maturity.',
        features: ['Lifetime coverage after maturity', 'Guaranteed maturity benefit', 'Bonus additions', 'Loan facility', 'Tax benefits under 80C & 10(10D)', 'Accidental death benefit rider'],
        minAge: 18, maxAge: 50, minSumAssured: 200000, maxSumAssured: 10000000,
        minTerm: 15, maxTerm: 35,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Sum Assured + Bonus + Final Additional Bonus. Lifetime coverage continues.',
        deathBenefits: 'Sum Assured + Bonus (during policy). Sum Assured after maturity.',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2, percentage: '80-90% of premiums paid' },
        bestFor: { ageGroups: ['25-45'], goals: ['savings', 'lifetime coverage', 'wealth creation', 'retirement corpus'], occupations: ['salaried', 'business', 'professionals'], riskLevel: 'low' },
        icon: 'heart',
        categoryId: categories[1].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'Jeevan Labh',
        planNumber: '936',
        description: 'Limited premium payment endowment plan. Pay for less years, get coverage for longer. Higher returns than regular endowment.',
        features: ['Limited premium payment (10/15/16 years)', 'Higher bonus rates', 'Loan facility', 'Tax benefits', 'Guaranteed additions'],
        minAge: 8, maxAge: 59, minSumAssured: 200000, maxSumAssured: 50000000,
        minTerm: 16, maxTerm: 25,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Sum Assured + Guaranteed Additions + Bonus + FAB',
        deathBenefits: 'Sum Assured + Guaranteed Additions + Bonus',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['25-55'], goals: ['wealth creation', 'short premium payment', 'high returns'], occupations: ['salaried', 'business'] },
        icon: 'piggy-bank',
        categoryId: categories[1].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'Dhan Varsha',
        planNumber: '987',
        description: 'Non-linked, non-participating, individual savings life insurance plan with guaranteed additions.',
        features: ['Guaranteed additions', 'Single & limited premium', 'Loan facility', 'Tax benefits', 'Death benefit during deferment'],
        minAge: 3, maxAge: 60, minSumAssured: 1000000, maxSumAssured: 100000000,
        minTerm: 10, maxTerm: 25,
        premiumFrequency: ['single', 'yearly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Sum Assured + Guaranteed Additions',
        deathBenefits: 'Sum Assured + Guaranteed Additions or 125% of single premium',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 1 },
        bestFor: { ageGroups: ['30-60'], goals: ['guaranteed returns', 'wealth transfer', 'tax saving'], occupations: ['business', 'professionals', 'HNI'] },
        icon: 'piggy-bank',
        categoryId: categories[1].id,
      },
    }),

    // Money Back Plans
    prisma.policy.create({
      data: {
        name: 'Jeevan Umang',
        planNumber: '945',
        description: 'Whole life money back plan. Annual survival benefits from end of premium paying term till death. Lifetime coverage.',
        features: ['Annual survival benefits after premium payment', 'Lifetime coverage', 'Loan facility', 'Tax benefits', 'Guaranteed additions', 'Bonus'],
        minAge: 90, maxAge: 55, minSumAssured: 200000, maxSumAssured: 10000000,
        minTerm: 15, maxTerm: 30,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: '8% of Sum Assured paid annually after premium paying term. Full SA + Bonus on death.',
        deathBenefits: 'Sum Assured + Guaranteed Additions + Bonus',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['25-55'], goals: ['regular income', 'retirement income', 'lifetime coverage'], occupations: ['all'] },
        icon: 'banknote',
        categoryId: categories[2].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'Jeevan Shiromani',
        planNumber: '947',
        description: 'Non-linked, with-profits money back plan with guaranteed additions. High net worth individuals.',
        features: ['Guaranteed additions', 'Periodic payouts', 'Critical illness cover', 'Loan facility', 'Tax benefits'],
        minAge: 18, maxAge: 55, minSumAssured: 10000000, maxSumAssured: 100000000,
        minTerm: 14, maxTerm: 22,
        premiumFrequency: ['yearly', 'half-yearly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Regular payouts during term + Sum Assured + Bonus at maturity',
        deathBenefits: 'Sum Assured + Guaranteed Additions + Bonus',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['30-55'], goals: ['HNI planning', 'regular income', 'tax saving'], occupations: ['business owners', 'professionals', 'HNI'] },
        icon: 'banknote',
        categoryId: categories[2].id,
      },
    }),

    // ULIP Plans
    prisma.policy.create({
      data: {
        name: 'SIIP (Single Premium Investment)',
        planNumber: '852',
        description: 'Systematic Investment cum Insurance Plan. Market-linked returns with insurance protection. Flexibility to switch funds.',
        features: ['Market-linked returns', 'Fund switching option', 'Partial withdrawal', 'Top-up facility', 'Tax benefits', 'Loyalty additions', 'Multiple fund options'],
        minAge: 90, maxAge: 65, minSumAssured: 500000, maxSumAssured: 99999999,
        minTerm: 10, maxTerm: 35,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Fund value at maturity based on market performance',
        deathBenefits: 'Higher of Sum Assured or 105% of premiums paid + Fund Value',
        loanFacility: false,
        surrenderRules: { available: true, afterYears: 5, lockIn: '5 years' },
        bestFor: { ageGroups: ['25-50'], goals: ['wealth creation', 'market returns', 'long term growth'], occupations: ['IT', 'business', 'professionals'], riskLevel: 'high' },
        icon: 'trending-up',
        categoryId: categories[4].id,
      },
    }),

    // Pension Plans
    prisma.policy.create({
      data: {
        name: 'Jeevan Shanti',
        planNumber: '850',
        description: 'Immediate or deferred annuity plan. Guaranteed pension for lifetime. Options for return of purchase price.',
        features: ['Guaranteed pension', 'Immediate or deferred option', 'Return of purchase price option', 'Joint life annuity', 'Multiple annuity options', 'Tax benefits'],
        minAge: 30, maxAge: 85, minSumAssured: 150000, maxSumAssured: 99999999,
        minTerm: 1, maxTerm: 99,
        premiumFrequency: ['single', 'yearly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': false },
        maturityBenefits: 'Pension continues for life. Return of purchase price on death (if opted).',
        deathBenefits: 'Return of purchase price to nominee (if opted)',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 1, conditions: 'Varies by annuity option' },
        bestFor: { ageGroups: ['40-85'], goals: ['retirement income', 'guaranteed pension', 'financial security'], occupations: ['retired', 'business owners', 'professionals'] },
        icon: 'landmark',
        categoryId: categories[5].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'New Pension Plus',
        planNumber: '867',
        description: 'Unit-linked pension plan for building retirement corpus with market-linked returns.',
        features: ['Market-linked returns', 'Fund options', 'Partial withdrawal after 5 years', 'Tax benefits', 'Loyalty additions'],
        minAge: 25, maxAge: 60, minSumAssured: 500000, maxSumAssured: 50000000,
        minTerm: 10, maxTerm: 35,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': false },
        maturityBenefits: 'Fund value used to purchase annuity for pension',
        deathBenefits: 'Fund value paid to nominee',
        loanFacility: false,
        surrenderRules: { available: true, afterYears: 5, lockIn: '5 years' },
        bestFor: { ageGroups: ['25-55'], goals: ['retirement planning', 'pension corpus', 'market returns'], occupations: ['IT', 'business', 'professionals'] },
        icon: 'landmark',
        categoryId: categories[5].id,
      },
    }),

    // Children Plans
    prisma.policy.create({
      data: {
        name: 'Amritbaal',
        planNumber: '974',
        description: 'Children\'s money back plan. Secures child\'s education and marriage with periodic payouts and guaranteed additions.',
        features: ['Guaranteed additions', 'Periodic payouts at age 18-21-24', 'Premium waiver on parent death', 'Loan facility', 'Tax benefits'],
        minAge: 0, maxAge: 13, minSumAssured: 200000, maxSumAssured: 50000000,
        minTerm: 25, maxTerm: 25,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Payouts at age 18, 21, 24 + Maturity at 25',
        deathBenefits: 'Sum Assured + Bonus. Remaining premiums waived.',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['25-45'], goals: ['child education', 'child marriage', 'child future'], occupations: ['all'] },
        icon: 'baby',
        categoryId: categories[6].id,
      },
    }),
    prisma.policy.create({
      data: {
        name: 'Jeevan Tarun',
        planNumber: '934',
        description: 'Children\'s plan with flexibility. Parent chooses benefit payout percentage at maturity.',
        features: ['Flexible payout options', 'Survival benefits', 'Premium waiver', 'Loan facility', 'Tax benefits', 'Bonus'],
        minAge: 0, maxAge: 12, minSumAssured: 75000, maxSumAssured: 10000000,
        minTerm: 20, maxTerm: 25,
        premiumFrequency: ['yearly', 'half-yearly', 'quarterly', 'monthly'],
        taxBenefits: { '80C': true, '80D': false, '10(10D)': true },
        maturityBenefits: 'Survival benefits at ages 20-23 + Maturity benefit',
        deathBenefits: 'Sum Assured + Bonus. Premium waiver.',
        loanFacility: true,
        surrenderRules: { available: true, afterYears: 2 },
        bestFor: { ageGroups: ['25-45'], goals: ['child education', 'child marriage'], occupations: ['all'] },
        icon: 'baby',
        categoryId: categories[6].id,
      },
    }),
  ])

  // Create segments
  await Promise.all([
    prisma.segment.create({ data: { name: 'IT Professionals', description: 'Software and IT sector employees', criteria: { sector: 'IT', occupation: 'software' } } }),
    prisma.segment.create({ data: { name: 'Banking Sector', description: 'Bank and financial institution employees', criteria: { sector: 'Banking' } } }),
    prisma.segment.create({ data: { name: 'Government Employees', description: 'Central and state government employees', criteria: { sector: 'Government' } } }),
    prisma.segment.create({ data: { name: '40+ Age Group', description: 'People above 40 years', criteria: { ageMin: 40 } } }),
    prisma.segment.create({ data: { name: 'High Income', description: 'Monthly income above 1 lakh', criteria: { incomeMin: 100000 } } }),
    prisma.segment.create({ data: { name: 'New Leads', description: 'Fresh leads not contacted yet', criteria: { status: 'new' } } }),
    prisma.segment.create({ data: { name: 'Hot Leads', description: 'Lead score above 70', criteria: { scoreMin: 70 } } }),
    prisma.segment.create({ data: { name: 'Family with Kids', description: 'Married with children', criteria: { hasChildren: true } } }),
  ])

  // Create testimonials
  await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Rajesh Kumar',
        age: 42,
        occupation: 'Senior Software Engineer at TCS',
        policyName: 'Jeevan Anand',
        testimonialText: 'I was skeptical about LIC initially, but after understanding the lifetime coverage and tax benefits of Jeevan Anand, I invested ₹50L. Now I feel secure knowing my family is protected AND I have a retirement corpus growing.',
        rating: 5,
        isFeatured: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Priya Sharma',
        age: 38,
        occupation: 'Bank Manager at SBI',
        policyName: 'Tech Term',
        testimonialText: 'As a banker, I analyzed every insurance option. Tech Term gave me ₹1Cr coverage at just ₹12,000/year. Nothing else comes close. My colleagues at SBI have also taken it after seeing my recommendation.',
        rating: 5,
        isFeatured: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Venkat Reddy',
        age: 45,
        occupation: 'Government Officer',
        policyName: 'Jeevan Labh',
        testimonialText: 'I took Jeevan Labh for my retirement. Paid premiums for 16 years and now getting ₹25L+ with bonus. Best decision I made. The agent explained everything clearly.',
        rating: 5,
        isFeatured: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Anitha Menon',
        age: 35,
        occupation: 'IT Project Manager',
        policyName: 'Amritbaal',
        testimonialText: 'For my daughter\'s future, Amritbaal is perfect. She\'ll get money at 18, 21, and 24 for education and marriage. If anything happens to me, premiums are waived. Peace of mind!',
        rating: 5,
        isFeatured: true,
      },
    }),
  ])

  // No dummy leads — leads come from real frontend assessments

  console.log('✅ Database seeded successfully!')
  console.log(`   - 1 admin user created`)
  console.log(`   - ${categories.length} policy categories created`)
  console.log(`   - ${policies.length} policies created`)
  console.log(`   - 8 segments created`)
  console.log(`   - 4 testimonials created`)
  console.log(`   - 0 dummy leads (real leads from assessment only)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
