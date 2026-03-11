const clickAudio = new Audio('sounds/interaction.mp3');
clickAudio.preload = 'auto';
const whosThatAudio = new Audio('sounds/whos-that-pokemon.mp3');
whosThatAudio.preload = 'auto';

let audioCtx = null, soundOn = true;

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
function playCorrect() { tone(523.25,'square',0.12,0.28,0); tone(659.25,'square',0.12,0.28,0.11); tone(783.99,'square',0.18,0.28,0.22); }
function playWrong()   { tone(300,'sawtooth',0.10,0.22,0); tone(220,'sawtooth',0.16,0.22,0.12); }
function playFanfare() { [523,659,784,1047].forEach((f,i)=>tone(f,'square',0.2,0.3,i*0.13)); }
function playHint()    { tone(880,'sine',0.09,0.15,0); }
function playClick() {
  if (!soundOn) return;
  clickAudio.currentTime = 0;
  clickAudio.play().catch(()=>{});
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