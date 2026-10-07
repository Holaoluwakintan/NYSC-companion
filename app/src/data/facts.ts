// Every fact here carries its source. "verified" = official NYSC statement or 2+ independent reputable outlets agree.
export interface Src { label: string; url: string }
export interface Fact { text: string; sources: Src[]; verified: boolean; checked: string }

export const CHECKED = '2026-10-07';

export const S = {
  c2Punch: { label: 'Punch: NYSC sets Nov 4 for 2026 Batch C Stream II orientation', url: 'https://punchng.com/nysc-sets-nov-4-for-2026-batch-c-stream-ii-orientation/' },
  c2Daily: { label: 'Daily Post, Oct 2, 2026 (NYSC statement by Caroline Embu)', url: 'https://dailypost.ng/2026/10/02/nysc-announces-date-for-2026-batch-c-stream-ii-orientation-camp/' },
  c2Fb: { label: 'Official NYSC Facebook page', url: 'https://www.facebook.com/officialnyscng/posts/2026-batch-c-stream-ii-orientation-commences-november-4the-management-of-nationa/1434109108907117/' },
  c1Lead: { label: 'Leadership: Batch C Stream I commences Sept 30', url: 'https://leadership.ng/2026-batch-c-stream1-orientation-course-commences-september-30/' },
  b2Legit: { label: 'Legit.ng: 2026 Batch B Stream II, Aug 5–25', url: 'https://www.legit.ng/education/1720417-nysc-announces-date-2026-batch-b-stream-ii-orientation-commence-36-states/' },
  b1X: { label: 'Official NYSC on X: Batch B Stream I commences June 10', url: 'https://x.com/officialnyscng/status/2057401533738656152' },
  a2Pulse: { label: 'Pulse: Batch A Stream II camp from April 22, 2026', url: 'https://www.pulse.ng/story/nysc-2026-batch-a-stream-ii-call-up-letters-orientation-2026042015430390343' },
  a2Fb: { label: 'Official NYSC Facebook page (Batch A Stream II)', url: 'https://www.facebook.com/officialnyscng/posts/commencement-of-2026-batch-a-stream-ii-orientation-coursethe-management-of-natio/1281303477521015/' },
  a1Punch: { label: 'Punch: Batch A Stream I commences Jan 21, 2026', url: 'https://punchng.com/nysc-sets-date-for-2026-batch-a-stream-i-orientation-course/' },
  allowPunch: { label: 'Punch, Mar 26, 2025: FG begins payment of N77,000 allowance', url: 'https://punchng.com/fg-begins-payment-of-n77000-new-monthly-allowance-to-nysc-members/' },
  allowBbc: { label: 'BBC Pidgin: allowance raised from ₦33,000 to ₦77,000', url: 'https://www.bbc.com/pidgin/articles/cvglvv9v8v0o' },
  mobtable: { label: 'NYSC mobilisation timetable (nysc.gov.ng)', url: 'https://www.nysc.gov.ng/mobtable.html' },
  saedGov: { label: 'NYSC SAED department (nysc.gov.ng)', url: 'https://www.nysc.gov.ng/saed.html' },
  saedPortal: { label: 'NYSC SAED portal (skill areas)', url: 'https://saed.nysc.org.ng/' },
  portal: { label: 'NYSC portal', url: 'https://portal.nysc.org.ng/' },
};

// The next camp. Times are West Africa Time (UTC+1).
export const NEXT_CAMP = {
  id: 'C2-2026',
  label: '2026 Batch C Stream II',
  start: '2026-11-04', // reception & registration opens
  swearIn: '2026-11-06',
  registrationCloses: '2026-11-06', // midnight, per the NYSC statement
  close: '2026-11-24',
  sources: [S.c2Daily, S.c2Punch, S.c2Fb],
  verified: true,
};

export const ALLOWANCE: Fact & { amount: number } = {
  amount: 77000,
  text: 'The federal "allawee" is ₦77,000 a month, the same in every state. It went up from ₦33,000 in line with the National Minimum Wage (Amendment) Act 2024, and payment of ₦77,000 began in March 2025. 2026 reports still show ₦77,000.',
  sources: [S.allowPunch, S.allowBbc],
  verified: true,
  checked: CHECKED,
};

export interface Batch { id: string; label: string; start: string; end?: string; sources: Src[]; verified: boolean; note?: string }
// 2026 orientation courses (start = reception day). End dates only where a source states them.
export const BATCHES_2026: Batch[] = [
  { id: 'A1-2026', label: 'Batch A Stream I', start: '2026-01-21', sources: [S.a1Punch], verified: true },
  { id: 'A2-2026', label: 'Batch A Stream II', start: '2026-04-22', sources: [S.a2Pulse, S.a2Fb], verified: true },
  { id: 'B1-2026', label: 'Batch B Stream I', start: '2026-06-10', sources: [S.b1X], verified: true },
  { id: 'B2-2026', label: 'Batch B Stream II', start: '2026-08-05', end: '2026-08-25', sources: [S.b2Legit], verified: true },
  { id: 'C1-2026', label: 'Batch C Stream I', start: '2026-09-30', end: '2026-10-20', sources: [S.c1Lead], verified: true },
  { id: 'C2-2026', label: 'Batch C Stream II', start: '2026-11-04', end: '2026-11-24', sources: [S.c2Daily, S.c2Punch, S.c2Fb], verified: true, note: 'Registration Nov 4 to midnight Nov 6; swearing-in Nov 6; closing ceremony Nov 24.' },
];

export const DISCLAIMER_AI = 'Corper Guide is an AI. It can be wrong. Always confirm official matters (postings, relocation, allowance, dates) with the NYSC, your camp officials or your LGI.';
