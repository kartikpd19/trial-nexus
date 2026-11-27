export const popularConditions = ['Neurological Disorders', 'Heart Disease', 'Diabetes', 'Cancer']

// Trial counts are sample values until the search API is wired.
export const conditions = [
  { title: 'Cancer', subs: 'Breast Cancer, Leukemia', count: '500+' },
  { title: 'Heart Disease', subs: 'Heart Failure, Arrhythmia', count: '320+', badge: '32+ ADDED' },
  { title: 'Diabetes', subs: 'Type 1, Type 2', count: '280+' },
  { title: 'Neurological', query: 'Neurological Disorders', subs: 'Epilepsy, Multiple Sclerosis', count: '240+' },
  { title: "Alzheimer's", query: "Alzheimer's & Dementia", subs: 'Early Onset, Mild Cognitive Impairment', count: '150+' },
  { title: 'Respiratory', subs: 'Asthma, COPD', count: '190+', badge: '18+ ADDED' },
  { title: 'Autoimmune', subs: 'Lupus, Rheumatoid Arthritis', count: '170+' },
  { title: 'Mental Health', subs: 'Depression, Anxiety', count: '210+' },
]

export const features = [
  {
    icon: 'reliable',
    title: 'Reliable',
    text: 'Every listing comes from verified trial registries and research sites, and is checked for status updates.',
  },
  {
    icon: 'secure',
    title: 'Secure',
    text: 'Your health details are handled with HIPAA-aware practices and are never shared without your consent.',
  },
  {
    icon: 'affordable',
    title: 'Affordable',
    text: 'Searching and matching is always free. Many trials also cover study care and travel costs.',
  },
]

// Search taxonomy: condition -> groups of sub-conditions
export const conditionTaxonomy = {
  Cancer: [
    {
      group: 'Carcinomas',
      note: 'Cancers of epithelial tissue',
      items: ['Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Prostate Cancer', 'Pancreatic Cancer', 'Stomach (Gastric) Cancer', 'Liver Cancer', 'Cervical Cancer', 'Bladder Cancer', 'Kidney (Renal Cell) Cancer', 'Ovarian Cancer'],
    },
    {
      group: 'Sarcomas',
      note: 'Cancers of connective tissue',
      items: ['Osteosarcoma (Bone Cancer)', 'Chondrosarcoma (Cartilage Cancer)', 'Soft Tissue Sarcoma', 'Ewing Sarcoma'],
    },
    {
      group: 'Blood Cancers',
      note: 'Leukemias, lymphomas and myeloma',
      items: ['Acute Myeloid Leukemia (AML)', 'Acute Lymphoblastic Leukemia (ALL)', 'Chronic Lymphocytic Leukemia (CLL)', 'Chronic Myeloid Leukemia (CML)', 'Hodgkin Lymphoma', 'Non-Hodgkin Lymphoma', 'Multiple Myeloma'],
    },
    {
      group: 'Other Cancers',
      note: 'Brain, skin and more',
      items: ['Glioblastoma', 'Melanoma', 'Neuroblastoma', 'Thyroid Cancer', 'Head and Neck Cancer'],
    },
  ],
  'Heart Disease': [
    { group: 'Heart and Vessels', note: 'Heart muscle, rhythm and circulation', items: ['Heart Failure', 'Coronary Artery Disease', 'Atrial Fibrillation', 'Arrhythmia', 'Cardiomyopathy', 'Hypertension', 'High Cholesterol'] },
  ],
  Diabetes: [
    { group: 'Types', note: 'Blood sugar conditions', items: ['Type 1 Diabetes', 'Type 2 Diabetes', 'Gestational Diabetes', 'Prediabetes'] },
    { group: 'Complications', note: 'Related conditions', items: ['Diabetic Neuropathy', 'Diabetic Retinopathy', 'Diabetic Kidney Disease'] },
  ],
  'Neurological Disorders': [
    { group: 'Neurological', note: 'Brain, spine and nerves', items: ['Epilepsy', 'Multiple Sclerosis', "Parkinson's Disease", 'Migraine', 'ALS', 'Stroke', 'Peripheral Neuropathy'] },
  ],
  "Alzheimer's & Dementia": [
    { group: 'Dementia', note: 'Memory and thinking', items: ["Alzheimer's Disease", 'Mild Cognitive Impairment', 'Lewy Body Dementia', 'Frontotemporal Dementia', 'Vascular Dementia'] },
  ],
  Respiratory: [
    { group: 'Lung Conditions', note: 'Airways and lungs', items: ['Asthma', 'COPD', 'Cystic Fibrosis', 'Pulmonary Fibrosis', 'Sleep Apnea'] },
  ],
  Autoimmune: [
    { group: 'Autoimmune', note: 'Immune system attacking the body', items: ['Lupus', 'Rheumatoid Arthritis', 'Psoriasis', "Crohn's Disease", 'Ulcerative Colitis', 'Celiac Disease'] },
  ],
  'Mental Health': [
    { group: 'Mental Health', note: 'Mood, anxiety and more', items: ['Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder', 'Schizophrenia', 'ADHD', 'OCD'] },
  ],
  'Kidney Disease': [
    { group: 'Kidney', note: 'Kidney function', items: ['Chronic Kidney Disease', 'Polycystic Kidney Disease', 'Kidney Transplant'] },
  ],
  'Infectious Disease': [
    { group: 'Infections', note: 'Viral and bacterial', items: ['HIV', 'Hepatitis B', 'Hepatitis C', 'COVID-19', 'RSV'] },
  ],
}

export const locations = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Tempe, AZ', 'Scottsdale, AZ',
  'Mesa, AZ', 'Tucson, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Boston, MA',
  'Seattle, WA', 'Denver, CO', 'Atlanta, GA', 'Miami, FL', 'Nashville, TN', 'Baltimore, MD', 'Rochester, MN',
]

export const faqs = [
  {
    q: 'What is a clinical trial?',
    a: 'A clinical trial is a research study conducted with volunteers to evaluate the safety and effectiveness of new medical treatments, drugs, devices, or procedures. They are the primary way researchers determine whether new treatments work in people.',
  },
  {
    q: 'Who can participate in a clinical trial?',
    a: 'Each trial has its own eligibility criteria, such as age, diagnosis, stage of a condition, current medications, and overall health. Some trials look for people with a specific condition, while others need healthy volunteers. The study team confirms eligibility through a screening process.',
  },
  {
    q: 'Is participating in a clinical trial safe?',
    a: 'Every trial follows a protocol reviewed by an ethics board, and participants are monitored closely throughout. Like any treatment, there can be risks and side effects. Before you join, the study team explains the possible risks and benefits so you can make an informed decision.',
  },
  {
    q: 'Do I get paid for participating?',
    a: 'It depends on the study. Many trials cover study-related care at no cost, and some offer compensation for your time or reimburse travel and parking. Compensation details are listed in the trial information and explained during screening.',
  },
  {
    q: 'How do I sign up for a trial on Trial Nexus?',
    a: 'Search by condition and location, open a trial that interests you, and check whether you may be a fit. If it looks right, submit your interest and the research site will contact you to talk through next steps and screening. Searching and matching is always free.',
  },
  {
    q: 'Can I leave a clinical trial after I join?',
    a: 'Yes. Taking part is always voluntary, and you can leave a study at any time for any reason. Let the study team know so they can help you stop safely and guide any follow-up care.',
  },
]

export const footer = {
  contact: { address: '[ADDRESS]', email: '[EMAIL]', phone: '[PHONE]' },
  quickLinks: [
    { label: 'About Us' },
    { label: 'Trials by Condition' },
    { label: 'All Clinical Trials' },
    { label: 'Work With Us', count: 1 },
  ],
  columns: [
    { heading: 'Browse', links: ['Conditions', 'Cities', 'States', 'Popular Categories', 'Treatments'] },
    { heading: 'Locations', links: ['Arizona', 'California', 'Texas', 'Florida', 'New York', 'Illinois'] },
    { heading: 'Conditions', links: ['Cancer', 'Heart Disease', 'Diabetes', "Alzheimer's", "Parkinson's", 'Depression'] },
    { heading: 'Trial Types', links: ['Interventional', 'Observational', 'Pediatric', 'Healthy Volunteers', 'Remote / Decentralized'] },
    { heading: 'Cities', links: ['Phoenix', 'Tempe', 'Scottsdale', 'Los Angeles', 'Houston', 'Chicago'] },
  ],
  legal: ['Terms of Service', 'Privacy Policy', 'Cookies', 'Security'],
}
