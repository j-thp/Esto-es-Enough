#!/usr/bin/env python3
"""Genera laminas/<id>.html a partir de tools/laminas_datos.json.
Uso (desde la raíz del repo):  python3 tools/construir-laminas.py
Edita las narrativas en el JSON y vuelve a correr el script."""
import json, html, os
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://j-thp.github.io/Esto-es-Enough/'
datos = json.load(open(os.path.join(RAIZ, 'tools', 'laminas_datos.json'), encoding='utf-8'))
e = lambda s: html.escape(str(s), quote=True)

def pagina(i, d, grupo):
    n = len(grupo); prev = grupo[(i - 1) % n]; sig = grupo[(i + 1) % n]
    foto = d['foto']
    w, h = Image.open(os.path.join(RAIZ, foto)).size
    es_est = d['grupo'] == 'estudio'
    etiqueta = ('Estudio de luz ' if es_est else 'Lámina ') + d['num']
    cat = d['cat'].capitalize() if not es_est else d['cat']
    volver = ('../index.html#estudios', 'Estudios de luz') if es_est else ('../galeria.html#' + d['id'], 'Archivo visual')
    titulo = f"{d['title']} · {etiqueta} — Enough"
    desc = d['resumen']
    url = f"{BASE}laminas/{d['id']}.html"
    img = f"{BASE}og/lamina-{d['id']}.jpg"
    parrafos = '\n'.join(f'        <p>{e(p)}</p>' for p in d['narrativa'])
    def enlace(x, cls, flecha_i, flecha_d):
        return (f'<a class="{cls}" href="{x["id"]}.html" rel="{"prev" if cls=="lam-prev" else "next"}">'
                f'<span class="lam-pn">{flecha_i}{"Anterior" if cls=="lam-prev" else "Siguiente"}{flecha_d}</span>'
                f'<span class="lam-pt">{e(x["title"])}</span><span class="lam-ph">{e(x["time"])}</span></a>')
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{e(titulo)}</title>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{e(desc)}">
  <link rel="canonical" href="{url}">
  <meta property="og:site_name" content="Enough — Editorial">
  <meta property="og:locale" content="es_CO">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{e(d['title'])} · {e(etiqueta)} — Enough">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{e(d['title'])}, {e(d['time'])}, {e(d['loc'])}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(d['title'])} · {e(etiqueta)} — Enough">
  <meta name="twitter:description" content="{e(desc)}">
  <meta name="twitter:image" content="{img}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../enough.css">
  <link rel="stylesheet" href="../enough-ux.css">
</head>
<body class="lamina" data-hora="{e(d['time'])}">

  <nav class="site-nav">
    <a href="../index.html" class="mark">ENOUGH<span class="dot">.</span></a>
    <ul>
      <li><a href="../index.html">Inicio</a></li>
      <li><a href="../galeria.html"{' aria-current="page"' if not es_est else ''}>Galería</a></li>
      <li><a href="../blog.html">Blog</a></li>
      <li><a href="../fragmentos.html">Fragmentos</a></li>
      <li><a href="../acceso.html">Acceso</a></li>
    </ul>
    <div class="nav-coords"><b>{e(d['time'])}</b> · {e(d['title'])}</div>
    <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>
  </nav>

  <main class="lam">
    <a class="lam-back" href="{volver[0]}">← {volver[1]}</a>

    <figure class="lam-fig">
      <img src="../{foto}" width="{w}" height="{h}" alt="{e(d['title'])} — {e(d['loc'])}, {e(d['time'])}" fetchpriority="high">
    </figure>

    <article class="lam-text">
      <p class="lam-kicker"><span>{e(etiqueta)}</span> · {e(cat)}</p>
      <h1>{e(d['title'])}</h1>
      <p class="lam-meta"><b>{e(d['time'])}</b> · {e(d['loc'])} · {e(d['year'])}</p>
      <p class="lam-lede">{e(d['resumen'])}</p>
      <div class="lam-body">
{parrafos}
      </div>
    </article>

    <nav class="lam-pager" aria-label="Otras láminas">
      {enlace(prev, 'lam-prev', '← ', '')}
      {enlace(sig, 'lam-next', '', ' →')}
    </nav>
  </main>

  <footer class="site-foot">
    <div class="ed-mark">
      <div class="name">ENOUGH<span class="dot">.</span></div>
      <p class="tag">Editorial sobre atmósfera, materia y la forma de habitar el espacio.</p>
    </div>
    <div class="ed-seal" aria-hidden="true"><div class="seal-inner">Vol.<b>I</b>MMXXVI</div></div>
    <div class="ed-colophon">
      <div class="col"><h5>Editorial</h5><a href="../index.html#manifiesto">Manifiesto</a><a href="../index.html#estudios">Estudios</a><a href="../blog.html">Ensayos</a></div>
      <div class="col"><h5>Archivo</h5><a href="../galeria.html">Galería</a><a href="../fragmentos.html">Fragmentos</a></div>
      <div class="col"><h5>Casa</h5><a href="../index.html#contacto">Contacto</a><a href="../acceso.html">Acceso</a></div>
      <div class="col"><h5>Tipografía</h5><span>Cormorant Garamond</span><span>DM Sans</span><span>Editado en Bucaramanga, CO</span></div>
    </div>
    <div class="ed-end">
      <span>© MMXXVI · Enough Editorial</span>
      <span class="center">Fin del Volumen I</span>
      <span><a href="../privacidad.html">Privacidad</a> · <a href="../terminos.html">Términos</a></span>
    </div>
  </footer>

  <script src="../enough-ux.js" defer></script>
  <script>
    (function(){{ if (localStorage.getItem('sb-ewxrqebjqwswhpjufrop-auth-token')) {{
      var l = document.querySelector('.site-nav a[href="../acceso.html"]');
      if (l) {{ l.href = '../dashboard.html'; l.textContent = 'Archivo'; }} }} }})();
  </script>
</body>
</html>
'''

grupos = {}
for d in datos: grupos.setdefault(d['grupo'], []).append(d)
os.makedirs(os.path.join(RAIZ, 'laminas'), exist_ok=True)
for g, lista in grupos.items():
    for i, d in enumerate(lista):
        open(os.path.join(RAIZ, 'laminas', d['id'] + '.html'), 'w', encoding='utf-8').write(pagina(i, d, lista))
print(len(datos), 'páginas generadas')
