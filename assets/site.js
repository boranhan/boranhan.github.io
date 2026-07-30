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
    const lightboxCounter = lightbox.querySelector(".lightbox-counter");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const previousButton = lightbox.querySelector(".lightbox-previous");
    const nextButton = lightbox.querySelector(".lightbox-next");
    let activePhotos = [];
    let activeIndex = 0;

    function getPhotoDetails(button) {
      const location = button.dataset.location;
      const date = button.dataset.date;
      const series = location === "Iceland" ? "Fire & Ice" : location;
      const context = series === location ? date : `${location} / ${date}`;

      return { series, context };
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
      const { series, context } = getPhotoDetails(button);

      lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
      lightboxImage.alt = sourceImage.alt;
      lightboxTitle.textContent = `${series} / ${context}`;
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
  let points = [];
  let frame;

  const colors = ["#65d9d1", "#b8e36d", "#ff7868"];
  const equations = [
    {
      label: "ATTENTION",
      lines: ["Attn(Q,K,V) = softmax(QK^T / sqrt(d_k)) V"],
      x: 0.6,
      y: 0.16,
      phase: 0.2,
    },
    {
      label: "CROSS-ENTROPY",
      lines: ["L_CE = -sum_i y_i log p_theta(i|x)"],
      x: 0.68,
      y: 0.32,
      phase: 1.4,
    },
    {
      label: "PPO",
      lines: [
        "J_PPO = E_t[min(r_t A_t,",
        "clip(r_t, 1-eps, 1+eps) A_t)]",
      ],
      x: 0.59,
      y: 0.49,
      phase: 2.7,
    },
    {
      label: "GRPO",
      lines: [
        "A_i = (r_i - mean(r)) / std(r)",
        "J_GRPO = E[1/G sum_i rho_i A_i]",
      ],
      x: 0.67,
      y: 0.68,
      phase: 4.1,
    },
    {
      label: "DIFFUSION",
      lines: ["L_diff = E[||eps - eps_theta(x_t,t)||_2^2]"],
      x: 0.58,
      y: 0.84,
      phase: 5.2,
    },
  ];

  function drawEquations(time) {
    const compact = width < 700;
    const medium = width >= 700 && width < 1050;
    const seconds = time / 1000;
    const baseOpacity = compact ? 0.11 : medium ? 0.17 : 0.22;
    const labelSize = compact ? 8 : 10;
    const equationSize = compact ? 10 : medium ? 11 : 13;

    context.save();
    context.textBaseline = "top";

    equations.forEach((equation, index) => {
      if (compact && (index === 1 || index === 3)) return;

      const compactX = [0.06, 0.2, 0.08, 0.24, 0.05][index];
      const compactY = [0.09, 0.27, 0.48, 0.68, 0.86][index];
      const anchorX = (compact ? compactX : equation.x) * width;
      const anchorY = (compact ? compactY : equation.y) * height;
      const driftX = reducedMotion ? 0 : Math.sin(seconds * 0.13 + equation.phase) * 8;
      const driftY = reducedMotion ? 0 : Math.cos(seconds * 0.16 + equation.phase) * 4;
      const pulse = reducedMotion ? 1 : 0.82 + Math.sin(seconds * 0.22 + equation.phase) * 0.18;
      const x = anchorX + driftX;
      const y = anchorY + driftY;

      context.globalAlpha = baseOpacity * pulse;
      context.fillStyle = index % 2 === 0 ? "#65d9d1" : "#b8e36d";
      context.font = `700 ${labelSize}px "DejaVu Sans Mono", "Courier New", monospace`;
      context.fillText(equation.label, x, y);

      context.globalAlpha = baseOpacity * pulse * 0.78;
      context.fillStyle = "#f4f5f2";
      context.font = `400 ${equationSize}px "DejaVu Sans Mono", "Courier New", monospace`;
      equation.lines.forEach((line, lineIndex) => {
        context.fillText(line, x, y + labelSize + 7 + lineIndex * (equationSize + 5));
      });
    });

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

    const count = Math.max(26, Math.min(78, Math.floor((width * height) / 19000)));
    points = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: index % 9 === 0 ? 2.1 : 1.1,
      color: colors[index % colors.length],
    }));

    draw();
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    drawEquations(time);

    points.forEach((point, index) => {
      if (!reducedMotion) {
        point.x += point.vx;
        point.y += point.vy;

        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 140 && distance > 0) {
          point.x += (dx / distance) * 0.35;
          point.y += (dy / distance) * 0.35;
        }

        if (point.x < -10) point.x = width + 10;
        if (point.x > width + 10) point.x = -10;
        if (point.y < -10) point.y = height + 10;
        if (point.y > height + 10) point.y = -10;
      }

      for (let next = index + 1; next < points.length; next += 1) {
        const neighbor = points[next];
        const distance = Math.hypot(point.x - neighbor.x, point.y - neighbor.y);
        if (distance < 150) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(neighbor.x, neighbor.y);
          context.strokeStyle = `rgba(101, 217, 209, ${0.13 * (1 - distance / 150)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = point.color;
      context.fill();
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
