/* sprite map to convert names to all lowercase 
const SPRITE_MAP = {
  bulbasaur:'Bulbasaur',ivysaur:'Ivysaur',venusaur:'Venusaur',
  charmander:'Charmander',charmeleon:'Charmeleon',charizard:'Charizard',
  squirtle:'Squirtle',wartortle:'Wartortle',blastoise:'Blastoise',
  caterpie:'Caterpie',metapod:'Metapod',butterfree:'Butterfree',
  weedle:'Weedle',kakuna:'Kakuna',beedrill:'Beedrill',
  pidgey:'Pidgey',pidgeotto:'Pidgeotto',pidgeot:'Pidgeot',
  rattata:'Rattata',raticate:'Raticate',spearow:'Spearow',fearow:'Fearow',
  ekans:'Ekans',arbok:'Arbok',pikachu:'Pikachu',raichu:'Raichu',
  sandshrew:'Sandshrew',sandslash:'Sandslash',
  'nidoran-f':'Nidoran_F',nidorina:'Nidorina',nidoqueen:'Nidoqueen',
  'nidoran-m':'Nidoran_M',nidorino:'Nidorino',nidoking:'Nidoking',
  clefairy:'Clefairy',clefable:'Clefable',vulpix:'Vulpix',ninetales:'Ninetales',
  jigglypuff:'Jigglypuff',wigglytuff:'Wigglytuff',zubat:'Zubat',golbat:'Golbat',
  oddish:'Oddish',gloom:'Gloom',vileplume:'Vileplume',
  paras:'Paras',parasect:'Parasect',venonat:'Venonat',venomoth:'Venomoth',
  diglett:'Diglett',dugtrio:'Dugtrio',meowth:'Meowth',persian:'Persian',
  psyduck:'Psyduck',golduck:'Golduck',mankey:'Mankey',primeape:'Primeape',
  growlithe:'Growlithe',arcanine:'Arcanine',
  poliwag:'Poliwag',poliwhirl:'Poliwhirl',poliwrath:'Poliwrath',
  abra:'Abra',kadabra:'Kadabra',alakazam:'Alakazam',
  machop:'Machop',machoke:'Machoke',machamp:'Machamp',
  bellsprout:'Bellsprout',weepinbell:'Weepinbell',victreebel:'Victreebel',
  tentacool:'Tentacool',tentacruel:'Tentacruel',
  geodude:'Geodude',graveler:'Graveler',golem:'Golem',
  ponyta:'Ponyta',rapidash:'Rapidash',slowpoke:'Slowpoke',slowbro:'Slowbro',
  magnemite:'Magnemite',magneton:'Magneton',farfetchd:'Farfetchd',
  doduo:'Doduo',dodrio:'Dodrio',seel:'Seel',dewgong:'Dewgong',
  grimer:'Grimer',muk:'Muk',shellder:'Shellder',cloyster:'Cloyster',
  gastly:'Gastly',haunter:'Haunter',gengar:'Gengar',onix:'Onix',
  drowzee:'Drowzee',hypno:'Hypno',krabby:'Krabby',kingler:'Kingler',
  voltorb:'Voltorb',electrode:'Electrode',
  exeggcute:'Exeggcute',exeggutor:'Exeggutor',
  cubone:'Cubone',marowak:'Marowak',hitmonlee:'Hitmonlee',hitmonchan:'Hitmonchan',
  lickitung:'Lickitung',koffing:'Koffing',weezing:'Weezing',
  rhyhorn:'Rhyhorn',rhydon:'Rhydon',chansey:'Chansey',tangela:'Tangela',
  kangaskhan:'Kangaskhan',horsea:'Horsea',seadra:'Seadra',
  goldeen:'Goldeen',seaking:'Seaking',staryu:'Staryu',starmie:'Starmie',
  'mr-mime':'Mr.Mime',scyther:'Scyther',jynx:'Jynx',
  electabuzz:'Electabuzz',magmar:'Magmar',pinsir:'Pinsir',tauros:'Tauros',
  magikarp:'Magikarp',gyarados:'Gyarados',lapras:'Lapras',ditto:'Ditto',
  eevee:'Eevee',vaporeon:'Vaporeon',jolteon:'Jolteon',flareon:'Flareon',
  porygon:'Porygon',omanyte:'Omanyte',omastar:'Omastar',
  kabuto:'Kabuto',kabutops:'Kabutops',aerodactyl:'Aerodactyl',snorlax:'Snorlax',
  articuno:'Articuno',zapdos:'Zapdos',moltres:'Moltres',
  dratini:'Dratini',dragonair:'Dragonair',dragonite:'Dragonite',
  mewtwo:'Mewtwo',mew:'Mew'
};  */
// const GIF_BASE      = 'https://cdn.jsdelivr.net/gh/Nackha1/Hd-sprites@master/';  HD GIF source
const FALLBACK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
// function gifUrl(name)    { return GIF_BASE+(SPRITE_MAP[name]||capitalize(name))+'.gif'; } HD GIF source
function gifUrl(name) { return 'img/sprites/' + name + '.gif'; }
function fallbackUrl(id) { return FALLBACK_BASE+id+'.png'; }

let quizType=null, difficulty=null, quizMode='quick', playerName='';
let allPokemon=[], questions=[], currentQ=0, correctCount=0, answeredCount=0;
let hintsRevealed=0, currentPokemonData=null;
let autoNextTimer=null;
const QUICK_COUNT=20;

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
}





// ════════════════════════════════════════════════════════════════
// ── EASTER EGGS
// ════════════════════════════════════════════════════════════════

// ── Easter egg overlay helpers ───────────────────────────────────
function showEasterEgg(emoji, title, body, img=null) {
  const emojiEl = document.getElementById('easter-emoji');
  if (img) {
    emojiEl.innerHTML = `<img src="${img}" alt="" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated;"/>`;
  } else {
    emojiEl.innerHTML = emoji;
  }
  document.getElementById('easter-title').textContent = title;
  document.getElementById('easter-body').textContent  = body;
  document.getElementById('easter-overlay').style.display = 'flex';
  vibrate([50,30,50,30,100]);
}

let onEasterEggClose = null;
function closeEasterEgg() {
  document.getElementById('easter-overlay').style.display = 'none';
  if (onEasterEggClose) {
    onEasterEggClose();
    onEasterEggClose = null;
  }
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
    'z-index:9997; opacity:0; transition:opacity 0.3s ease, transform 0.3s ease;' +
    'max-width:300px; text-align:center; line-height:1.5; pointer-events:none;'
  );
  document.body.appendChild(toast);
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });
  setTimeout(()=>{
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(()=> toast.remove(), 400);
  }, 4000);
}

// ── 1. Logo tap milestones ────────────────────────────────────────
let logoTapCount=0, logoTapTimer=null;

window.addEventListener('load', ()=>{
	showWelcomePopup(); // Welcome Popup Message
  const logo = document.getElementById('landing-logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', ()=>{
      logoTapCount++;
      if (logoTapTimer) clearTimeout(logoTapTimer);
      logoTapTimer = setTimeout(()=>{ logoTapCount=0; }, 3000);

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
          "This whole game was made for people who notice the small things. You're one of them!");
      }
    });
  }

  if (!('ontouchstart' in window)) {
    const hint = document.getElementById('swipe-hint');
    if (hint) hint.classList.add('hidden');
  }

  setTimeout(checkNightMode, 500);
});

// ── 2. Night mode ────────────────────────────────────────────────
function checkNightMode() {
  const h = new Date().getHours();
  if (h >= 23 || h < 4) {
    const overlay = document.getElementById('easter-overlay');
    if (!overlay) return;
    playNightChime();
    setTimeout(()=>{
      showEasterEgg('🌙', "Shouldn't you be asleep, Trainer?",
        "It's late… but a true Pokémon Trainer never rests. Night mode activated. 🌟\n\nTake care of yourself — even Ash sleeps sometimes.");

      document.body.style.background  = '#1a1a2e';
      document.body.style.transition  = 'background 1.5s ease';
      document.querySelector('.card').style.background = '#16213e';
      document.querySelector('.card').style.color      = '#e0e0e0';
      document.querySelector('.card').style.transition = 'background 1.5s ease, color 1.5s ease';
      document.querySelector('.card').style.boxShadow  = '0 8px 32px rgba(0,0,0,0.6)';

      const stars = document.createElement('div');
      stars.id = 'night-stars';
      stars.setAttribute('style',
        'position:fixed;inset:0;pointer-events:none;z-index:1;' +
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
      setTimeout(()=>{ stars.style.opacity='1'; }, 100);

      // ── Only inject night styles when it's actually night ────
      const style = document.createElement('style');
      style.id = 'night-mode-styles';
      style.textContent = `
        body.night-mode, body.night-mode * {
          --night-text: #e8e8e8;
          --night-sub:  #aab4c8;
          --night-blue: #7eb3f7;
        }
        #landing-screen h1, #welcome-screen h1, .qt-title,
        .learn-detail-name, #lb-title { color: #7eb3f7 !important; -webkit-text-stroke: 0 !important; }
        .qt-desc, .landing-subtitle, label, .learn-info-label, .learn-dex-entry,
        .learn-category, .lc-name, .evo-mem-name, .result-msg,
        .result-score-sub, .result-time, .feedback-msg, .top-bar,
        .page-footer, .page-footer *, .lb-table td,
        .lb-table th { color: #aab4c8 !important; }
        #learn-category { color: #e8e8e8 !important; }
        .entry-text { color: #e8e8e8 !important; }
        .qt-title, #welcome-title, .learn-detail-num, .lc-num,
        .evo-mem-num { color: #7eb3f7 !important; }
        .quiz-type-btn { background: #1e2d4a !important; border-color: #2e4a7a !important; }
        .quiz-type-btn:hover { background: #2a3f6a !important; border-color: #7eb3f7 !important; }
        .diff-btn, .toggle-btn, .learn-nav-btn, .learn-card {
          background: #1e2d4a !important; border-color: #2e4a7a !important; color: #aab4c8 !important;
        }
        .diff-btn.selected, .toggle-btn.active { background: #3D7DCA !important; color: #fff !important; }
        input[type="text"] { background: #1e2d4a !important; border-color: #2e4a7a !important; color: #e8e8e8 !important; }
        input[type="text"]::placeholder { color: #556a8a !important; }
        .hint-card, .learn-info-card { background: #1e2d4a !important; border-color: #2e4a7a !important; color: #aab4c8 !important; }
        .lb-table { background: transparent !important; }
        .lb-table tr { background: #1e2d4a !important; }
        .lb-table tr.lb-you { background: #2a3f6a !important; }
        .lb-table th { background: #16213e !important; color: #7eb3f7 !important; }
        .opt-btn, .img-opt-btn, .evo-opt-btn { background: #1e2d4a !important; border-color: #2e4a7a !important; color: #e8e8e8 !important; }
        .opt-btn.correct, .img-opt-btn.correct, .evo-opt-btn.correct { background: #1a4a2a !important; border-color: #28a745 !important; }
        .opt-btn.wrong, .img-opt-btn.wrong, .evo-opt-btn.wrong { background: #4a1a1a !important; border-color: #dc3545 !important; }
        .progress-wrap { background: #2e4a7a !important; }
        .gen-badge { background: #1e2d4a !important; border-color: #2e4a7a !important; color: #aab4c8 !important; }
        .gen-badge.gen-active { background: #2a3f6a !important; border-color: #7eb3f7 !important; color: #7eb3f7 !important; }
      `;
      document.head.appendChild(style);
      document.body.classList.add('night-mode');

    }, 500);
  }
}

// ── 3. Trainer name eggs ─────────────────────────────────────────
const TRAINER_EGGS = {
  'ash':           { emoji:'🎯', img:'img/ash.png',
                     title:'I wanna be the very best!',
                     body:'Like no one ever was! To catch them is your real test, to train them is your cause! Welcome, Ash.' },
  'gary':          { emoji:'😏', img:'img/gary.png',
                     title:'Smell ya later!',
                     body:'Difficulty auto-set to Hard. You asked for it, Gary.' },
  'misty':         { emoji:'💧', img:'img/misty.png',
                     title:'Togepiiiii!',
                     body:'The Cerulean City Gym Leader is here! Water-type Pokémon will feel extra familiar.' },
  'brock':         { emoji:'🍳', img:'img/brock.png',
                     title:'Leave it to me!',
                     body:'The Pewter City Gym Leader has arrived. Jelly-filled donuts for everyone!' },
  'maulishmaster': [
    { emoji:'🔍', img:'img/maulishmaster.png',
      title:'True Trainer Detected!',
      body:"You didn't just play the game. You went looking for more. That's the kind of trainer energy we love." },
    { emoji:'🗝️', img:'img/maulishmaster.png',
      title:'The Pokédex Knows a Secret!',
      body:"You typed the magic words. The Pokédex has unlocked a secret it doesn't even know about." },
    { emoji:'🥚', img:'img/maulishmaster.png',
      title:'Easter Egg Discovered!',
      body:'You found the easter egg. You typed the magic name. You are now officially the coolest trainer here.' },
    { emoji:'⚡', img:'img/maulishmaster.png',
      title:'A Legendary Name…',
      body:"Only the most legendary trainers carry that name. Let's see if you live up to it." }
  ],
  'thewifey': [
    { emoji:'💛', img:'img/thewifey.png',
      title:'The Most Important Trainer!',
      body:"Yes, the quiz was literally built for you. No pressure. 😄" },
    { emoji:'💛️', img:'img/thewifey.png',
      title:'The Ultimate Champion',
      body:"You've already completed the hardest quest; growing a tiny trainer. This quiz should be easy!" },
    { emoji:'🥚', img:'img/thewifey.png',
      title:'An Egg Is About To Hatch!',
      body:"Professor Oak confirms: a brand new trainer is on the way! Until then, let's see if Mom still remembers her Pokémon." },
	{ emoji:'✨', img:'img/thewifey.png',
      title:'The Shiny Trainer Appears!',
      body:"A rare and powerful trainer has appeared. Bonus points for carrying the rarest Pokémon of all: Baby!" },
	{ emoji:'✨', img:'img/thewifey.png',
      title:'The Favorite Trainer',
      body:"Out of all the trainers in the world, you're the one I choose. Now go catch that high score." },
    { emoji:'🍼', img:'img/thewifey.png',
      title:'Future Pokémon Mom',
      body:"Soon you'll be raising two things: a baby… and a new generation of Pokémon trainers." }
  ],
  'helu': [
    { emoji:'🎮', img:'img/helu.png',
      title:'Player 2 Has Joined!',
      body:"Before the quiz, before the code, there was you, a GameBoy SP, and way too many arguments about who got to play Pokémon Emerald 💚" },
    { emoji:'🎮', img:'img/helu.png',
      title:'Rival Battle!',
      body:"Warning: childhood Pokémon rivalry detected. Prepare for intense sibling competition." },
    { emoji:'🕹️', img:'img/helu.png',
      title:'The OG Player 2',
      body:"From fighting over the GameBoy to battling over Pokémon Emerald - some things never change." },
	{ emoji:'⚡', img:'img/helu.png',
      title:'Sibling Rival Activated',
      body:"All childhood Pokémon debates are about to be settled. Once and for all." },
	{ emoji:'🎲', img:'img/helu.png',
      title:'Battle Mode: ON',
      body:"You survived the sibling battles of childhood. This quiz should be easy." },
    { emoji:'💚', img:'img/helu.png',
      title:'Pokémon Emerald Veteran',
      body:"A trainer forged in the fires of GameBoy SP arguments enters the arena." }
  ],
  'missingno':     null
};

function checkTrainerNameEgg(name) {
  const key = name.toLowerCase().replace(/\s+/g,'');
  if (key === 'missingno') {
    triggerMissingNo();
    return true;
  }
  if (key === 'gary') {
    difficulty = 'hard';
    document.getElementById('btn-easy').classList.remove('selected');
    document.getElementById('btn-hard').classList.add('selected');
    checkReady();
  }
  if (key === 'maulish' || key === 'maulishmaster') {
    const variants = TRAINER_EGGS['maulishmaster'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playSecretJingle();
    setTimeout(() => showEasterEgg(egg.emoji, egg.title, egg.body, egg.img || null), 300);
    return true;
  }
    if (key === 'thewifey' || key === 'sssiddhi') {
    const variants = TRAINER_EGGS['thewifey'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playSecretJingle();
    setTimeout(() => showEasterEgg(egg.emoji, egg.title, egg.body, egg.img || null), 300);
    return true;
  }
    if (key === 'helu' || key === 'preeyanshee') {
    const variants = TRAINER_EGGS['helu'];
    const egg = variants[Math.floor(Math.random() * variants.length)];
    playSecretJingle();
    setTimeout(() => showEasterEgg(egg.emoji, egg.title, egg.body, egg.img || null), 300);
    return true;
  }
  if (TRAINER_EGGS[key]) {
    const egg = TRAINER_EGGS[key];
    playSecretJingle();
    setTimeout(()=> showEasterEgg(egg.emoji, egg.title, egg.body, egg.img||null), 300);
    return true;
  }
  return false;
}

// ── 4. MissingNo glitch ──────────────────────────────────────────
function triggerMissingNo() {
  playGlitchSound();
  vibrate([100,50,200,50,100]);
  const card = document.querySelector('.card');
  card.style.transition = 'filter 0.1s';
  let flickers = 0;
  const glitch = setInterval(()=>{
    card.style.filter = flickers%2===0 ? 'invert(1) hue-rotate(180deg)' : 'none';
    flickers++;
    if (flickers > 10) {
      clearInterval(glitch);
      card.style.filter = 'none';
      showEasterEgg('👾', 'E̷R̵R̴O̸R̷: M̸I̷S̶S̴I̵N̷G̸N̵O̴.',
        'A wild MissingNo. appeared and corrupted the quiz data!. 😅\n\nThat Trainer Name can’t be registered. Please choose a different one!');
    }
  }, 120);
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
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{ mew.style.bottom = '120px'; });
  });
  setTimeout(()=>{ mew.style.opacity='0'; }, 3200);
  setTimeout(()=>{ mew.remove(); }, 4400);
  setTimeout(()=>{
    showEasterEgg('✨', 'A Wild Mew Appeared!',
      'You scored 100%! Only the rarest trainers ever see Mew.\n\nYou are one of them. 🌟');
  }, 1400);
}

// ── 6. Long-press sprite for cry ─────────────────────────────────
let longPressTimer = null;
function attachLongPress(imgEl, pokemonId) {
const start = ()=>{
longPressTimer = setTimeout(()=>{
longPressTimer = null;
vibrate([30,20,30]);
playLearnCry(pokemonId);
}, 600);
};
const cancel = ()=>{ if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer=null; } };
imgEl.onmousedown  = start;
imgEl.ontouchstart = start;
imgEl.onmouseup    = cancel;
imgEl.onmouseleave = cancel;
imgEl.ontouchend   = cancel;
}
function playLearnCry(pokemonId) {
  if (!soundOn) return;
  const cry = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`);
  cry.volume = 0.5;
  cry.play().catch(()=>{});
}

// ════════════════════════════════════════════════════════════════
// ── INIT
// ════════════════════════════════════════════════════════════════

document.addEventListener('touchstart', ()=>getCtx(), {once:true, passive:true});
document.addEventListener('mousedown',  ()=>getCtx(), {once:true});

// ── Swipe ────────────────────────────────────────────────────────
let touchStartX=0, touchStartY=0, swipeCount=0;
const MAX_SWIPE_HINTS=3;
document.getElementById('learn-detail-screen').addEventListener('touchstart',e=>{
  touchStartX=e.changedTouches[0].screenX;
  touchStartY=e.changedTouches[0].screenY;
},{passive:true});
document.getElementById('learn-detail-screen').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].screenX-touchStartX;
  const dy=e.changedTouches[0].screenY-touchStartY;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){
    if(dx<0) learnNavigate(1); else learnNavigate(-1);
    swipeCount++;
    if(swipeCount>=MAX_SWIPE_HINTS){
      const hint=document.getElementById('swipe-hint');
      if(hint) hint.classList.add('hidden');
    }
  }
},{passive:true});

// ── Navigation ───────────────────────────────────────────────────
function goToWelcome(type) {
  playClick();
  if(type==='whos'&&soundOn){ whosThatAudio.currentTime=0; whosThatAudio.play().catch(()=>{}); }
  quizType=type; difficulty=null; quizMode='quick';
  document.getElementById('btn-easy').classList.remove('selected');
  document.getElementById('btn-hard').classList.remove('selected');
  document.getElementById('player-name').value='';
  document.getElementById('start-btn').disabled=true;
  document.getElementById('start-btn').textContent='Start Quiz!';
  document.getElementById('btn-quick').classList.add('active');
  document.getElementById('btn-full').classList.remove('active');
  const titles={
    whos:     ["Who's That Pokémon?",  'Full sprite shown',  'Silhouette only'],
    identify: ["Identify the Pokémon", 'Clear images shown', 'Silhouettes shown'],
    evo:      ["Spot the Evolution",   'Clear images shown', 'Silhouettes shown']
  };
  const [title,easyD,hardD]=titles[type];
  document.getElementById('welcome-title').textContent=title;
  document.getElementById('easy-desc').textContent=easyD;
  document.getElementById('hard-desc').textContent=hardD;
  showScreen('welcome-screen');
}
function goHome() {
  playClick(); stopLearnAudio(); stopResultAudio(); stopWhosThatAudio();
  clearAutoNext();
  showScreen('landing-screen');
}

document.getElementById('player-name').addEventListener('input', checkReady);
function selectMode(m) {
  playClick(); quizMode=m;
  document.getElementById('btn-quick').classList.toggle('active',m==='quick');
  document.getElementById('btn-full').classList.toggle('active',m==='full');
}
function selectDiff(d) {
  playClick(); difficulty=d;
  document.getElementById('btn-easy').classList.toggle('selected',d==='easy');
  document.getElementById('btn-hard').classList.toggle('selected',d==='hard');
  checkReady();
}
function checkReady() {
  const name=document.getElementById('player-name').value.trim();
  document.getElementById('start-btn').disabled=!(name&&difficulty);
}

async function loadPokemonList() {
  const res=await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data=await res.json();
  allPokemon=data.results.map((p,i)=>({id:i+1,name:p.name}));
}

async function getEvolutionChain(pokemonId) {
  const specRes=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
  const specData=await specRes.json();
  const chainRes=await fetch(specData.evolution_chain.url);
  const chainData=await chainRes.json();
  const list=[]; const parentMap={}, childrenMap={};
  function walk(node,parent) {
    const p=allPokemon.find(x=>x.name===node.species.name);
    if(!p) return;
    list.push(p); parentMap[p.name]=parent||null; childrenMap[p.name]=[];
    if(parent) childrenMap[parent.name].push(p);
    node.evolves_to.forEach(c=>walk(c,p));
  }
  walk(chainData.chain,null);
  return {allMembers:list,parentMap,childrenMap};
}
async function getGen1EvoSiblings(pokemonId) {
  try { const {allMembers}=await getEvolutionChain(pokemonId); return allMembers.filter(p=>p.id!==pokemonId); }
  catch(e) { return []; }
}

async function buildEvoQuestion(subject) {
  const {parentMap,childrenMap}=await getEvolutionChain(subject.id);
  const dir=Math.random()<0.5?'next':'prev';
  let answer=null, answerIsNone=false;
  if(dir==='next'){
    const ch=childrenMap[subject.name]||[];
    if(ch.length===0) answerIsNone=true;
    else if(ch.length===1) answer=ch[0];
    else answer=ch[Math.floor(Math.random()*ch.length)];
  } else {
    const par=parentMap[subject.name];
    if(!par) answerIsNone=true; else answer=par;
  }
  return {subject,direction:dir,answer,answerIsNone};
}
async function buildOptions(correct) {
  let evoDecoy=null;
  if(difficulty==='hard'&&quizType==='whos'){
    const sib=await getGen1EvoSiblings(correct.id);
    if(sib.length>0) evoDecoy=sib[Math.floor(Math.random()*sib.length)];
  }
  const excl=new Set([correct.id]);
  if(evoDecoy) excl.add(evoDecoy.id);
  const pool=allPokemon.filter(x=>!excl.has(x.id)).sort(()=>Math.random()-.5);
  const opts=[correct];
  if(evoDecoy) opts.push(evoDecoy);
  pool.slice(0,4-opts.length).forEach(p=>opts.push(p));
  return opts.sort(()=>Math.random()-.5);
}
function buildEvoOptions(evoQ) {
  const {answer,answerIsNone,subject}=evoQ;
  const excl=new Set([subject.id]); if(answer) excl.add(answer.id);
  const pool=allPokemon.filter(x=>!excl.has(x.id)).sort(()=>Math.random()-.5);
  if(answerIsNone) return [{isNone:true},...pool.slice(0,3)].sort(()=>Math.random()-.5);
  return [answer,{isNone:true},...pool.slice(0,2)].sort(()=>Math.random()-.5);
}

async function startGame() {
  getCtx(); stopWhosThatAudio();
  const rawName = document.getElementById('player-name').value.trim();
  checkTrainerNameEgg(rawName);
  if (rawName.toLowerCase().replace(/\s+/g,'') === 'missingno') return;
  playClick();
  playerName = rawName;
  document.getElementById('start-btn').disabled=true;
  document.getElementById('start-btn').textContent='Loading…';
  if(!allPokemon.length) await loadPokemonList();
  const shuffled=[...allPokemon].sort(()=>Math.random()-.5);
  const pool=quizMode==='full'?shuffled:shuffled.slice(0,QUICK_COUNT);
  questions=pool.map(p=>({correct:p,options:null,evoQ:null}));
  currentQ=0; correctCount=0; answeredCount=0;
  document.getElementById('q-total').textContent=questions.length;
  document.getElementById('player-display').textContent=playerName;
  document.getElementById('whos-section').style.display    =quizType==='whos'    ?'block':'none';
  document.getElementById('identify-section').style.display=quizType==='identify'?'block':'none';
  document.getElementById('evo-section').style.display     =quizType==='evo'     ?'block':'none';
  showScreen('game-screen');
  await preloadQuestionImages(0, 3);
  renderQuestion();

  // ── Wait for easter egg overlay before starting timer ────────
  const isTrainerEgg = TRAINER_EGGS[rawName.toLowerCase().replace(/\s+/g,'')] != null;
  if (isTrainerEgg) {
    setTimeout(()=>{
      const overlay = document.getElementById('easter-overlay');
      if (overlay.style.display === 'flex') {
        onEasterEggClose = ()=> startTimer();
      } else {
        startTimer();
      }
    }, 350);
  } else {
    startTimer();
  }
}

function preloadQuestionImages(startIdx, count) {
  const toLoad = questions.slice(startIdx, startIdx + count);
  const promises = toLoad.map(q => new Promise(resolve => {
    const img = new Image();
    img.onload  = resolve;
    img.onerror = resolve;
    img.src = gifUrl(q.correct.name);
  }));
  const timeout = new Promise(resolve => setTimeout(resolve, 4000));
  return Promise.race([Promise.all(promises), timeout]);
}

async function renderQuestion() {
  clearAutoNext();
  preloadQuestionImages(currentQ + 1, 5);
  const q=questions[currentQ];
  hintsRevealed=0; currentPokemonData=null;
  document.getElementById('hint-cards').innerHTML='';
  [1,2,3].forEach(i=>{ const b=document.getElementById(`hint-btn-${i}`); b.classList.remove('used'); b.disabled=i!==1; });
  document.getElementById('feedback-msg').textContent='';
  document.getElementById('next-btn').style.display='none';
  document.getElementById('progress-fill').style.width=(currentQ/questions.length*100)+'%';
  document.getElementById('q-num').textContent=currentQ+1;
  updateAccuracy();
  if(quizType==='whos'){
    if(!q.options) q.options=await buildOptions(q.correct);
    renderWhosQuestion(q);
  } else if(quizType==='identify'){
    if(!q.options) q.options=await buildOptions(q.correct);
    renderIdentifyQuestion(q);
  } else {
    if(!q.evoQ) q.evoQ=await buildEvoQuestion(q.correct);
    if(!q.evoQ.options) q.evoQ.options=buildEvoOptions(q.evoQ);
    renderEvoQuestion(q.evoQ);
  }
}

function renderWhosQuestion(q) {
  const img=document.getElementById('pokemon-img'), spn=document.getElementById('spinner');
  document.getElementById('options-grid').innerHTML='';
  img.style.opacity='0'; spn.style.display='block';
  img.className=''; img.src='';

  img.onload=()=>{ spn.style.display='none'; img.style.opacity='1'; preloadNext(); };
  img.onerror=()=>{ img.onerror=null; img.src=fallbackUrl(q.correct.id); };

  img.onload=()=>{
    spn.style.display='none';
    requestAnimationFrame(()=>{        // frame 1: CSS filter is computed
      requestAnimationFrame(()=>{      // frame 2: CSS filter is painted
        img.style.opacity='1';         // NOW show — silhouette guaranteed
      });
    });
    preloadNext();
  };
  img.onerror=()=>{ img.onerror=null; img.src=fallbackUrl(q.correct.id); };
  img.src=gifUrl(q.correct.name);

  q.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='opt-btn'; btn.textContent=displayName(opt.name);
    btn.style.fontFamily="'Flexo', sans-serif";
    btn.onclick=()=>checkAnswer('whos',opt.name,q.correct.name,btn);
    document.getElementById('options-grid').appendChild(btn);
  });
}

function renderIdentifyQuestion(q) {
  const nameEl=document.getElementById('identify-name');
  nameEl.textContent=displayName(q.correct.name);
  nameEl.style.fontFamily="'Flexo', sans-serif";
  const grid=document.getElementById('img-options-grid'); grid.innerHTML='';
  q.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='img-opt-btn'; btn.dataset.name=opt.name;
    const spin=document.createElement('div'); spin.className='img-opt-spinner';
    const img=document.createElement('img'); img.alt=opt.name; img.style.opacity='0';
    img.onload=()=>{ if(difficulty==='hard') img.classList.add('silhouette'); spin.style.display='none'; img.style.opacity='1'; };
    img.onerror=()=>{ img.onerror=null; img.src=fallbackUrl(opt.id); };
    img.src=gifUrl(opt.name);
    btn.appendChild(spin); btn.appendChild(img);
    btn.onclick=()=>checkAnswer('identify',opt.name,q.correct.name,btn);
    grid.appendChild(btn);
  });
}
function renderEvoQuestion(evoQ) {
  const img=document.getElementById('evo-pokemon-img'), spn=document.getElementById('evo-spinner');
  img.style.opacity='0'; spn.style.display='block';
  img.onload=()=>{ spn.style.display='none'; img.style.opacity='1'; };
  img.onerror=()=>{ img.onerror=null; img.src=fallbackUrl(evoQ.subject.id); };
  img.src=gifUrl(evoQ.subject.name);
  const visualRow=document.getElementById('evo-visual-row');
  const subjectWrap=document.getElementById('evo-question-img-wrap');
  visualRow.innerHTML='';
  const arrow=document.createElement('div'); arrow.className='evo-arrow';
  const aLine=document.createElement('div'); aLine.className='evo-arrow-line'; aLine.textContent='→';
  const aLbl=document.createElement('div'); aLbl.className='evo-arrow-label';
  aLbl.style.fontFamily="'Flexo', sans-serif";
  aLbl.textContent=evoQ.direction==='next'?'evolves into?':'evolved from?';
  arrow.appendChild(aLine); arrow.appendChild(aLbl);
  const qWrap=document.createElement('div'); qWrap.className='evo-qmark-wrap';
  const qMark=document.createElement('div'); qMark.className='evo-qmark'; qMark.textContent='?';
  qWrap.appendChild(qMark);
  if(evoQ.direction==='next'){ visualRow.appendChild(subjectWrap); visualRow.appendChild(arrow); visualRow.appendChild(qWrap); }
  else { visualRow.appendChild(qWrap); visualRow.appendChild(arrow); visualRow.appendChild(subjectWrap); }
  const grid=document.getElementById('evo-options-grid'); grid.innerHTML='';
  evoQ.options.forEach(opt=>{
    const btn=document.createElement('button');
    if(opt.isNone){
      btn.className='evo-opt-btn none-tile'; btn.dataset.isNone='true';
      const icon=document.createElement('div'); icon.className='none-icon'; icon.textContent='✖️';
      const lbl=document.createElement('div'); lbl.className='none-label';
      lbl.style.fontFamily="'Flexo', sans-serif";
      lbl.textContent=evoQ.direction==='next'?'Does not evolve':'No pre-evolution';
      btn.appendChild(icon); btn.appendChild(lbl);
      btn.onclick=()=>checkEvoAnswer(btn,evoQ,true);
    } else {
      btn.className='evo-opt-btn'; btn.dataset.name=opt.name;
      const spin=document.createElement('div'); spin.className='evo-opt-spinner';
      const img2=document.createElement('img'); img2.alt=opt.name; img2.style.opacity='0';
      img2.onload=()=>{ if(difficulty==='hard') img2.classList.add('silhouette'); spin.style.display='none'; img2.style.opacity='1'; };
      img2.onerror=()=>{ img2.onerror=null; img2.src=fallbackUrl(opt.id); };
      img2.src=gifUrl(opt.name);
      const cap=document.createElement('div'); cap.className='evo-caption';
      cap.style.fontFamily="'Flexo', sans-serif";
      cap.textContent=difficulty==='hard'?'???':displayName(opt.name);
      btn.appendChild(spin); btn.appendChild(img2); btn.appendChild(cap);
      btn.onclick=()=>checkEvoAnswer(btn,evoQ,false,opt.name);
    }
    grid.appendChild(btn);
  });
}

function clearAutoNext() {
  if(autoNextTimer){ clearInterval(autoNextTimer); autoNextTimer=null; }
  const nxt=document.getElementById('next-btn');
  if(nxt) nxt.textContent=currentQ<questions.length-1?'Next →':'See Results 🏆';
}
function startAutoNext(isLast) {
  let remaining=5;
  const nxt=document.getElementById('next-btn');
  const baseLabel=isLast?'See Results 🏆':'Next →';
  nxt.textContent=`${baseLabel} (${remaining}s)`;
  autoNextTimer=setInterval(()=>{
    remaining--;
    if(remaining<=0){ clearAutoNext(); nextQuestion(); }
    else { nxt.textContent=`${baseLabel} (${remaining}s)`; }
  },1000);
}

function checkAnswer(type,chosen,correct,btn) {
  if(type==='whos'){
    document.querySelectorAll('.opt-btn').forEach(b=>b.disabled=true);
    document.getElementById('pokemon-img').className='';
  } else {
    document.querySelectorAll('.img-opt-btn').forEach(b=>{ b.disabled=true; const i=b.querySelector('img'); if(i) i.classList.remove('silhouette'); });
  }
  [1,2,3].forEach(i=>document.getElementById(`hint-btn-${i}`).disabled=true);
  answeredCount++;
  const fb=document.getElementById('feedback-msg');
  if(chosen===correct){
    correctCount++; btn.classList.add('correct');
    fb.textContent=`✅ Correct! It's ${displayName(correct)}!`; fb.style.color='#28a745';
    playCorrect(); burstConfetti();
  } else {
    btn.classList.add('wrong');
    if(type==='whos') document.querySelectorAll('.opt-btn').forEach(b=>{ if(b.textContent===displayName(correct)) b.classList.add('correct'); });
    else document.querySelectorAll('.img-opt-btn').forEach(b=>{ if(b.dataset.name===correct) b.classList.add('correct'); });
    fb.textContent=`❌ It was ${displayName(correct)}!`; fb.style.color='#dc3545';
    playWrong();
  }
  updateAccuracy();
  const nxt=document.getElementById('next-btn');
  nxt.style.display='block';
  startAutoNext(currentQ>=questions.length-1);
}

function checkEvoAnswer(btn,evoQ,choseNone,chosenName) {
  document.querySelectorAll('.evo-opt-btn').forEach(b=>{
    b.disabled=true;
    const img=b.querySelector('img'); if(img) img.classList.remove('silhouette');
    const cap=b.querySelector('.evo-caption'); if(cap&&b.dataset.name) cap.textContent=displayName(b.dataset.name);
  });
  [1,2,3].forEach(i=>document.getElementById(`hint-btn-${i}`).disabled=true);
  answeredCount++;
  const fb=document.getElementById('feedback-msg');
  const isCorrect=choseNone===evoQ.answerIsNone&&(!choseNone?chosenName===evoQ.answer?.name:true);
  if(isCorrect){
    correctCount++; btn.classList.add('correct');
    const msg=evoQ.answerIsNone?(evoQ.direction==='next'?'It does not evolve!':'It has no pre-evolution!'):`It's ${displayName(evoQ.answer.name)}!`;
    fb.textContent=`✅ Correct! ${msg}`; fb.style.color='#28a745';
    playCorrect(); burstConfetti();
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.evo-opt-btn').forEach(b=>{
      if(evoQ.answerIsNone&&b.dataset.isNone) b.classList.add('correct');
      else if(!evoQ.answerIsNone&&b.dataset.name===evoQ.answer?.name) b.classList.add('correct');
    });
    const msg=evoQ.answerIsNone?(evoQ.direction==='next'?'It does not evolve!':'It has no pre-evolution!'):`It was ${displayName(evoQ.answer.name)}!`;
    fb.textContent=`❌ ${msg}`; fb.style.color='#dc3545';
    playWrong();
  }
  updateAccuracy();
  const nxt=document.getElementById('next-btn');
  nxt.style.display='block';
  startAutoNext(currentQ>=questions.length-1);
}

async function revealHint(level) {
  if(hintsRevealed>=level) return;
  playHint();
  if(!currentPokemonData){
    const id=quizType==='evo'?questions[currentQ].evoQ.subject.id:questions[currentQ].correct.id;
    const [pr,sr]=await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)]);
    currentPokemonData={...await pr.json(),species:await sr.json()};
  }
  hintsRevealed=level;
  for(let i=1;i<=level;i++){const b=document.getElementById(`hint-btn-${i}`);b.classList.add('used');b.disabled=true;}
  if(level<3) document.getElementById(`hint-btn-${level+1}`).disabled=false;
  const card=document.createElement('div'); card.className='hint-card';
  if(level===1){
    const g=currentPokemonData.species.genera.find(g=>g.language.name==='en');
    card.innerHTML=`<strong>🏷️ Hint 1 — Category</strong>${g?g.genus:'Unknown'}`;
  } else if(level===2){
    const b=currentPokemonData.types.map(t=>`<span class="type-badge t-${t.type.name}">${capitalize(t.type.name)}</span>`).join('');
    card.innerHTML=`<strong>⚡ Hint 2 — Type</strong>${b}`;
  } else {
    const e=currentPokemonData.species.flavor_text_entries.find(e=>e.language.name==='en'&&(e.version.name==='red'||e.version.name==='blue'))||currentPokemonData.species.flavor_text_entries.find(e=>e.language.name==='en');
    card.innerHTML=`<strong>📖 Hint 3 — Pokédex Entry</strong><span class="entry-text">${e?e.flavor_text.replace(/[\f\n\r]/g,' '):'No entry found.'}</span>`;
  }
  document.getElementById('hint-cards').appendChild(card);
}

// ── Pokédex ──────────────────────────────────────────────────────
let learnAudio=null, learnCurrentId=null, learnPreviousScreen='learn-browse-screen';

async function openLearn() {
  playClick();
  if(!allPokemon.length) await loadPokemonList();
  document.getElementById('learn-search').value='';
  buildLearnGrid(allPokemon);
  showScreen('learn-browse-screen');
}
function buildLearnGrid(list) {
  const grid=document.getElementById('learn-grid'); grid.innerHTML='';
  list.forEach(p=>{
    const card=document.createElement('div'); card.className='learn-card';
    card.onclick=()=>openLearnDetail(p.id);
    const img=document.createElement('img');
    img.src=gifUrl(p.name); img.onerror=()=>{img.onerror=null;img.src=fallbackUrl(p.id);};
    img.style.cursor='pointer';
    attachLongPress(img, p.id);
    const num=document.createElement('div'); num.className='lc-num'; num.textContent='#'+String(p.id).padStart(3,'0');
    const name=document.createElement('div'); name.className='lc-name';
    name.style.fontFamily="'Flexo', sans-serif";
    name.textContent=displayName(p.name);
    card.appendChild(img); card.appendChild(num); card.appendChild(name);
    grid.appendChild(card);
  });
}
function filterLearnList() {
  const q=document.getElementById('learn-search').value.trim().toLowerCase();
  buildLearnGrid(allPokemon.filter(p=>displayName(p.name).toLowerCase().includes(q)||String(p.id).padStart(3,'0').includes(q)));
}
async function openLearnDetail(pokemonId,fromBrowse=true) {
  learnCurrentId=pokemonId;
  if(fromBrowse) learnPreviousScreen='learn-browse-screen';
  const sprite=document.getElementById('learn-sprite'), spn=document.getElementById('learn-spinner');
  sprite.style.opacity='0'; spn.style.display='block';
  document.getElementById('learn-detail-name').textContent='…';
  document.getElementById('learn-detail-num').textContent='…';
  document.getElementById('learn-category').textContent='…';
  document.getElementById('learn-type').innerHTML='';
  document.getElementById('learn-dex-entry').textContent='Loading…';
  document.getElementById('learn-evo-line').innerHTML='';
  document.getElementById('learn-speaker-btn').classList.remove('playing');
  stopLearnAudio();
  document.getElementById('learn-nav-prev').disabled=pokemonId===1;
  document.getElementById('learn-nav-next').disabled=pokemonId===151;
  showScreen('learn-detail-screen');
  const [pr,sr]=await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
  ]);
  const pokeData=await pr.json(), specData=await sr.json();
  const p=allPokemon.find(x=>x.id===pokemonId);
  sprite.onload=()=>{ spn.style.display='none'; sprite.style.opacity='1'; };
  sprite.onerror=()=>{ sprite.onerror=null; sprite.src=fallbackUrl(pokemonId); };
  sprite.src=gifUrl(p.name);
  attachLongPress(sprite, pokemonId);
  const nameEl=document.getElementById('learn-detail-name');
  nameEl.textContent=displayName(p.name);
  nameEl.style.fontFamily="'Flexo', sans-serif";
  nameEl.style.webkitTextStroke='none';
  document.getElementById('learn-detail-num').textContent='#'+String(pokemonId).padStart(3,'0');
  const genus=specData.genera.find(g=>g.language.name==='en');
  document.getElementById('learn-category').textContent=genus?genus.genus:'—';
  document.getElementById('learn-type').innerHTML=pokeData.types
    .map(t=>`<span class="type-badge t-${t.type.name}" style="margin-right:4px">${capitalize(t.type.name)}</span>`).join('');
  const entry=specData.flavor_text_entries.find(e=>e.language.name==='en'&&(e.version.name==='red'||e.version.name==='blue'))||specData.flavor_text_entries.find(e=>e.language.name==='en');
  document.getElementById('learn-dex-entry').textContent=entry?entry.flavor_text.replace(/[\f\n\r]/g,' '):'No Pokédex entry available.';
  
if (learnCurrentId !== pokemonId) return;  // ← If navigated away, abort

if(soundOn){
  stopLearnAudio();
  const btn=document.getElementById('learn-speaker-btn');
  btn.classList.add('playing');
  learnAudio=new Audio(`sounds/eng_${String(pokemonId).padStart(3,'0')}.mp3`);
  learnAudio.play().catch(()=>btn.classList.remove('playing'));
  learnAudio.onended=()=>btn.classList.remove('playing');
}
  await buildLearnEvoLine(pokemonId,specData);
}
function stopLearnAudio() {
if(learnAudio){ learnAudio.onended=null; learnAudio.pause(); learnAudio=null; }
const btn=document.getElementById('learn-speaker-btn');
if(btn) btn.classList.remove('playing');
}
function playLearnAudio() {
  if(!learnCurrentId||!soundOn) return;
  stopLearnAudio();
  const btn=document.getElementById('learn-speaker-btn');
  btn.classList.add('playing');
  const capturedId = learnCurrentId;
  learnAudio=new Audio(`sounds/eng_${String(capturedId).padStart(3,'0')}.mp3`);
  learnAudio.play().catch(()=>{
    learnAudio=new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${capturedId}.ogg`);
    learnAudio.play().catch(()=>btn.classList.remove('playing'));
    learnAudio.onended=()=>btn.classList.remove('playing');
    return;
  });
  learnAudio.onended = () => {
    if (learnCurrentId !== capturedId) return;
    learnAudio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${capturedId}.ogg`);
    learnAudio.play().catch(()=>{});
    learnAudio.onended = () => btn.classList.remove('playing');
  };
}

async function buildLearnEvoLine(pokemonId, specData) {
  const container=document.getElementById('learn-evo-line');
  container.innerHTML='<span style="font-size:12px;color:#aaa">Loading…</span>';
  try {
    const cr=await fetch(specData.evolution_chain.url);
    const cd=await cr.json();
    function walkChain(node) {
      const p=allPokemon.find(x=>x.name===node.species.name);
      const children=node.evolves_to.map(walkChain).filter(n=>n!==null);
      if(p&&p.id<=151) return { pokemon:p, evolvesTo:children };
      return children.length>0 ? { pokemon:null, evolvesTo:children } : null;
    }
    function buildChain(node, first=true) {
      if(!node.pokemon){ node.evolvesTo.forEach(child=>buildChain(child, first)); return; }
      if(!first){ const arrow=document.createElement('div'); arrow.className='learn-evo-arrow'; arrow.textContent='→'; container.appendChild(arrow); }
      const member=makeLearnEvoMember(node.pokemon, pokemonId);
      if(member) container.appendChild(member);
      if(node.evolvesTo.length===1){ buildChain(node.evolvesTo[0], false); }
      else if(node.evolvesTo.length>1){
        const arrow=document.createElement('div'); arrow.className='learn-evo-arrow'; arrow.textContent='→'; container.appendChild(arrow);
        const branch=document.createElement('div'); branch.className='learn-evo-branch';
        node.evolvesTo.forEach(child=>{ if(child.pokemon){ const m=makeLearnEvoMember(child.pokemon, pokemonId); if(m) branch.appendChild(m); } });
        container.appendChild(branch);
      }
    }
    container.innerHTML='';
    const root=walkChain(cd.chain);
    if(!root){ container.innerHTML='<span style="font-size:12px;color:#aaa">No evolution data.</span>'; return; }
    buildChain(root, true);
  } catch(e) {
    container.innerHTML='<span style="font-size:12px;color:#aaa">Evolution data unavailable.</span>';
  }
}
function makeLearnEvoMember(p,currentId) {
  if(!p) return null;
  const wrap=document.createElement('div');
  wrap.className='learn-evo-member'+(p.id===currentId?' current':'');
  wrap.onclick=()=>{ if(p.id!==currentId) openLearnDetail(p.id,false); };
  const img=document.createElement('img');
  img.src=gifUrl(p.name); img.onerror=()=>{img.onerror=null;img.src=fallbackUrl(p.id);};
  const name=document.createElement('div'); name.className='evo-mem-name';
  name.style.fontFamily="'Flexo', sans-serif";
  name.textContent=displayName(p.name);
  const num=document.createElement('div'); num.className='evo-mem-num';
  num.textContent='#'+String(p.id).padStart(3,'0');
  wrap.appendChild(img); wrap.appendChild(name); wrap.appendChild(num);
  return wrap;
}
function learnGoBack()      { playClick(); stopLearnAudio(); showScreen(learnPreviousScreen); }
function learnNavigate(dir) {
  if(!learnCurrentId||!allPokemon.length) return;
  const idx=allPokemon.findIndex(x=>x.id===learnCurrentId);
  if(idx===-1) return;
  const next=allPokemon[idx+dir];
  if(next) openLearnDetail(next.id,false);
}

// ── Results ───────────────────────────────────────────────────────
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
  document.getElementById('result-emoji').textContent       = emoji;
  document.getElementById('result-player-name').textContent = playerName;
  document.getElementById('result-pct').textContent         = pct+'%';
  document.getElementById('result-score-sub').textContent   = `${correctCount} / ${answeredCount} correct`;
  document.getElementById('result-time').textContent        = `⏱ ${getTimeString()}`;
  document.getElementById('result-msg').textContent         = msg;
  document.getElementById('lb-submit-status').textContent   = 'Saving score…';
  showScreen('result-screen');
  setTimeout(()=>{ celebrationConfetti(pct); if(pct>=80) playFanfare(); }, 300);
  if (pct === 100) setTimeout(triggerMewEasterEgg, 800);
  if(soundOn){
    stopResultAudio();
    const soundFile = pct===100?'champion-sound': pct>=50?'win-sound':'lose-sound';
    resultAudio = new Audio(`sounds/${soundFile}.mp3`);
    resultAudio.play().catch(()=>{});
  }
  submitScore(pct);
}

// ── Utility ───────────────────────────────────────────────────────
function preloadNext() {
  if(quizType==='whos'&&currentQ+1<questions.length){ const p=new Image(); p.src=gifUrl(questions[currentQ+1].correct.name); }
}
function updateAccuracy() {
  document.getElementById('accuracy-display').textContent=answeredCount===0?'—':Math.round(correctCount/answeredCount*100)+'%';
}
function nextQuestion() {
  playClick(); clearAutoNext(); currentQ++;
  if(currentQ<questions.length) renderQuestion(); else showResults();
}
function confirmReset()  { if(confirm('Reset the quiz? Your progress will be lost.')) restartGame(); }
function restartGame() {
  playClick(); stopResultAudio(); stopTimer(); clearAutoNext(); difficulty=null;
  document.getElementById('btn-easy').classList.remove('selected');
  document.getElementById('btn-hard').classList.remove('selected');
  document.getElementById('player-name').value='';
  document.getElementById('start-btn').disabled=true;
  document.getElementById('start-btn').textContent='Start Quiz!';
  showScreen('welcome-screen');
}
function showScreen(id) {
  ['landing-screen','welcome-screen','game-screen','result-screen','leaderboard-screen','learn-browse-screen','learn-detail-screen']
    .forEach(s=>{ document.getElementById(s).style.display=s===id?'block':'none'; });
}
function capitalize(str) { return str.charAt(0).toUpperCase()+str.slice(1); }
function displayName(name) {
  const m={'nidoran-f':'Nidoran ♀','nidoran-m':'Nidoran ♂','mr-mime':'Mr. Mime','farfetchd':"Farfetch'd"};
  return m[name]||capitalize(name);
}
function burstConfetti() {
  confetti({ particleCount:65, spread:70, origin:{y:0.58}, colors:['#FFCB05','#3D7DCA','#003A70','#ffffff','#ff88cc'] });
}
function celebrationConfetti(pct) {
  if(pct<60) return;
  const rounds=pct===100?6:pct>=80?3:1, count=pct===100?130:75;
  let fired=0;
  const iv=setInterval(()=>{
    confetti({ particleCount:count, angle:fired%2===0?60:120, spread:80,
      origin:{x:fired%2===0?0.1:0.9,y:0.6}, colors:['#FFCB05','#3D7DCA','#003A70','#ffffff','#ffee88'] });
    if(++fired>=rounds*2) clearInterval(iv);
  },340);
}
