/* scorecard.js — PokéMommy Score Card */
(function () {
  'use strict';

  /* ── Palette ────────────────────────────────────────────────────────── */
  var W      = 400;
  var YELLOW = '#FFCB05';
  var BLUE   = '#3D7DCA';
  var DARK   = '#1C2438';
  var MUTED  = '#999999';
  var BORDER = '#E8E8E8';

  /* ── Layout ─────────────────────────────────────────────────────────── */
  var hH  = 74;             /* header height — logo + subtitle     */
  var YB  = 4;              /* yellow bar                          */
  var by  = hH + YB + 10;  /* body y-start                        */
  var dv  = by + 56;
  var sy  = dv + 78;        /* score % baseline                    */
  var my  = sy + 44;        /* message pill y                      */
  var pY  = my + 32;        /* first pill row y                    */
  var pH  = 42, pG = 8;
  var PAD = 16;
  var PW  = W - PAD * 2;   /* full body width = 368               */
  var HW  = (PW - 8) / 2;  /* half-pill width = 180               */

  /* Avatar */
  var AX   = W - 136;
  var AW   = 118;
  var AH   = AW / (250 / 560);
  var ACLP = Math.round(AH * 0.72);

  var lastPillBottom = pY + 2 * (pH + pG) - pG;   /* 2 rows */
  var H = Math.max(lastPillBottom, hH + YB + ACLP) + 52;

  /* ── Preload ────────────────────────────────────────────────────────── */
  var _logo = null, _boy = null, _girl = null;
  function _load(src, cb) {
    var img = new Image();
    img.onload  = function () { cb(img); };
    img.onerror = function () { cb(null); };
    img.src = src;
  }
  function _preload() {
    _load('img/pokemommy_logo.png', function (i) { _logo = i; });
    _load('img/avatar_boy.png',     function (i) { _boy  = i; });
    _load('img/avatar_girl.png',    function (i) { _girl = i; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _preload);
  } else {
    _preload();
  }

  /* ── Value formatters ───────────────────────────────────────────────── */
  function _fmtMode(m) {
    if (!m) return '';
    if (/full/i.test(m))  return 'Full • 151 Pokémon';
    if (/quick/i.test(m)) return 'Quick • 20 Questions';
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

  /* ── dataUrl → Blob (synchronous) ───────────────────────────────────── */
  function _toBlob(dataUrl) {
    var parts = dataUrl.split(','), mime = parts[0].match(/:(.*?);/)[1];
    var raw = atob(parts[1]), buf = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
    return new Blob([buf], { type: mime });
  }

  /* ── Canvas helpers ─────────────────────────────────────────────────── */
  function _rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);     ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r,     y + h); ctx.quadraticCurveTo(x,     y + h, x,         y + h - r);
    ctx.lineTo(x,         y + r); ctx.quadraticCurveTo(x,     y,     x + r,     y);
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

  function _pill(ctx, x, y, w, h, label, value, accent) {
    _rr(ctx, x, y, w, h, 10);
    ctx.fillStyle = '#FAFAFA'; ctx.fill();
    ctx.strokeStyle = BORDER; ctx.lineWidth = 1; ctx.stroke();
    /* Left accent bar */
    ctx.beginPath();
    ctx.moveTo(x, y + 10); ctx.lineTo(x, y + h - 10);
    ctx.quadraticCurveTo(x, y + h, x + 10, y + h);
    ctx.lineTo(x + 10, y + h); ctx.lineTo(x + 10, y);
    ctx.quadraticCurveTo(x, y, x, y + 10); ctx.closePath();
    ctx.fillStyle = accent; ctx.fill();
    /* Label */
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED; ctx.font = '9px Roboto, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), x + 16, y + h / 2 - 5);
    /* Value */
    ctx.fillStyle = DARK; ctx.font = 'bold 12px Flexo, Arial, sans-serif';
    var v = String(value), mw = w - 28;
    while (ctx.measureText(v).width > mw && v.length > 1) v = v.slice(0, -1);
    if (v !== String(value)) v += '…';
    ctx.fillText(v, x + 16, y + h / 2 + 9);
  }

  /* ── Card builder ───────────────────────────────────────────────────── */
	function _buildCard(d, noImages) {
	var cv = document.createElement('canvas');
    const scale = window.devicePixelRatio || 1;
    cv.width = 400 * scale;
    cv.height = 660 * scale;
    var ctx = cv.getContext('2d');
    ctx.scale(scale, scale);

    var logo = noImages ? null : _logo;
    var boy  = noImages ? null : _boy;
    var girl = noImages ? null : _girl;

    var name   = d.name   || 'Trainer';
    var pct    = typeof d.pct === 'number' ? d.pct : parseInt(d.pct) || 0;
    var score  = d.score  || '';
    var time   = _fmtTime(d.time   || '');
    var diff   = d.diff   || 'Hard';
    var mode   = _fmtMode(d.mode   || '');
    var qtype  = d.qtype  || '';
    var gender = d.gender || 'boy';
    var msg    = pct === 100 ? 'True Pokemon Master!'
               : pct >= 80  ? 'Excellent run, Trainer!'
               : pct >= 60  ? 'Solid instincts!'
               : pct >= 40  ? 'Keep training!'
               :               'Back to Prof. Oak!';
    var msgBg  = pct >= 80 ? '#FFF8DC' : '#EEF4FF';
    var msgBdr = pct >= 80 ? YELLOW    : BLUE;

    /* White background */
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    _pokeball(ctx, W - 20, H - 20, 100, 0.04);
    _pokeball(ctx, 22, 22, 22, 0.07);

    /* ── Header (white) ── */
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, hH);

    if (logo) {
      var asp = logo.naturalWidth / logo.naturalHeight;
      var lw  = Math.min(190, W - 80), lh = lw / asp;
      if (lh > 36) { lh = 36; lw = lh * asp; }
      /* Logo in upper portion of header */
      ctx.drawImage(logo, (W - lw) / 2, (hH * 0.52 - lh) / 2, lw, lh);
    } else {
      ctx.textAlign = 'center'; ctx.fillStyle = DARK;
      ctx.font = 'bold 20px PokemonSolid, Arial, sans-serif';
      ctx.fillText('PokeMommy', W / 2, 28);
    }

    /* Subtitle */
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED;
    ctx.font = 'italic 11px Roboto, Arial, sans-serif';
    ctx.fillText("Gotta train 'em all", W / 2, hH - 8);

    /* Yellow bar */
    ctx.fillStyle = YELLOW; ctx.fillRect(0, hH, W, YB);
    ctx.fillStyle = BORDER;  ctx.fillRect(0, hH + YB, W, 1);

    /* ── Avatar (no panel) ── */
    var av = gender === 'girl' ? girl : boy;
    if (av) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(AX, hH + YB + 2, W - AX, ACLP);
      ctx.clip();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(av, AX + (W - AX - AW) / 2, hH + YB + 4, AW, AH);
      ctx.restore();
    }

    /* ── Trainer name ── */
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED; ctx.font = '700 9px Roboto, Arial, sans-serif';
    ctx.fillText('TRAINER', PAD, by + 18);

    ctx.fillStyle = DARK; ctx.font = 'bold 24px Flexo, Arial, sans-serif';
    var maxNW = AX - PAD - 8;
    var dn = name;
    while (ctx.measureText(dn).width > maxNW && dn.length > 1) dn = dn.slice(0, -1);
    if (dn !== name) dn += '…';
    ctx.fillText(dn, PAD, by + 44);

    /* Fading divider */
    var dgr = ctx.createLinearGradient(PAD, 0, PAD + PW * 0.55, 0);
    dgr.addColorStop(0, YELLOW + 'CC'); dgr.addColorStop(1, YELLOW + '00');
    ctx.strokeStyle = dgr; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD, dv); ctx.lineTo(PAD + PW * 0.55, dv); ctx.stroke();

    /* ── Score % — main yellow ── */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur   = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = YELLOW;
    ctx.font = 'bold 80px Flexo, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(pct + '%', PAD - 2, sy);
    ctx.restore();

    ctx.fillStyle = MUTED; ctx.font = '13px Flexo, Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(score + ' correct', PAD, sy + 22);

    /* ── Message pill (full width) ── */
    _rr(ctx, PAD, my, PW, 26, 13);
    ctx.fillStyle = msgBg; ctx.fill();
    ctx.strokeStyle = msgBdr + '88'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = DARK; ctx.font = '11px Flexo, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(msg, PAD + PW / 2, my + 17);

    /* ── Stat pills — 2 columns × 2 rows ── */
    /*  Row 0: Quiz Type (left)  |  Mode (right)      */
    /*  Row 1: Difficulty (left) |  Time (right)       */
    var col0 = PAD;
    var col1 = PAD + HW + 8;

    _pill(ctx, col0, pY,            HW, pH, 'Quiz Type',  qtype, BLUE);
    _pill(ctx, col1, pY,            HW, pH, 'Mode',       mode,  YELLOW);
    _pill(ctx, col0, pY + pH + pG,  HW, pH, 'Difficulty', diff,  YELLOW);
    _pill(ctx, col1, pY + pH + pG,  HW, pH, 'Time',       time,  BLUE);

    /* ── Footer ── */
    var fy = H - 26;
    ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, fy - 8); ctx.lineTo(W - PAD, fy - 8); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Created by MaulishMaster, for my wife and our little future Pokémon Trainer she's carrying", W / 2, fy + 4);
    ctx.fillStyle = YELLOW; ctx.fillRect(0, H - 6, W, 6);

    return cv;
  }

  /* ── Safe dataUrl ───────────────────────────────────────────────────── */
  function _getSafeDataUrl(d) {
    try   { return _buildCard(d, false).toDataURL('image/png'); }
    catch (e) { return _buildCard(d, true).toDataURL('image/png'); }
  }

  /* ── Modal styles ───────────────────────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('_sc_styles')) return;
    var s = document.createElement('style');
    s.id = '_sc_styles';
    s.textContent =
      '#_sc_modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.82);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'padding:20px;gap:16px;animation:_scIn .2s ease}' +
      '@keyframes _scIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}' +
      '#_sc_modal img{max-height:80vh;max-width:min(500px,92vw);border-radius:16px;' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.45);display:block;width:auto;height:auto}' +
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

  /* ── Modal ──────────────────────────────────────────────────────────── */
  function _showModal(cvDisplay, safeUrl, shareText) {
    _injectStyles();
    var old = document.getElementById('_sc_modal');
    if (old) old.remove();

    var canShareFile = (function () {
      try { return typeof navigator.canShare === 'function' &&
              navigator.canShare({ files: [new File(['x'], 'x.png', { type: 'image/png' })] }); }
      catch (e) { return false; }
    }());

    var modal = document.createElement('div');
    modal.id = '_sc_modal';

    var xBtn = document.createElement('button');
    xBtn.className = '_x'; xBtn.innerHTML = '&times;';
    xBtn.onclick = function () { modal.remove(); };

    cvDisplay.style.cssText =
      'max-height:65vh;max-width:min(340px,88vw);border-radius:16px;' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.45);display:block;';

    var row = document.createElement('div');
    row.className = '_sc_row';

    var dl = document.createElement('button');
    dl.className = '_dl'; dl.textContent = '💾 Download';
    dl.onclick = function () {
      var a = document.createElement('a');
      a.href = safeUrl; a.download = 'pokemommy-score.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      modal.remove();
      if (typeof showToast === 'function') showToast('Score card downloaded! 📥');
    };
    row.appendChild(dl);

    var sh = document.createElement('button');
    sh.className = '_sh';
    if (canShareFile) {
      sh.textContent = '📤 Share';
      sh.onclick = function () {
        var blob = _toBlob(safeUrl);
        var file = new File([blob], 'pokemommy-score.png', { type: 'image/png' });
        navigator.share({ files: [file], text: shareText })
          .then(function () { modal.remove(); })
          .catch(function (err) { if (err && err.name !== 'AbortError') dl.click(); });
      };
    } else {
      sh.textContent = '📋 Copy Caption';
      sh.onclick = function () {
        var done = function () {
          if (typeof showToast === 'function') showToast('Caption copied! 📋');
          modal.remove();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).then(done).catch(function () { _copyFallback(shareText); done(); });
        } else { _copyFallback(shareText); done(); }
      };
    }
    row.appendChild(sh);

    var hint = document.createElement('p');
    hint.className = '_sc_hint';
    hint.textContent = canShareFile
      ? 'Tap Share to post the card image directly.'
      : 'Download the image, then Copy Caption to share it anywhere.';

    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    modal.appendChild(xBtn);
    modal.appendChild(cvDisplay);
    modal.appendChild(row);
    modal.appendChild(hint);
    document.body.appendChild(modal);
  }

  function _copyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;top:-999px;left:-999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  window.shareScoreCard = function (data) {
    var name      = data.name || 'Trainer';
    var pct       = typeof data.pct === 'number' ? data.pct : parseInt(data.pct) || 0;
    var shareText = name + ' scored ' + pct + '% on PokéMommy! pokemommy.app';
    var cvDisplay = _buildCard(data, false);
    var safeUrl   = _getSafeDataUrl(data);
    _showModal(cvDisplay, safeUrl, shareText);
  };

}());
