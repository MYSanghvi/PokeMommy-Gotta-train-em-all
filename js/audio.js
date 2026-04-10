const clickAudio = new Audio('sounds/interaction.mp3');
clickAudio.preload = 'auto';
const whosThatAudio = new Audio('sounds/whos-that-pokemon.mp3');
whosThatAudio.preload = 'auto';

let audioCtx = null, soundOn = true;

// ── SETTINGS ─────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? v : fallback; } catch(e) { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}

let sfxVolume = parseFloat(lsGet('pm_sfx_vol', '0.7'));
let musicVolume = parseFloat(lsGet('pm_music_vol', '0.5'));
let spriteStyle = lsGet('pm_sprite_style', 'sd');
let autoDuck = lsGet('pm_auto_duck', 'true') !== 'false';
let bgmAudio = null;

function initBgm() {
  if (bgmAudio) {
    if (bgmAudio.paused && soundOn && musicVolume > 0) {
      bgmAudio.play().catch(() => {});
    }
    return;
  }
  bgmAudio = new Audio('sounds/littleroot_town.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = soundOn ? musicVolume : 0;
  bgmAudio.play().catch(() => {});
}

function applyBgmVolume() {
  if (!bgmAudio) return;
  bgmAudio.volume = soundOn ? musicVolume : 0;
}

function duckBgm() {
  if (!bgmAudio || !autoDuck || musicVolume === 0) return;
  if (_unduckTimer) { clearInterval(_unduckTimer); _unduckTimer = null; }
  const target = soundOn ? musicVolume * 0.2 : 0;
  if (bgmAudio.volume === target) return;
  const start = bgmAudio.volume;
  const STEPS = 15;
  const PERIOD = 200 / STEPS; // 200ms fast fade-down
  let step = 0;
  _unduckTimer = setInterval(() => {
    step++;
    const t = step / STEPS;
    bgmAudio.volume = Math.max(start + (target - start) * t, 0);
    if (step >= STEPS) {
      clearInterval(_unduckTimer);
      _unduckTimer = null;
      bgmAudio.volume = target;
    }
  }, PERIOD);
}

let _unduckTimer = null;
function unduckBgm() {
  if (!bgmAudio) return;
  if (_unduckTimer) { clearInterval(_unduckTimer); _unduckTimer = null; }
  const target = soundOn ? musicVolume : 0;
  if (bgmAudio.volume === target) return;     // already at target, skip fade
  const start  = bgmAudio.volume;
  const STEPS  = 25;
  const PERIOD = 600 / STEPS;                // 600 ms smooth fade-up
  let step = 0;
  _unduckTimer = setInterval(() => {
    step++;
    const t = step / STEPS;
    // ease-out curve: feels natural
    bgmAudio.volume = Math.min(start + (target - start) * (1 - Math.pow(1 - t, 2)), 1);
    if (step >= STEPS) {
      clearInterval(_unduckTimer);
      _unduckTimer = null;
      bgmAudio.volume = target; // guarantee exact final value
    }
  }, PERIOD);
}
// ── SETTINGS ─────────────────────────────────────────────────────


function vibrate(pattern) {
  try { if(navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function tone(freq, type, dur, vol=0.28, delay=0) {
  if (!soundOn) return;
  const scaledVol = vol * sfxVolume;
  try {
    const ctx = getCtx();
    // ── Resume if suspended before scheduling any nodes ─────────
    if (ctx.state === 'suspended') ctx.resume();
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type=type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime+delay);
    gain.gain.setValueAtTime(scaledVol, ctx.currentTime+delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+delay+dur);
    osc.start(ctx.currentTime+delay); osc.stop(ctx.currentTime+delay+dur);
  } catch(e) {}
}

function playCorrect() {
  tone(523.25,'square',0.12,0.28,0);
  tone(659.25,'square',0.12,0.28,0.11);
  tone(783.99,'square',0.18,0.28,0.22);
  vibrate([40,30,40]);
}
function playWrong() {
  tone(300,'sawtooth',0.10,0.22,0);
  tone(220,'sawtooth',0.16,0.22,0.12);
  vibrate([80,40,80]);
}
function playFanfare() {
  [523,659,784,1047].forEach((f,i)=>tone(f,'square',0.2,0.3,i*0.13));
  vibrate([50,30,50,30,50,30,100]);
}
function playHint() {
  tone(880,'sine',0.09,0.15,0);
  vibrate(25);
}
function playClick() {
  if (!soundOn) return;
  // ── Resume context instantly if suspended ────────────────────
  const ctx = getCtx();
  clickAudio.volume = sfxVolume;  
  if (ctx.state === 'suspended') {
    ctx.resume().then(()=>{
      clickAudio.currentTime = 0;
      clickAudio.play().catch(()=>{});
    });
  } else {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(()=>{});
  }
  vibrate(10);
}

// ── Easter egg tones ─────────────────────────────────────────────
function playSecretJingle() {
  if (!soundOn) return;
  // Title screen-ish ascending jingle
  const notes = [392,440,494,523,587,659,784];
  notes.forEach((f,i) => tone(f,'square',0.15,0.25,i*0.12));
}
function playGlitchSound() {
  if (!soundOn) return;
  [180,220,160,300,140].forEach((f,i) => tone(f,'sawtooth',0.08,0.3,i*0.07));
}
function playMewChime() {
  if (!soundOn) return;
  [1047,1319,1568,2093].forEach((f,i) => tone(f,'sine',0.25,0.2,i*0.15));
}
function playNightChime() {
  if (!soundOn) return;
  [330,294,262].forEach((f,i) => tone(f,'sine',0.2,0.18,i*0.18));
}

function playWhosThatAudio() {
    if (!soundOn) return;
    whosThatAudio.volume = sfxVolume;   // ← links to SFX slider
    whosThatAudio.currentTime = 0;
    whosThatAudio.play().catch(() => {});
}

function stopWhosThatAudio() {
    whosThatAudio.pause();
    whosThatAudio.currentTime = 0;
}
function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) getCtx();
  else { stopLearnAudio(); stopResultAudio(); stopWhosThatAudio(); }
  applyBgmVolume();
}

function stopResultAudio() {
  if (typeof resultAudio !== 'undefined' && resultAudio) {
    resultAudio.onended = null;
    resultAudio.pause();
    resultAudio = null;
  }
}

function stopLearnAudio() {
  if (typeof learnAudio !== 'undefined' && learnAudio) {
    learnAudio.onended = null;
    learnAudio.pause();
    learnAudio = null;
  }
  const btn = document.getElementById('learn-speaker-btn');
  if (btn) btn.classList.remove('playing');
}