/* =====================================================================
   M7 v2 — Hero WebGL shader + canvas particles  (OTIMIZADO)
   - cada canvas só renderiza quando visível na tela
   - shader em resolução reduzida + menos noise
   - mobile/baixo desempenho: fallback CSS, sem canvas
   ===================================================================== */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 760;
  const lowPerf = reduced || mobile ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  // Observa visibilidade: só anima o que está na tela
  const onView = (el, cb) => {
    if (!("IntersectionObserver" in window)) { cb(true); return; }
    new IntersectionObserver(es => cb(es[0].isIntersecting), { threshold: 0, rootMargin: "120px" }).observe(el);
  };
  const visiblePage = () => !document.hidden;

  /* ---------- WebGL shader gradient ---------- */
  const canvas = document.getElementById("heroGL");
  const cssFallback = () => { if (canvas) canvas.style.background = "radial-gradient(ellipse at 70% 15%, rgba(233,78,27,.28), #08080A 60%)"; };

  if (canvas && !lowPerf) {
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" }) ||
               canvas.getContext("experimental-webgl");
    if (!gl) { cssFallback(); }
    else {
      const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
      // 3 octaves de fbm + 1 noise extra (era 8 chamadas, agora 4)
      const frag = `
        precision mediump float;
        uniform float uT; uniform vec2 uR; uniform vec2 uM;
        vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
        float snoise(vec2 v){
          const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
          vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
          vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
          vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
          vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
          vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
          m=m*m;m=m*m;
          vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
          m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
          vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
          return 130.0*dot(m,g);
        }
        float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<3;i++){s+=a*snoise(p);p*=2.0;a*=0.5;}return s;}
        void main(){
          vec2 uv=gl_FragCoord.xy/uR;
          vec2 asp=vec2(uR.x/uR.y,1.0);
          vec2 p=uv*asp;
          float t=uT*0.045;
          float f=fbm(p*1.7+vec2(t,t*0.6))*0.75 + snoise(p*3.0-vec2(t*0.5,t))*0.25;
          vec2 m=uM*asp;
          float spot=smoothstep(0.55,0.0,distance(p,m))*0.35;
          vec3 deep=vec3(0.031,0.031,0.039);
          vec3 warm=vec3(0.16,0.06,0.035);
          vec3 fire=vec3(0.914,0.306,0.106);
          vec3 ember=vec3(1.0,0.478,0.239);
          vec3 col=mix(deep,warm,smoothstep(-0.5,0.5,f));
          col=mix(col,fire,smoothstep(0.30,0.95,f+spot));
          col=mix(col,ember,smoothstep(0.80,1.25,f+spot));
          float vig=1.0-smoothstep(0.35,1.05,length(uv-0.5)*1.25);
          col*=0.55+0.55*vig; col+=spot*0.25*ember;
          gl_FragColor=vec4(col,1.0);
        }`;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(prog); gl.useProgram(prog);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uT = gl.getUniformLocation(prog, "uT"), uR = gl.getUniformLocation(prog, "uR"), uM = gl.getUniformLocation(prog, "uM");

      const RES = 0.65; // resolução interna reduzida (gradiente é suave → invisível)
      let mx = .5, my = .5, tmx = .5, tmy = .5;
      const resize = () => {
        canvas.width = Math.max(2, Math.round(canvas.clientWidth * RES));
        canvas.height = Math.max(2, Math.round(canvas.clientHeight * RES));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      addEventListener("resize", resize); resize();
      addEventListener("mousemove", e => {
        const r = canvas.getBoundingClientRect();
        tmx = (e.clientX - r.left) / r.width; tmy = 1 - (e.clientY - r.top) / r.height;
      }, { passive: true });

      let on = true; onView(canvas, v => on = v);
      const t0 = performance.now();
      const loop = () => {
        if (on && visiblePage()) {
          mx += (tmx - mx) * .05; my += (tmy - my) * .05;
          gl.uniform1f(uT, (performance.now() - t0) / 1000);
          gl.uniform2f(uR, canvas.width, canvas.height);
          gl.uniform2f(uM, mx, my);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        requestAnimationFrame(loop);
      };
      loop();
    }
  } else { cssFallback(); }

  /* ---------- partículas do hero ---------- */
  const pc = document.getElementById("heroParticles");
  if (pc && !lowPerf) {
    const ctx = pc.getContext("2d");
    let w, h, parts = [], mX = -9999, mY = -9999, on = true;
    const COUNT = 46, LINK = 140, DPR = 1;       // dpr fixo 1 → metade dos pixels
    const resize = () => { w = pc.width = pc.clientWidth; h = pc.height = pc.clientHeight; };
    const init = () => { parts = []; for (let i = 0; i < COUNT; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .5 }); };
    const draw = () => {
      if (on && visiblePage()) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = p.x - mX, dy = p.y - mY, dm = Math.hypot(dx, dy);
          if (dm < 130) { const f = (130 - dm) / 130; p.x += dx / dm * f * 2; p.y += dy / dm * f * 2; }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fill();
        }
        for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], c = parts[j], d = Math.hypot(a.x - c.x, a.y - c.y);
          if (d < LINK) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.strokeStyle = `rgba(233,78,27,${(1 - d / LINK) * .2})`; ctx.lineWidth = 1; ctx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    };
    addEventListener("mousemove", e => { const r = pc.getBoundingClientRect(); mX = e.clientX - r.left; mY = e.clientY - r.top; }, { passive: true });
    addEventListener("mouseout", () => { mX = -9999; mY = -9999; });
    addEventListener("resize", () => { resize(); init(); });
    onView(pc, v => on = v);
    resize(); init(); draw();
  } else if (pc) { pc.style.display = "none"; }

  /* ---------- partículas do CTA ---------- */
  const cta = document.getElementById("ctaParticles");
  if (cta && !lowPerf) {
    const ctx = cta.getContext("2d");
    let w, h, parts = [], on = false;
    const build = () => {
      w = cta.width = cta.clientWidth; h = cta.height = cta.clientHeight;
      parts = []; const n = 38;
      for (let i = 0; i < n; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, vy: -(Math.random() * .4 + .1), r: Math.random() * 2 + .5, a: Math.random() * .5 + .1 });
    };
    const draw = () => {
      if (on && visiblePage()) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) { p.y += p.vy; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(255,122,61,${p.a})`; ctx.fill(); }
      }
      requestAnimationFrame(draw);
    };
    addEventListener("resize", build);
    onView(cta, v => on = v);
    build(); draw();
  } else if (cta) { cta.style.display = "none"; }
})();
