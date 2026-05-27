/* =================================================================
   M7 GROUP — interatividade
   GSAP + ScrollTrigger + canvas particles + magnet buttons
================================================================= */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =================================================================
  // LOADER
  // =================================================================
  window.addEventListener("load", () => {
    setTimeout(() => $("#loader")?.classList.add("is-hidden"), 900);
  });

  // year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =================================================================
  // NAV — scroll state + active section + mobile burger
  // =================================================================
  const nav = $("#nav");
  const burger = $("#navBurger");
  const mobileMenu = $("#mobileMenu");

  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger?.addEventListener("click", () => {
    const open = burger.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  }));

  // active link by section
  const navLinks = $$(".nav__link");
  const sections = navLinks.map(l => $(l.getAttribute("href"))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navLinks.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => observer.observe(s));
  }

  // =================================================================
  // CURSOR
  // =================================================================
  const cursor = $("#cursor");
  if (isFinePointer && !prefersReduced) {
    const dot = $(".cursor__dot");
    const ring = $(".cursor__ring");
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener("mousemove", e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const raf = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    raf();

    $$("a, button, .pilar, .membro, .tabs__btn, label.radio, input, textarea").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  // =================================================================
  // DRAG-TO-SCROLL — segurar botão esquerdo e arrastar pra rolar
  // =================================================================
  if (isFinePointer && !prefersReduced) {
    const NON_DRAG = "a, button, input, textarea, select, label, .btn, .radio, .tabs__btn, .pilar__cta, [contenteditable]";
    let isDown = false;
    let isDragging = false;
    let startY = 0;
    let startScroll = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let momentumId = null;
    const THRESHOLD = 6;

    const stopMomentum = () => { if (momentumId) { cancelAnimationFrame(momentumId); momentumId = null; } };

    document.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(NON_DRAG)) return;
      stopMomentum();
      isDown = true;
      isDragging = false;
      startY = e.clientY;
      startScroll = window.scrollY;
      lastY = e.clientY;
      lastT = performance.now();
      velocity = 0;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      const dy = e.clientY - startY;
      if (!isDragging && Math.abs(dy) > THRESHOLD) {
        isDragging = true;
        document.body.classList.add("is-dragging");
        cursor?.classList.add("is-dragging");
        window.getSelection()?.removeAllRanges();
      }
      if (isDragging) {
        e.preventDefault();
        const now = performance.now();
        const dt = now - lastT;
        if (dt > 0) velocity = (e.clientY - lastY) / dt; // px/ms
        lastY = e.clientY;
        lastT = now;
        window.scrollTo(0, startScroll - dy);
      }
    }, { passive: false });

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      if (!isDragging) return;
      isDragging = false;
      document.body.classList.remove("is-dragging");
      cursor?.classList.remove("is-dragging");

      // Inércia: continua rolando com decay
      let v = velocity * 16; // ≈ px por frame a 60fps
      const decay = 0.94;
      const tick = () => {
        if (Math.abs(v) < 0.4) { momentumId = null; return; }
        window.scrollBy(0, -v);
        v *= decay;
        momentumId = requestAnimationFrame(tick);
      };
      momentumId = requestAnimationFrame(tick);
    };

    document.addEventListener("mouseup", endDrag);
    document.addEventListener("mouseleave", endDrag);
    window.addEventListener("blur", endDrag);

    document.addEventListener("selectstart", (e) => {
      if (isDragging) e.preventDefault();
    });

    // Qualquer scroll por outras vias cancela a inércia
    window.addEventListener("wheel", stopMomentum, { passive: true });
    window.addEventListener("touchstart", stopMomentum, { passive: true });
  }

  // =================================================================
  // MAGNET BUTTONS
  // =================================================================
  if (isFinePointer && !prefersReduced) {
    $$(".btn--magnet").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // =================================================================
  // HERO CANVAS — partículas em rede que reagem ao mouse
  // =================================================================
  const canvas = $("#heroCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr;
    const particles = [];
    const COUNT = window.innerWidth < 768 ? 45 : 90;
    const LINK_DIST = 140;
    let mouseX = -9999, mouseY = -9999;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.clientWidth * dpr;
      h = canvas.height = canvas.clientHeight * dpr;
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35 * dpr,
          vy: (Math.random() - 0.5) * 0.35 * dpr,
          r: (Math.random() * 1.6 + 0.4) * dpr,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const dxM = p.x - mouseX;
        const dyM = p.y - mouseY;
        const dM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (dM < 120 * dpr) {
          const force = (120 * dpr - dM) / (120 * dpr);
          p.x += (dxM / dM) * force * 1.5;
          p.y += (dyM / dM) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(233,78,27,0.55)";
        ctx.fill();
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST * dpr) {
            const alpha = (1 - d / (LINK_DIST * dpr)) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(245,245,247,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    canvas.addEventListener("mousemove", e => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * dpr;
      mouseY = (e.clientY - r.top) * dpr;
    });
    canvas.addEventListener("mouseleave", () => { mouseX = -9999; mouseY = -9999; });
    window.addEventListener("resize", () => { resize(); init(); });

    resize(); init(); draw();
  }

  // =================================================================
  // GSAP — reveal on scroll + hero title split
  // =================================================================
  if (window.gsap && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    // reveal generic
    $$(".reveal").forEach((el, i) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          delay: (i % 4) * 0.06,
          onStart: () => el.classList.add("is-visible"),
        }
      );
    });

    // hero title — sobe linha por linha
    const heroLines = $$(".hero__title .line > span");
    if (heroLines.length) {
      gsap.fromTo(heroLines,
        { y: "110%" },
        { y: "0%", duration: 1.1, ease: "expo.out", stagger: 0.12, delay: 0.9 }
      );
    }

    // pilares parallax sutil
    $$(".pilar").forEach((card, i) => {
      gsap.to(card, {
        y: (i % 2 === 0 ? -20 : -40),
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    });

    // hero glow segue scroll
    const glow = $(".hero__glow");
    if (glow) {
      gsap.to(glow, {
        y: 200,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
      });
    }
  } else {
    // fallback: revela tudo se gsap não carregar
    $$(".reveal").forEach(el => el.classList.add("is-visible"));
  }

  // =================================================================
  // COUNTERS
  // =================================================================
  const counters = $$(".stat__num[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => obs.observe(c));
  }

  // =================================================================
  // TABS — Serviços
  // =================================================================
  const tabBtns = $$(".tabs__btn");
  const tabPanels = $$(".tabs__panel");
  const indicator = $("#tabsIndicator");

  const moveIndicator = (btn) => {
    if (!indicator || !btn) return;
    indicator.style.left = btn.offsetLeft + "px";
    indicator.style.width = btn.offsetWidth + "px";
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.tab;
      tabPanels.forEach(p => p.classList.toggle("is-active", p.id === id));
      moveIndicator(btn);
    });
  });
  // init indicator
  const initialTab = $(".tabs__btn.is-active");
  if (initialTab) {
    requestAnimationFrame(() => moveIndicator(initialTab));
    window.addEventListener("resize", () => moveIndicator($(".tabs__btn.is-active")));
  }

  // =================================================================
  // CTAs por persona — preenche radio do form e rola
  // =================================================================
  $$("[data-persona]").forEach(btn => {
    btn.addEventListener("click", () => {
      const persona = btn.dataset.persona;
      const radio = document.querySelector(`input[name="persona"][value="${persona}"]`);
      if (radio) radio.checked = true;
    });
  });

  // =================================================================
  // FORM — apenas validação visual + mensagem (sem backend)
  // =================================================================
  const form = $("#contatoForm");
  const status = $("#formStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = data.get("nome")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const msg = data.get("mensagem")?.toString().trim();

    if (!nome || !email || !msg) {
      status.textContent = "Preencha nome, e-mail e mensagem.";
      status.className = "form__status is-error";
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      status.textContent = "Informe um e-mail válido.";
      status.className = "form__status is-error";
      return;
    }

    // monta link WhatsApp como fallback prático
    const persona = data.get("persona") || "outro";
    const empresa = data.get("empresa") || "—";
    const waMsg = `*Novo contato pelo site*%0A%0A*Nome:* ${nome} ${data.get("sobrenome") || ""}%0A*E-mail:* ${email}%0A*Empresa:* ${empresa}%0A*Perfil:* ${persona}%0A%0A*Mensagem:*%0A${msg}`;
    const waUrl = `https://wa.me/5511966438750?text=${waMsg}`;

    status.textContent = "Mensagem pronta! Abrindo WhatsApp…";
    status.className = "form__status is-success";

    setTimeout(() => {
      window.open(waUrl, "_blank", "noopener");
      form.reset();
      setTimeout(() => { status.textContent = ""; status.className = "form__status"; }, 4000);
    }, 600);
  });

})();
