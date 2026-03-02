import { getDB, setDB, toast, confirmAction } from './storage.js';

export function renderNotes(root) {
  const db = getDB();
  root.innerHTML = `
  <div class='card'>
    <h2>Notes</h2>
    <div class='row'>
      <div class='col-4'><input id='noteTitle' placeholder='Note title'></div>
      <div class='col-4'><select id='noteSubject'><option value=''>Subject</option>${db.subjects.map(s=>`<option>${s.name}</option>`).join('')}</select></div>
      <div class='col-4'><input id='noteSearch' placeholder='Search notes'></div>
      <div class='col-12'>
        <div class='editor-toolbar'>
          <button data-cmd='bold' type='button'><b>B</b></button>
          <button data-cmd='insertUnorderedList' type='button'>• List</button>
          <button data-cmd='formatBlock' data-val='h3' type='button'>H3</button>
        </div>
        <div id='noteBody' class='editor' contenteditable='true'></div>
      </div>
      <div class='col-12 actions'>
        <button id='saveNote'>Save Note</button>
        <button id='exportPdf' class='btn-secondary'>Export as PDF (Simulated)</button>
      </div>
    </div>
    <div id='noteList'></div>
  </div>`;

  const noteBody = root.querySelector('#noteBody');
  const draftKey = 'lexstudy_draft';
  noteBody.innerHTML = localStorage.getItem(draftKey) || '';
  noteBody.addEventListener('input', () => localStorage.setItem(draftKey, noteBody.innerHTML));

  root.querySelectorAll('[data-cmd]').forEach(btn => btn.onclick = () => document.execCommand(btn.dataset.cmd, false, btn.dataset.val || null));

  const draw = () => {
    const q = root.querySelector('#noteSearch').value.toLowerCase();
    const s = root.querySelector('#noteSubject').value;
    const list = db.notes.filter(n => (!q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) && (!s || n.subject === s));
    root.querySelector('#noteList').innerHTML = list.map(n => `<div class='list-item'><div><b>${n.title}</b> <span class='tag'>${n.subject||'General'}</span><div>${n.body}</div><small>${new Date(n.ts).toLocaleString()}</small></div><div class='actions'><button data-edit='${n.id}' class='btn-secondary'>Edit</button><button data-del='${n.id}' class='btn-danger'>Delete</button></div></div>`).join('') || '<p>No notes found.</p>';
    root.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      if (!confirmAction('Delete note?')) return;
      db.notes = db.notes.filter(n => n.id !== b.dataset.del); setDB(db); draw();
    });
    root.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
      const n = db.notes.find(x => x.id === b.dataset.edit);
      root.querySelector('#noteTitle').value = n.title; root.querySelector('#noteSubject').value = n.subject; noteBody.innerHTML = n.body; root.querySelector('#saveNote').dataset.id = n.id;
    });
  };

  root.querySelector('#saveNote').onclick = () => {
    const id = root.querySelector('#saveNote').dataset.id;
    const note = { id: id || crypto.randomUUID(), title: root.querySelector('#noteTitle').value.trim(), subject: root.querySelector('#noteSubject').value, body: noteBody.innerHTML.trim(), ts: Date.now() };
    if (!note.title || !note.body) return toast('Title and body required.');
    db.notes = db.notes.filter(n => n.id !== note.id); db.notes.unshift(note); setDB(db);
    root.querySelector('#noteTitle').value = ''; noteBody.innerHTML = ''; delete root.querySelector('#saveNote').dataset.id; localStorage.removeItem(draftKey); toast('Note saved.'); draw();
  };

  root.querySelector('#exportPdf').onclick = () => toast('PDF exported (simulation).');
  root.querySelector('#noteSearch').oninput = draw; root.querySelector('#noteSubject').onchange = draw;
  draw();
}
