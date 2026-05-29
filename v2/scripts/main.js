/* =====================================================================
   M7 v2 — interações: Lenis · GSAP · SplitText · ecossistema · cursor
   ===================================================================== */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;

  $("#year") && ($("#year").textContent = new Date().getFullYear());

  /* ---------------- LOADER ---------------- */
  const loader = $("#loader");
  const loaderCount = $("#loaderCount");
  const loaderWord = $$("#loaderWord span");
  let pct = 0;
  const tickLoad = () => {
    pct += Math.random() * 18;
    if (pct >= 100) pct = 100;
    if (loaderCount) loaderCount.textContent = Math.floor(pct);
    if (pct < 100) setTimeout(tickLoad, 110);
  };
  tickLoad();
  // reveal loader word
  loaderWord.forEach((s, i) => {
    s.style.transition = `transform .6s var(--ease-o) ${i * .04 + .2}s, opacity .6s ${i * .04 + .2}s`;
    requestAnimationFrame(() => { s.style.transform = "translateY(0)"; s.style.opacity = "1"; });
  });
  const hideLoader = () => {
    loader?.classList.add("done");
    document.body.classList.add("ready");
    startHeroIntro();
  };
  addEventListener("load", () => setTimeout(hideLoader, 1500));
  setTimeout(() => { if (!document.body.classList.contains("ready")) hideLoader(); }, 4000);

  /* ---------------- LENIS smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); }
  }
  // anchor scrolling
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------------- NAV ---------------- */
  const nav = $("#nav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 30);
    const sp = $("#scrollProgress");
    if (sp) { const h = document.documentElement.scrollHeight - innerHeight; sp.style.width = (scrollY / h * 100) + "%"; }
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const burger = $("#burger"), mMenu = $("#mMenu");
  const closeMenu = () => { burger?.classList.remove("open"); mMenu?.classList.remove("open"); document.body.style.overflow = ""; };
  burger?.addEventListener("click", () => {
    const open = burger.classList.toggle("open");
    mMenu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#mMenu a").forEach(a => a.addEventListener("click", closeMenu));

  /* ---------------- CURSOR ---------------- */
  if (fine) {
    const cur = $("#cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    const raf = () => { rx += (mx - rx) * .2; ry += (my - ry) * .2; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; label.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(raf); };
    raf();
    $$("a,button,.tilt,.member__social a").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const t = el.getAttribute("data-cursor");
        if (t) { cur.classList.add("label"); label.textContent = t; }
        else cur.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => cur.classList.remove("hover", "label"));
    });
  }

  /* ---------------- MAGNETIC ---------------- */
  if (fine && !reduced) {
    $$(".magnetic").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .25}px,${y * .4}px)`;
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
    });
  }

  /* ---------------- 3D TILT ---------------- */
  if (fine && !reduced) {
    $$(".tilt").forEach(el => {
      const card = $(".member__card", el) || el;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => card.style.transform = "");
    });
  }

  /* ---------------- SPLIT TEXT ---------------- */
  const splitLines = $$("[data-split]");
  splitLines.forEach(line => {
    line.setAttribute("aria-label", line.textContent);
    const tokens = [];
    [...line.childNodes].forEach(node => {
      const em = node.nodeName === "EM";
      [...(node.textContent || "")].forEach(ch => tokens.push({ ch, em }));
    });
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < tokens.length) {
      if (tokens[i].ch === " ") { frag.appendChild(document.createTextNode(" ")); i++; continue; }
      const word = document.createElement("span");
      let isEm = false;
      while (i < tokens.length && tokens[i].ch !== " ") {
        const c = document.createElement("span");
        c.className = "char";
        c.textContent = tokens[i].ch;
        c.setAttribute("aria-hidden", "true");
        if (tokens[i].em) isEm = true;
        word.appendChild(c);
        i++;
      }
      word.className = "word" + (isEm ? " word--em" : "");
      frag.appendChild(word);
    }
    line.innerHTML = "";
    line.appendChild(frag);
  });

  let heroStarted = false;
  function startHeroIntro() {
    if (heroStarted) return; heroStarted = true;
    if (reduced || !window.gsap) { $$(".hero .char").forEach(c => c.style.transform = "none"); $$(".hero [data-reveal]").forEach(r => r.classList.add("in")); return; }
    const heroChars = $$(".hero__title .char");
    gsap.to(heroChars, { y: "0%", duration: 1.1, ease: "expo.out", stagger: .03, delay: .1 });
    gsap.to($$(".hero [data-reveal]"), { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: .1, delay: .5, onStart() { $$(".hero [data-reveal]").forEach(r => r.classList.add("in")); } });
  }

  /* ---------------- REVEAL via IntersectionObserver (robusto no mobile) ---------------- */
  const revealEls = $$("[data-reveal]").filter(el => !el.closest(".hero"));
  if ("IntersectionObserver" in window && !reduced) {
    const ro = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    revealEls.forEach(el => ro.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* ---------------- CTA split-text (dispara por visibilidade) ---------------- */
  const ctaTitle = $(".cta__title");
  if (ctaTitle) {
    const ctaChars = $$(".cta__title .char");
    if (reduced || !window.gsap || !("IntersectionObserver" in window)) {
      ctaChars.forEach(c => c.style.transform = "none");
    } else {
      const cio = new IntersectionObserver(es => {
        if (es[0].isIntersecting) { gsap.to(ctaChars, { y: "0%", duration: 1, ease: "expo.out", stagger: .025 }); cio.disconnect(); }
      }, { threshold: 0.15 });
      cio.observe(ctaTitle);
    }
  }

  /* ---------------- efeitos GSAP (parallax + ticker) ---------------- */
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    $$(".pillar").forEach(p => {
      gsap.to($(".pillar__num", p), { y: -40, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    const tickerRow = $(".ticker__row");
    if (tickerRow) gsap.to(tickerRow, { xPercent: -50, repeat: -1, duration: 30, ease: "none" });
    // recalibra posições após carregar fontes/layout (corrige scroll defasado)
    addEventListener("load", () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 1900);
  }

  // counters
  const counters = $$(".stat__num[data-count]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, tgt = +el.dataset.count, suf = el.dataset.suffix || "", dur = 1700, st = performance.now();
      el.closest(".stat")?.classList.add("in");
      const step = now => { const t = Math.min(1, (now - st) / dur), e = 1 - Math.pow(1 - t, 3); el.textContent = Math.round(tgt * e) + suf; if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); io.unobserve(el);
    }), { threshold: .5 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------------- MANIFESTO word reveal ---------------- */
  const mText = $("#manifestoText");
  if (mText) {
    const words = mText.textContent.trim().split(/\s+/);
    mText.innerHTML = words.map(w => {
      const hl = /ninguém|crescimento|saúde/i.test(w);
      return `<span class="w${hl ? " hl-word" : ""}">${w}</span>`;
    }).join(" ");
    const ws = $$(".w", mText);
    if (window.ScrollTrigger && !reduced) {
      ScrollTrigger.create({
        trigger: mText, start: "top 75%", end: "bottom 55%", scrub: .6,
        onUpdate: self => {
          const n = Math.floor(self.progress * ws.length);
          ws.forEach((w, i) => { w.classList.toggle("lit", i < n); if (i < n && w.classList.contains("hl-word")) w.classList.add("hl"); });
        }
      });
    } else { ws.forEach(w => w.classList.add("lit")); }
  }

  /* =====================================================================
     ECOSSISTEMA — network graph interativo
     ===================================================================== */
  const ec = $("#ecoCanvas");
  if (ec) {
    const ctx = ec.getContext("2d");
    let w, h, dpr, cx, cy, R;
    const TAU = Math.PI * 2;

    const NODES = [
      { id: "m7", label: "M7", tag: "M7 Group", title: "O centro da engrenagem", desc: "A M7 orquestra todas as conexões: relacionamento, estratégia, vendas e marketing entre os atores do mercado da saúde.", center: true },
      { id: "med", label: "Médicos", tag: "Profissionais", title: "Médicos & profissionais", desc: "Capacitação, conteúdo estratégico e relacionamento que aproximam o profissional das melhores soluções.", ang: -Math.PI / 2 },
      { id: "cli", label: "Clínicas", tag: "Clínicas & franquias", title: "Clínicas & franquias", desc: "Consultoria, método e treinamento sob medida para clínicas crescerem com previsibilidade.", ang: 0 },
      { id: "for", label: "Fornecedores", tag: "Fornecedores", title: "Fornecedores", desc: "Força de vendas consultiva e presença em campo que transformam catálogo em demanda real.", ang: Math.PI / 2 },
      { id: "ind", label: "Indústria", tag: "Indústria Pharma", title: "Indústria farmacêutica", desc: "Posicionamento, marketing de conversão e M7 Pharma para marcas com visão de futuro.", ang: Math.PI }
    ];

    let hovered = null, active = null, onScreen = true;
    let mouse = { x: -9999, y: -9999 };
    const flows = []; // traveling energy dots

    // só anima quando visível na tela
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }, { threshold: 0, rootMargin: "120px" }).observe(ec);
    }

    const panel = { tag: $("#ecoTag"), title: $("#ecoTitle"), desc: $("#ecoDesc"), wrap: $("#ecoPanel") };
    const setPanel = node => {
      if (!node) node = NODES[0];
      panel.tag.textContent = node.tag;
      panel.title.textContent = node.title;
      panel.desc.textContent = node.desc;
      panel.wrap.style.borderColor = node.center ? "var(--orange)" : "rgba(233,78,27,.4)";
    };
    setPanel(NODES[0]);

    const layout = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = ec.width = ec.clientWidth * dpr;
      h = ec.height = ec.clientHeight * dpr;
      cx = w / 2; cy = h / 2;
      R = Math.min(w, h) * 0.32;
      NODES.forEach(n => {
        if (n.center) { n.x = cx; n.y = cy; n.r = 46 * dpr; }
        else { n.x = cx + Math.cos(n.ang) * R; n.y = cy + Math.sin(n.ang) * R; n.r = 34 * dpr; }
      });
    };
    addEventListener("resize", layout); layout();

    ec.addEventListener("mousemove", e => {
      const r = ec.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr; mouse.y = (e.clientY - r.top) * dpr;
      let h2 = null;
      for (const n of NODES) { if (Math.hypot(mouse.x - n.x, mouse.y - n.y) < n.r + 14 * dpr) { h2 = n; break; } }
      hovered = h2;
      ec.style.cursor = h2 ? "pointer" : "default";
      if (h2 && h2 !== active) { active = h2; setPanel(h2); }
    });
    ec.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; hovered = null; });

    // toque: tocar num nó atualiza o painel (mobile)
    ec.addEventListener("touchstart", e => {
      const t = e.touches[0]; if (!t) return;
      const r = ec.getBoundingClientRect();
      const tx = (t.clientX - r.left) * dpr, ty = (t.clientY - r.top) * dpr;
      let hit = null;
      for (const n of NODES) { if (Math.hypot(tx - n.x, ty - n.y) < n.r + 16 * dpr) { hit = n; break; } }
      if (hit) { hovered = hit; active = hit; setPanel(hit); }
    }, { passive: true });

    // spawn energy flows from outer nodes to center (pausa off-screen)
    setInterval(() => {
      if (document.hidden || !onScreen || flows.length > 14) return;
      const outer = NODES.filter(n => !n.center);
      const n = outer[Math.floor(Math.random() * outer.length)];
      flows.push({ from: n, t: 0, speed: 0.008 + Math.random() * 0.006 });
    }, 460);

    let tg = 0;
    const draw = () => {
      if (!onScreen || document.hidden) { requestAnimationFrame(draw); return; }
      tg += 0.016;
      ctx.clearRect(0, 0, w, h);
      const m7 = NODES[0];

      // connections
      NODES.forEach(n => {
        if (n.center) return;
        const lit = hovered === n || hovered === m7;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y); ctx.lineTo(m7.x, m7.y);
        ctx.strokeStyle = lit ? "rgba(233,78,27,.55)" : "rgba(233,78,27,.16)";
        ctx.lineWidth = (lit ? 2 : 1) * dpr;
        ctx.stroke();
      });

      // energy flows
      for (let i = flows.length - 1; i >= 0; i--) {
        const f = flows[i]; f.t += f.speed;
        if (f.t >= 1) { flows.splice(i, 1); continue; }
        const x = f.from.x + (m7.x - f.from.x) * f.t;
        const y = f.from.y + (m7.y - f.from.y) * f.t;
        ctx.beginPath(); ctx.arc(x, y, 3 * dpr, 0, TAU);
        ctx.fillStyle = `rgba(255,122,61,${1 - f.t})`; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 7 * dpr, 0, TAU);
        ctx.fillStyle = `rgba(255,122,61,${(1 - f.t) * .25})`; ctx.fill();
      }

      // nodes
      NODES.forEach(n => {
        const lit = hovered === n;
        const pulse = n.center ? 1 + Math.sin(tg * 1.6) * 0.04 : 1;
        const rr = n.r * pulse * (lit ? 1.12 : 1);

        // glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr * 2.4);
        g.addColorStop(0, n.center ? "rgba(233,78,27,.5)" : (lit ? "rgba(233,78,27,.4)" : "rgba(233,78,27,.14)"));
        g.addColorStop(1, "rgba(233,78,27,0)");
        ctx.beginPath(); ctx.arc(n.x, n.y, rr * 2.4, 0, TAU); ctx.fillStyle = g; ctx.fill();

        // disc
        ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, TAU);
        if (n.center) { ctx.fillStyle = "#E94E1B"; }
        else { ctx.fillStyle = lit ? "rgba(233,78,27,.92)" : "rgba(20,20,25,.95)"; }
        ctx.fill();
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = n.center ? "rgba(255,179,125,.8)" : (lit ? "rgba(255,179,125,.9)" : "rgba(233,78,27,.5)");
        ctx.stroke();

        // label (auto-ajusta para caber dentro do círculo)
        let fs = (n.center ? 16 : 12.5) * dpr;
        ctx.font = `${fs}px "Space Grotesk", sans-serif`;
        const maxW = rr * 1.65, tw = ctx.measureText(n.label).width;
        if (tw > maxW) { fs *= maxW / tw; ctx.font = `${fs}px "Space Grotesk", sans-serif`; }
        ctx.fillStyle = (n.center || lit) ? "#fff" : "rgba(244,244,246,.9)";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);
      });

      requestAnimationFrame(draw);
    };
    draw();
  }
})();
