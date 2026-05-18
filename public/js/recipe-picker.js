/* IRRecipePicker — modal that lets the user pick one of the 12 recipes.
   Used by favorites slot assignment, main screen slot click, recipes search jump.
   Renders into the shared #ir-modal overlay. */
(function () {
  function open(opts) {
    opts = opts || {};
    var overlay = document.getElementById('ir-modal-overlay');
    var title = document.getElementById('ir-modal-title');
    var body = document.getElementById('ir-modal-body');
    var actions = document.getElementById('ir-modal-actions');
    if (!overlay || !title || !body || !actions) return;

    title.textContent = opts.title || '레시피 선택';
    body.className = 'ir-modal-body is-info';
    body.style.padding = '14px 18px';
    body.style.textAlign = 'left';

    fetch('/api/recipes').then(function (r) { return r.json(); }).then(function (server) {
      var recipes = window.IRState ? window.IRState.applyOverlay(server) : server;
      var html = '<div class="picker-grid">';
      recipes.forEach(function (r) {
        var sel = opts.selectedId === r.id ? ' is-selected' : '';
        html += '<button class="picker-i' + sel + '" data-rid="' + r.id + '">' +
                '<span class="picker-num">' + String(r.id).padStart(2, '0') + '</span>' +
                '<span class="picker-name">레시피 ' + r.id + '</span>' +
                '<span class="picker-meta">' + (r.coffeeWeight || '--') + 'g · ' + (r.ratio || '--') + '</span>' +
                '</button>';
      });
      html += '</div>';
      if (opts.allowClear) {
        html += '<div style="margin-top:10px;text-align:right;"><button class="picker-clear" data-action="clear">슬롯 비우기</button></div>';
      }
      body.innerHTML = html;

      body.querySelectorAll('.picker-i').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var rid = parseInt(btn.dataset.rid, 10);
          overlay.classList.remove('is-open');
          body.style.cssText = '';
          if (typeof opts.onPick === 'function') opts.onPick(rid);
        });
      });
      var clearBtn = body.querySelector('.picker-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          overlay.classList.remove('is-open');
          body.style.cssText = '';
          if (typeof opts.onPick === 'function') opts.onPick(null);
        });
      }
    });

    actions.innerHTML = '';
    var cancel = document.createElement('button');
    cancel.className = 'ir-modal-btn';
    cancel.textContent = '취소';
    cancel.addEventListener('click', function () {
      overlay.classList.remove('is-open');
      body.style.cssText = '';
      if (typeof opts.onCancel === 'function') opts.onCancel();
    });
    actions.appendChild(cancel);

    overlay.classList.add('is-open');
  }

  // Inject picker styles once
  var style = document.createElement('style');
  style.textContent =
    '.picker-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:480px;}' +
    '.picker-i{display:grid;grid-template-columns:32px 1fr auto;gap:8px;align-items:center;padding:10px 12px;border:1px solid var(--hair,#ECECEC);background:var(--bg,#fff);cursor:pointer;text-align:left;font-family:inherit;font-size:12px;color:var(--ink,#111);}' +
    '.picker-i:hover{border-color:var(--ink,#111);}' +
    '.picker-i.is-selected{border-color:var(--brand,#E60012);background:var(--brand-dim,rgba(230,0,18,0.06));}' +
    '.picker-num{font-weight:700;color:var(--ink-3,#999);font-variant-numeric:tabular-nums;font-size:11px;}' +
    '.picker-name{font-weight:600;color:var(--ink,#111);}' +
    '.picker-meta{font-size:10.5px;color:var(--ink-3,#999);font-variant-numeric:tabular-nums;}' +
    '.picker-clear{padding:6px 12px;font-size:11px;font-weight:600;color:var(--ink-3,#999);background:transparent;border:1px dashed var(--hair-2,#DDD);cursor:pointer;font-family:inherit;}' +
    '.picker-clear:hover{color:var(--brand,#E60012);border-color:var(--brand,#E60012);}';
  document.head.appendChild(style);

  window.IRRecipePicker = { open: open };
})();
