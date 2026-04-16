const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrQs92eiCFtd2-TJd7iWQH-ZJhaHcLfcmNBf608pqSGLjeZS2YNdxgekOBw5TLt_g/exec';
let scoreSubmitted = false;

// ── Timer ────────────────────────────────────────────────────────
let timerInterval = null;
let timerSeconds = 0;
let timerTenths = 0;

function startTimer() {
  stopTimer();
  timerSeconds = 0;
  timerTenths = 0;

  const timerEl = document.getElementById('timer-display');
  if (timerEl) timerEl.textContent = '0:00.0';

  timerInterval = setInterval(() => {
    timerTenths++;
    timerSeconds = Math.floor(timerTenths / 10);

    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    const t = timerTenths % 10;

    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${String(s).padStart(2, '0')}.${t}`;
  }, 100);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getTimeString() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const t = timerTenths % 10;
  return `${m}m ${String(s).padStart(2, '0')}.${t}s`;
}

// ── Submit Score ─────────────────────────────────────────────────
async function submitScore(pct) {
  if (scoreSubmitted) return;

  const statusEl = document.getElementById('lb-submit-status');
  scoreSubmitted = true;

  if (statusEl) {
    statusEl.textContent = 'Saving to the Hall of Fame…';
    statusEl.className = 'lb-submit-status lb-submit-loading';
  }

  const quizNames = {
    whos: "Who's That Pokémon?",
    identify: 'Identify the Pokémon',
    evo: 'Spot the Evolution'
  };

  const payload = {
    quiz: quizNames[quizType],
    name: playerName,
    score: `${correctCount}/${answeredCount}`,
    accuracy: pct,
    time: getTimeString(),
    difficulty: difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown',
    mode: quizMode === 'full' ? 'Full Test' : 'Quick Test',
    sessionId: sessionId
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'Score rejected by server');

    if (statusEl) {
      statusEl.className = 'lb-submit-status';
      statusEl.textContent = '✅ Score saved!';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 10000);
    }
  } catch (e) {
    scoreSubmitted = false;

    if (statusEl) {
      statusEl.className = 'lb-submit-status';
      statusEl.textContent = '❌ Could not save score. Check your connection and try again.';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 10000);
    }

    console.error('submitScore failed:', e);
  }
}

// ── Leaderboard ──────────────────────────────────────────────────
let lbAllData = [];
let _lbMsgTimer = null;

function showLeaderboard() {
  playClick();

  const quizLabels = {
    whos: "Who's That Pokémon?",
    identify: 'Identify the Pokémon',
    evo: 'Spot the Evolution'
  };

  const diffLabel = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown';
  const modeLabel = quizMode === 'full' ? 'Full Test' : 'Quick Test';

  const titleEl = document.getElementById('lb-title');
  if (titleEl) {
    titleEl.textContent = `${quizLabels[quizType]} - ${diffLabel} ${modeLabel}`;
  }

  showScreen('leaderboard-screen');
  fetchLeaderboard();
}

function closeLeaderboard() {
  playClick();
  if (_lbMsgTimer) {
    clearInterval(_lbMsgTimer);
    _lbMsgTimer = null;
  }
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
  if (_lbMsgTimer) { clearInterval(_lbMsgTimer); _lbMsgTimer = null; }
  const wrap = document.getElementById('lb-table-wrap');

  // ── Rotating loading messages ─────────────────────────────────
  wrap.innerHTML = '';
const pokeballWrap = document.createElement('div');
pokeballWrap.className = 'lb-fetch-loading';
pokeballWrap.innerHTML = '<img src="img/pokeball_gray.png" class="pokeball-spinner" alt="Loading" />';
wrap.appendChild(pokeballWrap);
const loadEl = document.createElement('p');
loadEl.setAttribute('style',
'padding:4px 20px 32px;text-align:center;font-size:14px;line-height:1.8;' +
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

  _lbMsgTimer = setInterval(showNextMsg, 5000);

  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 15000); // 15s — enough for all messages

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=get`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    clearInterval(_lbMsgTimer);
	_lbMsgTimer = null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    let json = (await res.text()).trim();
    if (json.startsWith('/*')) json = json.replace(/^\/\*.*?\*\//s,'').trim();

    lbAllData = JSON.parse(json);
    if (!Array.isArray(lbAllData)) throw new Error('Unexpected data format');

    renderLeaderboardTable();

  } catch(e) {
    clearTimeout(timeout);
    clearInterval(_lbMsgTimer);
	_lbMsgTimer = null;
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
  const quizNames = {
    whos: "Who's That Pokémon?",
    identify: 'Identify the Pokémon',
    evo: 'Spot the Evolution'
  };

  // Filter to current quiz + difficulty + mode
  const currentMode = quizMode === 'full' ? 'Full Test' : 'Quick Test';
  let data = lbAllData.filter(r => {
    const rowMode = (r.mode && String(r.mode).trim() !== '')
      ? String(r.mode).trim()
      : 'Quick Test';
    return r.quiz === quizNames[quizType] && r.difficulty && difficulty && String(r.difficulty).toLowerCase() === difficulty.toLowerCase() && rowMode === currentMode;
  });

  // Normalise accuracy to 0–100 integer
  // Handles "85%" (string), 0.85 (decimal float), 85 (integer)
  data = data.map(r => {
    let acc = r.accuracy;
    if (typeof acc === 'string') {
      acc = parseFloat(acc.replace('%', ''));
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
    const key = String(r.name || '').trim().toLowerCase();
    const ex = bestByName[key];
    if (key && (!ex || r._acc > ex._acc || (r._acc === ex._acc && timeToSeconds(r.time) < timeToSeconds(ex.time)))) {
      bestByName[key] = r;
    }
  });
  data = Object.values(bestByName);

  // Sort: accuracy desc, then time asc
  data.sort((a, b) => {
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

  const medals = ['🥇', '🥈', '🥉'];
  const rows = data.map((r, i) => {
    const isMyName   = String(r.name || '').trim().toLowerCase() === String(playerName).trim().toLowerCase();
    const isCurrentSession = String(r.sessionId) === sessionId;
    const isYou      = isMyName;

    const rank      = i < 3 ? medals[i] : `#${i + 1}`;
    const rankClass = i < 3 ? `lb-rank lb-rank-${i + 1}` : 'lb-rank';

    const badgeLabel = isMyName ? (isCurrentSession ? 'YOU' : 'YOUR BEST') : null;
    const youBadge   = badgeLabel
      ? ` <span style="background:${isCurrentSession ? '#3D7DCA' : '#888'};color:#fff;font-size:9px;padding:1px 5px;border-radius:99px;font-family:Roboto,sans-serif;vertical-align:middle;">${badgeLabel}</span>`
      : '';

    return `<tr class="${isYou ? 'lb-you' : ''}" ${isYou ? 'id="lb-you-row"' : ''}>
  <td><span class="${rankClass}">${rank}</span></td>
  <td>${escHtml(r.name)}${youBadge}</td>
  <td>${r._acc}%</td>
  <td>${escHtml(r.time)}</td>
  <td>${formatDate(r.date)}</td>
</tr>`;
  }).join('');

  wrap.innerHTML = `<table class="lb-table">
  <thead><tr>
    <th>RANK</th><th>NAME</th>
    <th>ACCURACY</th><th>TIME</th><th>DATE</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`;

  const youRow = document.getElementById('lb-you-row');
if (youRow) setTimeout(() => youRow.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);

// ── "Not on the board" notice ──────────────────────────────────
const playerInTop50 = data.some(r =>
  String(r.name || '').trim().toLowerCase() === String(playerName).trim().toLowerCase()
);
if (!playerInTop50 && playerName) {
  const note = document.createElement('p');
  note.setAttribute('style',
    'text-align:center;font-size:12px;color:#888;font-family:sans-serif;' +
    'padding:12px 20px 4px;margin:0;'
  );
  note.textContent = `Your score didn't make the Leaderboard, ${playerName}. Keep training!`;
  wrap.appendChild(note);
}
}

// ── Helpers ───────────────────────────────────────────────────────
function timeToSeconds(timeStr) {
  if (!timeStr) return 99999;
  const m = timeStr.match(/(\d+)m\s*(\d+)(?:\.(\d))?s/);
  return m ? parseInt(m[1])*60 + parseInt(m[2]) + (parseInt(m[3]||'0')/10) : 99999;
}
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function formatDate(val) {
  if (!val) return '';
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const s = String(val);
  // stored as DD/MM/YYYY → convert to "02 Apr"
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm] = s.split('/');
    return `${dd} ${MONTHS[parseInt(mm, 10) - 1]}`;
  }
  const d = new Date(s);
  if (!isNaN(d)) {
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return `${String(ist.getUTCDate()).padStart(2,'0')} ${MONTHS[ist.getUTCMonth()]}`;
  }
  return s;
}
