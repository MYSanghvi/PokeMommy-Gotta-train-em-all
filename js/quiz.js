// const GIF_BASE      = 'https://cdn.jsdelivr.net/gh/Nackha1/Hd-sprites@master/';  HD GIF source
const FALLBACK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
// function gifUrl(name)    { return GIF_BASE+(SPRITE_MAP[name]||capitalize(name))+'.gif'; } HD GIF source
function gifUrl(name) {
  // ── Ash's Pikachu: swap sprite when trainer is Ash ───────────────
  const _ashAliases = { 'ashketchum': 'ash' };
  const _trainerKey = playerName.toLowerCase().replace(/\s+/g, '');
  const _resolvedTrainer = _ashAliases[_trainerKey] ?? _trainerKey;
  const spriteName = (name === 'pikachu' && _resolvedTrainer === 'ash')
    ? 'pikachu-ash'
    : name;
  // ────────────────────────────────────────────────────────────────

  if (spriteStyle === 'hd') return 'img/spriteshd/' + spriteName + '.gif';
  if (spriteStyle === 'static') return 'img/spritesstatic/' + spriteName + '.png';
  return 'img/sprites/' + spriteName + '.gif';
}

function fallbackUrl(id) {
	return FALLBACK_BASE + id + '.png';
}

let quizType = null,
	difficulty = null,
	quizMode = 'quick',
	playerName = '',
	playerGender = 'boy';
let allPokemon = [],
	questions = [],
	currentQ = 0,
	correctCount = 0,
	answeredCount = 0;
let hintsRevealed = 0,
	currentPokemonData = null;
let autoNextTimer = null;
let onEasterEggClose = null;
const QUICK_COUNT = 20;
let sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
let resultAudio = null;
let wrongAnswers = [];
let _settingsSnapshot = null;


// ════════════════════════════════════════════════════════════════
// ── WELCOME POPUP MESSAGE
// ════════════════════════════════════════════════════════════════

function showWelcomePopup() {
	const popup = document.getElementById('welcome-popup');
	popup.style.display = 'flex';
	// Prevent background scroll
	document.body.style.overflow = 'hidden';
}

function closeWelcomePopup() {
    const popup = document.getElementById('welcome-popup');
    popup.style.display = 'none';
    document.body.style.overflow = '';
    playClick();
    const saved = localStorage.getItem('pokemommy_trainer_name');
    if (saved) {
        document.getElementById('name-popup-input').value = saved;
        checkNamePopupReady();
    }
    showNamePopup();
}

// ── Trainer Name Popup ───────────────────────────────────────────
function showNamePopup() {
	const popup = document.getElementById('name-popup');
	popup.style.display = 'flex';
	document.body.style.overflow = 'hidden';
	setTimeout(() => document.getElementById('name-popup-input').focus(), 100);
	const savedGender = lsGet('pokemommy_gender', 'boy');
	selectGender(savedGender);
}

function selectGender(gender) {
  playerGender = gender;
  lsSet('pokemommy_gender', gender);
  const boyBtn = document.getElementById('gender-boy');
  const girlBtn = document.getElementById('gender-girl');
  if (gender === 'boy') {
    boyBtn.style.background = '#3D7DCA';
    boyBtn.style.borderColor = '#3D7DCA';
    boyBtn.style.color = '#fff';
    girlBtn.style.background = '#f9f9f9';
    girlBtn.style.borderColor = '#ddd';
    girlBtn.style.color = '#666';
  } else {
    girlBtn.style.background = '#3D7DCA';
    girlBtn.style.borderColor = '#3D7DCA';
    girlBtn.style.color = '#fff';
    boyBtn.style.background = '#f9f9f9';
    boyBtn.style.borderColor = '#ddd';
    boyBtn.style.color = '#666';
  }
}

function checkNamePopupReady() {
	const val = document.getElementById('name-popup-input').value.trim();
	const btn = document.getElementById('name-popup-btn');
	btn.disabled = !val;
	btn.style.opacity = val ? '1' : '0.5';
}

function confirmTrainerName() {
  const val = document.getElementById('name-popup-input').value.trim();
  if (!val) return;

      if (val.toLowerCase().replace(/\s+/g, '') === 'missingno') {
    document.getElementById('name-popup').style.display = 'none';
    document.body.style.overflow = '';
    onEasterEggClose = () => { showNamePopup(); };
    triggerMissingNo();
    document.getElementById('name-popup-input').value = '';
    checkNamePopupReady();
    return;
  }

  playerName = val;
  document.getElementById('player-name').value = val;
  lsSet('pokemommy_trainer_name', val);
  document.getElementById('name-popup').style.display = 'none';
  document.body.style.overflow = '';
  playClick();
const hadEgg = checkTrainerNameEgg(val);
if (hadEgg) {
    const prevClose = onEasterEggClose;
    onEasterEggClose = () => {
        if (prevClose) prevClose();
        initBgm();
        setTimeout(checkNightMode, 300);
    }
} else {
    initBgm();
    setTimeout(checkNightMode, 300);
}
}
// ── SETTINGS PANEL ───────────────────────────────────────────────
function openSettings() {
    // ── Snapshot current values so X can restore them ────────────
    _settingsSnapshot = {
        sfx:    sfxVolume,
        music:  musicVolume,
        sprite: spriteStyle,
        duck:   autoDuck
    };
    // ─────────────────────────────────────────────────────────────

    const ov = document.getElementById('settings-overlay');
    const sfxSlider   = document.getElementById('s-sfx-slider');
    const musicSlider = document.getElementById('s-music-slider');
    sfxSlider.value   = Math.round(sfxVolume * 100);
    musicSlider.value = Math.round(musicVolume * 100);
    sfxSlider.style.setProperty('--pct',   sfxSlider.value   + '%');
    musicSlider.style.setProperty('--pct', musicSlider.value + '%');
    document.getElementById('s-sfx-val').textContent   = sfxSlider.value   + '%';
    document.getElementById('s-music-val').textContent = musicSlider.value + '%';
    document.getElementById('s-sfx-card').classList.toggle('s-muted',   sfxVolume   === 0);
    document.getElementById('s-music-card').classList.toggle('s-muted', musicVolume === 0);
    document.getElementById('s-auto-duck').checked = autoDuck;
    updateDuckRow(Math.round(musicVolume * 100));
    const duckRow = document.getElementById('s-duck-row');
    duckRow.style.opacity      = musicVolume === 0 ? '0.4' : '1';
    duckRow.style.pointerEvents = musicVolume === 0 ? 'none' : '';
    document.querySelectorAll('.s-sprite-btn').forEach(b =>
        b.classList.toggle('selected', b.dataset.style === spriteStyle));
    ov.classList.add('open');
}

function closeSettings() {
    // ── Restore all values to what they were before opening ──────
    if (_settingsSnapshot) {
        sfxVolume   = _settingsSnapshot.sfx;
        musicVolume = _settingsSnapshot.music;
        spriteStyle = _settingsSnapshot.sprite;
        autoDuck    = _settingsSnapshot.duck;
        applyBgmVolume();
        _settingsSnapshot = null;
    }
    // ─────────────────────────────────────────────────────────────
    document.getElementById('settings-overlay').classList.remove('open');
}

function handleSettingsOverlayClick(e) {
  if (e.target === document.getElementById('settings-overlay')) closeSettings();
}

function updateDuckRow(musicVal) {
  const row = document.querySelector('.s-duck-row');
  const toggle = document.getElementById('s-auto-duck');
  const disabled = musicVal === 0;
  row.style.opacity = disabled ? '0.4' : '';
  row.style.pointerEvents = disabled ? 'none' : '';
  toggle.disabled = disabled;
}

let _sliderHintTimer = null;
function onSettingsSlider(type, val) {
  val = parseInt(val);
  const pct = val + '%';
  document.getElementById(`s-${type}-val`).textContent = pct;
  document.getElementById(`s-${type}-slider`).style.setProperty('--pct', pct);
  document.getElementById(`s-${type}-card`).classList.toggle('s-muted', val === 0);
  if (type === 'sfx') {
    sfxVolume = val / 100;
    clearTimeout(_sliderHintTimer);
    _sliderHintTimer = setTimeout(() => playHint(), 80);
  } else {
    musicVolume = val / 100;
    applyBgmVolume();
	updateDuckRow(val);
    const duckRow = document.getElementById('s-duck-row');
    duckRow.style.opacity = val === 0 ? '0.4' : '1';
    duckRow.style.pointerEvents = val === 0 ? 'none' : '';
  }
}

function saveSettings() {
  // Read sprite style
  playClick(); 
  const selected = document.querySelector('.s-sprite-btn.selected');
  if (selected) spriteStyle = selected.dataset.style;
  autoDuck = document.getElementById('s-auto-duck').checked;
  // Persist
  lsSet('pm_sfx_vol', sfxVolume);
  lsSet('pm_music_vol', musicVolume);
  lsSet('pm_sprite_style', spriteStyle);
  lsSet('pm_auto_duck', autoDuck);
  applyBgmVolume();
  _settingsSnapshot = null;
  closeSettings();
}


// ════════════════════════════════════════════════════════════════
// ── EASTER EGGS
// ════════════════════════════════════════════════════════════════

// ── Easter egg overlay helpers ───────────────────────────────────
function showEasterEgg(emoji, title, body, img = null) {
	const emojiEl = document.getElementById('easter-emoji');
	if (img) {
		emojiEl.innerHTML = `<img src="${img}" alt="" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated;"/>`;
	} else {
		emojiEl.innerHTML = emoji;
	}
	document.getElementById('easter-title').textContent = title;
	document.getElementById('easter-body').textContent = body;
	document.getElementById('easter-overlay').style.display = 'flex';
	vibrate([50, 30, 50, 30, 100]);
}

function closeEasterEgg() {
	cleanupChosenOne();
	cleanupWifey();
	cleanupHelu();
	document.getElementById('easter-overlay').style.display = 'none';
	if (onEasterEggClose) { onEasterEggClose(); onEasterEggClose = null; }
}

// ══════════ MAULISHMASTER — THE CHOSEN ONE ══════════
let maulishStarAnim = null;

function maulishCreateReverb(ctx, dur = 2.5, decay = 3.5) {
	const cv = ctx.createConvolver();
	const len = ctx.sampleRate * dur;
	const buf = ctx.createBuffer(2, len, ctx.sampleRate);
	for (let c = 0; c < 2; c++) {
		const d = buf.getChannelData(c);
		for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
	}
	cv.buffer = buf;
	return cv;
}

function playChosenSound() {
	const ctx = getCtx();
	const now = ctx.currentTime;
	const reverb = maulishCreateReverb(ctx);
	const rvg = ctx.createGain();
	rvg.gain.value = 0.55;
	reverb.connect(rvg);
	rvg.connect(ctx.destination);
	// 1. Heartbeat thuds
	[0, 0.55].forEach(t => {
		const o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.setValueAtTime(55, now + t);
		o.frequency.exponentialRampToValueAtTime(28, now + t + 0.3);
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, now + t);
		g.gain.linearRampToValueAtTime(1.3, now + t + 0.04);
		g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
		o.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(now + t);
		o.stop(now + t + 0.5);
		const nb = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
		const nd = nb.getChannelData(0);
		for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (nd.length * 0.1));
		const ns = ctx.createBufferSource();
		ns.buffer = nb;
		const ng = ctx.createGain();
		ng.gain.value = 0.5;
		ns.connect(ng);
		ng.connect(ctx.destination);
		ns.start(now + t);
	});
	// 2. String swell
	[65.41, 98.00, 130.81].forEach((freq, i) => {
		const o = ctx.createOscillator();
		o.type = 'sawtooth';
		o.frequency.value = freq;
		const f = ctx.createBiquadFilter();
		f.type = 'lowpass';
		f.frequency.setValueAtTime(120, now + 0.3);
		f.frequency.exponentialRampToValueAtTime(900, now + 1.5);
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, now + 0.3);
		g.gain.linearRampToValueAtTime(0.22 - i * 0.05, now + 1.0);
		g.gain.setValueAtTime(0.18, now + 2.0);
		g.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
		o.connect(f);
		f.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(now + 0.3);
		o.stop(now + 4.5);
	});
	// 3. Orchestral hit + sub boom
	[82.41, 110, 164.81, 220, 329.63, 440].forEach((freq, i) => {
		const o = ctx.createOscillator();
		o.type = 'sawtooth';
		o.frequency.value = freq;
		o.detune.value = (Math.random() - 0.5) * 15;
		const f = ctx.createBiquadFilter();
		f.type = 'lowpass';
		f.frequency.setValueAtTime(200, now + 1.0);
		f.frequency.exponentialRampToValueAtTime(4000, now + 1.3);
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, now + 1.0 + i * 0.008);
		g.gain.linearRampToValueAtTime(0.3 - i * 0.03, now + 1.06 + i * 0.008);
		g.gain.exponentialRampToValueAtTime(0.001, now + 3.8);
		o.connect(f);
		f.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(now + 1.0);
		o.stop(now + 4.0);
	});
	const hb = ctx.createOscillator();
	hb.type = 'sine';
	hb.frequency.setValueAtTime(100, now + 1.0);
	hb.frequency.exponentialRampToValueAtTime(30, now + 1.5);
	const hbg = ctx.createGain();
	hbg.gain.setValueAtTime(0, now + 1.0);
	hbg.gain.linearRampToValueAtTime(1.8, now + 1.04);
	hbg.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
	hb.connect(hbg);
	hbg.connect(ctx.destination);
	hbg.connect(reverb);
	hb.start(now + 1.0);
	hb.stop(now + 1.7);
	// 4. Choir
	[130.81, 164.81, 196, 261.63, 329.63, 392, 523.25].forEach((freq, i) => {
		for (let d = 0; d < 3; d++) {
			const o = ctx.createOscillator();
			o.type = 'sawtooth';
			o.frequency.value = freq;
			o.detune.value = (d - 1) * 8 + (Math.random() - 0.5) * 4;
			const f = ctx.createBiquadFilter();
			f.type = 'lowpass';
			f.frequency.setValueAtTime(250, now + 1.1);
			f.frequency.exponentialRampToValueAtTime(2200, now + 2.2);
			const g = ctx.createGain();
			const t = now + 1.1 + i * 0.06;
			g.gain.setValueAtTime(0, t);
			g.gain.linearRampToValueAtTime(0.07, t + 0.2);
			g.gain.setValueAtTime(0.06, now + 2.5);
			g.gain.exponentialRampToValueAtTime(0.001, now + 4.8);
			o.connect(f);
			f.connect(g);
			g.connect(ctx.destination);
			g.connect(reverb);
			o.start(t);
			o.stop(now + 5.0);
		}
	});
	// 5. Brass horns
	[196, 246.94, 293.66, 392, 493.88].forEach((freq, i) => {
		const o = ctx.createOscillator();
		o.type = 'square';
		o.frequency.value = freq;
		const f = ctx.createBiquadFilter();
		f.type = 'lowpass';
		f.frequency.value = 1200;
		f.Q.value = 2;
		const g = ctx.createGain();
		const t = now + 1.8 + i * 0.05;
		g.gain.setValueAtTime(0, t);
		g.gain.linearRampToValueAtTime(0.16, t + 0.08);
		g.gain.setValueAtTime(0.14, now + 2.5);
		g.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
		o.connect(f);
		f.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(t);
		o.stop(now + 4.5);
	});
	// 6. Ascending reveal
	[392, 493.88, 587.33, 698.46, 880, 1046.5, 1174.66].forEach((freq, i) => {
		const o = ctx.createOscillator();
		o.type = 'triangle';
		o.frequency.value = freq;
		const g = ctx.createGain();
		const t = now + 2.0 + i * 0.09;
		g.gain.setValueAtTime(0, t);
		g.gain.linearRampToValueAtTime(0.13, t + 0.05);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
		o.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(t);
		o.stop(t + 0.9);
	});
	// 7. Cosmic shimmer
	for (let i = 0; i < 20; i++) {
		const o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.value = 1200 + Math.random() * 5000;
		const g = ctx.createGain();
		const t = now + 2.5 + Math.random() * 1.2;
		g.gain.setValueAtTime(0.09, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
		o.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(t);
		o.stop(t + 0.5);
	}
	// 8. Power sustain bass
	[41.20, 55, 82.41, 110, 164.81].forEach((freq, i) => {
		const o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.value = freq;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, now + 1.5);
		g.gain.linearRampToValueAtTime(0.35 - i * 0.05, now + 2.2);
		g.gain.setValueAtTime(0.3 - i * 0.04, now + 3.0);
		g.gain.exponentialRampToValueAtTime(0.001, now + 5.5);
		o.connect(g);
		g.connect(ctx.destination);
		g.connect(reverb);
		o.start(now + 1.5);
		o.stop(now + 5.5);
	});
}

function maulishInitStars() {
	const canvas = document.getElementById('maulish-star-canvas');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const stars = Array.from({
		length: 200
	}, () => ({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		r: Math.random() * 1.8 + 0.3,
		speed: Math.random() * 0.4 + 0.1,
		twinkle: Math.random() * Math.PI * 2
	}));

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		stars.forEach(s => {
			s.twinkle += 0.03;
			const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
			ctx.beginPath();
			ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
			ctx.fill();
			s.y -= s.speed;
			if (s.y < -2) {
				s.y = canvas.height + 2;
				s.x = Math.random() * canvas.width;
			}
		});
		maulishStarAnim = requestAnimationFrame(draw);
	}
	draw();
	window.addEventListener('resize', () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});
}

function maulishSpawnRings() {
	for (let i = 0; i < 4; i++) {
		setTimeout(() => {
			const ring = document.createElement('div');
			ring.className = 'maulish-energy-ring';
			ring.style.width = (60 + i * 20) + 'px';
			ring.style.height = (60 + i * 20) + 'px';
			ring.style.border = `3px solid ${i % 2 === 0 ? 'rgba(255,215,0,0.9)' : 'rgba(160,80,255,0.8)'}`;
			ring.style.animationDuration = (1.1 + i * 0.15) + 's';
			document.body.appendChild(ring);
			setTimeout(() => ring.remove(), 1500);
		}, i * 140);
	}
}

function maulishSpawnParticles() {
	const colors = ['#FFD700', '#9B30FF', '#00BFFF', '#FF69B4', '#fff', '#FFA500'];
	for (let i = 0; i < 30; i++) {
		setTimeout(() => {
			const p = document.createElement('div');
			p.className = 'maulish-energy-particle';
			const size = Math.random() * 10 + 4;
			const color = colors[Math.floor(Math.random() * colors.length)];
			p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;bottom:${Math.random() * 20 + 5}vh;background:${color};box-shadow:0 0 ${size * 2}px ${color};--drift:${(Math.random() - 0.5) * 80}px;animation-duration:${Math.random() * 1.5 + 1}s;animation-delay:${Math.random() * 0.4}s;`;
			document.body.appendChild(p);
			setTimeout(() => p.remove(), 2500);
		}, i * 60);
	}
}

function maulishCosmicConfetti() {
	const cols = ['#FFD700', '#9B30FF', '#00BFFF', '#FF69B4', '#fff', '#FFA500', '#7FFF00'];
	confetti({
		particleCount: 70,
		spread: 80,
		origin: {
			x: 0.5,
			y: 0.35
		},
		colors: cols,
		startVelocity: 45,
		gravity: 0.55
	});
	setTimeout(() => {
		confetti({
			particleCount: 50,
			angle: 60,
			spread: 90,
			origin: {
				x: 0,
				y: 0.65
			},
			colors: cols,
			startVelocity: 50
		});
		confetti({
			particleCount: 50,
			angle: 120,
			spread: 90,
			origin: {
				x: 1,
				y: 0.65
			},
			colors: cols,
			startVelocity: 50
		});
	}, 300);
	setTimeout(() => {
		confetti({
			particleCount: 80,
			spread: 160,
			origin: {
				x: 0.5,
				y: 1
			},
			colors: cols,
			startVelocity: 22,
			gravity: 0.2,
			scalar: 1.2
		});
	}, 600);
}

let maulishTwTimer = null;

function maulishTypewrite(el, text, speed = 30) {
	if (maulishTwTimer) clearInterval(maulishTwTimer);
	el.textContent = '';
	let i = 0;
	maulishTwTimer = setInterval(() => {
		el.textContent += text[i++];
		if (i >= text.length) clearInterval(maulishTwTimer);
	}, speed);
}

function triggerChosenOne(egg) {
	// Block all interaction for the entire Chosen One sequence
	const chosenBlocker = document.createElement('div');
	chosenBlocker.id = 'chosen-one-blocker';
	chosenBlocker.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:all;';
	document.body.appendChild(chosenBlocker);

	const prevClose = onEasterEggClose;
	onEasterEggClose = () => {
		const b = document.getElementById('chosen-one-blocker');
		if (b) b.remove();
		if (prevClose) prevClose();
	};

	const emojiEl = document.getElementById('easter-emoji');
	const titleEl = document.getElementById('easter-title');
	const bodyEl = document.getElementById('easter-body');
	const overlay = document.getElementById('easter-overlay');
	const card = document.getElementById('easter-card');

	// Set content
	if (egg.img) {
		emojiEl.innerHTML = `<img src="${egg.img}" alt="" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated">`;
	} else {
		emojiEl.textContent = egg.emoji;
	}
	titleEl.textContent = egg.title;
	bodyEl.textContent = '';

	// Inject halo + nebula + banner into card (once only)
	if (!card.querySelector('.maulish-halo-ring')) {
		const halo = document.createElement('div');
		halo.className = 'maulish-halo-ring';
		const nebula = document.createElement('div');
		nebula.className = 'maulish-nebula';
		const banner = document.createElement('div');
		banner.className = 'maulish-chosen-banner';
		banner.textContent = '✦ Legendary Reputation ✦';
		card.prepend(halo);
		card.prepend(nebula);
		titleEl.before(banner);
	}

	// Build cosmic backdrop layers
	const cosmic = document.createElement('div');
	cosmic.id = 'maulish-cosmic';
	const starCanvas = document.createElement('canvas');
	starCanvas.id = 'maulish-star-canvas';
	const edgeAura = document.createElement('div');
	edgeAura.id = 'maulish-edge-aura';
	const lightPillar = document.createElement('div');
	lightPillar.id = 'maulish-light-pillar';
	document.body.append(cosmic, starCanvas, edgeAura, lightPillar);

	// Sound
	playChosenSound();
	vibrate([50, 30, 50, 30, 100]);

	// Phase 1 — cosmic bg fades in
	cosmic.style.display = 'block';
	requestAnimationFrame(() => {
		cosmic.style.opacity = '1';
	});
	setTimeout(() => {
		starCanvas.style.opacity = '1';
		maulishInitStars();
	}, 100);

	// Phase 2 — edge aura
	setTimeout(() => {
		edgeAura.style.display = 'block';
		edgeAura.classList.add('pulse');
	}, 300);

	// Phase 3 — two waves of energy rings
	setTimeout(maulishSpawnRings, 600);
	setTimeout(maulishSpawnRings, 900);

	// Phase 4 — light pillar rises from below
	setTimeout(() => {
		lightPillar.style.display = 'block';
		requestAnimationFrame(() => {
			lightPillar.style.height = '55vh';
		});
	}, 700);

	// Phase 5 — show card
	setTimeout(() => {
		card.classList.add('maulish-active');
		overlay.classList.add('maulish-active');
		overlay.style.display = 'flex';
	}, 900);

	// Phase 6 — particles
	setTimeout(maulishSpawnParticles, 1100);

	// Phase 7 — confetti
	setTimeout(maulishCosmicConfetti, 1300);

	// Phase 8 — typewriter body text
	setTimeout(() => maulishTypewrite(bodyEl, egg.body), 1500);
}

function cleanupChosenOne() {
	if (maulishTwTimer) { clearInterval(maulishTwTimer); maulishTwTimer = null; }
	['maulish-cosmic', 'maulish-star-canvas', 'maulish-edge-aura', 'maulish-light-pillar']
	.forEach(id => {
		const el = document.getElementById(id);
		if (el) el.remove();
	});
	if (maulishStarAnim) {
		cancelAnimationFrame(maulishStarAnim);
		maulishStarAnim = null;
	}
	const card = document.getElementById('easter-card');
	const overlay = document.getElementById('easter-overlay');
	if (card) {
		card.classList.remove('maulish-active');
		card.style.opacity = '';
		card.style.transform = '';
		// Remove injected Chosen One elements so they don't bleed into other easter eggs
		card.querySelectorAll('.maulish-halo-ring, .maulish-nebula, .maulish-chosen-banner')
			.forEach(el => el.remove());
	}
	if (overlay) {
		overlay.classList.remove('maulish-active');
	}
}
// ══════════ END CHOSEN ONE ══════════


// ══════════════════════════════════════
// WIFEY — THE ETERNAL BLOOM
// ══════════════════════════════════════
function playWifeySound() {
	const ctx = getCtx(), now = ctx.currentTime;
	const reverb = maulishCreateReverb(ctx, 2.8, 2.2);
	const rvg = ctx.createGain(); rvg.gain.value = 0.45;
	reverb.connect(rvg); rvg.connect(ctx.destination);
	[261.63,329.63,392,493.88].forEach((freq,i) => {
		const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
		const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(0.07-i*.01,now+.4);
		g.gain.setValueAtTime(0.06,now+2.5); g.gain.exponentialRampToValueAtTime(0.001,now+4.8);
		o.connect(f); f.connect(g); g.connect(ctx.destination); g.connect(reverb);
		o.start(now); o.stop(now+5);
	});
	[523.25,659.25,783.99,987.77,1046.5,1318.51].forEach((freq,i) => {
		const t = now+.35+i*.22, o = ctx.createOscillator(); o.type='sine'; o.frequency.value=freq;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.18,t+.025); g.gain.exponentialRampToValueAtTime(.001,t+.85);
		o.connect(g); g.connect(ctx.destination); g.connect(reverb); o.start(t); o.stop(t+.9);
	});
	[523.25,659.25,783.99,987.77,1046.5,1318.51].forEach((freq,i) => {
		const t = now+1.5+i*.2, o = ctx.createOscillator(); o.type='sine'; o.frequency.value=freq*.5;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.1,t+.03); g.gain.exponentialRampToValueAtTime(.001,t+1.0);
		o.connect(g); g.connect(ctx.destination); g.connect(reverb); o.start(t); o.stop(t+1.1);
	});
	for (let i=0;i<14;i++) {
		const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=1600+Math.random()*2200;
		const g=ctx.createGain(), t=now+.8+Math.random()*2.0;
		g.gain.setValueAtTime(.07,t); g.gain.exponentialRampToValueAtTime(.001,t+.35);
		o.connect(g); g.connect(ctx.destination); g.connect(reverb); o.start(t); o.stop(t+.4);
	}
	[0,.6].forEach(t => {
		const o=ctx.createOscillator(); o.type='sine';
		o.frequency.setValueAtTime(80,now+t); o.frequency.exponentialRampToValueAtTime(45,now+t+.25);
		const g=ctx.createGain();
		g.gain.setValueAtTime(0,now+t); g.gain.linearRampToValueAtTime(.28,now+t+.04); g.gain.exponentialRampToValueAtTime(.001,now+t+.5);
		o.connect(g); g.connect(ctx.destination); o.start(now+t); o.stop(now+t+.6);
	});
}

let wifeyStarAnim = null;

function wifeyInitCanvas(cv) {
	const ctx = cv.getContext('2d');
	cv.width = innerWidth; cv.height = innerHeight;
	const pts = Array.from({length:55}, () => ({
		x:Math.random()*cv.width, y:cv.height*.3+Math.random()*cv.height*.7,
		sz:Math.random()*13+7, vy:Math.random()*.55+.18, vx:(Math.random()-.5)*.35,
		wb:Math.random()*Math.PI*2, op:Math.random()*.55+.3,
		type:Math.random()>.38?'h':'s', hue:330+Math.random()*28,
	}));
	function drawHeart(ctx,cx,cy,s,op,hue) {
		ctx.save(); ctx.globalAlpha=op; ctx.fillStyle=`hsl(${hue},78%,72%)`;
		ctx.beginPath();
		ctx.moveTo(cx,cy+s*.28);
		ctx.bezierCurveTo(cx,cy-s*.05,cx-s*.5,cy-s*.05,cx-s*.5,cy+s*.28);
		ctx.bezierCurveTo(cx-s*.5,cy+s*.62,cx,cy+s*.88,cx,cy+s);
		ctx.bezierCurveTo(cx,cy+s*.88,cx+s*.5,cy+s*.62,cx+s*.5,cy+s*.28);
		ctx.bezierCurveTo(cx+s*.5,cy-s*.05,cx,cy-s*.05,cx,cy+s*.28);
		ctx.fill(); ctx.restore();
	}
	function frame() {
		ctx.clearRect(0,0,cv.width,cv.height);
		pts.forEach(p => {
			p.wb+=.022; p.y-=p.vy; p.x+=p.vx+Math.sin(p.wb)*.3;
			const f=p.y/cv.height, a=p.op*Math.min(1,f*2.5)*Math.max(0,1-(1-f)*3);
			if (p.type==='h') drawHeart(ctx,p.x,p.y,p.sz,a,p.hue);
			else { ctx.save(); ctx.globalAlpha=a; ctx.font=`${p.sz+4}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=`rgba(255,220,235,${a})`; ctx.fillText('✦',p.x,p.y); ctx.restore(); }
			if (p.y<-20) { p.y=cv.height+20; p.x=Math.random()*cv.width; p.wb=Math.random()*Math.PI*2; }
		});
		wifeyStarAnim = requestAnimationFrame(frame);
	}
	frame();
}

function wifeySpawnRings() {
	for (let i=0;i<4;i++) setTimeout(() => {
		const r=document.createElement('div'); r.className='wifey-ring';
		const s=62+i*24;
		r.style.cssText=`width:${s}px;height:${s}px;border:3px solid ${i%2===0?'rgba(255,145,180,.88)':'rgba(255,215,0,.65)'};animation-duration:${1.2+i*.14}s;`;
		document.body.appendChild(r); setTimeout(()=>r.remove(),1600);
	}, i*125);
}

function wifeySpawnPetals() {
	const em=['💕','✨','💫','🌸','💖','⭐','🌺','💗','🌷','🫧'];
	for (let i=0;i<30;i++) setTimeout(() => {
		const p=document.createElement('div'); p.className='wifey-petal';
		p.textContent=em[Math.floor(Math.random()*em.length)];
		p.style.cssText=`left:${Math.random()*100}vw;bottom:${Math.random()*18+4}vh;font-size:${Math.random()*14+14}px;--drift:${(Math.random()-.5)*100}px;--spin:${(Math.random()-.5)*200}deg;animation-duration:${Math.random()*1.4+1.2}s;animation-delay:${Math.random()*.25}s;`;
		document.body.appendChild(p); setTimeout(()=>p.remove(),3000);
	}, i*52);
}

function triggerWifey(egg) {
	const emojiEl = document.getElementById('easter-emoji');
	const titleEl = document.getElementById('easter-title');
	const bodyEl  = document.getElementById('easter-body');
	const overlay = document.getElementById('easter-overlay');
	const card    = document.getElementById('easter-card');
	if (egg.img) {
		emojiEl.innerHTML = `<img src="${egg.img}" alt="" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated;">`;
	} else {
		emojiEl.innerHTML = egg.emoji;
	}
	titleEl.textContent = egg.title;
	bodyEl.textContent  = egg.body;
	vibrate([50,30,50,30,100]);
	if (!card.querySelector('.wifey-halo')) {
		const halo=document.createElement('div'); halo.className='wifey-halo';
		const neb=document.createElement('div');  neb.className='wifey-nebula';
		const ban=document.createElement('span'); ban.className='wifey-banner'; ban.textContent='✦ MOST IMPORTANT TRAINER ✦';
		card.prepend(halo); card.prepend(neb); titleEl.before(ban);
	}
	const cosmic=document.createElement('div');    cosmic.id='wifey-cosmic';
	const starCv=document.createElement('canvas'); starCv.id='wifey-star-canvas';
	const edge=document.createElement('div');      edge.id='wifey-edge';
	const pillar=document.createElement('div');    pillar.id='wifey-pillar';
	document.body.append(cosmic,starCv,edge,pillar);
	overlay.classList.add('wifey-active');
	card.classList.add('wifey-active');
	overlay.style.display = 'flex';
	cosmic.style.display='block'; requestAnimationFrame(()=>cosmic.style.opacity='1');
	setTimeout(()=>{starCv.style.opacity='1'; wifeyInitCanvas(starCv);},100);
	setTimeout(()=>{edge.style.display='block'; edge.classList.add('pulse');},280);
	setTimeout(()=>wifeySpawnRings(),550);
	setTimeout(()=>wifeySpawnRings(),820);
	setTimeout(()=>{pillar.style.display='block'; requestAnimationFrame(()=>pillar.style.height='58vh');},650);
	setTimeout(()=>wifeySpawnPetals(),1100);
}

function cleanupWifey() {
	['wifey-cosmic','wifey-star-canvas','wifey-edge','wifey-pillar'].forEach(id=>{const el=document.getElementById(id); if(el)el.remove();});
	if (wifeyStarAnim) { cancelAnimationFrame(wifeyStarAnim); wifeyStarAnim=null; }
	const card=document.getElementById('easter-card');
	const overlay=document.getElementById('easter-overlay');
	if (card) { card.classList.remove('wifey-active'); card.querySelectorAll('.wifey-halo,.wifey-nebula,.wifey-banner').forEach(el=>el.remove()); }
	if (overlay) overlay.classList.remove('wifey-active');
	document.querySelectorAll('.wifey-ring,.wifey-petal').forEach(e=>e.remove());
}

// ══════════════════════════════════════
// HELU — GAMEBOY
// ══════════════════════════════════════
function playHeluSound() {
	const ctx=getCtx(), now=ctx.currentTime;
	const reverb=maulishCreateReverb(ctx,1.0,4.0);
	const rvg=ctx.createGain(); rvg.gain.value=0.3;
	reverb.connect(rvg); rvg.connect(ctx.destination);
	[[392,0],[523.25,.12],[659.25,.24],[783.99,.36],[880,.52],[783.99,.65],[880,.78],[1046.5,.92]].forEach(([freq,t])=>{
		const o=ctx.createOscillator(); o.type='square'; o.frequency.value=freq;
		const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2200;
		const g=ctx.createGain();
		g.gain.setValueAtTime(.14,now+t); g.gain.setValueAtTime(.12,now+t+.09); g.gain.exponentialRampToValueAtTime(.001,now+t+.16);
		o.connect(f); f.connect(g); g.connect(ctx.destination); g.connect(reverb); o.start(now+t); o.stop(now+t+.18);
	});
	[0,.52].forEach(t=>{
		const o=ctx.createOscillator(); o.type='square'; o.frequency.value=98;
		const g=ctx.createGain();
		g.gain.setValueAtTime(.35,now+t); g.gain.exponentialRampToValueAtTime(.001,now+t+.18);
		o.connect(g); g.connect(ctx.destination); o.start(now+t); o.stop(now+t+.2);
	});
	[.24,.78].forEach(t=>{
		const buf=ctx.createBuffer(1,ctx.sampleRate*.08,ctx.sampleRate);
		const d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
		const ns=ctx.createBufferSource(); ns.buffer=buf;
		const g=ctx.createGain();
		g.gain.setValueAtTime(.2,now+t); g.gain.exponentialRampToValueAtTime(.001,now+t+.08);
		ns.connect(g); g.connect(ctx.destination); ns.start(now+t); ns.stop(now+t+.09);
	});
}

let heluPixelAnim = null;

function heluInitCanvas(cv) {
	const ctx = cv.getContext('2d');
	cv.width = innerWidth; cv.height = innerHeight;
	const GB = ['#9BBB0F','#8BAC0F','#306230','#0F380F','#6a9a0f'];
	const pts = Array.from({length:130}, () => ({
		x: Math.random() * cv.width,
		y: Math.random() * cv.height,
		sz: (Math.floor(Math.random() * 3) + 1) * 4,
		vy: Math.random() * 1.3 + .35,
		vx: (Math.random() - .5) * .28,
		col: GB[Math.floor(Math.random() * GB.length)],
		op: Math.random() * .65 + .2,
	}));
	function frame() {
		ctx.clearRect(0, 0, cv.width, cv.height);
		pts.forEach(p => {
			p.y += p.vy; p.x += p.vx;
			ctx.globalAlpha = p.op;
			ctx.fillStyle = p.col;
			ctx.fillRect(Math.floor(p.x/p.sz)*p.sz, Math.floor(p.y/p.sz)*p.sz, p.sz-1, p.sz-1);
			if (p.y > cv.height + 10) { p.y = -p.sz; p.x = Math.random() * cv.width; }
		});
		heluPixelAnim = requestAnimationFrame(frame);
	}
	frame();
}

function heluSpawnRings() {
	for (let i=0;i<4;i++) setTimeout(()=>{
		const r=document.createElement('div'); r.className='helu-ring';
		const s=60+i*22;
		r.style.cssText=`width:${s}px;height:${s}px;border:3px solid ${i%2===0?'rgba(155,187,15,.9)':'rgba(48,98,48,.7)'};animation-duration:${.95+i*.11}s;`;
		document.body.appendChild(r); setTimeout(()=>r.remove(),1200);
	},i*95);
}

function heluSpawnGlitchLines() {
	const cols=['rgba(155,187,15,.35)','rgba(139,172,15,.28)','rgba(48,98,48,.4)'];
	for (let i=0;i<5;i++) setTimeout(()=>{
		const l=document.createElement('div'); l.className='helu-glitch-line';
		l.style.cssText=`background:${cols[i%3]};height:${Math.random()*3+1}px;animation-duration:${Math.random()*.7+.45}s;`;
		document.body.appendChild(l); setTimeout(()=>l.remove(),1100);
	},i*140);
}

function triggerHelu(egg) {
	const emojiEl=document.getElementById('easter-emoji');
	const titleEl=document.getElementById('easter-title');
	const bodyEl =document.getElementById('easter-body');
	const overlay=document.getElementById('easter-overlay');
	const card   =document.getElementById('easter-card');
	if (egg.img) {
		emojiEl.innerHTML=`<img src="${egg.img}" alt="" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated;">`;
	} else {
		emojiEl.innerHTML=egg.emoji;
	}
	titleEl.textContent=egg.title;
	bodyEl.textContent =egg.body;
	vibrate([50,30,50,30,100]);
	if (!card.querySelector('.helu-halo')) {
		const halo=document.createElement('div'); halo.className='helu-halo';
		const noise=document.createElement('div'); noise.className='helu-noise';
		const ban=document.createElement('span'); ban.className='helu-banner'; ban.textContent='>> PLAYER 2 HAS JOINED <<';
		card.prepend(halo); card.prepend(noise); titleEl.before(ban);
	}
		const pixelCv=document.createElement('canvas'); pixelCv.id='helu-pixel-canvas';
	const edge  =document.createElement('div'); edge.id='helu-edge';
	const pillar=document.createElement('div'); pillar.id='helu-pillar';
	document.body.append(pixelCv,edge,pillar);
	setTimeout(()=>{ pixelCv.style.opacity='1'; heluInitCanvas(pixelCv); }, 80);
	overlay.classList.add('helu-active');
	card.classList.add('helu-active');
	overlay.style.display='flex';
	setTimeout(()=>{edge.style.display='block'; edge.classList.add('pulse');},240);
	setTimeout(()=>{heluSpawnRings(); heluSpawnGlitchLines();},500);
	setTimeout(()=>{heluSpawnRings(); heluSpawnGlitchLines();},750);
	setTimeout(()=>{pillar.style.display='block'; requestAnimationFrame(()=>pillar.style.height='52vh');},580);
}

function cleanupHelu() {
	['helu-pixel-canvas','helu-edge','helu-pillar'].forEach(id=>{const el=document.getElementById(id); if(el)el.remove();});
	if (heluPixelAnim) { cancelAnimationFrame(heluPixelAnim); heluPixelAnim=null; }
	const card=document.getElementById('easter-card');
	const overlay=document.getElementById('easter-overlay');
	if (card) { card.classList.remove('helu-active'); card.querySelectorAll('.helu-halo,.helu-noise,.helu-banner').forEach(el=>el.remove()); }
	if (overlay) overlay.classList.remove('helu-active');
	document.querySelectorAll('.helu-ring,.helu-glitch-line').forEach(e=>e.remove());
}


// ── Toast helper (non-blocking) ───────────────────────────────────
function showToast(message) {
	const existing = document.getElementById('easter-toast');
	if (existing) existing.remove();
	const toast = document.createElement('div');
	toast.id = 'easter-toast';
	toast.textContent = message;
	toast.setAttribute('style',
		'position:fixed; bottom:80px; left:50%; transform:translateX(-50%) translateY(20px);' +
		'background:rgba(0,58,112,0.92); color:#fff; padding:12px 22px;' +
		'border-radius:12px; font-size:13px; font-family:sans-serif;' +
		'z-index:10002; opacity:0; transition:opacity 0.3s ease, transform 0.3s ease;' +
		'max-width:300px; text-align:center; line-height:1.5; pointer-events:none;'
	);
	document.body.appendChild(toast);
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			toast.style.opacity = '1';
			toast.style.transform = 'translateX(-50%) translateY(0)';
		});
	});
	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateX(-50%) translateY(20px)';
		setTimeout(() => toast.remove(), 400);
	}, 4000);
}

// Gen chip toast handlers
document.querySelectorAll('.s-gen-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    if (chip.classList.contains('s-mandatory')) {
      showToast("You can't leave the Kanto region just yet!");
    } else if (chip.classList.contains('s-locked')) {
      showToast("This region is still locked. New Pokémon will appear soon!");
    }
  });
});


// ── Toast helper Ends ───────────────────────────────────

// ── GYM BATTLES: tap-to-unlock sequence ──────────────────────────
const GYM_TOASTS = [
    "Let's not rush into battles… baby hasn't even chosen a starter yet.",
    "Battles can wait… right now it's all about naps and tiny yawns.",
    "Let's save battles for later… today's mission is surviving diaper duty.",
    "Let's not skip ahead, baby's still in the tutorial level.",
    "Hey! Tiny Trainer hasn't even met Pikachu yet!",
    "Relax! Baby hasn't even unlocked 'crawl,' and you want battles?",
    "Patience! You're tapping like a Jigglypuff with a marker and no supervision.",
    "You again? This isn't a button-mashing contest… or is it?",
    "Fine… I'll make this section available soon. Baby's not ready, but clearly you are."
];

let gymTapCount = 0;

function applyGymLock() {
    const btn = document.getElementById('gym-battles-btn');
    const badge = document.getElementById('gym-coming-soon-badge');
    if (!btn) return;
    btn.classList.add('quiz-type-btn--coming-soon');
    btn.disabled = true;
    btn.title = 'Gym Battles Coming Soon!';
    const arrow = btn.querySelector('.qt-arrow');
    if (arrow) arrow.style.color = '#ddd';
    if (badge) badge.style.display = '';
}

function gymBattleTap() {
    if (gymTapCount >= 9) return;
    gymTapCount++;
    playClick();
    showToast(GYM_TOASTS[gymTapCount - 1]);
    if (gymTapCount >= 9) {
        setTimeout(applyGymLock, 2800);
    }
}
// ── GYM BATTLES END ──────────────────────────────────────────────



// ── 1. Logo tap milestones ────────────────────────────────────────
let logoTapCount = 0,
	logoTapTimer = null;

window.addEventListener('load', () => {
	showWelcomePopup(); // Welcome Popup Message
	const logo = document.getElementById('landing-logo');
	if (logo) {
		logo.style.cursor = 'pointer';
		logo.addEventListener('click', () => {
			logoTapCount++;
			if (logoTapTimer) clearTimeout(logoTapTimer);
			logoTapTimer = setTimeout(() => {
				logoTapCount = 0;
			}, 3000);

			if (logoTapCount === 3) {
				playHint();
				showToast("📱 Your nearest PokéStop is 3 taps away… wait, that's not how this works.");
			} else if (logoTapCount === 5) {
				playHint();
				showToast("👊 5 taps. That's rookie numbers. A real Pokémon Master wouldn't quit now.");
			} else if (logoTapCount >= 10) {
				logoTapCount = 0;
				playSecretJingle();
				celebrationConfetti(100);
				showEasterEgg('🏆', 'ACHIEVEMENT UNLOCKED: Obsessive Tapper',
					"Incredible! You’ve unlocked a secret meant only for the most observant Trainers!");
			}
		});
	}

	if (!('ontouchstart' in window)) {
		const hint = document.getElementById('swipe-hint');
		if (hint) hint.classList.add('hidden');
	}
});

// ── 2. Night mode ────────────────────────────────────────────────
function checkNightMode() {
  if (document.body.classList.contains('night-mode')) return;
  const h = new Date().getHours();
  if (h >= 23 || h < 4) {
	// ── Block all interaction for the entire night-mode sequence ──
    const nightBlocker = document.createElement('div');
    nightBlocker.id = 'night-mode-blocker';
    nightBlocker.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:all;';
    document.body.appendChild(nightBlocker);

    
    // ── Step 1: Play the chime immediately ────────────────────
    playNightChime();

    // ── Step 2: Start the slow visual transition RIGHT NOW ────
    // Player is on the landing screen — they can watch it darken
    document.body.style.transition = 'background 1.8s ease';
    document.body.style.background = '#1a1a2e';

    const card = document.querySelector('.card');
    if (card) {
      card.style.transition = 'background 1.8s ease, color 1.8s ease, box-shadow 1.8s ease';
      card.style.background = '#16213e';
      card.style.color  = '#e0e0e0';
      card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
    }

    // ── Step 3: Inject night-mode class + styles mid-transition ──
    // Do this at 1.4s so CSS overrides kick in as the fade is halfway done
    setTimeout(() => {
  document.body.classList.add('night-mode');
}, 800);

    // ── Step 4: Stars fade in alongside the darkening ─────────
    setTimeout(() => {
      if (!document.getElementById('night-stars')) {
        const stars = document.createElement('div');
        stars.id = 'night-stars';
        stars.setAttribute('style',
          'position:fixed;inset:0;pointer-events:none;z-index:-1;' +
          'background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E' +
          '%3Ccircle cx=\'20\' cy=\'30\' r=\'1\' fill=\'white\' opacity=\'0.6\'/%3E' +
          '%3Ccircle cx=\'80\' cy=\'10\' r=\'1.5\' fill=\'white\' opacity=\'0.4\'/%3E' +
          '%3Ccircle cx=\'150\' cy=\'50\' r=\'1\' fill=\'white\' opacity=\'0.7\'/%3E' +
          '%3Ccircle cx=\'40\' cy=\'80\' r=\'1\' fill=\'white\' opacity=\'0.3\'/%3E' +
          '%3Ccircle cx=\'120\' cy=\'90\' r=\'1.5\' fill=\'white\' opacity=\'0.5\'/%3E' +
          '%3Ccircle cx=\'170\' cy=\'20\' r=\'1\' fill=\'white\' opacity=\'0.6\'/%3E' +
          '%3Ccircle cx=\'60\' cy=\'150\' r=\'1\' fill=\'white\' opacity=\'0.4\'/%3E' +
          '%3Ccircle cx=\'190\' cy=\'140\' r=\'1.5\' fill=\'white\' opacity=\'0.5\'/%3E' +
          '%3C/svg%3E") repeat;opacity:0;transition:opacity 2s ease;'
        );
        document.body.appendChild(stars);
        setTimeout(() => { stars.style.opacity = '1'; }, 100);
      }
    }, 1000);

        // ── Step 5: Show the easter egg AFTER the transition is felt ──
    // Player has had ~2.6s to watch the screen darken before the overlay appears
    setTimeout(() => {
            const prevClose = onEasterEggClose;
      onEasterEggClose = () => {
        const b = document.getElementById('night-mode-blocker');
        if (b) b.remove();
        if (prevClose) prevClose();
      };

      showEasterEgg('🌙', "Shouldn't you be asleep, Trainer?",
        "It's late… but a true Pokémon Trainer never rests. \n\nTake care of yourself - even Ash sleeps sometimes.");
    }, 1600);
  }
}

// ── 3. Trainer name eggs ─────────────────────────────────────────
const TRAINER_EGGS = {
	'ash': {
		emoji: '🎯',
		img: 'img/ash.png',
		title: 'I wanna be the very best!',
		body: 'Like no one ever was! To catch them is your real test, to train them is your cause! Welcome, Ash.'
	},
	'gary': {
		emoji: '😏',
		img: 'img/gary.png',
		title: 'Smell ya later!',
		body: 'Difficulty auto-set to Hard. You asked for it, Gary.'
	},
	'misty': {
		emoji: '💧',
		img: 'img/misty.png',
		title: 'Togepiiiii!',
		body: 'The Cerulean City Gym Leader is here! Water-type Pokémon will feel extra familiar.'
	},
	'brock': {
		emoji: '🍳',
		img: 'img/brock.png',
		title: 'Leave it to me!',
		body: 'The Pewter City Gym Leader has arrived. Jelly-filled donuts for everyone!'
	},
	'biggchilll': {
		emoji: '📸',
		img: 'img/biggchilll.png',
		title: 'One ear, full focus!',
		body: 'Spots Pokémon faster than your camera spots his other ear. Sydney mode: always locked in.'
	},

	'ayaame92': {
		emoji: '❄️',
		img: 'img/ayaame92.png',
		title: 'Mystic never melts!',
		body: 'Delhi heat? Doesn’t matter. Accuracy: 100%. Loyalty: Team Mystic. Mercy: not found.'
	},

	'joshv009': {
		emoji: '🎤',
		img: 'img/joshv009.png',
		title: 'PvP legend speaks!',
		body: 'Analyzed your moves, predicted your loss… even between spreadsheets and meetings. Welcome, PvP Reporter!'
	},

	'rajeshhawks': {
		emoji: '🧠',
		img: 'img/rajeshhawks.png',
		title: 'Mentor has entered the chat!',
		body: 'Ahmedabad’s Mystic mastermind. If you lost, don’t worry, it was part of his lesson plan.'
	},

	'heartofapoke': {
		emoji: '💙',
		img: 'img/heartofapoke.png',
		title: 'All heart, all power!',
		body: 'Pure dedication, zero chill. When Mystic needs a carry, this legend shows up.'
	},

	'wiredbaba': {
		emoji: '😤',
		img: 'img/wiredbaba.png',
		title: 'Complains. Continues. Conquers?',
		body: 'Roasts Niantic like a daily quest, yet never misses a login. Emerald nostalgia keeping this trainer alive.'
	},

	'yyyash': {
		emoji: '🔥',
		img: 'img/yyyash.png',
		title: 'Valor made him do it!',
		body: 'Started with Pokémon GO, now out here battling like a veteran. Respect the grind.'
	},

	'63724': {
		emoji: '🐉',
		img: 'img/63724.png',
		title: 'Dragonite witness!',
		body: 'Saw a wild Dragonite once… and has never been the same since. Legends are born like this.'
	},
	'thewifey': [{
			emoji: '💛',
			img: 'img/thewifey.png',
			title: 'The Most Important Trainer!',
			body: "Yes, the quiz was literally built for you. No pressure. 😄"
		},
		{
			emoji: '💛️',
			img: 'img/thewifey.png',
			title: 'The Ultimate Champion',
			body: "You've already completed the hardest quest; growing a tiny trainer. This quiz should be easy!"
		},
		{
			emoji: '🥚',
			img: 'img/thewifey.png',
			title: 'An Egg Is About To Hatch!',
			body: "Professor Oak confirms: a brand new trainer is on the way! Until then, let's see if Mom still remembers her Pokémon."
		},
		{
			emoji: '✨',
			img: 'img/thewifey.png',
			title: 'The Shiny Trainer Appears!',
			body: "A rare and powerful trainer has appeared. Bonus points for carrying the rarest Pokémon of all: Baby!"
		},
		{
			emoji: '✨',
			img: 'img/thewifey.png',
			title: 'The Favorite Trainer',
			body: "Out of all the trainers in the world, you're the one I choose. Now go catch that high score."
		},
		{
			emoji: '🍼',
			img: 'img/thewifey.png',
			title: 'Future Pokémon Mom',
			body: "Soon you'll be raising two things: a baby and a new generation of Pokémon trainers."
		}
	],
	'helu': [{
			emoji: '🎮',
			img: 'img/helu.png',
			title: 'Player 2 Has Joined!',
			body: "From epic GameBoy SP battles to Pokémon Emerald marathons, the ultimate Trainer has arrived!"
		},
		{
			emoji: '🎮',
			img: 'img/helu.png',
			title: 'Rival Battle!',
			body: "Warning: childhood Pokémon rivalry detected. Prepare for intense sibling competition."
		},
		{
			emoji: '🕹️',
			img: 'img/helu.png',
			title: 'Chaos Black Survivor',
			body: "You didn’t just play Pokémon you survived the chaos, the glitches, and whatever Chaos Black threw at you."
		},
		{
			emoji: '⚡',
			img: 'img/helu.png',
			title: 'Sibling Rival Activated',
			body: "All childhood Pokémon debates are about to be settled. Once and for all."
		},
		{
			emoji: '🎲',
			img: 'img/helu.png',
			title: 'Battle Mode: ON',
			body: "You survived the sibling battles of childhood. This quiz should be easy."
		},
		{
			emoji: '💚',
			img: 'img/helu.png',
			title: 'Pokémon Emerald Veteran',
			body: "A trainer forged in the fires of GameBoy SP arguments enters the arena."
		}
	],

	'maulishmaster': [{
		emoji: '👑',
		img: 'img/maulishmaster.png',
		title: 'Step Carefully',
		body: 'That name carries weight beyond the screen. Every choice you make will be measured.'
	}],

	'missingno': null
};

function checkTrainerNameEgg(name) {
  const key = name.toLowerCase().replace(/\s+/g, '');

  // ── Alias map: alternate names → canonical egg key ──────────────
  const ALIASES = {
    'ashketchum':       'ash',
    'garyoak':          'gary',
    'mistywaterflower': 'misty',
	'sssiddhi':         'thewifey',
	'preeyanshee':      'helu',
    'brockslater':      'brock',
  };
  const resolvedKey = ALIASES[key] ?? key;

  if (resolvedKey === 'missingno') { triggerMissingNo(); return true; }
  if (resolvedKey === 'gary') { difficulty = 'hard'; document.getElementById('btn-easy').classList.remove('selected'); document.getElementById('btn-hard').classList.add('selected'); checkReady(); }
  if (resolvedKey === 'maulishmaster') {
    const variants = TRAINER_EGGS['maulishmaster'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playSecretJingle();
    setTimeout(() => triggerChosenOne(egg), 300);
    return true;
  }
  if (resolvedKey === 'thewifey') {
    const variants = TRAINER_EGGS['thewifey'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playWifeySound();
    setTimeout(() => triggerWifey(egg), 300);
    return true;
  }
  if (resolvedKey === 'helu') {
    const variants = TRAINER_EGGS['helu'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playHeluSound();
    setTimeout(() => triggerHelu(egg), 300);
    return true;
  }
  if (TRAINER_EGGS[resolvedKey]) {
    const egg = TRAINER_EGGS[resolvedKey];
    playSecretJingle();
    setTimeout(() => showEasterEgg(egg.emoji, egg.title, egg.body, egg.img || null), 300);
    return true;
  }
  return false;
}

// ── 4. MissingNo glitch ──────────────────────────────────────────
function triggerMissingNo() {
	playGlitchSound();
	vibrate([100, 50, 200, 50, 100, 50, 200, 50, 300]);

	// Block interaction during glitch
	const blocker = document.createElement('div');
	blocker.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:all;';
	document.body.appendChild(blocker);

	// Inject keyframe animations
	if (!document.getElementById('missingno-style')) {
		const s = document.createElement('style');
		s.id = 'missingno-style';
		s.textContent = `
			@keyframes mnShake {
				0%,100%{transform:translate(0,0) skewX(0deg)}
				10%{transform:translate(-10px,4px) skewX(-3deg)}
				20%{transform:translate(10px,-4px) skewX(3deg)}
				30%{transform:translate(-6px,8px) skewX(-2deg)}
				40%{transform:translate(12px,-3px) skewX(4deg)}
				50%{transform:translate(-4px,10px) skewX(-3deg)}
				60%{transform:translate(8px,-8px) skewX(2deg)}
				70%{transform:translate(-12px,3px) skewX(-4deg)}
				80%{transform:translate(5px,9px) skewX(3deg)}
				90%{transform:translate(-8px,-5px) skewX(-2deg)}
			}
			@keyframes mnChroma {
				0%,100%{text-shadow:3px 0 #00ffff,-3px 0 #ff00ff,0 0 20px #ff0000}
				25%{text-shadow:-5px 0 #ff0000,5px 0 #0000ff,0 0 30px #ff0000}
				50%{text-shadow:4px 0 #00ff00,-4px 0 #ff0000,0 0 25px #ffff00}
				75%{text-shadow:-3px 0 #ffff00,3px 0 #ff00ff,0 0 20px #00ffff}
			}
			@keyframes mnScan {
				0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)}
			}
			@keyframes mnBlink {
				0%,49%{opacity:1} 50%,100%{opacity:0}
			}
		`;
		document.head.appendChild(s);
	}

	const card = document.querySelector('.card');
	const body = document.body;
	const origBg = body.style.background;

	// ── Overlay layers ──────────────────────────────────────

	// 1. Red flash vignette
	const redFlash = document.createElement('div');
	redFlash.style.cssText = 'position:fixed;inset:0;z-index:9993;pointer-events:none;background:rgba(255,0,0,0);transition:background 0.05s;';
	body.appendChild(redFlash);

	// 2. Scanlines
	const scanlines = document.createElement('div');
	scanlines.style.cssText = 'position:fixed;inset:0;z-index:9994;pointer-events:none;opacity:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.18) 0px,rgba(0,0,0,0.18) 1px,transparent 1px,transparent 4px);transition:opacity 0.2s;';
	body.appendChild(scanlines);

	// 3. Scrolling scan beam
	const beam = document.createElement('div');
	beam.style.cssText = 'position:fixed;left:0;right:0;top:0;height:3px;z-index:9995;pointer-events:none;background:rgba(0,255,180,0.7);box-shadow:0 0 18px 6px rgba(0,255,180,0.5);opacity:0;';
	body.appendChild(beam);

	// 4. Noise canvas (small, scaled up for performance)
	const nc = document.createElement('canvas');
	nc.width = 120; nc.height = 200;
	nc.style.cssText = 'position:fixed;inset:0;z-index:9996;pointer-events:none;opacity:0;width:100%;height:100%;image-rendering:pixelated;transition:opacity 0.1s;';
	body.appendChild(nc);
	const nctx = nc.getContext('2d');

	// 5. Warning text
	const warn = document.createElement('div');
	warn.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9997;pointer-events:none;font-family:monospace;font-size:clamp(12px,3.5vw,20px);font-weight:900;color:#ff0000;text-align:center;letter-spacing:3px;opacity:0;line-height:1.8;';
	warn.innerHTML = '⚠ D̷A̸T̴A̷ &nbsp;C̶O̷R̸R̵U̷P̴T̵E̸D̷ ⚠<br><span style="font-size:0.7em;color:#ff4444;">M̵I̷S̶S̴I̷N̵G̶N̷O̸.&nbsp;D̷E̸T̷E̸C̸T̵E̸D̷</span>';
	body.appendChild(warn);

	function drawNoise(intensity) {
		const d = nctx.createImageData(nc.width, nc.height);
		for (let i = 0; i < d.data.length; i += 4) {
			if (Math.random() < intensity) {
				d.data[i]   = Math.random() * 255;
				d.data[i+1] = Math.random() < 0.3 ? 255 : 0;
				d.data[i+2] = Math.random() * 255;
				d.data[i+3] = 220;
			}
		}
		nctx.putImageData(d, 0, 0);
	}

	const FILTERS = [
		'invert(1) hue-rotate(180deg)',
		'invert(1) hue-rotate(90deg) saturate(8)',
		'invert(0.9) hue-rotate(270deg) brightness(2.5)',
		'saturate(12) hue-rotate(120deg) contrast(2)',
		'invert(1) brightness(4) contrast(0.4)',
		'hue-rotate(240deg) saturate(10) brightness(1.8)',
		'invert(0.6) sepia(1) hue-rotate(180deg) saturate(8)',
		'brightness(0.1) invert(1)',
		'contrast(5) saturate(0)',
	];

	const BG_COLORS = ['#ff0000','#00ff00','#0000ff','#ff00ff','#00ffff','#ffff00','#1a1a2e','#FFCB05'];
	let tick = 0;
	const TOTAL = 22;

	const glitch = setInterval(() => {
		tick++;

		// Cycle dramatic filters
		card.style.filter = FILTERS[tick % FILTERS.length];

		// Red vignette flash
		redFlash.style.background = `rgba(255,0,0,${(Math.random() * 0.55).toFixed(2)})`;

		// Body BG corruption
		body.style.background = BG_COLORS[tick % BG_COLORS.length];

		// Scanlines ramp up
		scanlines.style.opacity = Math.min(tick / TOTAL * 0.9, 0.85).toString();

		// Scan beam fires from tick 5
		if (tick === 5) {
			beam.style.opacity = '1';
			beam.style.animation = 'mnScan 0.4s linear infinite';
		}

		// Card shake starts tick 7
		if (tick === 7) {
			card.style.animation = 'mnShake 0.12s infinite';
		}

		// Warning text appears tick 9
		if (tick === 9) {
			warn.style.opacity = '1';
			warn.style.animation = 'mnChroma 0.1s infinite, mnBlink 0.25s infinite';
		}

		// Noise builds from tick 13
		if (tick > 13) {
			const intensity = 0.08 + (tick - 13) * 0.06;
			nc.style.opacity = Math.min((tick - 13) * 0.12, 0.7).toString();
			drawNoise(intensity);
		}

		// Extra vibration bursts
		if (tick % 5 === 0) vibrate([80, 30, 120, 30, 80]);

		// ── PEAK: white flash ──
		if (tick === TOTAL) {
			clearInterval(glitch);
			card.style.filter = 'brightness(15) invert(1)';
			card.style.animation = 'none';
			nc.style.opacity = '0.9';
			drawNoise(0.9);
			body.style.background = '#ffffff';
			warn.style.opacity = '0';
			vibrate([200, 50, 200, 50, 400]);

			// ── Fade out then reveal easter egg ──
			setTimeout(() => {
				body.style.transition = 'background 0.3s';
				body.style.background = origBg || '#FFCB05';
				card.style.transition = 'filter 0.3s';
				card.style.filter = 'none';
				nc.style.opacity = '0';
				redFlash.style.background = 'rgba(0,0,0,0)';
				scanlines.style.opacity = '0';
				beam.style.opacity = '0';

				setTimeout(() => {
					body.style.transition = '';
					card.style.transition = '';
					[redFlash, scanlines, beam, nc, warn].forEach(el => el.remove());
					blocker.remove();
					showEasterEgg('👾', 'E̷R̵R̴O̸R̷: M̸I̷S̶S̴I̵N̷G̸N̵O̴.',
						"A wild MissingNo. appeared and corrupted the quiz data! 😅\n\nThat Trainer Name can't be registered. Please choose a different one!");
				}, 350);
			}, 180);
		}
	}, 95);
}

// ── 5. 100% Mew easter egg ───────────────────────────────────────
function triggerMewEasterEgg() {
	playMewChime();
	const mew = document.createElement('img');
	mew.src = gifUrl('mew');
	mew.style.cssText = `
    position:fixed; bottom:-80px; left:50%; transform:translateX(-50%);
    width:80px; height:80px; object-fit:contain; z-index:9998;
    transition: bottom 1.2s cubic-bezier(0.22,1,0.36,1), opacity 1s;
    pointer-events:none; image-rendering:pixelated;
  `;
	document.body.appendChild(mew);
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			mew.style.bottom = '120px';
		});
	});
	setTimeout(() => {
		mew.style.opacity = '0';
	}, 3200);
	setTimeout(() => {
		mew.remove();
	}, 4400);
	setTimeout(() => {
		showEasterEgg('✨', 'A Wild Mew Appeared!',
			'You scored 100%! Only the rarest trainers ever see Mew.\n\nYou are one of them. 🌟');
	}, 1400);
}

// ── 6. Long-press sprite for cry ─────────────────────────────────
let longPressTimer = null;

function attachLongPress(imgEl, pokemonId) {
	const start = () => {
		longPressTimer = setTimeout(() => {
			longPressTimer = null;
			vibrate([30, 20, 30]);
			playLearnCry(pokemonId);
		}, 600);
	};
	const cancel = () => {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	};
	imgEl.onmousedown = start;
	imgEl.ontouchstart = start;
	imgEl.onmouseup = cancel;
	imgEl.onmouseleave = cancel;
	imgEl.ontouchend = cancel;
}

function playLearnCry(pokemonId) {
	if (!soundOn) return;
	const cry = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`);
	cry.volume = 0.5 * sfxVolume;
	cry.play().catch(() => {});
}

// ════════════════════════════════════════════════════════════════
// ── INIT
// ════════════════════════════════════════════════════════════════

document.addEventListener('touchstart', () => getCtx(), {
	once: true,
	passive: true
});
document.addEventListener('mousedown', () => getCtx(), {
	once: true
});

// ── Swipe ────────────────────────────────────────────────────────
let touchStartX = 0,
	touchStartY = 0,
	swipeCount = 0;
const MAX_SWIPE_HINTS = 3;
document.getElementById('learn-detail-screen').addEventListener('touchstart', e => {
	touchStartX = e.changedTouches[0].screenX;
	touchStartY = e.changedTouches[0].screenY;
}, {
	passive: true
});
document.getElementById('learn-detail-screen').addEventListener('touchend', e => {
	const dx = e.changedTouches[0].screenX - touchStartX;
	const dy = e.changedTouches[0].screenY - touchStartY;
	if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) learnNavigate(1);
		else learnNavigate(-1);
		swipeCount++;
		if (swipeCount >= MAX_SWIPE_HINTS) {
			const hint = document.getElementById('swipe-hint');
			if (hint) hint.classList.add('hidden');
		}
	}
}, {
	passive: true
});

// ── Navigation ───────────────────────────────────────────────────
function goToWelcome(type) {
	playClick();
	if (type === 'whos' && soundOn) {
		playWhosThatAudio();
	}
	quizType = type;
	difficulty = null;
	quizMode = 'quick';
	document.getElementById('btn-easy').classList.remove('selected');
	document.getElementById('btn-hard').classList.remove('selected');
	document.getElementById('start-btn').textContent = 'Start Quiz!';
	document.getElementById('btn-quick').classList.add('active');
	document.getElementById('btn-full').classList.remove('active');
	const titles = {
  whos:     ["Who's That Pokémon?",  "Full sprite shown",              "Silhouette only"],
  identify: ["Identify the Pokémon", "Name shown, pick the image",     "Name shown, pick the silhouette"],
  evo:      ["Spot the Evolution",   "Pick evolution with clear images",  "Pick evolution with silhouettes"]
};
	const [title, easyD, hardD] = titles[type];
	document.getElementById('welcome-title').textContent = title;
	document.getElementById('easy-desc').textContent = easyD;
	document.getElementById('hard-desc').textContent = hardD;
	showScreen('welcome-screen');
}

function goHome() {
	playClick();
	stopLearnAudio();
	stopResultAudio();
	stopWhosThatAudio();
	clearAutoNext();
	unduckBgm();
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
	questions = [];
	currentQ = 0;
	correctCount = 0;
	answeredCount = 0;
	showScreen('landing-screen');
	const sb = document.getElementById('start-btn');
	if (sb) {
		sb.disabled = false;
		sb.textContent = 'Start Quiz!';
	}
}

document.getElementById('player-name').addEventListener('input', checkReady);

function selectMode(m) {
	playClick();
	quizMode = m;
	document.getElementById('btn-quick').classList.toggle('active', m === 'quick');
	document.getElementById('btn-full').classList.toggle('active', m === 'full');
}

function selectDiff(d) {
	playClick();
	difficulty = d;
	document.getElementById('btn-easy').classList.toggle('selected', d === 'easy');
	document.getElementById('btn-hard').classList.toggle('selected', d === 'hard');
	checkReady();
}

function checkReady() {
	const nameOk = document.getElementById('player-name').value.trim().length > 0;
	document.getElementById('start-btn').disabled = !(difficulty && nameOk);
}

async function loadPokemonList() {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    allPokemon = data.results.map((p, i) => ({ id: i + 1, name: p.name }));
  } catch(e) {
    showToast("⚠️ Couldn't reach Professor Oak's lab. Check your connection and try again!");
    const btn = document.getElementById('start-btn');
    btn.disabled = false;
    btn.textContent = 'Try Again';
  }
}

async function getEvolutionChain(pokemonId) {
	const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
	const specData = await specRes.json();
	const chainRes = await fetch(specData.evolution_chain.url);
	const chainData = await chainRes.json();
	const list = [];
	const parentMap = {},
		childrenMap = {};

	function walk(node, parent) {
		const p = allPokemon.find(x => x.name === node.species.name);
		if (!p) return;
		list.push(p);
		parentMap[p.name] = parent || null;
		childrenMap[p.name] = [];
		if (parent) childrenMap[parent.name].push(p);
		node.evolves_to.forEach(c => walk(c, p));
	}
	walk(chainData.chain, null);
	return {
		allMembers: list,
		parentMap,
		childrenMap
	};
}
async function getGen1EvoSiblings(pokemonId) {
	try {
		const {
			allMembers
		} = await getEvolutionChain(pokemonId);
		return allMembers.filter(p => p.id !== pokemonId);
	} catch (e) {
		return [];
	}
}

async function buildEvoQuestion(subject) {
	const {
		parentMap,
		childrenMap
	} = await getEvolutionChain(subject.id);
	const dir = Math.random() < 0.5 ? 'next' : 'prev';
	let answer = null,
		answerIsNone = false;
	if (dir === 'next') {
		const ch = childrenMap[subject.name] || [];
		if (ch.length === 0) answerIsNone = true;
		else if (ch.length === 1) answer = ch[0];
		else answer = ch[Math.floor(Math.random() * ch.length)];
	} else {
		const par = parentMap[subject.name];
		if (!par) answerIsNone = true;
		else answer = par;
	}
	return {
		subject,
		direction: dir,
		answer,
		answerIsNone
	};
}
async function buildOptions(correct) {
	let evoDecoy = null;
	if (difficulty === 'hard' && quizType === 'whos') {
		const sib = await getGen1EvoSiblings(correct.id);
		if (sib.length > 0) evoDecoy = sib[Math.floor(Math.random() * sib.length)];
	}
	const excl = new Set([correct.id]);
	if (evoDecoy) excl.add(evoDecoy.id);
	const pool = allPokemon.filter(x => !excl.has(x.id)).sort(() => Math.random() - .5);
	const opts = [correct];
	if (evoDecoy) opts.push(evoDecoy);
	pool.slice(0, 4 - opts.length).forEach(p => opts.push(p));
	return opts.sort(() => Math.random() - .5);
}

function buildEvoOptions(evoQ) {
	const {
		answer,
		answerIsNone,
		subject
	} = evoQ;
	const excl = new Set([subject.id]);
	if (answer) excl.add(answer.id);
	const pool = allPokemon.filter(x => !excl.has(x.id)).sort(() => Math.random() - .5);
	if (answerIsNone) return [{
		isNone: true
	}, ...pool.slice(0, 3)].sort(() => Math.random() - .5);
	return [answer, {
		isNone: true
	}, ...pool.slice(0, 2)].sort(() => Math.random() - .5);
}

async function startGame() {
	sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
	getCtx();
	stopWhosThatAudio();
	const rawName = document.getElementById('player-name').value.trim();
	playClick();
	playerName = rawName;
	lsSet('pokemommy_trainer_name', rawName);
	document.getElementById('start-btn').disabled = true;
	document.getElementById('start-btn').textContent = 'Loading…';
	if (!allPokemon.length) await loadPokemonList();
	const shuffled = [...allPokemon].sort(() => Math.random() - .5);
	const pool = quizMode === 'full' ? shuffled : shuffled.slice(0, QUICK_COUNT);
	questions = pool.map(p => ({
		correct: p,
		options: null,
		evoQ: null
	}));
	currentQ = 0;
	correctCount = 0;
	answeredCount = 0;
	wrongAnswers = [];
	document.getElementById('q-total').textContent = questions.length;
	document.getElementById('player-display').textContent = playerName;
	const genderImg = document.getElementById('trainer-gender-img');
	if (genderImg) genderImg.src = playerGender === 'girl' ? 'img/girl_ow.png' : 'img/boy_ow.png';
	document.getElementById('whos-section').style.display = quizType === 'whos' ? 'block' : 'none';
	document.getElementById('identify-section').style.display = quizType === 'identify' ? 'block' : 'none';
	document.getElementById('evo-section').style.display = quizType === 'evo' ? 'block' : 'none';
	showScreen('game-screen');
	await preloadQuestionImages(0, 2);
	renderQuestion();
	preloadQuestionImages(2, 4);


	startTimer();
}



async function preloadQuestionImages(startIdx, count) {
	const toLoad = questions.slice(startIdx, startIdx + count);
	for (const q of toLoad) {
		if (quizType === 'evo') {
			if (!q.evoQ) q.evoQ = await buildEvoQuestion(q.correct);
			if (!q.evoQ.options) q.evoQ.options = buildEvoOptions(q.evoQ);
			q.evoQ.options.filter(o => !o.isNone).forEach(o => {
				new Image().src = gifUrl(o.name);
			});
		} else {
			if (!q.options) q.options = await buildOptions(q.correct);
			q.options.forEach(o => {
				new Image().src = gifUrl(o.name);
			});
		}
	}
}

async function renderQuestion() {
	duckBgm();
	clearAutoNext();
	preloadQuestionImages(currentQ + 1, 5);
	const q = questions[currentQ];
	hintsRevealed = 0;
	currentPokemonData = null;
	document.getElementById('hint-cards').innerHTML = '';
	[1, 2, 3].forEach(i => {
		const b = document.getElementById(`hint-btn-${i}`);
		b.classList.remove('used');
		b.disabled = i !== 1;
	});
	document.getElementById('feedback-msg').textContent = '';
	const _nxt = document.getElementById('next-btn');
_nxt.style.display = 'block';
_nxt.disabled = true;
_nxt.style.opacity = '0.4';
_nxt.style.cursor = 'not-allowed';
	document.getElementById('progress-fill').style.width = (currentQ / questions.length * 100) + '%';
	document.getElementById('q-num').textContent = currentQ + 1;
	updateAccuracy();
	if (quizType === 'whos') {
		if (!q.options) q.options = await buildOptions(q.correct);
		renderWhosQuestion(q);
	} else if (quizType === 'identify') {
		if (!q.options) q.options = await buildOptions(q.correct);
		renderIdentifyQuestion(q);
	  } else {
    if (!q.evoQ) q.evoQ = await buildEvoQuestion(q.correct);
    if (!q.evoQ.options) q.evoQ.options = buildEvoOptions(q.evoQ);
    renderEvoQuestion(q.evoQ);
  }
  animateQuestionIn();
}

function renderWhosQuestion(q) {
	const img = document.getElementById('pokemon-img'),
		spn = document.getElementById('spinner');

	document.getElementById('options-grid').innerHTML = '';

  img.style.opacity = 0;
  spn.style.display = 'block';
  const whosSk = document.getElementById('whos-skeleton');
  if (whosSk) whosSk.style.opacity = '1';

	// ⭐ CRITICAL: reset FIRST
	img.classList.remove('silhouette');

	// ⭐ apply silhouette BEFORE src load
	if (difficulty === 'hard') {
		img.classList.add('silhouette');
	}

	  img.onload = () => {
    spn.style.display = 'none';
    img.style.opacity = 1;
    const sk = document.getElementById('whos-skeleton');
    if (sk) sk.style.opacity = '0';
    preloadNext();
  }

	img.onerror = () => {
		img.onerror = null;
		img.src = fallbackUrl(q.correct.id);
	};

	img.src = gifUrl(q.correct.name);

	q.options.forEach(opt => {
		const btn = document.createElement('button');
		btn.className = 'opt-btn';
		btn.textContent = displayName(opt.name);
		btn.style.fontFamily = "'Flexo', sans-serif";
		btn.onclick = () =>
			checkAnswer('whos', opt.name, q.correct.name, btn);

		document.getElementById('options-grid').appendChild(btn);
	});
}

function renderIdentifyQuestion(q) {
	const nameEl = document.getElementById('identify-name');
	nameEl.textContent = displayName(q.correct.name);
	nameEl.style.fontFamily = "'Flexo', sans-serif";
	const grid = document.getElementById('img-options-grid');
	grid.innerHTML = '';

	let loadedCount = 0;
	const total = q.options.length;

	function onOneLoaded(img, spin) {
		
		spin.style.display = 'none';
		loadedCount++;
		if (loadedCount === total) {
			grid.querySelectorAll('.img-opt-btn img').forEach(i => i.style.opacity = '1');
		}
	}

	q.options.forEach(opt => {
		const btn = document.createElement('button');
		btn.className = 'img-opt-btn';
		btn.dataset.name = opt.name;
		const spin = document.createElement('div');
		spin.className = 'img-opt-spinner';
		const img = document.createElement('img');
		img.alt = opt.name;
		img.style.opacity = '0';
		if (difficulty === 'hard') img.classList.add('silhouette');
		img.onload = () => onOneLoaded(img, spin);
		img.onerror = () => {
			img.onerror = null;
			img.src = fallbackUrl(opt.id);
			onOneLoaded(img, spin);
		};
		img.src = gifUrl(opt.name);
		btn.appendChild(spin);
		btn.appendChild(img);
		btn.onclick = () => checkAnswer('identify', opt.name, q.correct.name, btn);
		grid.appendChild(btn);
	});
}

function renderEvoQuestion(evoQ) {
  const img = document.getElementById('evo-pokemon-img'), spn = document.getElementById('evo-spinner');
  img.style.opacity = 0;
  spn.style.display = 'block';
  const evoSk = document.getElementById('evo-skeleton');
  if (evoSk) evoSk.style.opacity = '1';

  // Three gates: subject loaded, all options loaded, minimum read-delay elapsed
  let subjectReady = false, optionsReady = false, minDelayDone = false;
  const tryRevealOptions = () => {
    if (subjectReady && optionsReady && minDelayDone) {
      document.getElementById('evo-options-grid')
        .querySelectorAll('.evo-opt-btn img')
        .forEach(i => { i.style.opacity = 1; });
    }
  };
  setTimeout(() => { minDelayDone = true; tryRevealOptions(); }, 380);

  img.onload = () => {
  spn.style.display = 'none';
  img.style.opacity = 1; 
  if (evoSk) evoSk.style.opacity = 0;
  subjectReady = true;
  tryRevealOptions();                     
};
  img.onerror = () => { img.onerror = null; img.src = fallbackUrl(evoQ.subject.id); }
  img.src = gifUrl(evoQ.subject.name);
	const visualRow = document.getElementById('evo-visual-row');
	const subjectWrap = document.getElementById('evo-question-img-wrap');
	visualRow.innerHTML = '';
	const arrow = document.createElement('div');
	arrow.className = 'evo-arrow';
	const aLine = document.createElement('div');
	aLine.className = 'evo-arrow-line';
	aLine.textContent = '→';
	const aLbl = document.createElement('div');
	aLbl.className = 'evo-arrow-label';
	aLbl.style.fontFamily = "'Flexo', sans-serif";
	aLbl.textContent = evoQ.direction === 'next' ? 'evolves into?' : 'evolved from?';
	arrow.appendChild(aLine);
	arrow.appendChild(aLbl);
	const qWrap = document.createElement('div');
	qWrap.className = 'evo-qmark-wrap';
	const qMark = document.createElement('div');
	qMark.className = 'evo-qmark';
	qMark.textContent = '?';
	qWrap.appendChild(qMark);
	if (evoQ.direction === 'next') {
		visualRow.appendChild(subjectWrap);
		visualRow.appendChild(arrow);
		visualRow.appendChild(qWrap);
	} else {
		visualRow.appendChild(qWrap);
		visualRow.appendChild(arrow);
		visualRow.appendChild(subjectWrap);
	}
	const grid = document.getElementById('evo-options-grid');
	grid.innerHTML = '';
	const evoTotal = evoQ.options.filter(o => !o.isNone).length;
	let evoLoadedCount = 0;
	evoQ.options.forEach(opt => {
		const btn = document.createElement('button');
		if (opt.isNone) {
			btn.className = 'evo-opt-btn none-tile';
			btn.dataset.isNone = 'true';
			const icon = document.createElement('div');
			icon.className = 'none-icon';
			icon.textContent = '✖️';
			const lbl = document.createElement('div');
			lbl.className = 'none-label';
			lbl.style.fontFamily = "'Flexo', sans-serif";
			lbl.textContent = evoQ.direction === 'next' ? 'Does not evolve' : 'No pre-evolution';
			btn.appendChild(icon);
			btn.appendChild(lbl);
			btn.onclick = () => checkEvoAnswer(btn, evoQ, true);
		} else {
			btn.className = 'evo-opt-btn';
			btn.dataset.name = opt.name;
			const spin = document.createElement('div');
			spin.className = 'evo-opt-spinner';
			const img2 = document.createElement('img');
			img2.alt = opt.name;
			img2.style.opacity = '0';
			if (difficulty === 'hard') img2.classList.add('silhouette');  // ← before src
        img2.onload = () => {
          spin.style.display = 'none';
          evoLoadedCount++;
          if (evoLoadedCount >= evoTotal) { optionsReady = true; tryRevealOptions(); }
        };
        img2.onerror = () => {
          img2.onerror = null; img2.src = fallbackUrl(opt.id);
          evoLoadedCount++;
          if (evoLoadedCount >= evoTotal) { optionsReady = true; tryRevealOptions(); }
        };
			img2.src = gifUrl(opt.name);
			const cap = document.createElement('div');
			cap.className = 'evo-caption';
			cap.style.fontFamily = "'Flexo', sans-serif";
			cap.textContent = difficulty === 'hard' ? '???' : displayName(opt.name);
			btn.appendChild(spin);
			btn.appendChild(img2);
			btn.appendChild(cap);
			btn.onclick = () => checkEvoAnswer(btn, evoQ, false, opt.name);
		}
		grid.appendChild(btn);
	});
}


function animateQuestionIn() {
  const sectionId = quizType === 'whos'     ? 'whos-section'
                  : quizType === 'identify' ? 'identify-section'
                  : 'evo-section';
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.classList.remove('q-entering');
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add('q-entering');
}


function clearAutoNext() {
	if (autoNextTimer) {
		clearInterval(autoNextTimer);
		autoNextTimer = null;
	}
	const nxt = document.getElementById('next-btn');
	if (nxt) nxt.textContent = currentQ < questions.length - 1 ? 'Next →' : 'See Results 🏆';
}

function startAutoNext(isLast) {
	let remaining = 5;
	const nxt = document.getElementById('next-btn');
	const baseLabel = isLast ? 'See Results 🏆' : 'Next →';
	nxt.textContent = `${baseLabel} (${remaining}s)`;
	autoNextTimer = setInterval(() => {
		remaining--;
		if (remaining <= 0) {
			clearAutoNext();
			nextQuestion();
		} else {
			nxt.textContent = `${baseLabel} (${remaining}s)`;
		}
	}, 1000);
}

function checkAnswer(type, chosen, correct, btn) {
  if (type === 'whos') {
    document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
    document.getElementById('pokemon-img').className = '';
  } else {
    document.querySelectorAll('.img-opt-btn').forEach(b => {
      b.disabled = true;
      const i = b.querySelector('img');
      if (i) i.classList.remove('silhouette');
    });
  }
  [1, 2, 3].forEach(i => document.getElementById(`hint-btn-${i}`).disabled = true);
  answeredCount++;
  const fb = document.getElementById('feedback-msg');
  if (chosen === correct) {
    correctCount++;
    btn.classList.add('correct');
    fb.textContent = `✅ Correct! It's ${displayName(correct)}!`;
    fb.style.color = '#28a745';
    playCorrect();
  } else {
    // ── Record mistake ──────────────────────────────────────────
    wrongAnswers.push({
      correctName: correct,
      correctId:   questions[currentQ].correct.id,
      chosenName:  chosen !== correct ? chosen : null,
      quizType:    type
    });
    // ────────────────────────────────────────────────────────────
    btn.classList.add('wrong');
    if (type === 'whos') document.querySelectorAll('.opt-btn').forEach(b => {
      if (b.textContent === displayName(correct)) b.classList.add('correct');
    });
    else document.querySelectorAll('.img-opt-btn').forEach(b => {
      if (b.dataset.name === correct) b.classList.add('correct');
    });
    fb.textContent = `❌ It was ${displayName(correct)}!`;
    fb.style.color = '#dc3545';
    playWrong();
  }
  updateAccuracy();
  const nxt = document.getElementById('next-btn');
  nxt.style.display = 'block';
  nxt.disabled = false;
  nxt.style.opacity = '';
  nxt.style.cursor = '';
  startAutoNext(currentQ >= questions.length - 1);
}

function checkEvoAnswer(btn, evoQ, choseNone, chosenName) {
	document.querySelectorAll('.evo-opt-btn').forEach(b => {
		b.disabled = true;
		const img = b.querySelector('img');
		if (img) img.classList.remove('silhouette');
		const cap = b.querySelector('.evo-caption');
		if (cap && b.dataset.name) cap.textContent = displayName(b.dataset.name);
	});
	[1, 2, 3].forEach(i => document.getElementById(`hint-btn-${i}`).disabled = true);
	answeredCount++;
	const fb = document.getElementById('feedback-msg');
	const isCorrect = choseNone === evoQ.answerIsNone && (!choseNone ? chosenName === evoQ.answer?.name : true);
	if (isCorrect) {
		correctCount++;
		btn.classList.add('correct');
		const msg = evoQ.answerIsNone ? (evoQ.direction === 'next' ? 'It does not evolve!' : 'It has no pre-evolution!') : `It's ${displayName(evoQ.answer.name)}!`;
		fb.textContent = `✅ Correct! ${msg}`;
		fb.style.color = '#28a745';
		playCorrect();
	  } else {
    wrongAnswers.push({
      correctName: evoQ.answerIsNone ? '(no evolution)' : evoQ.answer?.name,
      correctId: evoQ.answerIsNone ? null : evoQ.answer?.id,
      chosenName: choseNone ? '(none)' : chosenName,
      quizType: 'evo',
      subjectName: evoQ.subject.name,
      subjectId: evoQ.subject.id,
      direction: evoQ.direction
    });
    btn.classList.add('wrong');
    document.querySelectorAll('.evo-opt-btn').forEach(b => {
			if (evoQ.answerIsNone && b.dataset.isNone) b.classList.add('correct');
			else if (!evoQ.answerIsNone && b.dataset.name === evoQ.answer?.name) b.classList.add('correct');
		});
		const msg = evoQ.answerIsNone ? (evoQ.direction === 'next' ? 'It does not evolve!' : 'It has no pre-evolution!') : `It was ${displayName(evoQ.answer.name)}!`;
		fb.textContent = `❌ ${msg}`;
		fb.style.color = '#dc3545';
		playWrong();
	}
	updateAccuracy();
	const nxt = document.getElementById('next-btn');
	nxt.style.display = 'block';
	nxt.disabled = false;
	nxt.style.opacity = '';
	nxt.style.cursor = '';
	startAutoNext(currentQ >= questions.length - 1);
}

async function revealHint(level) {
	if (hintsRevealed >= level) return;
	playHint();
	if (!currentPokemonData) {
		const id = quizType === 'evo' ? questions[currentQ].evoQ.subject.id : questions[currentQ].correct.id;
		const [pr, sr] = await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`), fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)]);
		currentPokemonData = {
			...await pr.json(),
			species: await sr.json()
		};
	}
	hintsRevealed = level;
	for (let i = 1; i <= level; i++) {
		const b = document.getElementById(`hint-btn-${i}`);
		b.classList.add('used');
		b.disabled = true;
	}
	if (level < 3) document.getElementById(`hint-btn-${level+1}`).disabled = false;
	const card = document.createElement('div');
	card.className = 'hint-card';
	if (level === 1) {
  const g = currentPokemonData.species.genera.find(g => g.language.name === 'en');
  card.innerHTML = `<strong>Hint 1 - Category</strong><br>${g ? g.genus : 'Unknown'}`;
} else if (level === 2) {
  const b = currentPokemonData.types.map(t => `<span class="type-badge t-${t.type.name}">${capitalize(t.type.name)}</span>`).join(' ');
  card.innerHTML = `<strong>Hint 2 - Type</strong><br>${b}`;
} else {
  const e = currentPokemonData.species.flavor_text_entries.find(e => e.language.name === 'en' && (e.version.name === 'red' || e.version.name === 'blue')) ||
            currentPokemonData.species.flavor_text_entries.find(e => e.language.name === 'en');
  card.innerHTML = `<strong>Hint 3 - Pokédex Entry</strong><br><span class="entry-text">${e ? e.flavor_text.replace(/\f/g, ' ') : 'No entry found.'}</span>`;
}
	document.getElementById('hint-cards').appendChild(card);
}

// ── Pokédex ──────────────────────────────────────────────────────
let learnAudio = null,
	learnCurrentId = null,
	learnPreviousScreen = 'learn-browse-screen';

async function openLearn() {
	playClick();
	if (!allPokemon.length) await loadPokemonList();
	document.getElementById('learn-search').value = '';
	buildLearnGrid(allPokemon);
	showScreen('learn-browse-screen');
}

function buildLearnGrid(list) {
	const grid = document.getElementById('learn-grid');
	grid.innerHTML = '';
	list.forEach(p => {
		const card = document.createElement('div');
		card.className = 'learn-card';
		card.onclick = () => openLearnDetail(p.id);
		const img = document.createElement('img');
		img.src = gifUrl(p.name);
		img.loading = 'lazy'; 
		img.decoding = 'async';
		img.onerror = () => {
			img.onerror = null;
			img.src = fallbackUrl(p.id);
		};
		img.style.cursor = 'pointer';
		attachLongPress(img, p.id);
		const num = document.createElement('div');
		num.className = 'lc-num';
		num.textContent = '#' + String(p.id).padStart(3, '0');
		const name = document.createElement('div');
		name.className = 'lc-name';
		name.style.fontFamily = "'Flexo', sans-serif";
		name.textContent = displayName(p.name);
		card.appendChild(img);
		card.appendChild(num);
		card.appendChild(name);
		grid.appendChild(card);
	});
}

function filterLearnList() {
	const q = document.getElementById('learn-search').value.trim().toLowerCase();
	buildLearnGrid(allPokemon.filter(p => displayName(p.name).toLowerCase().includes(q) || String(p.id).padStart(3, '0').includes(q)));
}
async function openLearnDetail(pokemonId, fromBrowse = true) {
	learnCurrentId = pokemonId;
	if (fromBrowse) learnPreviousScreen = 'learn-browse-screen';
	const sprite = document.getElementById('learn-sprite'),
		spn = document.getElementById('learn-spinner');
	sprite.style.opacity = '0';
	spn.style.display = 'block';
	document.getElementById('learn-detail-name').textContent = '…';
	document.getElementById('learn-detail-num').textContent = '…';
	document.getElementById('learn-category').textContent = '…';
	document.getElementById('learn-type').innerHTML = '';
	document.getElementById('learn-dex-entry').textContent = 'Loading…';
	document.getElementById('learn-evo-line').innerHTML = '';
	document.getElementById('learn-speaker-btn').classList.remove('playing');
	stopLearnAudio();
	document.getElementById('learn-nav-prev').disabled = pokemonId === 1;
	document.getElementById('learn-nav-next').disabled = pokemonId === 151;
	showScreen('learn-detail-screen');
	let pokeData, specData;
try {
  const [pr, sr] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
  ]);
  if (!pr.ok || !sr.ok) throw new Error('API error');
  pokeData = await pr.json();
  specData = await sr.json();
} catch(e) {
  document.getElementById('learn-spinner').style.display = 'none';
  document.getElementById('learn-dex-entry').textContent =
    "⚠️ Couldn't reach Professor Oak's lab — check your connection.";
  showToast("⚠️ Couldn't load Pokémon data. Check your connection!");
  return;
}
	
	const p = allPokemon.find(x => x.id === pokemonId);
	sprite.onload = () => {
		spn.style.display = 'none';
		sprite.style.opacity = '1';
	};
	sprite.onerror = () => {
		sprite.onerror = null;
		sprite.src = fallbackUrl(pokemonId);
	};
	sprite.src = gifUrl(p.name);
	attachLongPress(sprite, pokemonId);
	const nameEl = document.getElementById('learn-detail-name');
	nameEl.textContent = displayName(p.name);
	nameEl.style.fontFamily = "'Flexo', sans-serif";
	nameEl.style.webkitTextStroke = 'none';
	document.getElementById('learn-detail-num').textContent = '#' + String(pokemonId).padStart(3, '0');
	const genus = specData.genera.find(g => g.language.name === 'en');
	document.getElementById('learn-category').textContent = genus ? genus.genus : '—';
	document.getElementById('learn-type').innerHTML = pokeData.types
		.map(t => `<span class="type-badge t-${t.type.name}" style="margin-right:4px">${capitalize(t.type.name)}</span>`).join('');
	const entry = specData.flavor_text_entries.find(e => e.language.name === 'en' && (e.version.name === 'red' || e.version.name === 'blue')) || specData.flavor_text_entries.find(e => e.language.name === 'en');
	document.getElementById('learn-dex-entry').textContent = entry ? entry.flavor_text.replace(/[\f\n\r]/g, ' ') : 'No Pokédex entry available.';

	if (learnCurrentId !== pokemonId) return; // ← If navigated away, abort

	if (soundOn) {
		stopLearnAudio();
		const btn = document.getElementById('learn-speaker-btn');
		btn.classList.add('playing');
		learnAudio = new Audio(`sounds/eng_${String(pokemonId).padStart(3,'0')}.mp3`);
		learnAudio.volume = sfxVolume;
		learnAudio.play().catch(() => btn.classList.remove('playing'));
		learnAudio.onended = () => btn.classList.remove('playing');
	}
	await buildLearnEvoLine(pokemonId, specData);
}


function playLearnAudio() {
	if (!learnCurrentId || !soundOn) return;
	stopLearnAudio();
	const btn = document.getElementById('learn-speaker-btn');
	btn.classList.add('playing');
	const capturedId = learnCurrentId;
	learnAudio = new Audio(`sounds/eng_${String(capturedId).padStart(3,'0')}.mp3`);
	learnAudio.volume = sfxVolume;
	learnAudio.play().catch(() => {
		learnAudio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${capturedId}.ogg`);
		learnAudio.play().catch(() => btn.classList.remove('playing'));
		learnAudio.onended = () => btn.classList.remove('playing');
		return;
	});
	learnAudio.onended = () => {
		if (learnCurrentId !== capturedId) return;
		learnAudio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${capturedId}.ogg`);
		learnAudio.volume = sfxVolume;
		learnAudio.play().catch(() => {});
		learnAudio.onended = () => btn.classList.remove('playing');
	};
}

async function buildLearnEvoLine(pokemonId, specData) {
	const container = document.getElementById('learn-evo-line');
	container.innerHTML = '<span style="font-size:12px;color:#aaa">Loading…</span>';
	try {
		const cr = await fetch(specData.evolution_chain.url);
		const cd = await cr.json();

		function walkChain(node) {
			const p = allPokemon.find(x => x.name === node.species.name);
			const children = node.evolves_to.map(walkChain).filter(n => n !== null);
			if (p && p.id <= 151) return {
				pokemon: p,
				evolvesTo: children
			};
			return children.length > 0 ? {
				pokemon: null,
				evolvesTo: children
			} : null;
		}

		function buildChain(node, first = true) {
			if (!node.pokemon) {
				node.evolvesTo.forEach(child => buildChain(child, first));
				return;
			}
			if (!first) {
				const arrow = document.createElement('div');
				arrow.className = 'learn-evo-arrow';
				arrow.textContent = '→';
				container.appendChild(arrow);
			}
			const member = makeLearnEvoMember(node.pokemon, pokemonId);
			if (member) container.appendChild(member);
			if (node.evolvesTo.length === 1) {
				buildChain(node.evolvesTo[0], false);
			} else if (node.evolvesTo.length > 1) {
				const arrow = document.createElement('div');
				arrow.className = 'learn-evo-arrow';
				arrow.textContent = '→';
				container.appendChild(arrow);
				const branch = document.createElement('div');
				branch.className = 'learn-evo-branch';
				node.evolvesTo.forEach(child => {
					if (child.pokemon) {
						const m = makeLearnEvoMember(child.pokemon, pokemonId);
						if (m) branch.appendChild(m);
					}
				});
				container.appendChild(branch);
			}
		}
		container.innerHTML = '';
		const root = walkChain(cd.chain);
		if (!root) {
			container.innerHTML = '<span style="font-size:12px;color:#aaa">No evolution data.</span>';
			return;
		}
		buildChain(root, true);
	} catch (e) {
		container.innerHTML = '<span style="font-size:12px;color:#aaa">Evolution data unavailable.</span>';
	}
}

function makeLearnEvoMember(p, currentId) {
	if (!p) return null;
	const wrap = document.createElement('div');
	wrap.className = 'learn-evo-member' + (p.id === currentId ? ' current' : '');
	wrap.onclick = () => {
		if (p.id !== currentId) openLearnDetail(p.id, false);
	};
	const img = document.createElement('img');
	img.src = gifUrl(p.name);
	img.decoding = 'async';
	img.onerror = () => {
		img.onerror = null;
		img.src = fallbackUrl(p.id);
	};
	const name = document.createElement('div');
	name.className = 'evo-mem-name';
	name.style.fontFamily = "'Flexo', sans-serif";
	name.textContent = displayName(p.name);
	const num = document.createElement('div');
	num.className = 'evo-mem-num';
	num.textContent = '#' + String(p.id).padStart(3, '0');
	wrap.appendChild(img);
	wrap.appendChild(name);
	wrap.appendChild(num);
	return wrap;
}

function learnGoBack() {
	playClick();
	stopLearnAudio();
	showScreen(learnPreviousScreen);
}

function learnNavigate(dir) {
	if (!learnCurrentId || !allPokemon.length) return;
	const idx = allPokemon.findIndex(x => x.id === learnCurrentId);
	if (idx === -1) return;
	const next = allPokemon[idx + dir];
	if (next) openLearnDetail(next.id, false);
}

// ── Results ───────────────────────────────────────────────────────
function showResults() {
stopTimer();
	const pct = answeredCount === 0 ? 0 : Math.round(correctCount / answeredCount * 100);
	const tiers = [
		[100, '🏆', 'Perfect score! True Pokémon Master!'],
		[80, '🌟', 'Excellent! Almost a Pokémon Master!'],
		[60, '😄', 'Good job, Trainer! Keep it up!'],
		[40, '😅', 'Not bad, but keep training!'],
		[0, '😢', 'Time to revisit your Pokédex!']
	];
	const [, emoji, msg] = tiers.find(([t]) => pct >= t);
	document.getElementById('result-emoji').textContent = emoji;
	document.getElementById('result-player-name').textContent = playerName;
	document.getElementById('result-pct').textContent = pct + '%';
	document.getElementById('result-score-sub').textContent = `${correctCount} / ${answeredCount} correct`;
	document.getElementById('result-time').textContent = `⏱ ${getTimeString()}`;
	document.getElementById('result-msg').textContent = msg;
	document.getElementById('lb-submit-status').textContent = 'Saving score…';
	showScreen('result-screen');
	setTimeout(() => {
		celebrationConfetti(pct);
		if (pct >= 80) playFanfare();
	}, 300);
	if (pct === 100) setTimeout(triggerMewEasterEgg, 800);
	if (soundOn) {
		stopResultAudio();
		const soundFile = pct === 100 ? 'champion-sound' : pct >= 50 ? 'win-sound' : 'lose-sound';
		resultAudio = new Audio(`sounds/${soundFile}.mp3`);
		resultAudio.volume = sfxVolume;   // ← add this line
		resultAudio.play().catch(() => {});
	}
	  submitScore(pct);
  renderWrongAnswerReview();;
  
  //auto-scroll to review section if there are mistakes
if (wrongAnswers.length > 0) {
  setTimeout(() => {
    document.getElementById('review-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}
}

function shareScore() {
  playClick();
  const pct    = parseInt(document.getElementById('result-pct').textContent);
  const name   = playerName || 'A Trainer';
  const mode   = quizMode === 'full' ? 'Full Pokédex' : 'Quick Test';
  const diff   = difficulty === 'hard' ? 'Hard 🕶️' : 'Easy';
  const typeLabel = quizType === 'whos'     ? "Who's That Pokémon? 🎯"
                  : quizType === 'identify' ? 'Identify the Pokémon 🔍'
                  : 'Spot the Evolution ⚡';
  const medal  = pct === 100 ? '🏆 PERFECT SCORE!' : pct >= 80 ? '⭐ Great score!' : pct >= 60 ? '👍 Not bad!' : '💪 Keep training!';
  const wrongs = wrongAnswers.length;
  const wrongLine = wrongs === 0 ? 'Zero mistakes — true Pokémon Master! 🌟' : `Got ${wrongs} wrong — can you do better?`;

  const text = [
    `${medal}`,
    `${name} scored ${pct}% on PokéMommy!`,
    `📋 ${typeLabel} | ${mode} | ${diff}`,
    wrongLine,
    `🎮 Try it yourself → ${window.location.href}`
  ].join('\n');

  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(()  => showToast('Score copied to clipboard! 📋 Paste it anywhere.'))
      .catch(()  => showToast('Share: ' + pct + '% on PokéMommy! 🎉'));
  }
}


function renderWrongAnswerReview() {
  const section = document.getElementById('review-section');
  section.innerHTML = '';
  if (wrongAnswers.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  const title = document.createElement('div');
  title.className = 'review-title';
  title.textContent = `Review Mistakes (${wrongAnswers.length})`;
  section.appendChild(title);

  wrongAnswers.forEach(w => {
    const card = document.createElement('div');
    card.className = 'review-card';

    // Sprite
    const imgWrap = document.createElement('div');
    imgWrap.className = 'review-img-wrap';
    const img = document.createElement('img');
    img.className = 'review-sprite';
    if (w.quizType === 'evo') {
      // show subject for evo questions
      img.src = gifUrl(w.subjectName);
      img.onerror = () => { img.onerror = null; img.src = fallbackUrl(w.subjectId); };
    } else if (w.correctId) {
      img.src = gifUrl(w.correctName);
      img.onerror = () => { img.onerror = null; img.src = fallbackUrl(w.correctId); };
    }
    imgWrap.appendChild(img);

    // Text block
    const info = document.createElement('div');
    info.className = 'review-info';

    if (w.quizType === 'evo') {
      const q = document.createElement('div');
      q.className = 'review-question';
      q.textContent = `${displayName(w.subjectName)} ${w.direction === 'next' ? '→ evolves into?' : '← evolved from?'}`;
      const correct = document.createElement('div');
      correct.className = 'review-correct';
      correct.innerHTML = `✅ ${w.correctName === '(no evolution)' ? (w.direction === 'next' ? 'Does not evolve' : 'No pre-evolution') : displayName(w.correctName)}`;
      const wrong = document.createElement('div');
      wrong.className = 'review-wrong';
      wrong.innerHTML = `❌ You chose: ${w.chosenName === '(none)' ? (w.direction === 'next' ? 'Does not evolve' : 'No pre-evolution') : displayName(w.chosenName)}`;
      info.appendChild(q);
      info.appendChild(correct);
      info.appendChild(wrong);
    } else {
      const q = document.createElement('div');
      q.className = 'review-question';
      q.textContent = w.quizType === 'identify'
        ? `Which image is ${displayName(w.correctName)}?`
        : `Who's that Pokémon?`;
      const correct = document.createElement('div');
      correct.className = 'review-correct';
      correct.innerHTML = `✅ ${displayName(w.correctName)}`;
      const wrong = document.createElement('div');
      wrong.className = 'review-wrong';
      wrong.innerHTML = w.chosenName ? `❌ You chose: ${displayName(w.chosenName)}` : `❌ Incorrect`;
      info.appendChild(q);
      info.appendChild(correct);
      info.appendChild(wrong);
    }

    card.appendChild(imgWrap);
    card.appendChild(info);
    section.appendChild(card);
  });
}


// ── Utility ───────────────────────────────────────────────────────
function preloadNext() {
	if (quizType === 'whos' && currentQ + 1 < questions.length) {
		const p = new Image();
		p.src = gifUrl(questions[currentQ + 1].correct.name);
	}
}

function updateAccuracy() {
	document.getElementById('accuracy-display').textContent = answeredCount === 0 ? '—' : Math.round(correctCount / answeredCount * 100) + '%';
}

function nextQuestion() {
  const nxt = document.getElementById('next-btn');
  if (nxt && nxt.disabled) return; // guard: block double-fire
  if (nxt) nxt.disabled = true;
  playClick();
  clearAutoNext();
  currentQ++;
  if (currentQ < questions.length) renderQuestion();
  else showResults();
}

function confirmReset() {
    const gs = document.getElementById('game-screen');
    gs.style.filter = 'blur(20px) brightness(0.1)';
	gs.style.pointerEvents = 'none';
	requestAnimationFrame(() => requestAnimationFrame(() => {
        const ok = confirm('Restart from Question 1? Your progress will be lost.');
        gs.style.filter = '';
        gs.style.pointerEvents = '';
        if (ok) {
            playClick();
            stopTimer();
            clearAutoNext();
			unduckBgm();
            currentQ = 0; correctCount = 0; answeredCount = 0;
            hintsRevealed = 0;
            startGame();
        }
    }));
}

function confirmGoHome() {
    const gs = document.getElementById('game-screen');
    gs.style.filter = 'blur(20px) brightness(0.1)';
	gs.style.pointerEvents = 'none';
	requestAnimationFrame(() => requestAnimationFrame(() => {
        const ok = confirm('Your progress will be lost. Are you sure you want to start the quiz again?');
        gs.style.filter = '';
        gs.style.pointerEvents = '';
        if (ok) {
            playClick();
            stopTimer();
            clearAutoNext();
			unduckBgm();
            currentQ = 0; correctCount = 0; answeredCount = 0;
            difficulty = null;
            document.getElementById('btn-easy').classList.remove('selected');
            document.getElementById('btn-hard').classList.remove('selected');
            document.getElementById('start-btn').disabled = true;
            checkReady();
            showScreen('welcome-screen');
        }
    }));
}

function restartGame() {
	playClick();
	stopResultAudio();
	stopTimer();
	clearAutoNext();
	unduckBgm();
	difficulty = null;
	document.getElementById('btn-easy').classList.remove('selected');
	document.getElementById('btn-hard').classList.remove('selected');
	document.getElementById('start-btn').textContent = 'Start Quiz!';
	checkReady();
	showScreen('welcome-screen');
}

function showScreen(id) {
	['landing-screen', 'welcome-screen', 'game-screen', 'result-screen', 'leaderboard-screen', 'learn-browse-screen', 'learn-detail-screen']
	.forEach(s => {
		document.getElementById(s).style.display = s === id ? 'block' : 'none';
	});
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function displayName(name) {
	const m = {
		'nidoran-f': 'Nidoran ♀',
		'nidoran-m': 'Nidoran ♂',
		'mr-mime': 'Mr. Mime',
		'farfetchd': "Farfetch'd"
	};
	return m[name] || capitalize(name);
}

function burstConfetti() {
	confetti({
		particleCount: 65,
		spread: 70,
		origin: {
			y: 0.58
		},
		colors: ['#FFCB05', '#3D7DCA', '#003A70', '#ffffff', '#ff88cc']
	});
}

function celebrationConfetti(pct) {
	if (pct < 60) return;
	const rounds = pct === 100 ? 6 : pct >= 80 ? 3 : 1,
		count = pct === 100 ? 130 : 75;
	let fired = 0;
	const iv = setInterval(() => {
		confetti({
			particleCount: count,
			angle: fired % 2 === 0 ? 60 : 120,
			spread: 80,
			origin: {
				x: fired % 2 === 0 ? 0.1 : 0.9,
				y: 0.6
			},
			colors: ['#FFCB05', '#3D7DCA', '#003A70', '#ffffff', '#ffee88']
		});
		if (++fired >= rounds * 2) clearInterval(iv);
	}, 340);
}

// ── Enter key support ────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault();

	// Don't fire while user is typing in the name field
	const tag = document.activeElement?.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA') return;

	// Welcome popup "Let's Go!" button
	const popup = document.getElementById('welcome-popup');
	if (popup && popup.style.display === 'flex') {
		closeWelcomePopup();
		return;
	}

	// Easter egg "Okay" button
	const easterOverlay = document.getElementById('easter-overlay');
	if (easterOverlay && easterOverlay.style.display === 'flex') {
		closeEasterEgg();
		return;
	}

	// "Begin Journey" — check parent screen is actually visible
	const startBtn = document.getElementById('start-btn');
	if (startBtn && !startBtn.disabled) {
		const screen = startBtn.closest('[id$="-screen"]');
		if (screen && screen.style.display !== 'none') {
			startBtn.click();
			return;
		}
	}

	// "Next Question" / "See Results"
	const nextBtn = document.getElementById('next-btn');
	if (nextBtn && nextBtn.style.display !== 'none') {
		const screen = nextBtn.closest('[id$="-screen"]');
		if (screen && screen.style.display !== 'none') {
			nextBtn.click();
			return;
		}
	}
});