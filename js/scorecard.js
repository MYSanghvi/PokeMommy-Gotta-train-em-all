/* scorecard.js — PokéMommy Score Card */
(function () {
'use strict';

/* ── Palette ── */
var W      = 400;
var YELLOW = '#FFCB05';
var BLUE   = '#3D7DCA';
var DARK   = '#1C2438';
var MUTED  = '#8A8A8A';
var BORDER = '#E2E2E2';

/* ── Layout ── */
var hH  = 70;
var YB  = 4;
var by  = hH + YB + 10;
var dv  = by + 56;
var sy  = dv + 78;
var my  = sy + 44;
var pY  = my + 32;
var pH  = 42, pG = 8;
var PAD = 16;
var PW  = W - PAD * 2;
var HW  = (PW - 8) / 2;
var FOOTER_H = 58;

/* Avatar */
var AX   = W - 136;
var AW   = 118;
var AH   = AW / (250 / 560);
var ACLP = Math.round(AH * 0.72);

var lastPillBottom = pY + 2 * (pH + pG) - pG;
var H = Math.max(lastPillBottom, hH + YB + ACLP) + FOOTER_H;

/* ── Image helpers ── */

/* Always resolve to absolute URL so it works from any page depth */
function _absUrl(rel) {
  return new URL(rel, document.baseURI).href;
}

/* Load a fresh Image — always creates a new Image() to avoid stale DOM references */
function _load(src, cb) {
  var img = new Image();
  /* Use CORS only for http(s); file:// local runs reject crossOrigin requests. */
  var absSrc = _absUrl(src);
  if (/^https?:/i.test(absSrc)) img.crossOrigin = 'anonymous';
  img.onload  = function () { cb(img); };
  img.onerror = function () {
    /* Retry once without crossOrigin (some servers reject the preflight) */
    var retry = new Image();
    retry.onload  = function () { cb(retry); };
    retry.onerror = function () { cb(null); };
    retry.src = absSrc;
  };
  img.src = absSrc;
}

/* ── Value formatters ── */
function _fmtMode(m) {
  if (!m) return '';
  if (/full/i.test(m))  return 'Full \u2022 151 Pok\u00e9mon';
  if (/quick/i.test(m)) return 'Quick \u2022 20 Questions';
  return m;
}

function _fmtTime(t) {
  if (!t) return '';
  var mo = t.match(/^(\d+)m\s*([\d.]+)s?/);
  if (mo) {
    var mins = parseInt(mo[1], 10), secs = mo[2];
    return mins === 0 ? secs + 's' : mins + 'm ' + secs + 's';
  }
  return t;
}

/* ── dataUrl → Blob ── */
function _toBlob(dataUrl) {
  var parts = dataUrl.split(','), mime = parts[0].match(/:(.*?);/)[1];
  var raw = atob(parts[1]), buf = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

/* ── Canvas helpers ── */
function _rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);     ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);     ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);         ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
}

function _pokeball(ctx, cx, cy, r, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.closePath();
  ctx.fillStyle = '#cc0000'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI); ctx.closePath();
  ctx.fillStyle = '#f0f0f0'; ctx.fill();
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = r * 0.115;
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = r * 0.08; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2);
  ctx.fillStyle = '#999'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = '#eee'; ctx.fill();
  ctx.restore();
}

/* All pills use YELLOW accent for consistency */
function _pill(ctx, x, y, w, h, label, value) {
  _rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#F8F8F8'; ctx.fill();
  ctx.strokeStyle = BORDER; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 10); ctx.lineTo(x, y + h - 10);
  ctx.quadraticCurveTo(x, y + h, x + 10, y + h);
  ctx.lineTo(x + 10, y + h); ctx.lineTo(x + 10, y);
  ctx.quadraticCurveTo(x, y, x, y + 10); ctx.closePath();
  ctx.fillStyle = YELLOW; ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = MUTED; ctx.font = '9px Roboto, Arial, sans-serif';
  ctx.fillText(label.toUpperCase(), x + 16, y + h / 2 - 5);
  ctx.fillStyle = DARK; ctx.font = 'bold 12px Flexo, Arial, sans-serif';
  var v = String(value), mw = w - 28;
  while (ctx.measureText(v).width > mw && v.length > 1) v = v.slice(0, -1);
  if (v !== String(value)) v += '\u2026';
  ctx.fillText(v, x + 16, y + h / 2 + 9);
}

/* ── Card builder ── */
function _buildCard(d, logo, boy, girl) {
  var cv  = document.createElement('canvas');
  var dpr = Math.max(window.devicePixelRatio || 1, 2);
  cv.width  = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  cv.style.width  = W + 'px';
  cv.style.height = H + 'px';
  var ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  var name   = d.name   || 'Trainer';
  var pct    = typeof d.pct === 'number' ? d.pct : parseInt(d.pct) || 0;
  var score  = d.score  || '';
  var time   = _fmtTime(d.time || '');
  var diff   = d.diff   || 'Hard';
  var mode   = _fmtMode(d.mode || '');
  var qtype  = d.qtype  || '';
  var gender = d.gender || 'boy';

  var msg    = pct === 100 ? 'Perfect score! True Pokémon Master!'
             : pct >= 80   ? 'Excellent! Almost a Pokémon Master!'
             : pct >= 60   ? 'Good job, Trainer! Keep it up!'
             : pct >= 40   ? 'Not bad, but keep training!'
             :               'Time to revisit your Pokédex!';
  var msgBg  = pct >= 80 ? '#FFF8DC' : '#EEF4FF';
  var msgBdr = pct >= 80 ? YELLOW    : BLUE;

  /* ── Background ── */
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  _pokeball(ctx, W - 20, H - 20, 100, 0.04);
  _pokeball(ctx, 22, 22, 22, 0.07);

  /* ── Header ── */
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, hH);
  if (logo) {
    var asp = logo.naturalWidth / logo.naturalHeight;
    var lh  = 44, lw = lh * asp;
    if (lw > W - 40) { lw = W - 40; lh = lw / asp; }
ctx.drawImage(logo, (W - lw) / 2, 14, lw, lh);
ctx.textAlign = 'center'; ctx.fillStyle = MUTED;
ctx.font = 'italic 10px Roboto, Arial, sans-serif';
ctx.fillText("Gotta train \u2019em all", W / 2, 14 + lh + 9);
  } else {
    ctx.textAlign = 'center'; ctx.fillStyle = DARK;
    ctx.font = 'bold 22px PokemonSolid, Arial, sans-serif';
    ctx.fillText('Pok\u00e9Mommy', W / 2, 30);
    ctx.fillStyle = MUTED; ctx.font = 'italic 10px Roboto, Arial, sans-serif';
    ctx.fillText("Gotta train \u2019em all", W / 2, 48);
  }

  /* ── Yellow accent bar ── */
  ctx.fillStyle = YELLOW; ctx.fillRect(0, hH, W, YB);
  ctx.fillStyle = BORDER; ctx.fillRect(0, hH + YB, W, 1);

  /* ── Avatar ── */
  var av = (gender === 'girl') ? girl : boy;
  if (av) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(AX, hH + YB + 2, W - AX, ACLP);
    ctx.clip();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(av, AX + (W - AX - AW) / 2, hH + YB + 4, AW, AH);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(AX, hH + YB + 2, W - AX, ACLP);
    ctx.fillStyle = '#CCCCCC'; ctx.font = '52px Arial'; ctx.textAlign = 'center';
    ctx.fillText(gender === 'girl' ? '\u2640' : '\u2642', AX + (W - AX) / 2, hH + YB + ACLP / 2 + 18);
    ctx.restore();
  }

  /* ── Trainer name ── */
  ctx.textAlign = 'left';
  ctx.fillStyle = MUTED; ctx.font = '700 9px Roboto, Arial, sans-serif';
  ctx.fillText('TRAINER', PAD, by + 18);
  ctx.fillStyle = DARK; ctx.font = 'bold 24px Flexo, Arial, sans-serif';
  var maxNW = AX - PAD - 8, dn = name;
  while (ctx.measureText(dn).width > maxNW && dn.length > 1) dn = dn.slice(0, -1);
  if (dn !== name) dn += '\u2026';
  ctx.fillText(dn, PAD, by + 44);

  /* ── Fading divider ── */
  var dgr = ctx.createLinearGradient(PAD, 0, PAD + PW * 0.55, 0);
  dgr.addColorStop(0, YELLOW + 'CC'); dgr.addColorStop(1, YELLOW + '00');
  ctx.strokeStyle = dgr; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, dv); ctx.lineTo(PAD + PW * 0.55, dv); ctx.stroke();

  /* ── Score % — dynamic size so % never clips ── */
  var pctText = pct + '%';
  var pctSize = 80;
  var maxPctW = AX - PAD - 10;
  ctx.font = 'bold ' + pctSize + 'px Flexo, Arial, sans-serif';
  while (ctx.measureText(pctText).width > maxPctW && pctSize > 40) {
    pctSize -= 4;
    ctx.font = 'bold ' + pctSize + 'px Flexo, Arial, sans-serif';
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 1;
  ctx.fillStyle = YELLOW; ctx.textAlign = 'left';
  ctx.fillText(pctText, PAD - 2, sy);
  ctx.restore();
  ctx.fillStyle = MUTED; ctx.font = '13px Flexo, Arial, sans-serif';
  ctx.textAlign = 'left'; ctx.fillText(score + ' correct', PAD, sy + 22);

  /* ── Message pill ── */
  _rr(ctx, PAD, my, PW, 26, 13);
  ctx.fillStyle = msgBg; ctx.fill();
  ctx.strokeStyle = msgBdr + '88'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = DARK; ctx.font = '11px Flexo, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(msg, PAD + PW / 2, my + 17);

  /* ── Stat pills ── */
  var col0 = PAD, col1 = PAD + HW + 8;
  _pill(ctx, col0, pY,           HW, pH, 'Quiz Type',  qtype);
  _pill(ctx, col1, pY,           HW, pH, 'Mode',       mode);
  _pill(ctx, col0, pY + pH + pG, HW, pH, 'Difficulty', diff);
  _pill(ctx, col1, pY + pH + pG, HW, pH, 'Time',       time);

  /* ── Footer ── */
  var fy = H - FOOTER_H + 8;
  ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, fy); ctx.lineTo(W - PAD, fy); ctx.stroke();
  ctx.fillStyle = MUTED; ctx.font = '9.5px Roboto, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("Created by MaulishMaster, for my wife and", W / 2, fy + 16);
  ctx.fillText("our little future Pokemon Trainer she\u2019s carrying.", W / 2, fy + 30);

  /* ── Border: yellow outline + white gap (NO solid bottom bar) ── */
  /* 1. Yellow outer border */
  ctx.strokeStyle = YELLOW; ctx.lineWidth = 6;
  _rr(ctx, 3, 3, W - 6, H - 6, 14);
  ctx.stroke();
  /* 2. White gap ring between border and content */
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
  _rr(ctx, 9, 9, W - 18, H - 18, 10);
  ctx.stroke();

  return cv;
}

/* ── Modal styles ── */
function _injectStyles() {
  if (document.getElementById('_sc_styles')) return;
  var s = document.createElement('style');
  s.id = '_sc_styles';
  s.textContent =
    '#_sc_modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.82);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'padding:20px;gap:16px;animation:_scIn .2s ease}' +
    '@keyframes _scIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}' +
    '#_sc_modal canvas{border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.45);display:block;}' +
    '#_sc_modal ._sc_row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}' +
    '#_sc_modal ._sc_hint{font-size:11px;color:rgba(255,255,255,0.4);margin-top:-4px;' +
    'font-family:Roboto,Arial,sans-serif;text-align:center;max-width:300px;line-height:1.5}' +
    '#_sc_modal button{padding:13px 26px;border:none;border-radius:10px;font-size:15px;' +
    'font-weight:700;cursor:pointer;font-family:Flexo,Arial,sans-serif;' +
    'transition:opacity .15s,transform .1s}' +
    '#_sc_modal button:active{opacity:.8;transform:scale(.96)}' +
    '#_sc_modal ._dl{background:#FFCB05;color:#1C2438}' +
    '#_sc_modal ._sh{background:#3D7DCA;color:#fff}' +
    '#_sc_modal ._x{position:absolute;top:14px;right:18px;background:none;border:none;' +
    'color:rgba(255,255,255,0.45);font-size:28px;cursor:pointer;padding:4px 8px;line-height:1}';
  document.head.appendChild(s);
}

/* ── Modal ── */
function _showModal(cvDisplay, safeUrl, shareText) {
  _injectStyles();
  var old = document.getElementById('_sc_modal');
  if (old) old.remove();

  var canShareFile = (function () {
    try { return typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File(['x'], 'x.png', { type: 'image/png' })] }); }
    catch (e) { return false; }
  }());

  var modal = document.createElement('div'); modal.id = '_sc_modal';

  var xBtn = document.createElement('button');
  xBtn.className = '_x'; xBtn.innerHTML = '&times;';
  xBtn.onclick = function () { modal.remove(); };

  var maxPx = Math.min(400, window.innerWidth - 40);
  var scale = maxPx / W;
  cvDisplay.style.cssText =
    'width:'  + Math.round(W * scale) + 'px;' +
    'height:' + Math.round(H * scale) + 'px;' +
    'border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.45);display:block;';

  var row = document.createElement('div'); row.className = '_sc_row';

  var dl = document.createElement('button');
  dl.className = '_dl'; dl.textContent = '\uD83D\uDCBE Download';
  dl.onclick = function () {
    var a = document.createElement('a');
    a.href = safeUrl; a.download = 'pokemommy-score.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    modal.remove();
    if (typeof showToast === 'function') showToast('Score card downloaded! \uD83D\uDCE5');
  };
  row.appendChild(dl);

  var sh = document.createElement('button'); sh.className = '_sh';
  if (canShareFile) {
    sh.textContent = '\uD83D\uDCE4 Share';
    sh.onclick = function () {
      var blob = _toBlob(safeUrl);
      var file = new File([blob], 'pokemommy-score.png', { type: 'image/png' });
      navigator.share({ files: [file], text: shareText })
        .then(function () { modal.remove(); })
        .catch(function (err) { if (err && err.name !== 'AbortError') dl.click(); });
    };
  } else {
    sh.textContent = '\uD83D\uDCCB Copy Caption';
    sh.onclick = function () {
      var done = function () {
        if (typeof showToast === 'function') showToast('Caption copied! \uD83D\uDCCB');
        modal.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(done)
          .catch(function () { _copyFallback(shareText); done(); });
      } else { _copyFallback(shareText); done(); }
    };
  }
  row.appendChild(sh);

  var hint = document.createElement('p'); hint.className = '_sc_hint';
  hint.textContent = canShareFile
    ? 'Tap share to post the card image directly.'
    : 'Download the image, then copy caption to share it anywhere.';

  modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
  modal.appendChild(xBtn); modal.appendChild(cvDisplay);
  modal.appendChild(row); modal.appendChild(hint);
  document.body.appendChild(modal);
}

function _copyFallback(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;top:-999px;left:-999px';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

/* ── Public API ── */
window.shareScoreCard = function (data) {
  var pct = typeof data.pct === 'number' ? data.pct : parseInt(data.pct) || 0;
  var shareText = 'I scored ' + pct + '% on the Pokémon quiz. Can you go further? ' +
    'https://mysanghvi.github.io/PokeMommy/';

  /*
   * Always load all three images fresh on every call.
   * This is the most reliable approach — avoids stale references,
   * DOM-visibility issues, and cache inconsistencies between desktop & mobile.
   * crossOrigin='anonymous' in _load() prevents canvas taint on GitHub Pages.
   */
  var imgs = { logo: null, boy: null, girl: null };
  var needed = 3, done = 0;

  function _tryBuild() {
    if (done < needed) return;
    var cv      = _buildCard(data, imgs.logo, imgs.boy, imgs.girl);
    var safeUrl;
    try  { safeUrl = cv.toDataURL('image/png'); }
    catch(e) {
      if (location.protocol === 'file:' && typeof showToast === 'function') {
        showToast('Local file mode blocks exporting embedded images. Run the site through a local web server to include the logo and avatar.');
      }
      console.warn('Score card export fell back to a text-only image:', e);
      safeUrl = _buildCard(data, null, null, null).toDataURL('image/png');
    }
    _showModal(cv, safeUrl, shareText);
  }

  _load('img/pokemommy_logo.png', function (i) { imgs.logo = i; done++; _tryBuild(); });
  _load('img/avatar_boy.png',     function (i) { imgs.boy  = i; done++; _tryBuild(); });
  _load('img/avatar_girl.png',    function (i) { imgs.girl = i; done++; _tryBuild(); });
};

}());
