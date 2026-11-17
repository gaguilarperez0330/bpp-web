// Beatriz Perez Photography — interaction and motion. The site is fully usable without this file.
(() => {
  const root = document.documentElement;
  const motion = root.classList.contains("motion");
  window.__motion = true;

  // ---------------------------------------------------------------- smooth scroll (Lenis)
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -90 }, autoRaf: false });
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      const go = () => lenis.scrollTo(target, { immediate: true, offset: -90, force: true });
      go();
      window.addEventListener("load", go, { once: true });
    }
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const lockScroll = (on) => { root.classList.toggle("lightbox-open", on); if (lenis) on ? lenis.stop() : lenis.start(); };

  // ---------------------------------------------------------------- header: hides on the way down, returns on the way up
  const header = document.querySelector("[data-header]");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (header && !header.classList.contains("menu-is-open")) {
      if (y > 400 && y > lastY + 2) header.classList.add("is-hidden");
      if (y < lastY - 2 || y < 120) header.classList.remove("is-hidden");
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---------------------------------------------------------------- mobile menu
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      header.classList.toggle("menu-is-open", open);
      toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
    };
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // ---------------------------------------------------------------- reveals
  // Headings rise word by word: wrap each word of the text nodes, keeping inline elements (the red full stop, links, italics).
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w";
            w.textContent = part;
            w.style.setProperty("--i", i++);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.classList.contains("punctum")) { n.classList.add("w"); n.style.setProperty("--i", i++); }
          else walk(n);
        }
      });
    };
    walk(el);
  };

  const splits = [...document.querySelectorAll("main [data-split]")];
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  const frames = [...document.querySelectorAll("main .media")];

  // things side by side come in one after another, not all at once
  const stagger = (list, step, max) => {
    const groups = new Map();
    list.forEach((el) => {
      const k = el.closest(".gallery, .home-project__images, .print-grid, .press-grid, .installation, .exh-list, .praise, .about-teaser") || el.parentElement;
      const n = groups.get(k) || 0;
      groups.set(k, n + 1);
      el.style.setProperty("--d", `${Math.min(n, max) * step}s`);
    });
  };

  if (motion && "IntersectionObserver" in window) {
    splits.forEach(splitWords);
    stagger(frames, 0.12, 5);
    stagger(reveals, 0.08, 6);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
        // once shown, hover effects react straight away
        if (en.target.classList.contains("media")) setTimeout(() => en.target.style.setProperty("--d", "0s"), 2000);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    [...splits, ...reveals, ...frames].forEach((el) => io.observe(el));
  } else {
    [...splits, ...reveals, ...frames].forEach((el) => el.classList.add("is-in"));
  }

  // ---------------------------------------------------------------- praise switcher
  document.querySelectorAll("[data-praise]").forEach((box) => {
    const tabs = [...box.querySelectorAll("[data-praise-tab]")];
    const panels = [...box.querySelectorAll(".praise__panel")];
    const show = (i) => {
      tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
      panels.forEach((p, j) => (p.hidden = i !== j));
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(i));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const n = (i + (e.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length;
        show(n); tabs[n].focus();
      });
    });
  });

  // ---------------------------------------------------------------- lightbox: open, step through the set, click to zoom
  const lb = document.querySelector("[data-lightbox]");
  if (lb) {
    const img = lb.querySelector("[data-lb-img]");
    const cap = lb.querySelector("[data-lb-cap]");
    let set = [], idx = 0, opener = null;
    const render = () => {
      const el = set[idx];
      img.src = el.dataset.full;
      img.alt = el.querySelector("img")?.alt || "";
      cap.textContent = el.dataset.caption || "";
      lb.classList.remove("is-zoomed");
      lb.querySelectorAll("[data-lb-prev], [data-lb-next]").forEach((b) => (b.hidden = set.length < 2));
    };
    const open = (el) => {
      const scope = el.closest(".gallery, .print-grid, .press-grid, .installation, .exh-year, .exh-archive") || document;
      set = [...scope.querySelectorAll("[data-lightbox-open]")];
      idx = Math.max(0, set.indexOf(el));
      opener = el;
      render();
      lb.hidden = false;
      lockScroll(true);
      lb.querySelector("[data-lb-close]").focus();
    };
    const close = () => { lb.hidden = true; lockScroll(false); opener?.focus(); };
    const step = (d) => { idx = (idx + d + set.length) % set.length; render(); };
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-lightbox-open]");
      if (t) { e.preventDefault(); open(t); }
    });
    lb.querySelector("[data-lb-close]").addEventListener("click", close);
    lb.querySelector("[data-lb-prev]").addEventListener("click", () => step(-1));
    lb.querySelector("[data-lb-next]").addEventListener("click", () => step(1));
    img.addEventListener("click", () => lb.classList.toggle("is-zoomed"));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  // ---------------------------------------------------------------- La Merienda: the photograph opens like an aperture
  // As it scrolls up through the screen, the side insets shrink from the text width to zero and the slight zoom settles.
  const aperture = document.querySelector("[data-aperture] .aperture__window");
  if (aperture && motion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = aperture.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));       // 0 when it enters, 1 once well inside
      const start = Math.max(parseFloat(getComputedStyle(root).getPropertyValue("--gutter")) || 24, (window.innerWidth - 1240) / 2 + 48);
      aperture.style.setProperty("--ap", `${(start * (1 - p)).toFixed(1)}px`);
      aperture.style.setProperty("--apz", (1.08 - 0.08 * p).toFixed(3));
    };
    const onScrollAp = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScrollAp, { passive: true });
    window.addEventListener("resize", onScrollAp);
    update();
  }

  // ---------------------------------------------------------------- drop-downs: open the one a link points to
  const openTarget = (id) => {
    const el = id && document.getElementById(id);
    const d = el && (el.tagName === "DETAILS" ? el : el.closest("details"));
    if (d) d.open = true;
    return el;
  };
  if (location.hash) {
    const el = openTarget(decodeURIComponent(location.hash.slice(1)));
    if (el) setTimeout(() => (lenis ? lenis.scrollTo(el, { offset: -100, immediate: true }) : el.scrollIntoView()), 60);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) openTarget(decodeURIComponent(a.getAttribute("href").slice(1)));
  });

  root.classList.add("is-loaded");
})();
