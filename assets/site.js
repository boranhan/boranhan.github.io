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

  const photoGrids = document.querySelectorAll(".photo-grid");
  let photoLayoutFrame;

  function layoutPhotoGrids() {
    window.cancelAnimationFrame(photoLayoutFrame);
    photoLayoutFrame = window.requestAnimationFrame(() => {
      photoGrids.forEach((grid) => {
        const styles = window.getComputedStyle(grid);
        const rowHeight = Number.parseFloat(styles.gridAutoRows);
        const rowGap = Number.parseFloat(styles.rowGap);

        grid.querySelectorAll(".photo-frame").forEach((frame) => {
          const image = frame.querySelector("img");
          const imageHeight = image.getBoundingClientRect().height;
          if (!imageHeight) return;

          const rowSpan = Math.ceil((imageHeight + rowGap) / (rowHeight + rowGap));
          frame.style.gridRowEnd = `span ${rowSpan}`;
        });
      });
    });
  }

  if (photoGrids.length) {
    layoutPhotoGrids();
    photoGrids.forEach((grid) => {
      grid.querySelectorAll("img").forEach((image) => {
        if (!image.complete) image.addEventListener("load", layoutPhotoGrids, { once: true });
      });
    });
    window.addEventListener("resize", layoutPhotoGrids);
  }

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
    { lines: ["Attn(Q,K,V) =", "softmax(QK^T / sqrt(d_k))V"] },
    { lines: ["L_CE = -sum_i y_i", "log p_theta(i|x)"] },
    { lines: ["r_t = pi_theta(a_t|s_t)", "/ pi_old(a_t|s_t)"] },
    { lines: ["L_PPO = E[min(r_t A_t,", "clip(r_t,1-e,1+e)A_t)]"] },
    { lines: ["A_i = (R_i - mean(R))", "/ (std(R) + eps)"] },
    { lines: ["J_GRPO = E[sum_i rho_i A_i/G", "- beta D_KL(pi||pi_ref)]"] },
    { lines: ["q(x_t|x_0) = N(", "sqrt(a_t)x_0, (1-a_t)I)"] },
    { lines: ["L_diff = E[||eps -", "eps_theta(x_t,t)||_2^2]"] },
    { lines: ["grad_theta J = E[", "grad log pi_theta(a|s) A]"] },
    { lines: ["A_t^GAE = sum_l", "(gamma lambda)^l delta_t+l"] },
    { lines: ["delta_t = r_t + gamma V(s_t+1)", "- V(s_t)"] },
    { lines: ["D_KL(p||q) = sum_x p(x)", "log[p(x)/q(x)]"] },
    { lines: ["H(pi) = -sum_a pi(a|s)", "log pi(a|s)"] },
    { lines: ["p(x_t|x_<t) =", "softmax(W h_t)"] },
    { lines: ["h_l = LN(h_l-1 +", "Attn(h_l-1))"] },
    { lines: ["FFN(x) = W_2 sigma(", "W_1 x + b_1) + b_2"] },
    { lines: ["W' = W + (alpha/r) B A"] },
    { lines: ["L_NCE = -log", "exp(sim(z,z+)/tau) / sum_j exp(...)"] },
    { lines: ["V*(s) = max_a E[", "r + gamma V*(s')]"] },
    { lines: ["s_theta(x,t) ~", "grad_x log p_t(x)"] },
    { lines: ["dx_t = [f - .5 g^2 s_theta]dt", "+ g(t)dW_t"] },
    { lines: ["z = E_phi(x)", "x_hat = D_psi(z)"] },
    { lines: ["I(X;Z) = E log", "p(x,z) / (p(x)p(z))"] },
    { lines: ["Q*(s,a) = E[r +", "gamma max_a' Q*(s',a')]"] },
    { lines: ["L_SFT = -E_(x,y)", "sum_t log pi_theta(y_t|x,y_<t)"] },
    { lines: ["p(y|x,D) = integral", "p(y|x,w)p(w|D)dw"] },
    { lines: ["mu = 1/N sum_i x_i", "sigma^2 = 1/N sum_i(x_i-mu)^2"] },
    { lines: ["z_i = (x_i - mu) /", "sqrt(sigma^2 + eps)"] },
    { lines: ["MHA(Q,K,V) =", "Concat(head_1,...,head_h)W_o"] },
    { lines: ["head_i = Attn(QW_i^Q,", "KW_i^K,VW_i^V)"] },
    { lines: ["p_theta(y|x) =", "prod_t p(y_t|y_<t,x)"] },
    { lines: ["R(theta) = E_tau~pi", "sum_t gamma^t r_t"] },
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
