/* Suhaas Behara — portfolio interactions (vanilla, no dependencies) */
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero line reveal after first paint (timer, not rAF, so background tabs still reveal)
  setTimeout(() => document.body.classList.add("loaded"), 60);

  /* ---------- nav: scrolled state + mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      links.classList.toggle("open", open);
      nav.classList.toggle("menu-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- scroll reveals ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- marquee pause ---------- */
  const pauseBtn = document.querySelector("[data-pause-marquee]");
  const marquee = document.querySelector(".marquee");
  if (pauseBtn && marquee) {
    pauseBtn.addEventListener("click", () => {
      const paused = marquee.dataset.paused === "true";
      marquee.dataset.paused = String(!paused);
      pauseBtn.setAttribute("aria-pressed", String(!paused));
      pauseBtn.textContent = paused ? "(Pause motion)" : "(Play motion)";
    });
  }

  /* ---------- selected work: sticky preview follows hovered/visible row ---------- */
  const items = [...document.querySelectorAll(".work-item")];
  const previews = [...document.querySelectorAll(".preview-frame img")];
  const capNum = document.querySelector("[data-preview-num]");
  const capCat = document.querySelector("[data-preview-cat]");
  const bar = document.querySelector(".preview-bar i");
  const activate = (i) => {
    items.forEach((it, k) => it.classList.toggle("is-active", k === i));
    previews.forEach((im, k) => im.classList.toggle("is-active", k === i));
    if (capNum) capNum.textContent = `(${String(i + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")})`;
    if (capCat) capCat.textContent = items[i].dataset.cat || "";
    if (bar) bar.style.transform = `translateX(${i * 100}%)`;
  };
  if (items.length && previews.length) {
    if (bar) bar.style.width = `${100 / items.length}%`;
    activate(0);
    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => activate(i));
      it.addEventListener("focusin", () => activate(i));
    });
    if ("IntersectionObserver" in window) {
      const rowIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) activate(items.indexOf(en.target)); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      items.forEach((it) => rowIO.observe(it));
    }
  }

  /* ---------- about: word-by-word highlight tied to scroll ---------- */
  const lead = document.querySelector("[data-words]");
  if (lead) {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = part;
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(lead);
    const words = lead.querySelectorAll(".w");
    if (reduceMotion) {
      words.forEach((w) => w.classList.add("on"));
    } else {
      let ticking = false;
      const update = () => {
        const r = lead.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress 0 when top hits 85% of viewport, 1 when bottom reaches 45%
        const start = vh * 0.85;
        const end = vh * 0.45;
        const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < n));
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
  }

  /* ---------- lightbox for case-study figures ---------- */
  const lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    let opener = null;
    document.querySelectorAll(".fig button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        const cap = btn.closest("figure").querySelector("figcaption");
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = cap ? cap.textContent : "";
        opener = btn;
        lb.showModal();
      });
    });
    const close = () => lb.close();
    lb.querySelector(".close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    lb.addEventListener("close", () => { if (opener) opener.focus(); });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
