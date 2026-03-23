const KEY = 'lexstudy_db';

const seed = {
  users: [],
  subjects: [
    { id: crypto.randomUUID(), name: 'English Language', color: '#38bdf8', progress: 28 },
    { id: crypto.randomUUID(), name: 'Current Affairs & GK', color: '#f59e0b', progress: 18 },
    { id: crypto.randomUUID(), name: 'Legal Reasoning', color: '#22c55e', progress: 42 },
    { id: crypto.randomUUID(), name: 'Logical Reasoning', color: '#a855f7', progress: 34 },
    { id: crypto.randomUUID(), name: 'Quantitative Techniques', color: '#ef4444', progress: 16 }
  ],
  notes: [
    { id: crypto.randomUUID(), title: 'Reading routine', subject: 'English Language', body: '<p>Read one editorial, note tone, central idea, and 5 new words daily.</p>', ts: Date.now() - 86400000 },
    { id: crypto.randomUUID(), title: 'Legal principle shortcut', subject: 'Legal Reasoning', body: '<p>In principle-fact questions, first lock the principle, then test each fact strictly.</p>', ts: Date.now() - 3600000 }
  ],
  cases: [
    { id: crypto.randomUUID(), subject: 'Legal Reasoning', caseName: 'Minors and Contracts', court: 'Practice Set', year: 2026, principle: 'A minor cannot enter into a legally enforceable contract.', summary: 'If X is 17 and signs a paid subscription agreement, the enforceability issue turns on minority.', tags: 'legal reasoning,contracts,principle-fact', bookmarked: true },
    { id: crypto.randomUUID(), subject: 'Current Affairs & GK', caseName: 'Parliament Budget Session', court: 'GK Capsule', year: 2026, principle: 'Track institutions, constitutional offices, and policy impacts.', summary: 'Revise who presented what, major reforms, and likely static-GK links.', tags: 'gk,polity,revision', bookmarked: false }
  ],
  tasks: [
    { id: crypto.randomUUID(), title: 'Solve 2 legal reasoning passages', date: '', priority: 'High', done: false },
    { id: crypto.randomUUID(), title: 'Revise 20 current affairs one-liners', date: '', priority: 'Medium', done: false }
  ],
  quizHistory: [],
  bareActs: [
    { id: 'gk-1', title: 'Weekly GK Capsule', text: 'Track appointments, awards, major Supreme Court observations, important bills, and international summits in one weekly note.', bookmarked: true, highlight: false },
    { id: 'gk-2', title: 'QT Revision Hint', text: 'For CLAT QT, focus on percentages, ratios, averages, and data interpretation from short passages rather than lengthy calculations.', bookmarked: false, highlight: false },
    { id: 'gk-3', title: 'English Accuracy Rule', text: 'While practicing reading comprehension, learn to eliminate extreme answer choices before choosing the closest inference.', bookmarked: false, highlight: true }
  ],
  streak: { lastDate: null, count: 0 },
  quoteIdx: 0
};

export const getDB = () => {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  return JSON.parse(raw);
};

export const setDB = (db) => localStorage.setItem(KEY, JSON.stringify(db));
export const withDB = (cb) => { const db = getDB(); cb(db); setDB(db); };

export const currentUser = () => JSON.parse(localStorage.getItem('lexstudy_current_user') || 'null');
export const setCurrentUser = (u) => localStorage.setItem('lexstudy_current_user', JSON.stringify(u));
export const clearCurrentUser = () => localStorage.removeItem('lexstudy_current_user');

export const toast = (msg) => {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2800);
};

export const confirmAction = (msg) => window.confirm(msg);
