/* enough-ux.js — menú móvil, aparición lenta y tono de la hora.
   Ligero: sin dependencias, un solo listener de scroll (rAF), respeta reduced-motion. */
(function () {
  'use strict';
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ruta = location.pathname;
  var esIndex = /\/(index\.html)?$/.test(ruta);
  var esLamina = document.body.classList.contains('lamina');

  /* ═══ 1) MENÚ MÓVIL ═══ */
  var nav = document.querySelector('nav.site-nav');
  if (nav) {
    if (esIndex) nav.classList.add('ux-dark');
    var burger = document.createElement('button');
    burger.className = 'ux-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Abrir menú');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-haspopup', 'dialog');
    burger.innerHTML = '<i></i><i></i>';
    nav.appendChild(burger);

    var panel = null;
    var armar = function () {
      panel = document.createElement('div');
      panel.className = 'ux-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', 'Menú');
      var links = '';
      nav.querySelectorAll('ul a').forEach(function (a, i) {
        var cur = a.getAttribute('aria-current') === 'page' || a.classList.contains('active');
        links += '<a href="' + a.getAttribute('href') + '"' + (cur ? ' aria-current="page"' : '') + '>' +
                 '<small>' + (i === 0 ? '—' : '0' + i) + '</small>' + a.textContent + '</a>';
      });
      panel.innerHTML =
        '<div class="ux-veil"></div>' +
        '<aside class="ux-side">' +
          '<button class="ux-close" type="button" aria-label="Cerrar menú"></button>' +
          '<div class="ux-links">' + links + '</div>' +
          '<div class="ux-foot"><b>Enough.</b> · Vol. I · Bucaramanga</div>' +
        '</aside>';
      document.body.appendChild(panel);
      panel.querySelector('.ux-veil').addEventListener('click', cerrar);
      panel.querySelector('.ux-close').addEventListener('click', cerrar);
      panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', cerrar); });
    };
    var abierto = function () { return panel && panel.classList.contains('open'); };
    var abrir = function () {
      if (!panel) armar();
      /* un frame para que la transición parta desde el estado cerrado */
      requestAnimationFrame(function () { panel.classList.add('open'); });
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('ux-lock');
      setTimeout(function () { var c = panel.querySelector('.ux-close'); if (c) c.focus(); }, 60);
    };
    var cerrar = function () {
      if (!abierto()) return;
      panel.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('ux-lock');
      burger.focus();
    };
    burger.addEventListener('click', function () { abierto() ? cerrar() : abrir(); });
    document.addEventListener('keydown', function (e) {
      if (!abierto()) return;
      if (e.key === 'Escape') { cerrar(); return; }
      if (e.key === 'Tab') {            /* el foco no se escapa del panel */
        var f = panel.querySelectorAll('button, a[href]');
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });
    /* si se agranda la ventana, cerrar el panel */
    window.matchMedia('(min-width: 921px)').addEventListener('change', function (m) {
      if (m.matches && abierto()) cerrar();
    });
  }

  /* ═══ 2) APARICIÓN LENTA ═══ */
  var objetivos = [];
  var marcar = function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal', 'ux-r');
      objetivos.push(el);
    });
  };
  if (!esIndex && !calmo) {
    marcar('.lam-fig, .lam-text > *, .lam-pager, .featured, .index-head, .essay-list, ' +
           '.fragmento, .filter-strip, footer.site-foot .ed-mark, footer.site-foot .ed-colophon');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      objetivos.forEach(function (el) { io.observe(el); });
      /* red de seguridad: lo que ya está a la vista no debe quedarse invisible */
      setTimeout(function () {
        objetivos.forEach(function (el) {
          if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
        });
      }, 2500);
    } else { objetivos.forEach(function (el) { el.classList.add('in'); }); }
  }

  /* ═══ 3) TONO SEGÚN LA HORA ═══ */
  if (esIndex) return;                  /* el inicio ya tiene su propio ciclo del día */
  var PALETA = [                        /* [hora desde, color 1, color 2] */
    [0,    'rgba(70,72,118,.20)',   'rgba(40,42,84,.15)'],     /* noche */
    [5,    'rgba(226,178,172,.30)', 'rgba(200,190,216,.18)'],  /* alba */
    [8,    'rgba(238,224,172,.26)', 'rgba(206,216,192,.14)'],  /* mañana */
    [11,   'rgba(240,236,216,.30)', 'rgba(220,228,216,.12)'],  /* mediodía */
    [14,   'rgba(224,186,112,.26)', 'rgba(192,162,112,.14)'],  /* tarde */
    [17,   'rgba(198,130,100,.28)', 'rgba(124,104,172,.20)'],  /* ocaso */
    [19.5, 'rgba(70,72,118,.20)',   'rgba(40,42,84,.15)']      /* noche */
  ];
  var capa = document.createElement('div');
  capa.className = 'ux-tono';
  capa.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(capa, document.body.firstChild);
  var actual = -1;
  var poner = function (h) {
    var i = 0;
    for (var k = 0; k < PALETA.length; k++) if (h >= PALETA[k][0]) i = k;
    if (i === actual) return;
    actual = i;
    capa.style.setProperty('--ux-t1', PALETA[i][1]);
    capa.style.setProperty('--ux-t2', PALETA[i][2]);
  };
  if (esLamina) {
    var m = /^(\d{1,2}):(\d{2})/.exec(document.body.getAttribute('data-hora') || '');
    var hora = m ? +m[1] + (+m[2]) / 60 : 12;
    capa.style.transition = 'none';     /* nace ya con su color… */
    poner(hora);
    requestAnimationFrame(function () { requestAnimationFrame(function () { capa.style.transition = ''; }); });
    if (calmo) return;
  } else {
    if (calmo) { poner(11.5); return; }
    var pendiente = false;
    var aScroll = function () {
      pendiente = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      poner(6 + 13 * p);               /* el scroll recorre el día: 06:00 → 19:00 */
    };
    poner(6);
    addEventListener('scroll', function () {
      if (!pendiente) { pendiente = true; requestAnimationFrame(aScroll); }
    }, { passive: true });
  }
})();
