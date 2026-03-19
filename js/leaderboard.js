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

// ── Current score fingerprint (used to highlight only THIS submission) ──
let currentScoreFingerprint = null;

// ── Show Results ─────────────────────────────────────────────────
function showResults() {
  stopTimer();
  const pct = answeredCount===0 ? 0 : Math.round(correctCount/answeredCount*100);
  const tiers=[
    [100,'\u{1F3C6}','Perfect score! True Pokémon Master!'],
    [80, '\u{1F31F}','Excellent! Almost a Pokémon Master!'],
    [60, '\u{1F604}','Good job, Trainer! Keep it up!'],
    [40, '\u{1F605}','Not bad, but keep training!'],
    [0,  '\u{1F622}','Time to revisit your Pokédex!']
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
  const timeStr = getTimeString();
  const dateStr = (()=>{
    const now=new Date(), ist=new Date(now.getTime()+(5.5*60*60*1000));
    return `${String(ist.getUTCDate()).padStart(2,'0')}/${String(ist.getUTCMonth()+1).padStart(2,'0')}/${ist.getUTCFullYear()}`;
  })();

  // ✅ Store fingerprint BEFORE sending so leaderboard can match exactly this row
  currentScoreFingerprint = {
    name:     playerName,
    accuracy: pct,
    time:     timeStr,
    date:     dateStr
  };

  const payload={
    quiz:       quizNames[quizType],
    name:       playerName,
    score:      `${correctCount}/${answeredCount}`,
    accuracy:   pct,
    time:       timeStr,
    difficulty: difficulty.charAt(0).toUpperCase()+difficulty.slice(1),
    date:       dateStr
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
  document.getElementById('lb-title').textContent =
    `🏆 ${quizLabels[quizType]} — ${diffLabel}`;

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
  const timeout = setTimeout(()=>controller.abort(), 40000);

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

  // Filter to current quiz + difficulty only
  let data = lbAllData.filter(r =>
    r.quiz === quizNames[quizType] &&
    r.difficulty &&
    r.difficulty.toLowerCase() === difficulty.toLowerCase()
  );

  // ── Normalise accuracy to 0–100 integer ──────────────────────
  data = data.map(r => {
    let acc = r.accuracy;
    if (typeof acc === 'string') {
      acc = parseFloat(acc.replace('%',''));
    } else if (typeof acc === 'number' && acc <= 1) {
      acc = Math.round(acc * 100);
    } else {
      acc = Math.round(acc);
    }
    return { ...r, _acc: acc };
  });

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

  // ── Track if current submission already exists ─────────
  let foundCurrentScore = false;

  const medals = ['🥇','🥈','🥉'];
  const rows = data.map((r,i) => {
    //  Match by (name + accuracy + time + date), only highlight ONCE
    let isYou = false;
    if (!foundCurrentScore && currentScoreFingerprint) {
      const fp = currentScoreFingerprint;
      const rowAcc = r._acc;
      if (
        r.name === fp.name &&
        rowAcc  === fp.accuracy &&
        r.time  === fp.time &&
        r.date  === fp.date
      ) {
        isYou = true;
        foundCurrentScore = true; // Only the first exact match gets highlighted
      }
    }
    const rank      = i < 3 ? medals[i] : `#${i+1}`;
    const rankClass = i < 3 ? `lb-rank lb-rank-${i+1}` : 'lb-rank';
    return `<tr class="${isYou ? 'lb-you' : ''}">
      <td><span class="${rankClass}">${rank}</span></td>
      <td>${escHtml(r.name)}${isYou ? ' 👈' : ''}</td>
      <td>${escHtml(r.score)}</td>
      <td>${r._acc}%</td>
      <td>${escHtml(r.time)}</td>
      <td>${escHtml(r.date||'—')}</td>
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
