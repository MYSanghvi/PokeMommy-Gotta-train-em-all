const clickAudio = new Audio('sounds/interaction.mp3');
clickAudio.preload = 'auto';
const whosThatAudio = new Audio('sounds/whos-that-pokemon.mp3');
whosThatAudio.preload = 'auto';

let audioCtx = null, soundOn = true;

function vibrate(pattern) {
  try { if(navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function tone(freq, type, dur, vol=0.28, delay=0) {
  if (!soundOn) return;
  try {
    const ctx=getCtx(), osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type=type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime+delay);
    gain.gain.setValueAtTime(vol, ctx.currentTime+delay);
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
  clickAudio.currentTime = 0;
  clickAudio.play().catch(()=>{});
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

function stopWhosThatAudio() {
  whosThatAudio.pause();
  whosThatAudio.currentTime = 0;
}
function toggleSound() {
  soundOn = !soundOn;
  const btn = document.getElementById('sound-toggle');
  btn.textContent = soundOn ? '🔊' : '🔇';
  btn.classList.toggle('muted', !soundOn);
  if (soundOn) getCtx();
  else { stopLearnAudio(); stopResultAudio(); stopWhosThatAudio(); }
}
