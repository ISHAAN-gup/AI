import { getDB, setDB, confirmAction, toast } from './storage.js';

export function renderCases(root) {
  const db = getDB();
  root.innerHTML = `<div class='card'><div class='section-title'><div><h2>Passage & GK Bank</h2><p class='muted'>Store legal reasoning principles, current affairs capsules, and tricky fact patterns.</p></div></div>
  <div class='row'>
    <div class='col-4'><input id='caseName' placeholder='Passage title / topic'></div>
    <div class='col-4'><input id='court' placeholder='Source / section'></div>
    <div class='col-4'><input id='year' type='number' placeholder='Year'></div>
    <div class='col-4'><input id='principle' placeholder='Core rule / learning'></div>
    <div class='col-8'><textarea id='summary' placeholder='Write the summary, facts, or revision note'></textarea></div>
    <div class='col-4'><input id='tags' placeholder='tags,comma,separated'></div>
    <div class='col-4'><select id='caseSubject'><option value=''>Track</option>${db.subjects.map(s=>`<option>${s.name}</option>`).join('')}</select></div>
    <div class='col-4'><input id='caseSearch' placeholder='Search bank'></div>
    <div class='col-4'><button id='saveCase'>Save Entry</button></div>
  </div><div id='caseList'></div></div>`;

  const draw = () => {
    const q = root.querySelector('#caseSearch').value.toLowerCase();
    root.querySelector('#caseList').innerHTML = db.cases
      .filter(c => JSON.stringify(c).toLowerCase().includes(q))
      .map(c => `<div class='list-item'><div><b>${c.caseName}</b> <span class='tag'>${c.subject||'General'}</span> <span class='tag'>${c.court} ${c.year}</span><p><strong>Key takeaway:</strong> ${c.principle}</p><small>${c.summary}</small><div class='pill-row' style='margin-top:.6rem;'>${(c.tags || '').split(',').filter(Boolean).map(tag => `<span class='pill'>#${tag.trim()}</span>`).join('')}</div></div><div class='actions'><button data-book='${c.id}' class='btn-secondary'>${c.bookmarked?'★ Saved':'☆ Save'}</button><button data-edit='${c.id}' class='btn-secondary'>Edit</button><button data-del='${c.id}' class='btn-danger'>Delete</button></div></div>`)
      .join('') || '<p class="muted">No entries found yet.</p>';
    root.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{ const item=db.cases.find(c=>c.id===b.dataset.book); item.bookmarked=!item.bookmarked; setDB(db); draw();});
    root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{ if(!confirmAction('Delete this entry?')) return; db.cases=db.cases.filter(c=>c.id!==b.dataset.del); setDB(db); draw();});
    root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{ const c=db.cases.find(x=>x.id===b.dataset.edit); ['caseName','court','year','principle','summary','tags','caseSubject'].forEach(id=>root.querySelector('#'+id).value=(id==='caseSubject'?c.subject:c[id])||''); root.querySelector('#saveCase').dataset.id=c.id;});
  };

  root.querySelector('#saveCase').onclick = () => {
    const id = root.querySelector('#saveCase').dataset.id;
    const existing = db.cases.find(c => c.id === id);
    const item = {
      id:id||crypto.randomUUID(),
      caseName:root.querySelector('#caseName').value.trim(),
      court:root.querySelector('#court').value.trim(),
      year:+root.querySelector('#year').value||'',
      principle:root.querySelector('#principle').value.trim(),
      summary:root.querySelector('#summary').value.trim(),
      tags:root.querySelector('#tags').value.trim(),
      subject:root.querySelector('#caseSubject').value,
      bookmarked:existing?.bookmarked || false
    };
    if (!item.caseName || !item.principle) return toast('Title and key takeaway are required.');
    db.cases = db.cases.filter(c=>c.id!==item.id);
    db.cases.unshift(item);
    setDB(db);
    toast('Entry saved.');
    draw();
  };
  root.querySelector('#caseSearch').oninput = draw;
  draw();
}
