import { S, type Src } from './facts';

// ---------- CAMP CHECKLIST ----------
export interface CItem { id: string; label: string; note?: string; must?: boolean }
export interface CGroup { id: string; title: string; emoji: string; items: CItem[]; source?: Src; sourceNote?: string }

export const CHECKLIST: CGroup[] = [
  { id: 'docs', title: 'Documents', emoji: '📄', source: { label: 'Monoed: documents required for NYSC camp', url: 'https://monoed.africa/blog/nysc-orientation-camp-required-documents' }, sourceNote: 'Your call-up letter and camp officials have the final word: read the instructions on it.', items: [
    { id: 'callup', label: 'Call-up letter, printed in colour', must: true, note: 'Don\'t laminate it. Keep 3 photocopies.' },
    { id: 'greencard', label: 'NYSC green card, printed and signed', must: true, note: 'From your portal dashboard. Don\'t laminate it.' },
    { id: 'result', label: 'Statement of result or certificate (original)', must: true, note: 'Plus 3 photocopies.' },
    { id: 'schoolid', label: 'School ID card (original + copies)', must: true, note: 'Even if expired.' },
    { id: 'medical', label: 'Medical fitness certificate', must: true, note: 'From a government or military hospital, signed, stamped and dated.' },
    { id: 'photos', label: 'Passport photographs (8–10)', must: true, note: 'Matching the photo on your green card.' },
    { id: 'nin', label: 'NIN slip or National ID', must: true, note: 'Also handy for bank verification in camp.' },
    { id: 'itletter', label: 'IT letter (HND graduates)', note: 'For HND holders who did the one-year industrial training.' },
    { id: 'copies', label: 'Waterproof folder for all copies' },
    { id: 'marriage', label: 'Marriage certificate + spouse letter (if relocating on marital grounds)' },
    { id: 'medreport', label: 'Medical report (if relocating on health grounds)' },
  ]},
  { id: 'kit', title: 'Kits & clothing', emoji: '👕', sourceNote: 'NYSC issues a kit at camp; bring extra whites because sizes run out.', items: [
    { id: 'whitetee', label: 'White T-shirts (3+)', must: true },
    { id: 'whiteshorts', label: 'White shorts (2+)', must: true },
    { id: 'canvas', label: 'White canvas / tennis shoes', must: true },
    { id: 'socks', label: 'White socks (3+ pairs)', must: true },
    { id: 'slippers', label: 'Bathroom slippers' },
    { id: 'mufti', label: 'Mufti clothes for evenings and Sunday' },
    { id: 'underwear', label: 'Enough underwear for 3 weeks' },
    { id: 'rain', label: 'Raincoat or small umbrella' },
    { id: 'sweater', label: 'Light sweater (nights get cold in some camps)' },
    { id: 'sewing', label: 'Needle, thread and safety pins', note: 'Kits often need adjusting.' },
  ]},
  { id: 'room', title: 'Hostel life', emoji: '🛏️', items: [
    { id: 'padlock', label: 'Padlock + spare key', must: true },
    { id: 'bucket', label: 'Bucket and bowl', must: true },
    { id: 'bedsheet', label: 'Bedsheets and pillowcase', must: true },
    { id: 'net', label: 'Mosquito net or repellent', must: true },
    { id: 'torch', label: 'Rechargeable torch / lamp' },
    { id: 'powerbank', label: 'Power bank (charged)', must: true },
    { id: 'hangers', label: 'Hangers and clothes pegs' },
    { id: 'plate', label: 'Plate, cup, spoon and flask' },
    { id: 'notebook', label: 'Notebook and pens' },
  ]},
  { id: 'care', title: 'Toiletries & health', emoji: '🧴', items: [
    { id: 'toiletries', label: 'Soap, sponge, toothbrush, paste', must: true },
    { id: 'towel', label: 'Towel' },
    { id: 'detergent', label: 'Detergent for hand-washing' },
    { id: 'meds', label: 'Personal medication + prescription', must: true, note: 'Tell the camp clinic about any condition.' },
    { id: 'firstaid', label: 'Plasters, pain relief, ORS' },
    { id: 'sanitary', label: 'Sanitary pads (if needed)' },
    { id: 'sanitiser', label: 'Hand sanitiser and tissue' },
  ]},
  { id: 'money', title: 'Money & food', emoji: '💸', items: [
    { id: 'cash', label: 'Cash in small notes', must: true, note: 'POS lines get long and network fails.' },
    { id: 'atm', label: 'ATM card + bank app set up', must: true, note: 'Your allowance account details are needed at camp.' },
    { id: 'provisions', label: 'Provisions: garri, sugar, milk, beverage, biscuits' },
    { id: 'water', label: 'Bottled water for the journey' },
    { id: 'contacts', label: 'Emergency contacts written on paper' },
  ]},
];
export const DONT_BRING = ['Expensive jewellery and valuables', 'Large amounts of cash', 'Any weapon or sharp object beyond a small cutlery set', 'Hard drugs, alcohol or anything illegal', 'Coloured clothes as your "white" kit'];

// ---------- CDS ----------
export const CDS_GROUPS = ['Education (EDUC)', 'Health', 'Environmental', 'Legal Aid (CLAD)', 'Road Safety (FRSC)', 'Editorial / OBS', 'Sports', 'Social Development', 'Agro-allied', 'SAED', 'HIV/AIDS (PHAT)', 'Anti-Corruption (HEED)', 'Culture & Tourism', 'Disaster Management', 'SDGs', 'Anti-Drug Abuse (NDLEA)'];
export const CDS_SOURCE: Src = { label: 'NYSC Mobilization guide: the 16 CDS groups', url: 'https://nyscmobilization.org/nysc-cds-groups/' };
export const CLEARANCE_SOURCE: Src = { label: 'NYSC Mobilization guide: monthly clearance', url: 'https://nyscmobilization.org/nysc-monthly-clearance/' };

// ---------- GUIDES ----------
export interface Tip { t: string; d: string }
export const PPA_TIPS: { title: string; emoji: string; tips: Tip[] }[] = [
  { title: 'Before posting', emoji: '🧭', tips: [
    { t: 'Ask around in camp', d: 'Platoon mates from the state and ex-corpers in camp know which PPAs pay, which accommodate, and which reject corpers. Ask early.' },
    { t: 'Know what you want', d: 'Teaching, health, tech, banking, government? Your PPA shapes your CV. Write down 2–3 sectors before posting day.' },
    { t: 'Don\'t pay anyone for "posting"', d: 'Anybody asking for money to "fix" your PPA is a scammer. Postings are done by NYSC officials.' },
  ]},
  { title: 'Reporting to your PPA', emoji: '🏢', tips: [
    { t: 'Report fast', d: 'Go with your posting letter, ID and passport photos the first working day after camp. First impressions decide your desk.' },
    { t: 'If they reject you', d: 'Collect a written rejection letter, then go to your LGI (Local Government Inspector) for a new posting. Do it quickly so your clearance is not affected.' },
    { t: 'Ask about the extras', d: 'Some PPAs give a stipend, lodging or transport. Ask HR politely, in writing if you can.' },
  ]},
  { title: 'Living well', emoji: '🏠', tips: [
    { t: 'Corpers\' lodge first', d: 'Check if your PPA or LGA has a corpers\' lodge before paying an agent. Never pay rent before you see the room.' },
    { t: 'Budget from day one', d: 'Allowance + PPA pay − rent − transport − food. Use the Money tab to track it.' },
    { t: 'Safety', d: 'Share your location with family, avoid travelling at night, and save your LGI\'s number.' },
  ]},
  { title: 'Make the year count', emoji: '🚀', tips: [
    { t: 'Collect proof', d: 'Keep a simple log of projects, results and references. It becomes your CV and LinkedIn after POP.' },
    { t: 'Learn one paid skill', d: 'Use SAED plus free online courses. One skill you can sell is worth more than a certificate.' },
    { t: 'Ask for a letter', d: 'Before you leave, ask your boss for a reference or a job. Many corpers are retained.' },
  ]},
];

export const SAED_AREAS: { name: string; emoji: string; ideas: string }[] = [
  { name: 'ICT', emoji: '💻', ideas: 'Web and app development, graphics, data, digital marketing. Low start-up cost, sells online.' },
  { name: 'Agro-allied', emoji: '🌱', ideas: 'Poultry, fish farming, snail farming, crop and food processing.' },
  { name: 'Culinary & catering', emoji: '🍲', ideas: 'Small chops, pastries, event catering, food packaging.' },
  { name: 'Cosmetology', emoji: '💅', ideas: 'Hair, makeup, nails, soap and cream making.' },
  { name: 'Creative industry', emoji: '🎨', ideas: 'Fashion and tailoring, photography, video, crafts, content creation.' },
  { name: 'Construction', emoji: '🧱', ideas: 'Tiling, POP ceilings, painting, plumbing.' },
  { name: 'Automobile', emoji: '🚗', ideas: 'Vehicle maintenance, auto-electrics.' },
  { name: 'Cleaning services & hygiene', emoji: '🧼', ideas: 'Liquid soap, detergent, fumigation, cleaning business.' },
  { name: 'Power & energy', emoji: '☀️', ideas: 'Solar installation and maintenance.' },
  { name: 'Education', emoji: '📚', ideas: 'Lesson centres, exam coaching, tutoring.' },
];
export const SAED_STEPS: Tip[] = [
  { t: 'In camp', d: 'Attend the SAED lectures and pick one skill area. Choose by what you can sell in your state, not by what\'s popular.' },
  { t: 'After camp', d: 'Find an accredited SAED training centre near your PPA on the SAED portal and keep training.' },
  { t: 'Funding', d: 'Watch for SAED business grants and NYSC partner loans. Prepare a simple business plan; it is always asked for.' },
];
export const SAED_SOURCES: Src[] = [S.saedPortal, S.saedGov, { label: 'Federal Ministry of Youth Development: NYSC SAED programme', url: 'https://yid.fmyd.gov.ng/nysc-saed-skills-acquisition-entrepreneurship-development-programme/' }];

// ---------- FAQ / MYTHS ----------
export interface Faq { q: string; myth?: boolean; a: string; src?: Src[]; verified?: boolean }
export const FAQ: Faq[] = [
  { myth: true, q: '“Allowance is different in every state.”', a: 'The federal allowance is the same ₦77,000 everywhere. Some state governments and PPAs add their own stipend on top, and that part differs.', src: [S.allowPunch, S.allowBbc], verified: true },
  { myth: true, q: '“I can relocate if I don\'t like my state.”', a: 'Relocation is considered on marital, health or security grounds, with proof (e.g. a marriage certificate or a government hospital medical report). Personal preference is not a valid ground.', src: [{ label: 'NYSC Guide: redeployment 2026', url: 'https://nyscguide.org/blog/redeployment-guide-2026' }, { label: 'NYSC Mobilization: redeployment', url: 'https://nyscmobilization.org/nysc-redeployment/' }], verified: false },
  { myth: true, q: '“Missing monthly clearance is no big deal.”', a: 'Clearance is how NYSC confirms you are serving. Without it you may not be paid for that month, and repeated absence can lead to an extended service year.', src: [{ label: 'NYSC Mobilization: monthly clearance', url: 'https://nyscmobilization.org/nysc-monthly-clearance/' }], verified: false },
  { myth: true, q: '“CDS is optional.”', a: 'Group CDS, one day a week, is compulsory. Missing it without a good reason can bring queries, affect your allowance or extend your service.', src: [{ label: 'NYSC Mobilization: CDS groups', url: 'https://nyscmobilization.org/nysc-cds-groups/' }], verified: false },
  { myth: true, q: '“Someone can pay to fix my posting.”', a: 'Nobody can legitimately sell you a posting or a relocation. Treat any such offer as a scam and report it.' },
  { myth: true, q: '“The camp gives you everything, so pack light.”', a: 'You get a kit, but sizes run out and you still need bedding, a bucket, toiletries, provisions and cash. Use the checklist.' },
  { q: 'How long is camp?', a: 'About three weeks. For 2026 Batch C Stream II: reception from Wednesday Nov 4, swearing-in on Friday Nov 6, closing ceremony on Tuesday Nov 24.', src: [S.c2Daily, S.c2Punch], verified: true },
  { q: 'When does registration close?', a: 'For Batch C Stream II, registration in camp runs from Nov 4 to midnight on Friday Nov 6, 2026. Arrive early.', src: [S.c2Daily], verified: true },
  { q: 'Where do I print my call-up letter?', a: 'On the NYSC portal, from your dashboard, once your institution and NYSC have released it.', src: [S.portal] },
  { q: 'What is a PPA?', a: 'Your Place of Primary Assignment: the school, hospital, company or office you serve at after camp.' },
  { q: 'Who is the LGI?', a: 'The Local Government Inspector: the NYSC official in your LGA who handles clearance, CDS and PPA issues.' },
  { q: 'What happens at POP?', a: 'The Passing Out Parade ends your service year. You collect your certificate of national service. NYSC announces each batch\'s date.' },
];
