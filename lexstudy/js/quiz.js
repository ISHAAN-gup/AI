import { getDB, setDB, toast } from './storage.js';

const Q = [
  { q: 'Which article guarantees equality before law?', options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'], a: 0 },
  { q: 'IPC stands for?', options: ['Indian Penal Code', 'International Procedure Code', 'Indian Public Charter', 'Internal Penal Charter'], a: 0 },
  { q: 'Doctrine of basic structure comes from?', options: ['Golaknath', 'Kesavananda Bharati', 'Maneka Gandhi', 'Minerva Mills'], a: 1 }
];

export function renderQuiz(root){
  const db=getDB(); let idx=0, score=0, left=30; const questions=[...Q].sort(()=>Math.random()-.5);
  root.innerHTML = `<div class='card'><h2>Quiz & Practice</h2><p id='timer'></p><div id='qBox'></div><div id='history'></div></div>`;
  const timerEl = root.querySelector('#timer');
  const qBox = root.querySelector('#qBox');
  const tick = setInterval(()=>{ left--; timerEl.textContent = `Time left: ${left}s`; if(left<=0){finish();}},1000);

  const draw=()=>{
    if(idx>=questions.length) return finish();
    const q=questions[idx];
    qBox.innerHTML = `<h3>${idx+1}. ${q.q}</h3>${q.options.map((o,i)=>`<button data-i='${i}' class='btn-secondary' style='display:block;margin:.4rem 0;'>${o}</button>`).join('')}`;
    qBox.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ if(+b.dataset.i===q.a) score++; idx++; draw(); });
  };

  const finish=()=>{
    clearInterval(tick);
    qBox.innerHTML = `<h3>Score: ${score}/${questions.length}</h3><p>${score>=2?'Great job!':'Keep practicing.'}</p>`;
    db.quizHistory.unshift({ts:Date.now(), score, total:questions.length}); setDB(db);
    root.querySelector('#history').innerHTML = '<h4>History</h4>' + db.quizHistory.slice(0,8).map(h=>`<div>${new Date(h.ts).toLocaleString()} - ${h.score}/${h.total}</div>`).join('');
    toast('Quiz completed.');
  };
  draw();
}
