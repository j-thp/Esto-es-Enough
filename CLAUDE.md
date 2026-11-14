# CONTEXTO DEL PROYECTO — Enough Editorial

## Proyecto
**Enough Editorial** — sitio estático en GitHub Pages, Vol. I — Apertura (en construcción)
- **Repo:** `https://github.com/j-thp/Esto-es-Enough`
- **URL live:** `https://j-thp.github.io/Esto-es-Enough/`
- **Instagram:** `@enough_void`
- **Directorio de trabajo:** `C:\Users\LENOVO\OneDrive\Escritorio\Enough\`
- **Autor:** Juan, 24 años, Bucaramanga CO

> **REGLA:** Editar siempre los archivos en `C:\Users\LENOVO\OneDrive\Escritorio\Enough\`.
> **Git:** el repo raíz en `C:\Users\LENOVO\` está mal configurado y causa conflictos. Subir a GitHub desde un clon limpio de `j-thp/Esto-es-Enough` o manualmente.

---

## Stack
- HTML/CSS/JS estático puro — sin frameworks
- GitHub Pages como hosting
- Supabase (auth + db + storage)
- Wompi (pagos Colombia)
- Fuentes: Cormorant Garamond (display/títulos) + DM Sans (labels/body) — Google Fonts
- `enough.css` como hoja de estilos compartida
- `index.html` tiene CSS **inline** propio (no depende de `enough.css`)

---

## Paleta de diseño

**Tema claro (enough.css y mayoría de páginas):**
```css
--bg: #e6e0d1;    --bg-soft: #dcd5c3;   --panel: #ccc3ab;
--text: #11100c;  --gold: #8c6a30;
--muted: rgba(17,16,12,.64);  --hair: rgba(17,16,12,.10);
```

**Tema oscuro (dark-bands de index.html):**
```css
--void: #0f0f11;  --void-2: #161618;  --void-3: #1f1f22;
--bone: #d8d1bf;  --ember: #c08043;
```

**Reader modal (blog.html):** `bg: #0f0d0a · text: #efe6d4 · gold: #b69a6a`

**index.html usa variables propias:** `--paper`, `--ink`, `--gold` (mismos valores que tema claro)

---

## Supabase
- **Proyecto:** `Esto es Enough` — ref `ewxrqebjqwswhpjufrop` (región us-west-2)
- **URL:** `https://ewxrqebjqwswhpjufrop.supabase.co`
- **Anon key:** está en el código de las páginas (es pública por diseño). Se consulta en el panel de Supabase → Settings → API. Usar la llave **anon (JWT)**, no `sb_publishable_`.
- **SDK CDN:** `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.js`
- **Tablas:** `productos · ordenes` (con RLS). `entradas` no existe en el proyecto nuevo (ningún código la usa).
- **Storage:** bucket `descargas` PRIVADO — signed URLs 60s en dashboard.html; solo descargan quienes tengan una orden APROBADA del producto
- **Clave localStorage de sesión:** `sb-ewxrqebjqwswhpjufrop-auth-token` (usada en los scripts de nav)
- **NUNCA** poner llaves `service_role` ni secretos de Wompi en el repo (es público)

**Patrones de auth:**
- `tienda.html`, `producto.html` → `getUser()` + redirect a `acceso.html` si no hay sesión (hoy ambas redirigen a `index.html`: tienda desactivada)
- `dashboard.html` → `onAuthStateChange` + evento `INITIAL_SESSION` + inactividad 30min
- `acceso.html` → limpia localStorage (claves `sb-*`) al cargar
- Logout → `signOut()` + limpiar localStorage manualmente + redirect a `acceso.html`

**Configuración pendiente en el panel de Supabase (Authentication → URL Configuration):**
- Site URL: `https://j-thp.github.io/Esto-es-Enough/`
- Redirect URLs: `https://j-thp.github.io/Esto-es-Enough/dashboard.html` y `.../acceso.html`

---

## Edge Functions (Supabase) — PENDIENTES DE RECREAR en el proyecto nuevo

| Función | verify_jwt | Descripción |
|---|---|---|
| `wompi-checkout` | ✅ true | POST `{slug}` + Bearer → devuelve `checkout_url` |
| `wompi-webhook` | ❌ false | URL en Wompi — pendiente de configurar en panel Wompi |
| `welcome-email` | ❌ false | Trigger Postgres en `auth.users` INSERT → Resend |

El proyecto nuevo no tiene ninguna. Los secretos (llaves de Wompi, Resend) se guardan como **secrets de Edge Functions** en Supabase, nunca en el repo.

---

## Wompi (pasarela de pagos Colombia)
- Llaves en modo **test**. Producción: `pub_prod_` y `prod_integrity_`.
- La llave de integridad y las llaves privadas viven solo en los secrets de Supabase (ver panel de Wompi).

**Implementación en `producto.html`:** llama edge function `wompi-checkout` con el slug. La función calcula precio y firma en el servidor, devuelve `checkout_url` y se redirige a `https://checkout.wompi.co/p/`. Referencia: `enough-{id}-{timestamp}`.

---

## Archivos del proyecto y su estado

| Archivo | Descripción | Auth | CSS |
|---|---|---|---|
| `index.html` | Portada editorial, hero Turrell, dark-bands + zonas claras | ❌ público | inline |
| `galeria.html` | Archivo fotográfico, lightbox oscuro | ❌ público | enough.css + dark override |
| `blog.html` | Ensayos con reader modal oscuro | ❌ público | enough.css |
| `fragmentos.html` | Notas/fragmentos | ❌ público | enough.css |
| `tienda.html` | Catálogo de productos, filtros, vista grid/lista | ✅ getUser | enough.css |
| `producto.html` | Ficha producto + checkout via wompi-checkout | ✅ getUser | enough.css |
| `dashboard.html` | Archivo personal, signed URLs, inactividad 30min | ✅ INITIAL_SESSION | enough.css |
| `acceso.html` | Login/registro, OAuth Google, toggle Lector/Lectora | ❌ público | enough.css |
| `gracias.html` | Confirmación de compra | ❌ público | enough.css |
| `sobre.html` | Página "Sobre mí" — **OCULTA** (display:none en todos los links) | ❌ público | enough.css |
| `404.html` | Página de error | ❌ público | enough.css |
| `design-specs.html` | Documento interno, no parte del sitio (noindex) | — | — |
| `favicon.svg` | Sello E, borde thin dorado, media query claro/oscuro | — | — |
| `logo-instagram.svg` | Logo oscuro para Instagram, Cormorant Garamond 300 | — | — |
| `logo-instagram.png` | PNG 1080×1080 exportado con convert-logo.js | — | — |
| `convert-logo.js` | Script Node para regenerar el PNG (descarga fuente, usa Edge headless) | — | — |

---

## Navegación (unificada en todas las páginas)
```
ENOUGH.  |  Inicio · Galería · Blog · Fragmentos · Acceso
```

- Numeración de páginas: `01 Galería · 02 Blog · 03 Fragmentos · 04 Acceso · 05 Archivo (dashboard)`
- Script inline detecta sesión en localStorage y cambia "Acceso" → "Archivo"
- `dashboard.html` tiene nav propio: `Inicio · Galería · Blog · Fragmentos · Archivo · Salir`
- **Mobile/tablet (≤920px):** barra deslizable horizontal, scrollbar invisible, fade-out con `mask-image`

---

## Logo Instagram
- Archivo: `logo-instagram.svg` + `logo-instagram.png` (1080×1080)
- Diseño: fondo `#0f0d0a`, texto `— ENOUGH .` en Cormorant Garamond 300, color `#d8d1bf`, guión y punto en dorado `#b69a6a`, font-size 120px, letter-spacing 22px
- Para regenerar el PNG: `node convert-logo.js`

---

## Componentes CSS clave (enough.css)
- **`.ft-seal`** — footer colophon con sello rotativo (`@keyframes rotate`)
- **`.btn-solid`** / **`.btn-ghost`** — botones principal y secundario
- **`.site-nav`** — nav fijo, `backdrop-filter: blur`, grid `auto 1fr auto`
- **`.page-head`** — cabecera con grid 12 columnas
- **`.reveal`** — animación de entrada (IntersectionObserver)
- **`body::before`** — grain de papel, `mix-blend-mode: multiply`
- **`.nav-toggle`** — presente en HTML pero `display: none` (obsoleto, no usar)

---

## Pendientes conocidos
1. Recrear las Edge Functions (`wompi-checkout`, `wompi-webhook`, `welcome-email`) en el proyecto Supabase nuevo y configurar la URL del webhook en el panel de Wompi
2. Configurar Site URL y Redirect URLs en Supabase Auth (ver arriba) y reconfigurar Google OAuth con la nueva URL
3. Subir archivos reales al bucket `descargas` y completar `archivo_url` en `productos`
4. Tienda desactivada temporalmente (tienda.html y producto.html redirigen a index.html); el producto Vol. I tiene precio de prueba ($2.000 COP)
5. Habilitar GitHub Pages en el repo nuevo (Settings → Pages → rama `main`, carpeta raíz)
6. Fotos pesadas (~54 MB): comprimir a ~300–500 KB cada una

---

## Tono editorial
Enough NO debe sentirse como startup ni tienda online. Archivo editorial, publicación íntima, espacio atmosférico. Influencias: James Turrell, escritura arquitectónica hispana, Apartamento.
