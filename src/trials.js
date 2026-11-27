// SAMPLE DATA: placeholder trials for building the results UI.
// Replace with the real trials API before launch. Not real studies.
const t = (id, condition, subCondition, city, phase, title, summary, extra = {}) => ({
  id, condition, subCondition, city, phase, title, summary,
  type: 'Interventional', status: 'Recruiting', paid: false, placebo: true, postedDaysAgo: 14,
  ...extra,
})

export const trials = [
  t(1, 'Cancer', 'Soft Tissue Sarcoma', 'Phoenix, AZ', 1,
    'Testing a New Treatment to See If It Is Safe and Effective for Adults With Solid Tumors That Have Come Back or Did Not Respond to Other Treatments',
    'This study is looking at a new therapy for people whose solid tumors have returned or stopped responding to standard treatments. Researchers want to understand how safe it is and whether it helps shrink or control the tumor.'),
  t(2, 'Cancer', 'Non-Hodgkin Lymphoma', 'Phoenix, AZ', 2,
    'A New Therapy Study for Adults With Returning or Treatment-Resistant Blood Cancer',
    'This study focuses on adults with blood cancer that has come back or not responded to earlier treatment. Researchers are testing a new drug to see how well the body tolerates it and whether it can slow or stop the cancer from growing.',
    { postedDaysAgo: 21, paid: true }),
  t(3, 'Cancer', 'Kidney (Renal Cell) Cancer', 'Mesa, AZ', 1,
    'Researching Whether a New Drug Is Safe and Works Well for Adults Who Have Been Diagnosed With Kidney Cancer',
    'This study is for adults with kidney cancer who need new treatment options. Researchers are measuring the right dose of a new drug, its side effects, and whether it helps control the cancer.',
    { postedDaysAgo: 30 }),
  t(4, 'Cancer', 'Liver Cancer', 'Mesa, AZ', 3,
    'A Study Looking at a New Therapy for Adults With Liver Cancer Who Are Not Eligible for Surgery',
    'This study compares a new therapy with the current standard treatment for people whose liver cancer cannot be removed with surgery. Researchers want to see which approach helps people live longer with fewer side effects.',
    { postedDaysAgo: 14, paid: true }),
  t(5, 'Cancer', 'Stomach (Gastric) Cancer', 'Gilbert, AZ', 2,
    'Finding Out How Well a New Treatment Works for Adults With Stomach Cancer That Has Spread Beyond the Stomach',
    'This study is for adults whose stomach cancer has spread to other parts of the body. Researchers are adding a new medicine to standard chemotherapy to see if it helps control the cancer for longer.',
    { postedDaysAgo: 30 }),
  t(6, 'Cancer', 'Prostate Cancer', 'Phoenix, AZ', 2,
    'Studying a New Treatment Approach for Adults With Prostate Cancer That Has Stopped Responding to Hormone Therapy',
    'This study is for men whose prostate cancer keeps growing despite hormone therapy. Researchers are testing a targeted treatment to learn whether it can lower PSA levels and slow the cancer.',
    { postedDaysAgo: 42, placebo: false }),
  t(7, 'Cancer', 'Breast Cancer', 'Scottsdale, AZ', 3,
    'Comparing a New Combination Therapy With Standard Care for Adults With Early-Stage HER2-Positive Breast Cancer',
    'This study compares a new combination of medicines with standard treatment given before surgery. Researchers want to know whether more people end up with no remaining cancer at the time of surgery.',
    { postedDaysAgo: 7, paid: true }),
  t(8, 'Cancer', 'Lung Cancer', 'Tempe, AZ', 2,
    'Testing an Immunotherapy Combination for Adults With Advanced Non-Small Cell Lung Cancer',
    'This study looks at whether pairing two immunotherapy medicines helps the immune system find and attack lung cancer cells better than one medicine alone.',
    { postedDaysAgo: 10 }),
  t(9, 'Cancer', 'Colorectal Cancer', 'Tucson, AZ', 1,
    'A First-in-Human Study of a Targeted Drug for Adults With Advanced Colorectal Cancer',
    'This early study is testing a new targeted drug in people for the first time. Researchers are looking for a safe dose and early signs that the drug can shrink colorectal tumors.',
    { postedDaysAgo: 3, placebo: false, status: 'Upcoming' }),
  t(10, 'Cancer', 'Acute Myeloid Leukemia (AML)', 'Phoenix, AZ', 2,
    'A Study of an Oral Medicine Added to Standard Care for Older Adults Newly Diagnosed With AML',
    'This study is for adults aged 60 and over who have just been diagnosed with acute myeloid leukemia. Researchers want to see if adding a daily pill to standard treatment helps more people reach remission.',
    { postedDaysAgo: 18 }),
  t(11, 'Cancer', 'Melanoma', 'Scottsdale, AZ', 4,
    'Following Adults Treated With Immunotherapy After Melanoma Surgery to Learn About Long-Term Outcomes',
    'This study follows people who received immunotherapy after melanoma surgery. Researchers are collecting information over several years about recurrence, side effects and quality of life.',
    { postedDaysAgo: 60, type: 'Observational', placebo: false, status: 'Not Recruiting' }),
  t(12, 'Heart Disease', 'Heart Failure', 'Phoenix, AZ', 3,
    'Testing Whether a Once-Daily Medicine Reduces Hospital Visits for Adults Living With Heart Failure',
    'This study compares a new once-daily medicine with a placebo, alongside usual care. Researchers want to know if it lowers the number of hospital stays and improves daily symptoms.',
    { postedDaysAgo: 12, paid: true }),
  t(13, 'Heart Disease', 'Atrial Fibrillation', 'Tempe, AZ', 2,
    'Studying a New Approach to Prevent Strokes in Adults With Atrial Fibrillation',
    'This study tests a new blood thinner designed to lower stroke risk with less bleeding than current options.',
    { postedDaysAgo: 25 }),
  t(14, 'Diabetes', 'Type 2 Diabetes', 'Mesa, AZ', 3,
    'A Study of a Weekly Injection to Help Adults With Type 2 Diabetes Control Blood Sugar',
    'This study compares a once-weekly injection with a daily tablet. Researchers are measuring changes in A1C, weight and side effects over one year.',
    { postedDaysAgo: 9, paid: true }),
  t(15, 'Diabetes', 'Type 1 Diabetes', 'Phoenix, AZ', 2,
    'Testing Whether a New Medicine Can Protect Insulin-Making Cells in People Recently Diagnosed With Type 1 Diabetes',
    'This study is for people diagnosed with type 1 diabetes in the last 100 days. Researchers want to see if a new medicine helps the body keep making some of its own insulin.',
    { postedDaysAgo: 35 }),
  t(16, 'Neurological Disorders', 'Multiple Sclerosis', 'Scottsdale, AZ', 3,
    'Comparing Two Treatments to Slow Disability in Adults With Relapsing Multiple Sclerosis',
    'This study compares a new oral therapy with an approved injection. Researchers are tracking relapses, MRI changes and disability over two years.',
    { postedDaysAgo: 16, placebo: false }),
  t(17, 'Mental Health', 'Depression', 'Tempe, AZ', 2,
    'A Study of a Fast-Acting Treatment for Adults With Depression That Has Not Improved With Other Medicines',
    'This study tests a new treatment for depression that has not responded to at least two medicines. Researchers want to know whether symptoms improve within the first weeks.',
    { postedDaysAgo: 5, paid: true }),
  t(18, 'Respiratory', 'Asthma', 'Tucson, AZ', 3,
    'Testing a Twice-Yearly Injection to Reduce Asthma Attacks in Adults With Severe Asthma',
    'This study looks at whether an injection given every six months can cut the number of severe asthma attacks compared with a placebo.',
    { postedDaysAgo: 28 }),
  t(19, "Alzheimer's & Dementia", "Alzheimer's Disease", 'Phoenix, AZ', 3,
    "Testing Whether a New Medicine Can Slow Memory Loss in People With Early Alzheimer's Disease",
    "This study is for people with early Alzheimer's disease or mild memory problems. Researchers are measuring whether a monthly infusion slows changes in memory and thinking over 18 months.",
    { postedDaysAgo: 20, paid: true }),
  t(20, 'Autoimmune', 'Lupus', 'Mesa, AZ', 2,
    'A Study of a New Targeted Therapy for Adults With Active Lupus',
    'This study tests whether a new targeted medicine, added to usual care, reduces lupus flares and lets people lower their steroid dose.',
    { postedDaysAgo: 45 }),
]

// Derived sample details used by the map detail card
const femaleOnly = ['Breast Cancer', 'Cervical Cancer', 'Ovarian Cancer']
for (const tr of trials) {
  tr.sex = tr.subCondition === 'Prostate Cancer' ? 'Male' : femaleOnly.includes(tr.subCondition) ? 'Female' : 'All'
  tr.age = tr.subCondition.includes('AML') ? '60+' : '18+'
  tr.participants = 40 + ((tr.id * 137) % 760)
  // Trials with specific rules beyond the basics get the "Eligibility required" tag
  tr.extraCriteria = tr.phase === 1 || tr.sex !== 'All' || tr.age !== '18+' || /\(/.test(tr.subCondition)
}

/** Match strength for a trial given the current search. Null when nothing was searched. */
export function matchStrength(trial, { condition, sub, distance }) {
  if (!condition && !sub) return null
  const exactSub = sub && trial.subCondition === sub
  const near = distance == null || distance <= 15
  if (exactSub || (!sub && near)) return 'Strong'
  if (distance == null || distance <= 40) return 'Good'
  return 'Possible'
}

export const phaseLabel = {
  1: 'Early Testing (Safety)',
  2: 'Effectiveness Testing',
  3: 'Pivotal Trial (Final Testing)',
  4: 'After Approval (Long-Term)',
}

export const cityCoords = {
  'Phoenix, AZ': [33.4484, -112.074],
  'Tempe, AZ': [33.4255, -111.94],
  'Mesa, AZ': [33.4152, -111.8315],
  'Scottsdale, AZ': [33.4942, -111.9261],
  'Gilbert, AZ': [33.3528, -111.789],
  'Tucson, AZ': [32.2226, -110.9747],
  'Chandler, AZ': [33.3062, -111.8413],
  'Glendale, AZ': [33.5387, -112.186],
}

export const milesBetween = ([lat1, lon1], [lat2, lon2]) => {
  const r = (d) => (d * Math.PI) / 180
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(a))
}

export const timeAgo = (days) => {
  if (days < 1) return 'Today'
  if (days < 7) return `${days} Day${days === 1 ? '' : 's'} Ago`
  if (days < 30) { const w = Math.round(days / 7); return `${w} Week${w === 1 ? '' : 's'} Ago` }
  const m = Math.round(days / 30); return `${m} Month${m === 1 ? '' : 's'} Ago`
}
