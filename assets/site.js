(() => {
  const body = document.body;
  const menuButton = document.querySelector(".menu-toggle");
  const menuLinks = document.querySelectorAll(".site-nav a");

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  // Theme
  const themeToggle = document.querySelector('.theme-toggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaColor) metaColor.content = theme === 'light' ? '#f7f7f2' : '#090b0d';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  applyTheme(localStorage.getItem('theme') || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(
        (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark'
          ? 'light' : 'dark'
      );
    });
  }

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealNodes = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealNodes.forEach((node) => observer.observe(node));
  }

  const filterButtons = document.querySelectorAll(".filter-button");
  const publications = document.querySelectorAll(".publication");
  const filterResult = document.querySelector(".filter-result");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let count = 0;

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      publications.forEach((publication) => {
        const categories = publication.dataset.categories.split(" ");
        const matches = filter === "all" || categories.includes(filter);
        publication.hidden = !matches;
        if (matches) count += 1;
      });

      if (filterResult) {
        filterResult.textContent = `${count} selected publication${count === 1 ? "" : "s"}`;
      }
    });
  });

  const lightbox = document.querySelector(".photo-lightbox");
  const photoButtons = document.querySelectorAll(".photo-open");

  if (lightbox && photoButtons.length) {
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const lightboxTitle = lightbox.querySelector(".lightbox-title");
    const lightboxMetadata = lightbox.querySelector(".lightbox-metadata");
    const lightboxCounter = lightbox.querySelector(".lightbox-counter");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const previousButton = lightbox.querySelector(".lightbox-previous");
    const nextButton = lightbox.querySelector(".lightbox-next");
    let activePhotos = [];
    let activeIndex = 0;

    function getPhotoDetails(button) {
      const location = button.dataset.location;
      const date = button.dataset.date;
      const series = button.dataset.series || (location === "Iceland" ? "Fire & Ice" : location);
      const context = series === location ? date : `${location} / ${date}`;
      const metadata = [
        button.dataset.camera,
        button.dataset.lens,
        button.dataset.focalLength,
        button.dataset.settings,
      ].filter(Boolean);

      return { series, context, metadata };
    }

    photoButtons.forEach((button, index) => {
      const { series, context } = getPhotoDetails(button);
      const number = String(index + 1).padStart(2, "0");
      const label = document.createElement("span");
      const labelTitle = document.createElement("strong");
      const labelContext = document.createElement("small");

      button.setAttribute("aria-label", `Enlarge photograph ${index + 1}`);
      button.querySelector(".photo-number").textContent = number;
      label.className = "photo-label";
      label.setAttribute("aria-hidden", "true");
      labelTitle.textContent = series;
      labelContext.textContent = context;
      label.append(labelTitle, labelContext);
      button.append(label);
    });

    function renderPhoto() {
      const button = activePhotos[activeIndex];
      const sourceImage = button.querySelector("img");
      const { series, context, metadata } = getPhotoDetails(button);

      lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
      lightboxImage.alt = sourceImage.alt;
      lightboxTitle.textContent = `${series} / ${context}`;
      lightboxMetadata.textContent = metadata.join(" / ");
      lightboxMetadata.hidden = metadata.length === 0;
      lightboxCounter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(activePhotos.length).padStart(2, "0")}`;

      const nextImage = activePhotos[(activeIndex + 1) % activePhotos.length].querySelector("img");
      const preload = new Image();
      preload.src = nextImage.currentSrc || nextImage.src;
    }

    function movePhoto(offset) {
      activeIndex = (activeIndex + offset + activePhotos.length) % activePhotos.length;
      renderPhoto();
    }

    function openLightbox() {
      if (typeof lightbox.showModal === "function") {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
      body.classList.add("lightbox-open");
    }

    function closeLightbox() {
      if (typeof lightbox.close === "function") {
        lightbox.close();
      } else {
        lightbox.removeAttribute("open");
        body.classList.remove("lightbox-open");
        lightboxImage.removeAttribute("src");
      }
    }

    photoButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activePhotos = Array.from(button.closest(".photo-grid").querySelectorAll(".photo-open"));
        activeIndex = activePhotos.indexOf(button);
        renderPhoto();
        openLightbox();
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    previousButton.addEventListener("click", () => movePhoto(-1));
    nextButton.addEventListener("click", () => movePhoto(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    });

    lightbox.addEventListener("close", () => {
      body.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");
    });
  }

  // ── Background canvas (stars+meteors / grass+flowers) ───────────
  const bgCanvas = document.createElement('canvas');
  bgCanvas.className = 'star-canvas';
  bgCanvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(bgCanvas);

  const sc = bgCanvas.getContext('2d');
  let sw = 0, sh = 0, bgRaf;

  // ── Dark mode: stars & meteors ────────────────────────────────
  let starList = [], meteors = [], lastMeteor = -3000;

  function buildStars() {
    starList = [];
    for (let i = 0; i < 160; i++) starList.push({ x: Math.random()*sw, y: Math.random()*sh, r: 0.4+Math.random()*0.9,  base: 0.12+Math.random()*0.45, ph: Math.random()*Math.PI*2, sp: 0.3+Math.random()*0.9 });
    for (let i = 0; i < 35;  i++) starList.push({ x: Math.random()*sw, y: Math.random()*sh, r: 1.0+Math.random()*0.8,  base: 0.3 +Math.random()*0.4,  ph: Math.random()*Math.PI*2, sp: 0.2+Math.random()*0.5 });
    for (let i = 0; i < 12;  i++) starList.push({ x: Math.random()*sw, y: Math.random()*sh, r: 1.8+Math.random()*1.0,  base: 0.55+Math.random()*0.35, ph: Math.random()*Math.PI*2, sp: 0.15+Math.random()*0.3, glow: true });
  }

  function drawDark(time) {
    const t = time / 1000;
    sc.fillStyle = '#090b0d'; sc.fillRect(0, 0, sw, sh);
    starList.forEach(s => {
      const op = s.base * (reducedMotion ? 1 : 0.62 + 0.38 * Math.sin(t * s.sp + s.ph));
      if (s.glow) {
        const g = sc.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*3.5);
        g.addColorStop(0, `rgba(244,245,242,${op*0.55})`); g.addColorStop(1, 'rgba(244,245,242,0)');
        sc.beginPath(); sc.arc(s.x, s.y, s.r*3.5, 0, Math.PI*2); sc.fillStyle = g; sc.fill();
      }
      sc.beginPath(); sc.arc(s.x, s.y, s.r, 0, Math.PI*2); sc.fillStyle = `rgba(244,245,242,${op})`; sc.fill();
    });
    if (!reducedMotion) {
      if (time - lastMeteor > 1500 + Math.random()*2500) {
        lastMeteor = time;
        const n = Math.random() < 0.28 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const left = Math.random() < 0.65;
          const angle = left ? 2.53 + Math.random()*0.35 : 0.26 + Math.random()*0.35;
          const spd = 9 + Math.random()*10;
          meteors.push({ x: left ? sw*(0.35+Math.random()*0.65) : sw*Math.random()*0.65, y: -20-Math.random()*60, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd, len: 160+Math.random()*220, dur: 800+Math.random()*700, age: 0, alpha: 0 });
        }
      }
      meteors = meteors.filter(m => m.alpha > 0.005 || m.age < m.dur*0.5);
      meteors.forEach(m => {
        m.x += m.vx; m.y += m.vy; m.age += 16;
        const p = Math.min(1, m.age/m.dur);
        m.alpha = p < 0.12 ? p/0.12 : p > 0.65 ? Math.max(0, (1-p)/0.35) : 1;
        if (m.alpha <= 0.005) return;
        const spd = Math.sqrt(m.vx*m.vx+m.vy*m.vy), ux = -m.vx/spd, uy = -m.vy/spd;
        const tx = m.x+ux*m.len, ty = m.y+uy*m.len;
        const trail = sc.createLinearGradient(tx, ty, m.x, m.y);
        trail.addColorStop(0, 'rgba(180,210,255,0)'); trail.addColorStop(0.55, `rgba(220,235,255,${m.alpha*0.28})`);
        trail.addColorStop(0.85, `rgba(244,245,242,${m.alpha*0.7})`); trail.addColorStop(1, `rgba(255,255,255,${m.alpha})`);
        sc.save(); sc.beginPath(); sc.moveTo(tx,ty); sc.lineTo(m.x,m.y);
        sc.strokeStyle = trail; sc.lineWidth = 1.8+m.alpha*0.8; sc.lineCap = 'round'; sc.stroke();
        const gr = sc.createRadialGradient(m.x,m.y,0,m.x,m.y,7*m.alpha);
        gr.addColorStop(0, `rgba(210,235,255,${m.alpha*0.9})`); gr.addColorStop(0.4, `rgba(180,215,255,${m.alpha*0.35})`); gr.addColorStop(1, 'rgba(180,215,255,0)');
        sc.beginPath(); sc.arc(m.x,m.y,7*m.alpha,0,Math.PI*2); sc.fillStyle = gr; sc.fill(); sc.restore();
      });
    }
  }

  // ── Light mode: grass & blooming flowers ──────────────────────
  let blades = [], flowers = [], fallingPetals = [], dotPat = null, lastPetal = 0, prevTheme = null;

  const PETAL_COLORS = ['#ffb8c8','#fff8a0','#d4a8f0','#a8d8f8','#ffffff','#ffd0a0','#ffcce8','#c8f0c0'];

  function buildNature() {
    blades = []; flowers = []; fallingPetals = []; dotPat = null;
    const r = () => Math.random();
    for (let i = 0; i < Math.floor(sw/10); i++)
      blades.push({ x: r()*sw, h: 28+r()*55, lean: (r()-.5)*.45, ph: r()*Math.PI*2, sp: .5+r()*.8, w: 1.2+r()*1.3, color: `hsl(${102+r()*30},${38+r()*25}%,${20+r()*14}%)`, layer: 0 });
    for (let i = 0; i < Math.floor(sw/7); i++)
      blades.push({ x: r()*sw, h: 52+r()*75, lean: (r()-.5)*.38, ph: r()*Math.PI*2, sp: .4+r()*.7, w: 1.8+r()*1.8, color: `hsl(${108+r()*26},${48+r()*28}%,${28+r()*16}%)`, layer: 1 });
    const n = Math.min(22, Math.floor(sw/80));
    for (let i = 0; i < n; i++)
      flowers.push({ x: (i+.5+(r()-.5)*.6)/n*sw, stemH: 55+r()*65, nP: 5+Math.floor(r()*3), pr: 8+r()*9, color: PETAL_COLORS[Math.floor(r()*PETAL_COLORS.length)], ph: r()*Math.PI*2, sp: .3+r()*.4, bloom: 0, bloomStart: .4+r()*2.5, bloomDur: 1.2+r()*1.2, born: null });
  }

  function easeOut3(t) { return 1-(1-t)*(1-t)*(1-t); }

  function drawBlade(b, t) {
    const sw_ = Math.sin(t*b.sp+b.ph)*(9+b.h*.08);
    sc.beginPath(); sc.moveTo(b.x, sh);
    sc.quadraticCurveTo(b.x+sw_*.4+b.lean*b.h*.4, sh-b.h*.55, b.x+sw_+b.lean*b.h, sh-b.h);
    sc.strokeStyle = b.color; sc.lineWidth = b.w; sc.lineCap = 'round'; sc.stroke();
  }

  function drawFlower(f, t) {
    if (f.born === null) f.born = t;
    const age = t - f.born;
    if (age > f.bloomStart && f.bloom < 1) f.bloom = Math.min(1, easeOut3((age-f.bloomStart)/f.bloomDur));
    const sw_ = Math.sin(t*f.sp+f.ph)*4*(f.stemH/100);
    const hx = f.x+sw_, hy = sh-f.stemH;
    sc.beginPath(); sc.moveTo(f.x, sh); sc.quadraticCurveTo(f.x+sw_*.35, sh-f.stemH*.5, hx, hy);
    sc.strokeStyle = '#5a8a28'; sc.lineWidth = 1.8; sc.lineCap = 'round'; sc.stroke();
    if (f.bloom < 0.02) {
      sc.beginPath(); sc.ellipse(hx, hy, 2.5, 5, 0, 0, Math.PI*2); sc.fillStyle = f.color; sc.fill(); return;
    }
    const pd = f.pr*1.18*f.bloom;
    for (let i = 0; i < f.nP; i++) {
      const a = (i/f.nP)*Math.PI*2 - Math.PI/2;
      sc.save(); sc.translate(hx+Math.cos(a)*pd, hy+Math.sin(a)*pd); sc.rotate(a+Math.PI/2);
      sc.beginPath(); sc.ellipse(0, 0, f.pr*f.bloom, f.pr*.52*f.bloom, 0, 0, Math.PI*2);
      sc.fillStyle = f.color; sc.globalAlpha = .88*f.bloom; sc.fill(); sc.restore();
    }
    sc.globalAlpha = 1;
    sc.beginPath(); sc.arc(hx, hy, 3.5*f.bloom, 0, Math.PI*2); sc.fillStyle = '#e8c030'; sc.fill();
  }

  function drawLight(time) {
    const t = time / 1000;
    sc.fillStyle = '#f5f5f0'; sc.fillRect(0, 0, sw, sh);
    if (!dotPat) {
      const tile = document.createElement('canvas'); tile.width = tile.height = 26;
      const tx = tile.getContext('2d'); tx.fillStyle = 'rgba(60,85,70,0.22)';
      tx.beginPath(); tx.arc(13, 13, 1, 0, Math.PI*2); tx.fill();
      dotPat = sc.createPattern(tile, 'repeat');
    }
    sc.fillStyle = dotPat; sc.fillRect(0, 0, sw, sh);
    let g = sc.createRadialGradient(sw*.15,sh*.3,0,sw*.15,sh*.3,sw*.55);
    g.addColorStop(0,'rgba(10,122,114,0.07)'); g.addColorStop(1,'rgba(10,122,114,0)'); sc.fillStyle=g; sc.fillRect(0,0,sw,sh);
    g = sc.createRadialGradient(sw*.85,sh*.7,0,sw*.85,sh*.7,sw*.55);
    g.addColorStop(0,'rgba(74,122,10,0.06)'); g.addColorStop(1,'rgba(74,122,10,0)'); sc.fillStyle=g; sc.fillRect(0,0,sw,sh);
    sc.lineCap = 'round';
    blades.filter(b=>b.layer===0).forEach(b=>drawBlade(b,t));
    flowers.forEach(f=>drawFlower(f,t));
    blades.filter(b=>b.layer===1).forEach(b=>drawBlade(b,t));
    if (!reducedMotion && time-lastPetal > 2000+Math.random()*3500) {
      lastPetal = time;
      const f = flowers.find(fl=>fl.bloom>0.85);
      if (f) fallingPetals.push({ x:f.x, y:sh-f.stemH, vx:(Math.random()-.5)*1.3, vy:-.9-Math.random()*.7, color:f.color, r:f.pr*.55, rot:Math.random()*Math.PI*2, age:0 });
    }
    fallingPetals = fallingPetals.filter(p=>p.age<1 && p.y>-40);
    fallingPetals.forEach(p => {
      p.x+=p.vx+Math.sin(t*.9+p.rot)*.5; p.y+=p.vy; p.vy+=.01; p.rot+=.025; p.age+=.004;
      const alpha = Math.min(1, (1-p.age)*3);
      sc.save(); sc.translate(p.x,p.y); sc.rotate(p.rot);
      sc.beginPath(); sc.ellipse(0,0,p.r,p.r*.5,0,0,Math.PI*2);
      sc.fillStyle=p.color; sc.globalAlpha=alpha*.82; sc.fill(); sc.restore(); sc.globalAlpha=1;
    });
  }

  // ── Unified render loop ───────────────────────────────────────
  function drawBg(time) {
    const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    if (theme !== prevTheme) { prevTheme = theme; if (theme === 'light') buildNature(); }
    if (theme === 'light') drawLight(time); else drawDark(time);
    bgRaf = requestAnimationFrame(drawBg);
  }

  function resizeBg() {
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    sw = window.innerWidth; sh = window.innerHeight;
    bgCanvas.width = Math.floor(sw*dpr); bgCanvas.height = Math.floor(sh*dpr);
    sc.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars(); buildNature();
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(bgRaf); resizeBg(); bgRaf = requestAnimationFrame(drawBg); }, { passive: true });
  resizeBg(); bgRaf = requestAnimationFrame(drawBg);
  // ────────────────────────────────────────────────────────────────

  const canvas = document.querySelector(".field-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let equationLayout = [];
  let chalkDust = [];
  let frame;

  const equations = [
    { lines: ["Attn(Q,K,V) =", "softmax(QKᵀ/√d_k) · V"] },
    { lines: ["ℒ_CE = −∑ᵢ yᵢ", "log p_θ(i|x)"] },
    { lines: ["rₜ = π_θ(aₜ|sₜ)", "/ π_old(aₜ|sₜ)"] },
    { lines: ["ℒ_PPO = E[min(rₜAₜ,", "clip(rₜ,1−ε,1+ε)Aₜ)]"] },
    { lines: ["Aᵢ = (Rᵢ − μ_R)", "/ (σ_R + ε)"] },
    { lines: ["J_GRPO = E[∑ᵢ ρᵢAᵢ/G", "− β D_KL(π‖π_ref)]"] },
    { lines: ["q(xₜ|x₀) = N(", "√āₜ x₀, (1−āₜ)I)"] },
    { lines: ["ℒ_diff = E[‖ε −", "ε_θ(xₜ,t)‖²]"] },
    { lines: ["∇_θ J = E[", "∇ log π_θ(a|s) · A]"] },
    { lines: ["Aₜ^GAE = ∑_ℓ", "(γλ)^ℓ δₜ₊ℓ"] },
    { lines: ["δₜ = rₜ + γ V(sₜ₊₁)", "− V(sₜ)"] },
    { lines: ["D_KL(p‖q) = ∑ₓ p(x)", "log[p(x)/q(x)]"] },
    { lines: ["H(π) = −∑_a π(a|s)", "log π(a|s)"] },
    { lines: ["p(xₜ|x_{<t}) =", "softmax(W hₜ)"] },
    { lines: ["hₗ = LN(hₗ₋₁ +", "Attn(hₗ₋₁))"] },
    { lines: ["FFN(x) = W₂ σ(", "W₁x + b₁) + b₂"] },
    { lines: ["W′ = W + (α/r) BA"] },
    { lines: ["ℒ_NCE = −log", "e^(sim(z,z⁺)/τ) / ∑_j e^(…)"] },
    { lines: ["V*(s) = max_a E[", "r + γ V*(s′)]"] },
    { lines: ["s_θ(x,t) ≈", "∇_x log pₜ(x)"] },
    { lines: ["dxₜ = [f − ½g²s_θ]dt", "+ g(t) dWₜ"] },
    { lines: ["z = E_φ(x)", "x̂ = D_ψ(z)"] },
    { lines: ["I(X;Z) = E log", "p(x,z) / (p(x)·p(z))"] },
    { lines: ["Q*(s,a) = E[r +", "γ max_{a′} Q*(s′,a′)]"] },
    { lines: ["ℒ_SFT = −E_{x,y}", "∑ₜ log π_θ(yₜ|x,y_{<t})"] },
    { lines: ["p(y|x,D) = ∫", "p(y|x,w) p(w|D) dw"] },
    { lines: ["μ = 1/N ∑ᵢ xᵢ", "σ² = 1/N ∑ᵢ(xᵢ−μ)²"] },
    { lines: ["ẑᵢ = (xᵢ − μ) /", "√(σ² + ε)"] },
    { lines: ["MHA(Q,K,V) =", "Concat(h₁,…,hₕ) Wₒ"] },
    { lines: ["hᵢ = Attn(QWᵢᴷ,", "KWᵢᴷ, VWᵢᵛ)"] },
    { lines: ["p_θ(y|x) =", "∏ₜ p(yₜ|y_{<t}, x)"] },
    { lines: ["R(θ) = E_{τ∼π}", "∑ₜ γᵗ rₜ"] },
  ];

  const chalkColors = ["#f4f5f2", "#e7eeeb", "#cfe4df", "#dbe7bd"];

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function buildEquationLayout() {
    const compact = width < 700;
    const medium = width >= 700 && width < 1050;
    const columns = compact ? 2 : medium ? 3 : 4;
    const rows = compact ? 7 : medium ? 7 : 8;
    const count = Math.min(equations.length, columns * rows);
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const baseSize = compact ? 14 : medium ? 16 : 18;
    const random = seededRandom(24051988 + columns * 101 + rows * 17);
    const compactOrder = [0, 3, 7, 5, 11, 14, 18, 9, 16, 19, 1, 23, 12, 21];

    equationLayout = Array.from({ length: count }, (_, index) => {
      const equationIndex = compact ? compactOrder[index] : index;
      const equation = equations[equationIndex];
      const column = index % columns;
      const row = Math.floor(index / columns);
      const scale = 0.78 + random() * 0.48;
      const preferredSize = baseSize * scale;
      const maxWidth = cellWidth * (compact ? 0.9 : 0.94);
      const fontFamily =
        index % 5 === 0
          ? '"URW Chancery L", "Comic Sans MS", cursive'
          : 'Georgia, "Times New Roman", serif';

      context.font = `italic 500 ${preferredSize}px ${fontFamily}`;
      const measuredWidth = Math.max(
        ...equation.lines.map((line) => context.measureText(line).width)
      );
      const fontSize = Math.max(compact ? 9.5 : 12, preferredSize * Math.min(1, maxWidth / measuredWidth));
      context.font = `italic 500 ${fontSize}px ${fontFamily}`;

      return {
        lines: equation.lines,
        x: column * cellWidth + cellWidth * (0.07 + random() * 0.12),
        y: row * cellHeight + cellHeight * (0.14 + random() * 0.27),
        rotation: (random() - 0.5) * (compact ? 0.08 : 0.11),
        phase: random() * Math.PI * 2,
        depth: 0.4 + random() * 0.8,
        opacity: (compact ? 0.7 : 0.72) + random() * (compact ? 0.2 : 0.23),
        color: chalkColors[index % chalkColors.length],
        fontFamily,
        fontSize,
        lineHeight: fontSize * 1.22,
        textWidth: Math.max(
          ...equation.lines.map((line) => context.measureText(line).width)
        ),
        decorator: index % 6,
      };
    });

    chalkDust = Array.from({ length: compact ? 60 : 110 }, () => ({
      x: random() * width,
      y: random() * height,
      radius: 0.35 + random() * 1.1,
      opacity: 0.05 + random() * 0.13,
    }));
  }

  function drawChalkDust() {
    chalkDust.forEach((speck) => {
      context.beginPath();
      context.arc(speck.x, speck.y, speck.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(244, 245, 242, ${speck.opacity})`;
      context.fill();
    });
  }

  function drawEquation(equation, index, seconds) {
    const compact = width < 700;
    const pointerActive = pointer.x > 0 && pointer.y > 0;
    const pointerX = pointerActive ? pointer.x / width - 0.5 : 0;
    const pointerY = pointerActive ? pointer.y / height - 0.5 : 0;
    const driftX = reducedMotion ? 0 : Math.sin(seconds * 0.055 + equation.phase) * 6;
    const driftY = reducedMotion ? 0 : Math.cos(seconds * 0.048 + equation.phase) * 4;
    const parallaxX = pointerX * equation.depth * 13;
    const parallaxY = pointerY * equation.depth * 9;
    const pulse = reducedMotion ? 1 : 0.9 + Math.sin(seconds * 0.12 + equation.phase) * 0.1;
    const behindCopy =
      equation.x < width * (compact ? 0.88 : 0.56) &&
      equation.y > height * 0.1 &&
      equation.y < height * 0.88;
    const readability = behindCopy ? (compact ? 0.52 : 0.38) : 1;
    const opacity = equation.opacity * readability * pulse;
    const totalHeight = equation.lines.length * equation.lineHeight;

    context.save();
    context.translate(
      equation.x + driftX + parallaxX,
      equation.y + driftY + parallaxY
    );
    context.rotate(
      equation.rotation +
        (reducedMotion ? 0 : Math.sin(seconds * 0.035 + equation.phase) * 0.006)
    );
    context.font = `italic 500 ${equation.fontSize}px ${equation.fontFamily}`;
    context.textBaseline = "top";
    context.fillStyle = equation.color;
    context.lineCap = "round";
    context.lineJoin = "round";

    equation.lines.forEach((line, lineIndex) => {
      const y = lineIndex * equation.lineHeight;
      context.globalAlpha = opacity * 0.92;
      context.fillText(line, 0, y);
      context.globalAlpha = opacity * 0.2;
      context.fillText(line, 0.7, y - 0.4);
    });

    context.strokeStyle = equation.color;
    context.lineWidth = Math.max(0.7, equation.fontSize * 0.055);
    context.globalAlpha = opacity * 0.58;

    if (equation.decorator === 0 || equation.decorator === 3) {
      const underlineY = totalHeight + equation.fontSize * 0.08;
      context.beginPath();
      context.moveTo(-2, underlineY);
      context.quadraticCurveTo(
        equation.textWidth * 0.48,
        underlineY + (index % 2 ? 2 : -1),
        equation.textWidth * 0.9,
        underlineY
      );
      context.stroke();
    } else if (equation.decorator === 1) {
      const arrowY = totalHeight + equation.fontSize * 0.22;
      context.beginPath();
      context.moveTo(equation.textWidth * 0.18, arrowY);
      context.lineTo(equation.textWidth * 0.72, arrowY);
      context.lineTo(equation.textWidth * 0.68, arrowY - 3);
      context.moveTo(equation.textWidth * 0.72, arrowY);
      context.lineTo(equation.textWidth * 0.68, arrowY + 3);
      context.stroke();
    } else if (equation.decorator === 2) {
      context.beginPath();
      context.arc(
        equation.textWidth * 0.84,
        totalHeight * 0.45,
        equation.fontSize * 0.55,
        0,
        Math.PI * 2
      );
      context.stroke();
    }

    context.restore();
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = Math.floor(bounds.width);
    height = Math.floor(bounds.height);
    if (!width || !height) return;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildEquationLayout();
    draw();
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    drawChalkDust();
    equationLayout.forEach((equation, index) => {
      drawEquation(equation, index, time / 1000);
    });

    if (!reducedMotion) frame = window.requestAnimationFrame(draw);
  }

  canvas.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(frame);
    resize();
  });

  resize();
})();
