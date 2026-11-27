// SAMPLE DATA: builds detail-page content from the sample trials in trials.js.
// Replace with fields from the real trials API (eligibility, arms, sites, sponsor) before launch.
import { cityCoords, milesBetween, phaseLabel } from './trials.js'

const monthYear = (daysAgo) =>
  new Date(Date.now() - daysAgo * 864e5).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

const siteNames = ['Valley Clinical Research Center', 'Sonoran Health Research Institute', 'Desert Medical Research Partners', 'Canyon Clinical Studies Unit']

const sponsors = {
  Cancer: { name: 'Southwest Oncology Research Group', initials: 'SO' },
  'Heart Disease': { name: 'Cardiovascular Research Collaborative', initials: 'CR' },
  Diabetes: { name: 'Metabolic Health Research Network', initials: 'MH' },
  default: { name: 'Regional Clinical Research Alliance', initials: 'RC' },
}

const treatmentWeeks = { 1: 12, 2: 24, 3: 52, 4: 0 }

export function getTrialDetail(trial) {
  const code = `TNX-${100 + trial.id * 7}`
  const isCancer = trial.condition === 'Cancer'
  const weeks = treatmentWeeks[trial.phase]
  const ageText = trial.age === '60+' ? '60 or older' : '18 or older'
  const sexText = trial.sex === 'All' ? '' : ` and ${trial.sex === 'Male' ? 'male' : 'female'}`
  const sponsor = sponsors[trial.condition] || sponsors.default

  const keyRequirements = [
    `You are ${ageText}${sexText}.`,
    `You have a confirmed diagnosis of ${trial.subCondition}${isCancer ? ' that has been checked with a biopsy or scan' : ''}.`,
    isCancer
      ? 'You are well enough to take care of yourself and do most of your daily activities.'
      : 'Your condition is stable enough that your current treatment has not changed in the last 3 months.',
    `You can attend regular study visits in ${trial.city}${weeks ? ` for about ${weeks} weeks` : ''}.`,
  ]

  const inclusion = [
    ...keyRequirements,
    'Recent blood tests show your liver, kidneys and blood counts are within safe ranges.',
    'You are willing to sign a consent form after the study is explained to you.',
  ]

  const exclusion = [
    'You are pregnant, breastfeeding, or planning a pregnancy during the study.',
    'You have an active infection that needs treatment.',
    'You took part in another trial that tested a treatment in the last 30 days.',
    'You have a serious heart, lung or liver condition that would make the study unsafe for you.',
    ...(isCancer ? ['Your cancer has spread to the brain and has not yet been treated.'] : []),
  ]

  const groups = trial.placebo
    ? [
        { name: 'Group I', kind: 'Experimental', text: `${code} given with standard care.` },
        { name: 'Group II', kind: 'Placebo Comparator', text: 'A placebo (an inactive look-alike) given with standard care.' },
      ]
    : trial.type === 'Observational'
      ? [{ name: 'Cohort', kind: 'Observational', text: 'People already receiving treatment are followed over time. No study medicine is given.' }]
      : [{ name: 'Group I', kind: 'Experimental', text: `Everyone in the study receives ${code}.` }]

  const timeline = [
    { label: 'Screening', duration: 'Up to 4 weeks', text: 'Visits to confirm you qualify: health history, a physical exam, blood tests and any scans needed.', icon: 'clipboard' },
    trial.type === 'Observational'
      ? { label: 'Observation', duration: '2 to 5 years', text: 'Check-ins and questionnaires during your usual care. No extra treatment is given.', icon: 'users' }
      : { label: 'Treatment', duration: `${weeks || 12} weeks`, text: `You receive your assigned treatment and come in for regular check-ups, usually every 2 to 4 weeks.`, icon: 'users' },
    { label: 'Follow-up', duration: '12 months', text: 'Fewer visits or phone calls so the team can track your health after treatment ends.', icon: 'calendar' },
  ]

  const origin = cityCoords[trial.city]
  const sites = siteNames.slice(0, 3).map((name, i) => {
    const city = i === 0 ? trial.city : Object.keys(cityCoords).filter((c) => c !== trial.city && c !== 'Tucson, AZ')[(trial.id + i) % 6]
    return {
      name,
      city,
      miles: origin && cityCoords[city] ? Math.round(milesBetween(origin, cityCoords[city])) : null,
      recruiting: trial.status === 'Recruiting' && i < 2,
    }
  })

  return {
    code,
    shortTitle: trial.title,
    howItWorks: `${trial.summary} ${trial.placebo ? 'Participants may receive either the study treatment or a placebo.' : 'Everyone who joins receives the study treatment.'}`,
    goodFit: `This study may be a fit if you are ${ageText}${sexText}, have ${trial.subCondition.toLowerCase().startsWith('type') ? trial.subCondition : trial.subCondition.toLowerCase()}, and can travel to ${trial.city} for visits. The study team makes the final decision after screening.`,
    fullPost: [
      `Official title: A ${phaseLabel[trial.phase].split(' (')[0].toLowerCase()} study of ${code} in participants with ${trial.subCondition}.`,
      trial.summary,
      `The study is ${trial.placebo ? 'randomized and double-blind, which means neither you nor the study doctors will know which group you are in' : 'open-label, which means you and your doctors will know which treatment you receive'}. Researchers will measure safety, side effects and how the condition changes over time.`,
    ],
    keyRequirements,
    inclusion,
    exclusion,
    groups,
    timeline,
    sites,
    sponsor: { ...sponsor, blurb: 'Led by a trusted healthcare research team ensuring participant safety and ethical standards.' },
    investigator: { name: '[Investigator name]', role: 'Principal Investigator', org: sites[0].name },
    basics: [
      ['Ages eligible', trial.age],
      ['Sexes eligible', trial.sex],
      ['Randomized', trial.placebo ? 'Yes' : 'No'],
      ['Healthy volunteers', 'No'],
      ['First submitted', monthYear(trial.postedDaysAgo + 420)],
      ['Last verified', monthYear(trial.postedDaysAgo)],
    ],
    faq: [
      { q: `What is ${code}?`, a: `${code} is the investigational treatment being studied. It is not yet approved for ${trial.subCondition}, which is why it is being tested in this trial.` },
      { q: 'Could I receive a placebo?', a: trial.placebo ? 'Yes. Some participants receive a placebo alongside standard care, so no one goes without the usual treatment for their condition.' : 'No. This study does not use a placebo.' },
      { q: 'Will I be paid?', a: trial.paid ? 'Yes. This study offers compensation for your time, and may cover travel or parking. The study team will share exact amounts.' : 'Compensation is not listed for this study. Study-related care is usually provided at no cost. Ask the study team for details.' },
      { q: 'Can I stop at any time?', a: 'Yes. Joining is voluntary and you can leave the study at any time without affecting your regular care.' },
    ],
  }
}
