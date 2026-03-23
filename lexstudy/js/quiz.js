import { getDB, setDB, toast } from './storage.js';

const Q = [
  { q: 'In CLAT legal reasoning, what should you do first?', options: ['Memorize outside law', 'Read the principle carefully', 'Guess based on fairness', 'Skip the passage'], a: 1 },
  { q: 'Which area is most closely tested through short data-based passages in CLAT?', options: ['Quantitative Techniques', 'Essay Writing', 'Drafting', 'Mooting'], a: 0 },
  { q: 'A strong current affairs revision strategy is to focus on:', options: ['Only headlines', 'Appointments, schemes, judgments, and context', 'Random facts without notes', 'Only sports news'], a: 1 },
  { q: 'In reading comprehension, the best answer is usually the one that:', options: ['Sounds extreme', 'Matches the author tone and passage evidence', 'Uses difficult words', 'Adds outside knowledge'], a: 1 },
  { q: 'For logical reasoning, a high-value habit is to:', options: ['Ignore assumptions', 'Track conclusion, premise, and inference gaps', 'Solve without reading options', 'Learn formulas only'], a: 1 }
];

export function renderQuiz(root){
  const db=getDB(); let idx=0, score=0, left=45; const questions=[...Q].sort(()=>Math.random()-.5);
  root.innerHTML = `<div class='card'><div class='section-title'><div><h2>Sectional Quiz</h2><p class='muted'>Quick CLAT-style mixed practice for legal reasoning, English, GK, logic, and QT.</p></div></div><p id='timer'></p><div id='qBox'></div><div id='history'></div></div>`;
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
    qBox.innerHTML = `<h3>Score: ${score}/${questions.length}</h3><p>${score>=4?'Excellent pace—keep moving into mocks.':score>=2?'Good start—review weak areas and retry.':'Build fundamentals first, then attempt again.'}</p>`;
    db.quizHistory.unshift({ts:Date.now(), score, total:questions.length}); setDB(db);
    root.querySelector('#history').innerHTML = '<h4>Recent attempts</h4>' + db.quizHistory.slice(0,8).map(h=>`<div>${new Date(h.ts).toLocaleString()} - ${h.score}/${h.total}</div>`).join('');
    toast('Quiz completed.');
  };
  draw();
}
