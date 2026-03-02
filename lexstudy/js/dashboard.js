import { clearCurrentUser, currentUser, getDB, setDB, toast } from './storage.js';
import { renderNotes } from './notes.js';
import { renderCases } from './cases.js';
import { renderPlanner } from './planner.js';
import { renderQuiz } from './quiz.js';

const user = currentUser();
if (!user) location.href = 'login.html';

const sections = ['dashboard','subjects','notes','cases','quiz','planner','bareact','search'];
const nav = document.getElementById('navLinks');
nav.innerHTML = sections.map(s => `<button data-go='${s}'><i class='fa-solid fa-angle-right'></i> ${s[0].toUpperCase()+s.slice(1)}</button>`).join('');

const show = (id) => {
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
  nav.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.go === id));
};
nav.querySelectorAll('button').forEach(b => b.onclick = () => show(b.dataset.go));

const updateStreak = () => {
  const db = getDB(); const today = new Date().toDateString();
  if (db.streak.lastDate !== today) {
    const last = db.streak.lastDate ? new Date(db.streak.lastDate) : null;
    const diff = last ? Math.round((new Date(today)-last)/86400000) : 1;
    db.streak.count = diff === 1 ? db.streak.count + 1 : 1;
    db.streak.lastDate = today; setDB(db);
  }
  return getDB().streak.count;
};

const quotes = [
  'Justice delayed is justice denied.',
  'Law and order are the medicine of the body politic.',
  'The law is reason, free from passion.'
];

function renderDashboard() {
  const db = getDB();
  const done = db.tasks.filter(t=>t.done).length;
  const prog = db.tasks.length ? Math.round(done/db.tasks.length*100) : 0;
  const quote = quotes[db.quoteIdx % quotes.length];
  document.getElementById('dashboard').innerHTML = `
    <div class='grid cards'>
      <div class='card'><h3>Welcome, ${user.name}</h3><p>Stay consistent and win your next legal exam.</p></div>
      <div class='card'><h3>Study Progress</h3><div class='progress'><span style='width:${prog}%'></span></div><p>${prog}% tasks done</p></div>
      <div class='card'><h3>Streak 🔥</h3><p>${updateStreak()} day(s)</p></div>
      <div class='card'><h3>Upcoming Tasks</h3><p>${db.tasks.filter(t=>!t.done).slice(0,3).map(t=>t.title).join(', ')||'No pending tasks'}</p></div>
      <div class='card col-12'><h3>Legal Quote</h3><p>${quote}</p><button id='newQuote' class='btn-secondary'>New Quote</button></div>
    </div>`;
  document.getElementById('newQuote').onclick = ()=>{ const d=getDB(); d.quoteIdx++; setDB(d); renderDashboard(); };
}

function renderSubjects() {
  const root = document.getElementById('subjects');
  const db = getDB();
  root.innerHTML = `<div class='card'><h2>Subjects Manager</h2>
  <div class='row'><div class='col-4'><input id='subName' placeholder='Subject name'></div><div class='col-4'><input id='subColor' type='color' value='#38bdf8'></div><div class='col-4'><input id='subProg' type='number' min='0' max='100' placeholder='Progress %'></div><div class='col-12'><button id='addSub'>Add Subject</button></div></div>
  <div id='subList'></div></div>`;
  const draw = () => {
    root.querySelector('#subList').innerHTML = db.subjects.map(s => `<div class='list-item'><div><b>${s.name}</b> <span class='tag' style='background:${s.color}'>${s.color}</span><div class='progress'><span style='width:${s.progress||0}%'></span></div></div><div class='actions'><button data-edit='${s.id}' class='btn-secondary'>Edit</button><button data-del='${s.id}' class='btn-danger'>Delete</button></div></div>`).join('');
    root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ db.subjects=db.subjects.filter(s=>s.id!==b.dataset.del); setDB(db); draw(); });
    root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{ const s=db.subjects.find(x=>x.id===b.dataset.edit); root.querySelector('#subName').value=s.name; root.querySelector('#subColor').value=s.color; root.querySelector('#subProg').value=s.progress; root.querySelector('#addSub').dataset.id=s.id;});
  };
  root.querySelector('#addSub').onclick = ()=>{
    const id=root.querySelector('#addSub').dataset.id;
    const s={id:id||crypto.randomUUID(), name:root.querySelector('#subName').value.trim(), color:root.querySelector('#subColor').value, progress:+root.querySelector('#subProg').value||0};
    if(!s.name) return toast('Subject name required.');
    db.subjects=db.subjects.filter(x=>x.id!==s.id); db.subjects.unshift(s); setDB(db); draw();
  };
  draw();
}

function renderBareAct(){
  const root=document.getElementById('bareact');
  const db=getDB();
  root.innerHTML = `<div class='card'><h2>Bare Act Reader (IPC Demo)</h2>${db.bareActs.map(a=>`<details><summary>${a.bookmarked?'★':''} ${a.title}</summary><p style='background:${a.highlight?'#fef08a55':'transparent'}'>${a.text}</p><div class='actions'><button data-b='${a.id}' class='btn-secondary'>Bookmark</button><button data-h='${a.id}' class='btn-secondary'>Highlight</button></div></details>`).join('')}</div>`;
  root.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const d=getDB();const x=d.bareActs.find(i=>i.id===b.dataset.b);x.bookmarked=!x.bookmarked;setDB(d);renderBareAct();});
  root.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const d=getDB();const x=d.bareActs.find(i=>i.id===b.dataset.h);x.highlight=!x.highlight;setDB(d);renderBareAct();});
}

function renderGlobalSearch(){
  const q = document.getElementById('globalSearch').value.toLowerCase();
  const db = getDB();
  const res = [
    ...db.subjects.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Subject: ${x.name}`),
    ...db.notes.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Note: ${x.title}`),
    ...db.cases.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Case: ${x.caseName}`),
    ...db.tasks.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Task: ${x.title}`)
  ];
  document.getElementById('search').innerHTML = `<div class='card'><h2>Global Search Results</h2>${res.map(r=>`<div>${r}</div>`).join('') || '<p>No matches.</p>'}</div>`;
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
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lexstudy-backup.json'; a.click();
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
