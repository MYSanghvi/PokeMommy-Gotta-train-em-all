const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrQs92eiCFtd2-TJd7iWQH-ZJhaHcLfcmNBf608pqSGLjeZS2YNdxgekOBw5TLt_g/exec';

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

// ── Show Results ─────────────────────────────────────────────────
function showResults() {
  stopTimer();
  const pct = answeredCount===0 ? 0 : Math.round(correctCount/answeredCount*100);
  const tiers=[
    [100,'🏆','Perfect score! True Pokémon Master!'],
    [80, '🌟','Excellent! Almost a Pokémon Master!'],
    [60, '😄','Good job, Trainer! Keep it up!'],
    [40, '😅','Not bad, but keep training!'],
    [0,  '😢','Time to revisit your Pokédex!']
  ];
  const [,emoji,msg]=tiers.find(([t])=>pct>=t);
  document.getElementById('result-emoji').textContent      = emoji;
  document.getElementById('result-player-name').textContent= playerName;
  document.getElementById('result-pct').textContent        = pct+'%';
  document.getElementById('result-score-sub').textContent  = `${correctCount} / ${answeredCount} correct`;
  document.getElementById('result-time').textContent       = `⏱ ${getTimeString()}`;
  document.getElementById('result-msg').textContent        = msg;
  document.getElementById('lb-submit-status').textContent  = 'Saving score…';
  showScreen('result-screen');

  setTimeout(()=>{ celebrationConfetti(pct); if(pct>=80) playFanfare(); }, 300);

  // ── 100% Mew easter egg ───────────────────────────────────────
  if (pct === 100) setTimeout(triggerMewEasterEgg, 800);

  if(soundOn){
    stopResultAudio();
    const soundFile = pct===100?'champion-sound': pct>=50?'win-sound':'lose-sound';
    resultAudio = new Audio(`sounds/${soundFile}.mp3`);
    resultAudio.play().catch(()=>{});
  }

  submitScore(pct);
}

// ── Submit Score ─────────────────────────────────────────────────
async function submitScore(pct) {
const statusEl = document.getElementById('lb-submit-status');
const quizNames={whos:"Who's That Pokémon?",identify:'Identify the Pokémon',evo:'Spot the Evolution'};
const payload={
quiz: quizNames[quizType],
name: playerName,
score: `${correctCount}/${answeredCount}`,
accuracy: pct,
time: getTimeString(),
difficulty: difficulty.charAt(0).toUpperCase()+difficulty.slice(1),
mode: quizMode === 'full' ? 'Full Test' : 'Quick Test',
sessionId: sessionId
};
try {
await fetch(APPS_SCRIPT_URL,{
method:'POST', mode:'no-cors',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
statusEl.textContent='✅ Score saved!';
} catch(e) {
statusEl.textContent='⚠️ Could not save score.';
}
setTimeout(()=>{ statusEl.textContent=''; }, 3000);
}

// ── Leaderboard ──────────────────────────────────────────────────
let lbAllData=[];

function showLeaderboard() {
playClick();

const quizLabels={
whos:"Who's That Pokémon?",
identify:'Identify the Pokémon',
evo:'Spot the Evolution'
};
const diffLabel = difficulty.charAt(0).toUpperCase()+difficulty.slice(1);
const modeLabel = quizMode === 'full' ? 'Full Test' : 'Quick Test';
document.getElementById('lb-title').textContent =
`${quizLabels[quizType]} - ${diffLabel} ${modeLabel}`;

showScreen('leaderboard-screen');
fetchLeaderboard();
}

function closeLeaderboard() {
  playClick();
  showScreen('result-screen');
}

// ── Fetch ─────────────────────────────────────────────────────────
const LB_LOADING_MSGS = [
  "Determining if you're a Pokémon Master…",
  "Almost ready, trainer!",
  "Sending a Pidgey to fetch the leaderboard…",
  "Checking who's the very best… like no one ever was.",
  "Scanning trainers across the region…",
  "The Poké League is verifying the scores…",
  "Snorlax is sitting on the server… asking it to move.",
  "Team Rocket tried to steal the leaderboard… fixing it.",
  "Fetching leaderboard from Professor Oak…",
  "Alakazam is calculating the leaderboard…",
  "Magikarp is trying its best…",
  "MissingNo. corrupted the scores… fixing it.",
  "Checking Bill's PC for the leaderboard…",
  "Looking under the truck near the S.S. Anne…",
  "Gary says he's already #1… again.",
  "Checking if you used the bicycle indoors…"
];

async function fetchLeaderboard() {
  const wrap = document.getElementById('lb-table-wrap');

  // ── Rotating loading messages ─────────────────────────────────
  wrap.innerHTML = '';
  const loadEl = document.createElement('p');
  loadEl.setAttribute('style',
    'padding:40px 20px;text-align:center;font-size:14px;line-height:1.8;' +
    'color:#555;font-family:sans-serif;display:block !important;visibility:visible !important;'
  );

  const shuffled = [...LB_LOADING_MSGS].sort(()=>Math.random()-0.5);
  let msgIndex = 0;

  function showNextMsg() {
    loadEl.textContent = shuffled[msgIndex % shuffled.length];
    msgIndex++;
  }
  showNextMsg();
  wrap.appendChild(loadEl);

  const msgTimer = setInterval(showNextMsg, 5000);

  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 40000); // 40s — enough for all messages

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=get`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    clearInterval(msgTimer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    let json = (await res.text()).trim();
    if (json.startsWith('/*')) json = json.replace(/^\/\*.*?\*\//s,'').trim();

    lbAllData = JSON.parse(json);
    if (!Array.isArray(lbAllData)) throw new Error('Unexpected data format');

    renderLeaderboardTable();

  } catch(e) {
    clearTimeout(timeout);
    clearInterval(msgTimer);
    wrap.innerHTML = '';
    const errEl = document.createElement('p');
    errEl.setAttribute('style',
      'padding:40px 20px;text-align:center;font-size:14px;color:#888;font-family:sans-serif;'
    );
    errEl.innerHTML = e.name==='AbortError'
      ? '⏱ Took too long to load.<br/>Check your connection and try again.'
      : `⚠️ Could not load scores.<br/><small>${e.message}</small>`;
    wrap.appendChild(errEl);
  }
}


// ── Render ────────────────────────────────────────────────────────
function renderLeaderboardTable() {
  const wrap = document.getElementById('lb-table-wrap');
  const quizNames={
    whos:"Who's That Pokémon?",
    identify:'Identify the Pokémon',
    evo:'Spot the Evolution'
  };

// Filter to current quiz + difficulty + mode
const currentMode = quizMode === 'full' ? 'Full Test' : 'Quick Test';
let data = lbAllData.filter(r => {
const rowMode = (r.mode && r.mode.trim() !== '') ? r.mode : 'Quick Test';
return r.quiz === quizNames[quizType] &&
r.difficulty &&
r.difficulty.toLowerCase() === difficulty.toLowerCase() &&
rowMode === currentMode;
});

  // ── Normalise accuracy to 0–100 integer ──────────────────────
  // Handles "85%" (string), 0.85 (decimal float), 85 (integer)
  data = data.map(r => {
  let acc = r.accuracy;
  if (typeof acc === 'string') {
    acc = parseFloat(acc.replace('%',''));
  } else if (typeof acc === 'number' && acc > 0 && acc <= 1) {
    acc = Math.round(acc * 100);
  } else {
    acc = Math.round(Number(acc));
  }
  if (isNaN(acc)) acc = 0;
  return { ...r, _acc: acc };
});

  // Keep only each trainer's best attempt
const bestByName = {};
data.forEach(r => {
const key = r.name.trim().toLowerCase();
const ex = bestByName[key];
if (!ex ||
    r._acc > ex._acc ||
    (r._acc === ex._acc && timeToSeconds(r.time) < timeToSeconds(ex.time))) {
  bestByName[key] = r;
}
});
data = Object.values(bestByName);

// Sort: accuracy desc, then time asc
data.sort((a,b) => {
if (b._acc !== a._acc) return b._acc - a._acc;
return timeToSeconds(a.time) - timeToSeconds(b.time);
});

  data = data.slice(0, 50);

  wrap.innerHTML = '';

  if (data.length === 0) {
    const empty = document.createElement('p');
    empty.setAttribute('style',
      'padding:40px 20px;text-align:center;font-size:14px;color:#888;font-family:sans-serif;'
    );
    empty.innerHTML = 'No scores yet for this quiz.<br/>Be the first! 🏆';
    wrap.appendChild(empty);
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  const rows = data.map((r,i) => {
const isYou = sessionId
  ? (String(r.sessionid || '') === sessionId)
  : (r.name === playerName);
const rank = i < 3 ? medals[i] : `#${i+1}`;
const rankClass = i < 3 ? `lb-rank lb-rank-${i+1}` : 'lb-rank';
const youBadge = isYou ? ' <span style="background:#3D7DCA;color:#fff;font-size:9px;padding:1px 5px;border-radius:99px;font-family:Roboto,sans-serif;vertical-align:middle;">YOU</span>' : '';
    return `<tr class="${isYou ? 'lb-you' : ''}" ${isYou ? 'id="lb-you-row"' : ''}>
      <td><span class="${rankClass}">${rank}</span></td>
      <td>${escHtml(r.name)}${youBadge}</td>
      <td>${escHtml(r.score)}</td>
      <td>${r._acc}%</td>
      <td>${escHtml(r.time)}</td>
      <td>${formatDate(r.date)}</td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="lb-table">
      <thead>
        <tr>
          <th>RANK</th><th>NAME</th><th>SCORE</th>
          <th>ACCURACY</th><th>TIME</th><th>DATE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const youRow = document.getElementById('lb-you-row');
  if (youRow) setTimeout(() => youRow.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
}

// ── Helpers ───────────────────────────────────────────────────────
function timeToSeconds(timeStr) {
  if (!timeStr) return 99999;
  const m = timeStr.match(/(\d+)m\s*(\d+)s/);
  return m ? parseInt(m[1])*60 + parseInt(m[2]) : 99999;
}
function escHtml(str) {
  if (!str) return '—';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(val) {
  if (!val) return '—';
  const s = String(val);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s; // already DD/MM/YYYY
  const d = new Date(s);
  if (!isNaN(d)) {
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return `${String(ist.getUTCDate()).padStart(2,'0')}/${String(ist.getUTCMonth()+1).padStart(2,'0')}/${ist.getUTCFullYear()}`;
  }
  return s;
}