const KEY = 'lexstudy_db';

const seed = {
  users: [],
  subjects: [
    { id: crypto.randomUUID(), name: 'Constitutional Law', color: '#38bdf8', progress: 35 },
    { id: crypto.randomUUID(), name: 'Contract Law', color: '#22c55e', progress: 55 },
    { id: crypto.randomUUID(), name: 'Criminal Law', color: '#f59e0b', progress: 25 }
  ],
  notes: [],
  cases: [
    { id: crypto.randomUUID(), subject: 'Constitutional Law', caseName: 'Kesavananda Bharati v. State of Kerala', court: 'Supreme Court', year: 1973, principle: 'Basic Structure Doctrine', summary: 'Parliament cannot alter basic structure.', tags: 'constitution,basic structure', bookmarked: true }
  ],
  tasks: [],
  quizHistory: [],
  bareActs: [
    { id: 'ipc-1', title: 'IPC Section 1', text: 'This Act shall be called the Indian Penal Code...', bookmarked: false, highlight: false },
    { id: 'ipc-2', title: 'IPC Section 2', text: 'Every person shall be liable to punishment under this Code...', bookmarked: false, highlight: false }
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
