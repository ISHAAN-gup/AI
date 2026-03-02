import { getDB, setDB, confirmAction } from './storage.js';

export function renderPlanner(root){
  const db = getDB();
  root.innerHTML = `<div class='card'><h2>Study Planner</h2>
    <div class='row'>
      <div class='col-4'><input id='taskTitle' placeholder='Task title'></div>
      <div class='col-4'><input id='taskDate' type='date'></div>
      <div class='col-4'><select id='taskPriority'><option>Low</option><option>Medium</option><option>High</option></select></div>
      <div class='col-12'><button id='addTask'>Add Task</button></div>
    </div>
    <div id='taskList'></div>
  </div>`;

  const draw = () => {
    const done = db.tasks.filter(t=>t.done).length;
    const pct = db.tasks.length ? Math.round((done/db.tasks.length)*100) : 0;
    root.querySelector('#taskList').innerHTML = `<p>Completion ${pct}%</p><div class='progress'><span style='width:${pct}%'></span></div>` + db.tasks.map(t=>`<div class='list-item'><div><b>${t.title}</b><div>${t.date||'No deadline'} • ${t.priority}</div></div><div class='actions'><button data-done='${t.id}' class='btn-secondary'>${t.done?'Undo':'Done'}</button><button data-del='${t.id}' class='btn-danger'>Delete</button></div></div>`).join('');
    root.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{const t=db.tasks.find(x=>x.id===b.dataset.done); t.done=!t.done; setDB(db); draw();});
    root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(!confirmAction('Delete task?')) return; db.tasks=db.tasks.filter(t=>t.id!==b.dataset.del); setDB(db); draw();});
  };
  root.querySelector('#addTask').onclick = ()=>{
    const title=root.querySelector('#taskTitle').value.trim(); if(!title) return;
    db.tasks.unshift({id:crypto.randomUUID(), title, date:root.querySelector('#taskDate').value, priority:root.querySelector('#taskPriority').value, done:false});
    setDB(db); draw();
  };
  draw();
}
