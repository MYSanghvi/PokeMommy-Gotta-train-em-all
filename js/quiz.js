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
};
const GIF_BASE      = 'https://cdn.jsdelivr.net/gh/Nackha1/Hd-sprites@master/';
const FALLBACK_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
function gifUrl(name)    { return GIF_BASE+(SPRITE_MAP[name]||capitalize(name))+'.gif'; }
function fallbackUrl(id) { return FALLBACK_BASE+id+'.png'; }

let quizType=null, difficulty=null, quizMode='quick', playerName='';
let allPokemon=[], questions=[], currentQ=0, correctCount=0, answeredCount=0;
let hintsRevealed=0, currentPokemonData=null;
let autoNextTimer=null; // ── auto-next timer handle
const QUICK_COUNT=20;

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
window.addEventListener('load',()=>{
  if(!('ontouchstart' in window)){
    const hint=document.getElementById('swipe-hint');
    if(hint) hint.classList.add('hidden');
  }
});

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
  getCtx(); playClick(); stopWhosThatAudio();
  playerName=document.getElementById('player-name').value.trim();
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
  startTimer();
  showScreen('game-screen');
  renderQuestion();
}

async function renderQuestion() {
  clearAutoNext();
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
  img.onload=()=>{ if(difficulty==='hard') img.classList.add('silhouette'); spn.style.display='none'; img.style.opacity='1'; preloadNext(); };
  img.onerror=()=>{ img.onerror=null; img.src=fallbackUrl(q.correct.id); };
  img.src=gifUrl(q.correct.name);
  q.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='opt-btn'; btn.textContent=displayName(opt.name);
    btn.onclick=()=>checkAnswer('whos',opt.name,q.correct.name,btn);
    document.getElementById('options-grid').appendChild(btn);
  });
}
function renderIdentifyQuestion(q) {
  document.getElementById('identify-name').textContent=displayName(q.correct.name);
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
      cap.textContent=difficulty==='hard'?'???':displayName(opt.name);
      btn.appendChild(spin); btn.appendChild(img2); btn.appendChild(cap);
      btn.onclick=()=>checkEvoAnswer(btn,evoQ,false,opt.name);
    }
    grid.appendChild(btn);
  });
}

// ── Auto-next helpers ────────────────────────────────────────────
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
    if(remaining<=0){
      clearAutoNext();
      nextQuestion();
    } else {
      nxt.textContent=`${baseLabel} (${remaining}s)`;
    }
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
  const isLast=currentQ>=questions.length-1;
  startAutoNext(isLast);
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
  const isLast=currentQ>=questions.length-1;
  startAutoNext(isLast);
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
    const num=document.createElement('div'); num.className='lc-num'; num.textContent='#'+String(p.id).padStart(3,'0');
    const name=document.createElement('div'); name.className='lc-name'; name.textContent=displayName(p.name);
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
  document.getElementById('learn-detail-name').textContent=displayName(p.name);
  document.getElementById('learn-detail-num').textContent='#'+String(pokemonId).padStart(3,'0');
  const genus=specData.genera.find(g=>g.language.name==='en');
  document.getElementById('learn-category').textContent=genus?genus.genus:'—';
  document.getElementById('learn-type').innerHTML=pokeData.types
    .map(t=>`<span class="type-badge t-${t.type.name}" style="margin-right:4px">${capitalize(t.type.name)}</span>`).join('');
  const entry=specData.flavor_text_entries.find(e=>e.language.name==='en'&&(e.version.name==='red'||e.version.name==='blue'))||specData.flavor_text_entries.find(e=>e.language.name==='en');
  document.getElementById('learn-dex-entry').textContent=entry?entry.flavor_text.replace(/[\f\n\r]/g,' '):'No Pokédex entry available.';
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
  if(learnAudio){ learnAudio.pause(); learnAudio.currentTime=0; learnAudio=null; }
  const btn=document.getElementById('learn-speaker-btn');
  if(btn) btn.classList.remove('playing');
}
function playLearnAudio() {
  if(!learnCurrentId||!soundOn) return;
  stopLearnAudio();
  const btn=document.getElementById('learn-speaker-btn');
  btn.classList.add('playing');
  learnAudio=new Audio(`sounds/eng_${String(learnCurrentId).padStart(3,'0')}.mp3`);
  learnAudio.play().catch(()=>{
    learnAudio=new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${learnCurrentId}.ogg`);
    learnAudio.play().catch(()=>btn.classList.remove('playing'));
    learnAudio.onended=()=>btn.classList.remove('playing');
    return;
  });
  learnAudio.onended=()=>{
    learnAudio=new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${learnCurrentId}.ogg`);
    learnAudio.play().catch(()=>{});
    learnAudio.onended=()=>btn.classList.remove('playing');
  };
}
async function buildLearnEvoLine(pokemonId, specData) {
  const container=document.getElementById('learn-evo-line');
  container.innerHTML='<span style="font-size:12px;color:#aaa">Loading…</span>';
  try {
    const cr=await fetch(specData.evolution_chain.url);
    const cd=await cr.json();
    // Flatten full chain into a simple list of gen1-only nodes
    function walkChain(node) {
      const p=allPokemon.find(x=>x.name===node.species.name);
      const children=node.evolves_to.flatMap(c=>walkChain(c));
      if(p&&p.id<=151) return [{pokemon:p, evolvesTo: node.evolves_to.map(c=>{
        const cp=allPokemon.find(x=>x.name===c.species.name);
        return cp&&cp.id<=151?{pokemon:cp,evolvesTo:[]}:null;
      }).filter(Boolean)}];
      return children;
    }
    const nodes=walkChain(cd.chain);
    container.innerHTML='';
    if(nodes.length===0){
      container.innerHTML='<span style="font-size:12px;color:#aaa">No evolution data.</span>';
      return;
    }
    // Build a proper linear/branching chain from scratch
    function buildChain(node, first=true) {
      if(!first){
        const arrow=document.createElement('div');
        arrow.className='learn-evo-arrow'; arrow.textContent='→';
        container.appendChild(arrow);
      }
      const member=makeLearnEvoMember(node.pokemon, pokemonId);
      if(member) container.appendChild(member);
      if(node.evolvesTo.length===1){
        buildChain(node.evolvesTo[0], false);
      } else if(node.evolvesTo.length>1){
        const arrow=document.createElement('div');
        arrow.className='learn-evo-arrow'; arrow.textContent='→';
        container.appendChild(arrow);
        const branch=document.createElement('div'); branch.className='learn-evo-branch';
        node.evolvesTo.forEach(child=>{
          const member2=makeLearnEvoMember(child.pokemon, pokemonId);
          if(member2) branch.appendChild(member2);
        });
        container.appendChild(branch);
      }
    }
    buildChain(nodes[0], true);
  } catch(e) {
    container.innerHTML='<span style="font-size:12px;color:#aaa">Evolution data unavailable.</span>';
  }
}
function renderLearnEvoTree(container, node, currentId, isFirst=true) {
  if(!isFirst) {
    const arrow=document.createElement('div');
    arrow.className='learn-evo-arrow';
    arrow.textContent='→';
    container.appendChild(arrow);
  }
  const member=makeLearnEvoMember(node.pokemon, currentId);
  if(member) container.appendChild(member);
  if(node.evolvesTo.length===0) return;
  if(node.evolvesTo.length===1){
    renderLearnEvoTree(container, node.evolvesTo[0], currentId, false);
  } else {
    const branch=document.createElement('div');
    branch.className='learn-evo-branch';
    node.evolvesTo.forEach(child=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:6px;';
      renderLearnEvoTree(row, child, currentId, false);
      branch.appendChild(row);
    });
    const arrow=document.createElement('div');
    arrow.className='learn-evo-arrow';
    arrow.textContent='→';
    container.appendChild(arrow);
    container.appendChild(branch);
  }
}
function makeLearnEvoMember(p,currentId) {
  if(!p) return null;
  const wrap=document.createElement('div');
  wrap.className='learn-evo-member'+(p.id===currentId?' current':'');
  wrap.onclick=()=>{ if(p.id!==currentId) openLearnDetail(p.id,false); };
  const img=document.createElement('img');
  img.src=gifUrl(p.name); img.onerror=()=>{img.onerror=null;img.src=fallbackUrl(p.id);};
  const name=document.createElement('div'); name.className='evo-mem-name'; name.textContent=displayName(p.name);
  const num=document.createElement('div'); num.className='evo-mem-num'; num.textContent='#'+String(p.id).padStart(3,'0');
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

// ── Utility ──────────────────────────────────────────────────────
function preloadNext() {
  if(quizType==='whos'&&currentQ+1<questions.length){ const p=new Image(); p.src=gifUrl(questions[currentQ+1].correct.name); }
}
function updateAccuracy() {
  document.getElementById('accuracy-display').textContent=answeredCount===0?'—':Math.round(correctCount/answeredCount*100)+'%';
}
function nextQuestion()  {
  playClick();
  clearAutoNext();
  currentQ++;
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
  confetti({ particleCount:65, spread:70, origin:{y:0.58}, colors:['#ff4444','#ffcc00','#44aa44','#4488ff','#ff88cc','#ffffff'] });
}
function celebrationConfetti(pct) {
  if(pct<60) return;
  const rounds=pct===100?6:pct>=80?3:1, count=pct===100?130:75;
  let fired=0;
  const iv=setInterval(()=>{
    confetti({ particleCount:count, angle:fired%2===0?60:120, spread:80,
      origin:{x:fired%2===0?0.1:0.9,y:0.6}, colors:['#cc0000','#ffcc00','#ffffff','#ff6666','#ffee88'] });
    if(++fired>=rounds*2) clearInterval(iv);
  },340);
}