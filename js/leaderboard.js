const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwskA_4HLugLCfdbpQYcU7rvm_f-g2LSoxT-xWHuXuOwLNoZJt51KcQEoA3uE3Voj6a/exec';

// ── Timer ────────────────────────────────────────────────────────
let timerInterval=null, timerSeconds=0;

function startTimer() {
  stopTimer();
  timerSeconds=0;
  document.getElementById('timer-display').textContent='0:00';
  timerInterval=setInterval(()=>{
    timerSeconds++;
    const m=Math.floor(timerSeconds/60), s=timerSeconds%60;
    document.getElementById('timer-display').textContent=`${m}:${String(s).padStart(2,'0')}`;
  },1000);
}
function stopTimer() {
  if(timerInterval){ clearInterval(timerInterval); timerInterval=null; }
}
function getTimeString() {
  const m=Math.floor(timerSeconds/60), s=timerSeconds%60;
  return `${m}m ${String(s).padStart(2,'0')}s`;
}

// ── Result Audio ─────────────────────────────────────────────────
let resultAudio=null;
function stopResultAudio() {
  if(resultAudio){ resultAudio.pause(); resultAudio.currentTime=0; resultAudio=null; }
}

// ── Show Results + Auto Submit ───────────────────────────────────
function showResults() {
  stopTimer();
  const pct=answeredCount===0?0:Math.round(correctCount/answeredCount*100);
  const tiers=[
    [100,'🏆','Perfect score! True Pokémon Master!'],
    [80, '🌟','Excellent! Almost a Pokémon Master!'],
    [60, '😄','Good job, Trainer! Keep it up!'],
    [40, '😅','Not bad, but keep training!'],
    [0,  '😢','Time to revisit your Pokédex!']
  ];
  const [,emoji,msg]=tiers.find(([t])=>pct>=t);
  document.getElementById('result-emoji').textContent      =emoji;
  document.getElementById('result-player-name').textContent=playerName;
  document.getElementById('result-pct').textContent        =pct+'%';
  document.getElementById('result-score-sub').textContent  =`${correctCount} / ${answeredCount} correct`;
  document.getElementById('result-time').textContent       =`⏱ ${getTimeString()}`;
  document.getElementById('result-msg').textContent        =msg;
  document.getElementById('lb-submit-status').textContent  ='Saving score…';
  showScreen('result-screen');
  setTimeout(()=>{ celebrationConfetti(pct); if(pct>=80) playFanfare(); },300);
  if(soundOn){
    stopResultAudio();
    const soundFile=pct===100?'champion-sound':pct>=50?'win-sound':'lose-sound';
    resultAudio=new Audio(`sounds/${soundFile}.mp3`);
    resultAudio.play().catch(()=>{});
  }
  submitScore(pct);
}

async function submitScore(pct) {
  const statusEl=document.getElementById('lb-submit-status');
  if(!APPS_SCRIPT_URL||APPS_SCRIPT_URL==='YOUR_APPS_SCRIPT_URL_HERE'){
    statusEl.textContent=''; return;
  }
  const quizNames={whos:"Who's That Pokémon?",identify:'Identify the Pokémon',evo:'Spot the Evolution'};
  const payload={
    quiz:       quizNames[quizType],
    name:       playerName,
    score:      `${correctCount}/${answeredCount}`,
    accuracy:   pct+'%',
    time:       getTimeString(),
    difficulty: difficulty.charAt(0).toUpperCase()+difficulty.slice(1),
    date: (()=>{
      const now=new Date();
      const ist=new Date(now.getTime()+(5.5*60*60*1000));
      const dd=String(ist.getUTCDate()).padStart(2,'0');
      const mm=String(ist.getUTCMonth()+1).padStart(2,'0');
      const yyyy=ist.getUTCFullYear();
      return `${dd}/${mm}/${yyyy}`;
    })()
  };
  try {
    await fetch(APPS_SCRIPT_URL, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    statusEl.textContent='✅ Score saved!';
  } catch(e) {
    statusEl.textContent='⚠️ Could not save score.';
  }
  setTimeout(()=>{ statusEl.textContent=''; },3000);
}

// ── Leaderboard Display ──────────────────────────────────────────
let lbCurrentTab='whos', lbCurrentFilter='all', lbAllData=[];

function showLeaderboard() {
  playClick();
  lbCurrentTab=quizType;
  lbCurrentFilter=difficulty;
  document.querySelector('.lb-tabs').style.display='none';
  document.querySelector('.lb-filters').style.display='none';
  showScreen('leaderboard-screen');
  fetchLeaderboard();
}
function closeLeaderboard() {
  playClick();
  document.querySelector('.lb-tabs').style.display='';
  document.querySelector('.lb-filters').style.display='';
  showScreen('result-screen');
}
function switchLbTab(tab) {
  playClick();
  lbCurrentTab=tab;
  document.querySelectorAll('.lb-tab').forEach(t=>t.classList.remove('active'));
  const tabMap={whos:0,identify:1,evo:2};
  document.querySelectorAll('.lb-tab')[tabMap[tab]].classList.add('active');
  renderLeaderboardTable();
}
function switchLbFilter(filter) {
  playClick();
  lbCurrentFilter=filter;
  document.querySelectorAll('.lb-filter').forEach(f=>f.classList.remove('active'));
  const filterMap={all:0,easy:1,hard:2};
  document.querySelectorAll('.lb-filter')[filterMap[filter]].classList.add('active');
  renderLeaderboardTable();
}

async function fetchLeaderboard() {
  const wrap=document.getElementById('lb-table-wrap');
  wrap.innerHTML='<div class="lb-loading">Loading scores…</div>';
  if(!APPS_SCRIPT_URL||APPS_SCRIPT_URL==='YOUR_APPS_SCRIPT_URL_HERE'){
    wrap.innerHTML='<div class="lb-empty">Leaderboard not configured yet.<br/>Add your Apps Script URL to leaderboard.js</div>';
    return;
  }
  try {
    const res=await fetch(`${APPS_SCRIPT_URL}?action=get`);
    lbAllData=await res.json();
    renderLeaderboardTable();
  } catch(e) {
    wrap.innerHTML='<div class="lb-empty">⚠️ Could not load scores.<br/>Check your connection.</div>';
  }
}

function renderLeaderboardTable() {
  const wrap=document.getElementById('lb-table-wrap');
  const quizNames={whos:"Who's That Pokémon?",identify:'Identify the Pokémon',evo:'Spot the Evolution'};
  let data=lbAllData.filter(r=>r.quiz===quizNames[lbCurrentTab]);
  if(lbCurrentFilter!=='all'){
    data=data.filter(r=>r.difficulty&&r.difficulty.toLowerCase()===lbCurrentFilter);
  }
  data.sort((a,b)=>{
    const pa=parseInt(a.accuracy)||0, pb=parseInt(b.accuracy)||0;
    if(pb!==pa) return pb-pa;
    return timeToSeconds(a.time)-timeToSeconds(b.time);
  });
  data=data.slice(0,50);
  if(data.length===0){
    wrap.innerHTML='<div class="lb-empty">No scores yet for this quiz.<br/>Be the first! 🏆</div>';
    return;
  }
  const medals=['🥇','🥈','🥉'];
  const rows=data.map((r,i)=>{
    const isYou=r.name===playerName;
    const rankClass=i<3?`lb-rank lb-rank-${i+1}`:'lb-rank';
    const rank=i<3?medals[i]:`#${i+1}`;
    return `<tr class="${isYou?'lb-you':''}">
      <td><span class="${rankClass}">${rank}</span></td>
      <td>${escHtml(r.name)}${isYou?' 👈':''}</td>
      <td>${escHtml(r.score)}</td>
      <td>${escHtml(r.accuracy)}</td>
      <td>${escHtml(r.time)}</td>
      <td>${escHtml(r.difficulty||'—')}</td>
      <td>${escHtml(r.date||'—')}</td>
    </tr>`;
  }).join('');
  wrap.innerHTML=`
    <table class="lb-table">
      <thead>
        <tr>
          <th>RANK</th><th>NAME</th><th>SCORE</th>
          <th>ACCURACY</th><th>TIME</th><th>DIFF</th><th>DATE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function timeToSeconds(timeStr) {
  if(!timeStr) return 99999;
  const m=timeStr.match(/(\d+)m\s*(\d+)s/);
  if(m) return parseInt(m[1])*60+parseInt(m[2]);
  return 99999;
}
function escHtml(str) {
  if(!str) return '—';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}