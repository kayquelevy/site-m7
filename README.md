# Site M7 Group — Rebrand

Site institucional novo da **M7 Group** — hub de soluções para o mercado da saúde.
Stack: HTML + CSS + JS puros, GSAP via CDN. Zero build.

## Estrutura

```
.
├── index.html             # 10 seções, one-page
├── styles/main.css        # design system M7 (laranja #E94E1B sobre dark #0F0F12)
├── scripts/main.js        # canvas, GSAP reveals, cursor, magnet, tabs, contadores
├── assets/                # logos + favicon
└── conduzindo-m7/         # fotos da diretoria
```

## Rodar local

```powershell
cd "Site M7"
python -m http.server 8080
# ou
npx serve .
```

## Deploy

GitHub Pages na branch `main` (raiz). URL pública gerada automaticamente.

## Identidade

- Primária: `#E94E1B` (laranja M7)
- Fundo: `#0F0F12`
- Texto: `#F5F5F7`
- Hover: `#FF7A3D`
- Tipografias: Space Grotesk (display) + Inter (corpo) + Caveat (script "M'possibilidades")
