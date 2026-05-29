# M7 Group — v2 · Cinematic Edition

Versão experimental, imersiva e interativa do site da M7 Group.
Vive em paralelo ao site principal (`../`).

**URL:** https://kayquelevy.github.io/site-m7/v2/

## O que tem de diferente

- **Hero WebGL** — fundo com shader de gradiente animado (simplex noise + fbm) reativo ao mouse, sobre campo de partículas em constelação.
- **Smooth scroll** (Lenis) — rolagem com inércia estilo Apple/Awwwards.
- **SplitText** — headlines revelam caractere por caractere.
- **Ecossistema interativo** — network graph em canvas com a M7 no centro e 4 nós (Médicos, Clínicas, Fornecedores, Indústria) orbitando, com energia fluindo para o centro. Hover/toque revela o papel de cada conexão.
- **Manifesto scroll-driven** — texto ilumina palavra por palavra conforme rola.
- **Pilares cinematográficos** — números gigantes com stroke, glow por pilar, parallax.
- **Cards 3D tilt** — diretoria com inclinação que segue o mouse + profundidade.
- **Cursor contextual** — anel magnético que vira "pill" com rótulo (`data-cursor`).
- **CTA com partículas** subindo + título split-text on scroll.
- **Loader** com contador e tagline "M'possibilidades" animada.
- **Grain + scroll-progress + ticker** infinito.

## Stack

HTML + CSS + JS puro. Sem build.
CDNs: GSAP + ScrollTrigger, Lenis. WebGL nativo (sem Three.js).

## Estrutura

```
v2/
├── index.html
├── styles/main.css
├── scripts/
│   ├── hero.js      # shader WebGL + partículas
│   └── main.js      # Lenis, GSAP, ecossistema, cursor, tilt
├── assets/          # logos + favicon
└── conduzindo-m7/   # fotos da diretoria
```

## Acessibilidade

Respeita `prefers-reduced-motion` (desliga shader, partículas, split e scrub).
Headlines split têm `aria-label` com o texto completo.
