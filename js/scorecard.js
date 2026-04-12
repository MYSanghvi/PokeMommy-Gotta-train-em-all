/* scorecard.js — PokéMommy Score Card */
(function () {
  'use strict';

  var W = 400, H = 660, YELLOW = '#FFCB05', BLUE = '#3D7DCA';
  var LC = 16, LW = 214, RC = 238, RW = 154;
  var _logo = null, _boy = null, _girl = null;

  /* ── Preload assets ─────────────────────────────────────────────────── */
  function _load(src, cb) {
    var img = new Image();
    img.onload  = function () { cb(img); };
    img.onerror = function () { cb(null); };
    img.src = src;
  }
  function _preload() {
    _load('img/pokemommylogo.png', function (i) { _logo = i; });
    _load('img/avatar_boy.png',   function (i) { _boy  = i; });
    _load('img/avatar_girl.png',  function (i) { _girl = i; });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _preload);
  } else {
    _preload();
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
    ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.115;
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.08; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.17, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }

  function _pill(ctx, x, y, w, h, label, value, accent) {
    _rr(ctx, x, y, w, h, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.055)'; ctx.fill();
    ctx.strokeStyle = accent + '55'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 10); ctx.lineTo(x, y + h - 10);
    ctx.quadraticCurveTo(x, y + h, x + 10, y + h);
    ctx.lineTo(x + 10, y + h); ctx.lineTo(x + 10, y);
    ctx.quadraticCurveTo(x, y, x, y + 10); ctx.closePath();
    ctx.fillStyle = accent; ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.font = '9px Roboto, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), x + 16, y + h / 2 - 5);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Flexo, Arial, sans-serif';
    var v = String(value), mw = w - 24;
    while (ctx.measureText(v).width > mw && v.length > 1) v = v.slice(0, -1);
    if (v !== String(value)) v += '...';
    ctx.fillText(v, x + 16, y + h / 2 + 9);
  }

  /* ── Card builder (synchronous) ─────────────────────────────────────── */
  function _buildCard(d) {
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');

    var name   = d.name   || 'Trainer';
    var pct    = typeof d.pct === 'number' ? d.pct : parseInt(d.pct) || 0;
    var score  = d.score  || '';
    var time   = d.time   || '';
    var diff   = d.diff   || 'Hard';
    var mode   = d.mode   || 'Quick (20)';
    var qtype  = d.qtype  || '';
    var gender = d.gender || 'boy';
    var sc     = pct >= 80 ? YELLOW : '#7eb3f7';
    var msg    = pct === 100 ? 'True Pokemon Master!'
               : pct >= 80  ? 'Excellent run, Trainer!'
               : pct >= 60  ? 'Solid instincts!'
               : pct >= 40  ? 'Keep training!'
               :               'Back to Prof. Oak!';

    /* Background */
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a1628'); bg.addColorStop(0.45, '#0d2048'); bg.addColorStop(1, '#0a1628');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    _pokeball(ctx, W - 28, H - 28, 130, 0.06);
    _pokeball(ctx, 28, 28, 24, 0.16);

    /* Yellow header */
    var hH = 68;
    var hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, '#e6b800'); hg.addColorStop(0.5, YELLOW); hg.addColorStop(1, '#e6b800');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, hH);
    if (_logo) {
      var asp = _logo.naturalWidth / _logo.naturalHeight;
      var lw = Math.min(210, W - 80), lh = lw / asp;
      if (lh > 42) { lh = 42; lw = lh * asp; }
      ctx.drawImage(_logo, (W - lw) / 2, (hH - lh) / 2, lw, lh);
    } else {
      ctx.textAlign = 'center'; ctx.fillStyle = '#0a1628';
      ctx.font = '24px PokemonSolid, Arial, sans-serif'; ctx.fillText('PokeMommy', W / 2, 30);
      ctx.font = '11px Roboto, Arial, sans-serif'; ctx.fillStyle = 'rgba(10,22,40,0.6)';
      ctx.fillText('SCORE CARD', W / 2, 50);
    }
    ctx.fillStyle = '#cc0000'; ctx.fillRect(0, hH - 6, W, 6);
    ctx.fillStyle = '#111';    ctx.fillRect(0, hH,     W, 2);

    /* Shine */
    var shine = ctx.createLinearGradient(0, hH + 2, W * 0.55, H * 0.55);
    shine.addColorStop(0, 'rgba(255,255,255,0.07)');
    shine.addColorStop(0.4, 'rgba(255,255,255,0.03)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine; ctx.fillRect(0, hH + 2, W, H - hH - 2);
    var glow = ctx.createRadialGradient(40, hH + 30, 0, 40, hH + 30, 180);
    glow.addColorStop(0, 'rgba(255,255,255,0.06)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, hH + 2, W, H - hH - 2);

    /* Left column */
    var by = hH + 10;
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = '700 9px Roboto, Arial, sans-serif'; ctx.fillText('TRAINER', LC, by + 20);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Flexo, Arial, sans-serif';
    var dn = name;
    while (ctx.measureText(dn).width > LW - 4 && dn.length > 1) dn = dn.slice(0, -1);
    if (dn !== name) dn += '...';
    ctx.fillText(dn, LC, by + 50);
    var dv = by + 60;
    var dg = ctx.createLinearGradient(LC, 0, LC + LW, 0);
    dg.addColorStop(0, 'rgba(255,203,5,0.55)'); dg.addColorStop(1, 'rgba(255,203,5,0)');
    ctx.strokeStyle = dg; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(LC, dv); ctx.lineTo(LC + LW, dv); ctx.stroke();
    var sy = dv + 80;
    ctx.save();
    ctx.shadowColor = sc; ctx.shadowBlur = 28; ctx.fillStyle = sc;
    ctx.font = 'bold 82px Flexo, Arial, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(pct + '%', LC - 4, sy);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '13px Flexo, Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText(score + ' correct', LC, sy + 24);
    var my = sy + 46;
    _rr(ctx, LC, my, LW, 26, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.055)'; ctx.fill();
    ctx.strokeStyle = sc + '44'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11px Flexo, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(msg, LC + LW / 2, my + 17);
    var pH = 42, pG = 7, pY = my + 36;
    [['Quiz Type', qtype, BLUE], ['Difficulty', diff, YELLOW],
     ['Mode', mode, BLUE],       ['Time', time, YELLOW]
    ].forEach(function (p, i) { _pill(ctx, LC, pY + i * (pH + pG), LW, pH, p[0], p[1], p[2]); });

    /* Right column — avatar */
    _rr(ctx, RC, by + 4, RW, H - by - 24, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.stroke();
    var av = gender === 'girl' ? _girl : _boy;
    if (av) {
      var tW = RW - 8, tH = tW / (250 / 560);
      ctx.save();
      ctx.beginPath(); ctx.rect(RC + 2, by + 6, RW - 4, tH * 0.68); ctx.clip();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(av, RC + (RW - tW) / 2, by + 16, tW, tH);
      ctx.restore();
    } else {
      _pokeball(ctx, RC + RW / 2, by + 4 + (H - by - 28) / 2, 38, 0.25);
    }

    /* Footer */
    var fy = H - 28;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, fy - 8); ctx.lineTo(W - 20, fy - 8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.font = '10px Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('pokemommy.app  ·  Can you beat this score?', W / 2, fy + 6);
    ctx.fillStyle = YELLOW; ctx.fillRect(0, H - 6, W, 6);

    return cv;
  }

  /* ── Modal styles (injected once) ──────────────────────────────────── */
  function _injectStyles() {
    if (document.getElementById('_sc_styles')) return;
    var s = document.createElement('style');
    s.id = '_sc_styles';
    s.textContent =
      '#_sc_modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'padding:20px;gap:16px;animation:_scIn .2s ease}' +
      '@keyframes _scIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}' +
      '#_sc_modal img{max-height:62vh;max-width:min(340px,88vw);border-radius:16px;' +
      'box-shadow:0 24px 60px rgba(0,0,0,0.9);display:block}' +
      '#_sc_modal ._sc_row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}' +
      '#_sc_modal ._sc_hint{font-size:11px;color:rgba(255,255,255,0.35);' +
      'font-family:Roboto,Arial,sans-serif;text-align:center;max-width:280px}' +
      '#_sc_modal button{padding:13px 26px;border:none;border-radius:10px;font-size:15px;' +
      'font-weight:700;cursor:pointer;font-family:Flexo,Arial,sans-serif;' +
      'transition:opacity .15s,transform .1s}' +
      '#_sc_modal button:active{opacity:.8;transform:scale(.96)}' +
      '#_sc_modal ._dl{background:#FFCB05;color:#0a1628}' +
      '#_sc_modal ._sh{background:#3D7DCA;color:#fff}' +
      '#_sc_modal ._x{position:absolute;top:14px;right:18px;background:none;border:none;' +
      'color:rgba(255,255,255,0.4);font-size:28px;cursor:pointer;padding:4px 8px;line-height:1}';
    document.head.appendChild(s);
  }

  /* ── Share modal ─────────────────────────────────────────────────────  */
  function _showModal(dataUrl, getBlobFn, shareText) {
    _injectStyles();
    var old = document.getElementById('_sc_modal');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = '_sc_modal';

    /* × close */
    var x = document.createElement('button');
    x.className = '_x'; x.innerHTML = '&times;';
    x.onclick = function () { modal.remove(); };

    /* Card preview */
    var img = document.createElement('img');
    img.src = dataUrl; img.alt = 'Score Card';

    /* Button row */
    var row = document.createElement('div');
    row.className = '_sc_row';

    /* ── Download (always present) ── */
    var dl = document.createElement('button');
    dl.className = '_dl'; dl.textContent = '💾 Download';
    dl.onclick = function () {
      var a = document.createElement('a');
      a.href = dataUrl; a.download = 'pokemommy-score.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      modal.remove();
      if (typeof showToast === 'function') showToast('Score card downloaded! 📥');
    };

    /* ── Share (present when Web Share API is available) ── */
    var hint = null;
    if (navigator.share) {
      var sh = document.createElement('button');
      sh.className = '_sh'; sh.textContent = '📤 Share';
      sh.onclick = function () {
        var blob = getBlobFn();

        /* Can we share a file? (mobile browsers, not desktop) */
        var canFile = false;
        try { canFile = blob && typeof navigator.canShare === 'function' &&
              navigator.canShare({ files: [new File([blob], 'x.png', { type: 'image/png' })] }); }
        catch (e) {}

        var p;
        if (canFile) {
          /* Mobile: share image + caption */
          p = navigator.share({
            files: [new File([blob], 'pokemommy-score.png', { type: 'image/png' })],
            text: shareText
          });
        } else {
          /* Desktop Chrome/Edge: share text only (opens OS share dialog) */
          p = navigator.share({ text: shareText });
        }

        p.then(function () { modal.remove(); })
         .catch(function (err) {
           if (err && err.name !== 'AbortError') {
             if (typeof showToast === 'function') showToast('Share unavailable — use Download instead.');
           }
         });
      };
      row.appendChild(sh);

      /* Hint text shown only on desktop where file share isn't available */
      var canFileCheck = false;
      try { canFileCheck = typeof navigator.canShare === 'function' &&
            navigator.canShare({ files: [new File(['x'], 'x.png', { type: 'image/png' })] }); }
      catch (e) {}
      if (!canFileCheck) {
        hint = document.createElement('p');
        hint.className = '_sc_hint';
        hint.textContent = 'Tip: Download the image first, then share it.';
      }
    }

    row.insertBefore(dl, row.firstChild);
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    modal.appendChild(x);
    modal.appendChild(img);
    modal.appendChild(row);
    if (hint) modal.appendChild(hint);
    document.body.appendChild(modal);
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  window.shareScoreCard = function (data) {
    /* Build card synchronously — user gesture is preserved */
    var cv        = _buildCard(data);
    var dataUrl   = cv.toDataURL('image/png');
    var name      = data.name || 'Trainer';
    var pct       = typeof data.pct === 'number' ? data.pct : parseInt(data.pct) || 0;
    var shareText = name + ' scored ' + pct + '% on PokéMommy! pokemommy.app';

    /* Start blob generation in background — will be ready long before user taps Share */
    var _blob = null;
    cv.toBlob(function (b) { _blob = b; }, 'image/png');

    /* Show modal immediately. Share button calls getBlobFn() which returns
       the blob once ready (always will be by the time user taps). */
    _showModal(dataUrl, function () { return _blob; }, shareText);
  };

}());