import { clearCurrentUser, currentUser, getDB, setDB, toast } from './storage.js';
import { renderNotes } from './notes.js';
import { renderCases } from './cases.js';
import { renderPlanner } from './planner.js';
import { renderQuiz } from './quiz.js';

const user = currentUser();
if (!user) location.href = 'login.html';

const navItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'subjects', label: 'Syllabus Tracker' },
  { id: 'notes', label: 'Revision Notes' },
  { id: 'cases', label: 'Passage Bank' },
  { id: 'quiz', label: 'Sectional Quiz' },
  { id: 'planner', label: 'Study Planner' },
  { id: 'bareact', label: 'Quick Capsules' },
  { id: 'search', label: 'Search' }
];
const nav = document.getElementById('navLinks');
nav.innerHTML = navItems.map(item => `<button data-go='${item.id}'><i class='fa-solid fa-angle-right'></i> ${item.label}</button>`).join('');

const show = (id) => {
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
  nav.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.go === id));
};
nav.querySelectorAll('button').forEach(b => b.onclick = () => show(b.dataset.go));

const updateStreak = () => {
  const db = getDB();
  const today = new Date().toDateString();
  if (db.streak.lastDate !== today) {
    const last = db.streak.lastDate ? new Date(db.streak.lastDate) : null;
    const diff = last ? Math.round((new Date(today)-last)/86400000) : 1;
    db.streak.count = diff === 1 ? db.streak.count + 1 : 1;
    db.streak.lastDate = today;
    setDB(db);
  }
  return getDB().streak.count;
};

const quotes = [
  'Small daily revision beats last-minute panic.',
  'CLAT rewards consistency more than intensity spikes.',
  'Read deeply, reason clearly, and revise relentlessly.'
];

const getFocusBuckets = (db) => {
  const sorted = [...db.subjects].sort((a, b) => (a.progress || 0) - (b.progress || 0));
  return sorted.slice(0, 3);
};

function renderDashboard() {
  const db = getDB();
  const done = db.tasks.filter(t=>t.done).length;
  const prog = db.tasks.length ? Math.round(done/db.tasks.length*100) : 0;
  const quote = quotes[db.quoteIdx % quotes.length];
  const weakAreas = getFocusBuckets(db);
  const savedEntries = db.cases.filter(item => item.bookmarked).length;
  const notesThisWeek = db.notes.filter(n => Date.now() - n.ts < 7 * 86400000).length;
  document.getElementById('dashboard').innerHTML = `
    <div class='grid'>
      <div class='card hero-card'>
        <h2>Welcome back, ${user.name.split(' ')[0]} 👋</h2>
        <p>Use this dashboard to stay on top of your CLAT 2027 prep with notes, sectional drills, GK capsules, and a realistic planner.</p>
        <div class='hero-meta'>
          <span class='pill'>5 core sections tracked</span>
          <span class='pill'>${db.tasks.length} planned tasks</span>
          <span class='pill'>${db.quizHistory.length} quiz attempts</span>
        </div>
      </div>
      <div class='grid cards'>
        <div class='card'><h3>Task Progress</h3><div class='stat-number'>${prog}%</div><div class='progress'><span style='width:${prog}%'></span></div><p class='muted'>Based on your planner completion.</p></div>
        <div class='card'><h3>Streak 🔥</h3><div class='stat-number'>${updateStreak()}</div><p class='muted'>Study days maintained in a row.</p></div>
        <div class='card'><h3>Saved Entries</h3><div class='stat-number'>${savedEntries}</div><p class='muted'>Bookmarked passages and GK capsules.</p></div>
        <div class='card'><h3>Fresh Notes</h3><div class='stat-number'>${notesThisWeek}</div><p class='muted'>Notes created in the last 7 days.</p></div>
      </div>
      <div class='grid cards'>
        <div class='card'>
          <h3>Priority subjects</h3>
          ${weakAreas.map(item => `<div><strong>${item.name}</strong><div class='progress'><span style='width:${item.progress || 0}%'></span></div><small>${item.progress || 0}% syllabus confidence</small></div>`).join('')}
        </div>
        <div class='card'>
          <h3>Today’s recommended plan</h3>
          <ul>
            <li>1 English RC + vocab revision</li>
            <li>2 legal reasoning passages</li>
            <li>15 minutes of current affairs recall</li>
            <li>1 short logical reasoning drill</li>
          </ul>
        </div>
        <div class='card'>
          <h3>Motivation</h3>
          <p class='callout'>${quote}</p>
          <button id='newQuote' class='btn-secondary'>New Line</button>
        </div>
      </div>
    </div>`;
  document.getElementById('newQuote').onclick = ()=>{ const d=getDB(); d.quoteIdx++; setDB(d); renderDashboard(); };
}

function renderSubjects() {
  const root = document.getElementById('subjects');
  const db = getDB();
  root.innerHTML = `<div class='card'><div class='section-title'><div><h2>Syllabus Tracker</h2><p class='muted'>Track progress across all CLAT sections and update confidence as you revise.</p></div></div>
  <div class='row'><div class='col-4'><input id='subName' placeholder='Section or topic name'></div><div class='col-4'><input id='subColor' type='color' value='#38bdf8'></div><div class='col-4'><input id='subProg' type='number' min='0' max='100' placeholder='Confidence %'></div><div class='col-12'><button id='addSub'>Save Section</button></div></div>
  <div id='subList'></div></div>`;
  const draw = () => {
    root.querySelector('#subList').innerHTML = db.subjects.map(s => `<div class='list-item'><div><b>${s.name}</b> <span class='tag' style='background:${s.color}; color:#fff;'>${s.progress || 0}%</span><div class='progress'><span style='width:${s.progress||0}%'></span></div><small>${s.color}</small></div><div class='actions'><button data-edit='${s.id}' class='btn-secondary'>Edit</button><button data-del='${s.id}' class='btn-danger'>Delete</button></div></div>`).join('');
    root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ db.subjects=db.subjects.filter(s=>s.id!==b.dataset.del); setDB(db); draw(); });
    root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{ const s=db.subjects.find(x=>x.id===b.dataset.edit); root.querySelector('#subName').value=s.name; root.querySelector('#subColor').value=s.color; root.querySelector('#subProg').value=s.progress; root.querySelector('#addSub').dataset.id=s.id;});
  };
  root.querySelector('#addSub').onclick = ()=>{
    const id=root.querySelector('#addSub').dataset.id;
    const s={id:id||crypto.randomUUID(), name:root.querySelector('#subName').value.trim(), color:root.querySelector('#subColor').value, progress:+root.querySelector('#subProg').value||0};
    if(!s.name) return toast('Section name required.');
    db.subjects=db.subjects.filter(x=>x.id!==s.id); db.subjects.unshift(s); setDB(db); toast('Section saved.'); draw();
  };
  draw();
}

function renderBareAct(){
  const root=document.getElementById('bareact');
  const db=getDB();
  root.innerHTML = `<div class='card'><div class='section-title'><div><h2>Quick Capsules</h2><p class='muted'>Use these compact cards for last-minute revision of GK, QT, and strategy reminders.</p></div></div>${db.bareActs.map(a=>`<details><summary>${a.bookmarked?'★ ':''}${a.title}</summary><p style='background:${a.highlight?'#fef08a55':'transparent'}'>${a.text}</p><div class='actions'><button data-b='${a.id}' class='btn-secondary'>${a.bookmarked ? 'Unsave' : 'Save'}</button><button data-h='${a.id}' class='btn-secondary'>${a.highlight ? 'Unhighlight' : 'Highlight'}</button></div></details>`).join('')}</div>`;
  root.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const d=getDB();const x=d.bareActs.find(i=>i.id===b.dataset.b);x.bookmarked=!x.bookmarked;setDB(d);renderBareAct();});
  root.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const d=getDB();const x=d.bareActs.find(i=>i.id===b.dataset.h);x.highlight=!x.highlight;setDB(d);renderBareAct();});
}

function renderGlobalSearch(){
  const q = document.getElementById('globalSearch').value.toLowerCase();
  const db = getDB();
  const res = [
    ...db.subjects.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Section: ${x.name}`),
    ...db.notes.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Note: ${x.title}`),
    ...db.cases.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Bank Entry: ${x.caseName}`),
    ...db.tasks.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Task: ${x.title}`),
    ...db.bareActs.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Capsule: ${x.title}`)
  ];
  document.getElementById('search').innerHTML = `<div class='card'><h2>Search Results</h2>${q ? (res.map(r=>`<div class='list-item'><div>${r}</div></div>`).join('') || '<p class="muted">No matches.</p>') : '<p class="muted">Start typing in global search to find content instantly.</p>'}</div>`;
}

function applyTheme(){
  const theme = localStorage.getItem('lexstudy_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

document.getElementById('themeToggle').onclick = ()=>{
  const next = (localStorage.getItem('lexstudy_theme') || 'dark') === 'dark' ? 'light' : 'dark';
  localStorage.setItem('lexstudy_theme', next); applyTheme();
};

document.getElementById('logoutBtn').onclick = ()=>{ clearCurrentUser(); location.href='login.html'; };
document.getElementById('globalSearch').oninput = ()=>{ renderGlobalSearch(); show('search'); };

document.getElementById('backupBtn').onclick = ()=>{
  const blob = new Blob([JSON.stringify(getDB(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clat-2027-prep-backup.json'; a.click();
};
document.getElementById('restoreFile').onchange = (e)=>{
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader(); r.onload=()=>{ try{ setDB(JSON.parse(r.result)); toast('Backup restored. Reloading...'); setTimeout(()=>location.reload(),600);}catch{toast('Invalid backup file.');}}; r.readAsText(file);
};

window.addEventListener('keydown', (e)=>{
  if (e.altKey && e.key === '1') show('dashboard');
  if (e.altKey && e.key === '2') show('notes');
  if (e.altKey && e.key === '3') show('quiz');
});

applyTheme();
renderDashboard();
renderSubjects();
renderNotes(document.getElementById('notes'));
renderCases(document.getElementById('cases'));
renderPlanner(document.getElementById('planner'));
renderQuiz(document.getElementById('quiz'));
renderBareAct();
renderGlobalSearch();
