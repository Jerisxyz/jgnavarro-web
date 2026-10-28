/* ============================================================
   JOSÉ GUILLERMO NAVARRO — PORTAFOLIO
   Diseño y desarrollo: Veltrix Soft
   ------------------------------------------------------------
   JavaScript vanilla. Sin dependencias externas.
   - Revelado progresivo al hacer scroll (IntersectionObserver)
   - Barra de progreso de lectura
   - Estado de navegación al desplazarse + sección activa
   - Menú móvil accesible
   - Entrada escalonada del hero
   - Respeto total a prefers-reduced-motion
   ============================================================ */
(function () {
  "use strict";

  /* Marca JS activo: sin JS, todo el contenido es visible por defecto */
  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     1. ENTRADA DEL HERO (escalonada)
     ------------------------------------------------------------ */
  const hero = document.querySelector(".hero");
  if (hero) {
    // Índices para el delay escalonado
    hero.querySelectorAll("[data-hero]").forEach(function (el, i) {
      el.style.setProperty("--hero-i", i);
    });
    // Activa las animaciones una vez disponible el documento
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-loaded");
      });
    });
  }

  /* ------------------------------------------------------------
     2. REVELADO PROGRESIVO AL HACER SCROLL (una sola vez)
     ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll("[data-reveal]");

  // Retrasos escalonados para grupos [data-stagger]
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    group.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      if (!el.hasAttribute("data-reveal-delay")) {
        el.setAttribute("data-reveal-delay", String(i * 120));
      }
    });
  });

  // Aplica el delay como variable CSS
  revealEls.forEach(function (el) {
    const d = el.getAttribute("data-reveal-delay");
    if (d) el.style.setProperty("--reveal-delay", d + "ms");
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // Sin soporte o con movimiento reducido: mostrar todo directamente
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // se ejecuta una sola vez
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------
     3. BARRA DE PROGRESO DE LECTURA + ESTADO DEL HEADER
     ------------------------------------------------------------ */
  const progressBar = document.getElementById("scrollProgressBar");
  const header = document.getElementById("siteHeader");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar && max > 0) {
        progressBar.style.transform = "scaleX(" + Math.min(scrollTop / max, 1) + ")";
      }
      if (header) {
        header.classList.toggle("is-scrolled", scrollTop > 24);
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------
     4. SECCIÓN ACTIVA EN LA NAVEGACIÓN
     ------------------------------------------------------------ */
  const navLinks = document.querySelectorAll(".nav__link[data-section]");
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("data-section") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ------------------------------------------------------------
     5. MENÚ MÓVIL
     ------------------------------------------------------------ */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Cerrar al pulsar un enlace del menú
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    // Cerrar con Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    // Cerrar si se cambia a escritorio
    window.matchMedia("(min-width: 721px)").addEventListener("change", function () {
      setMenu(false);
    });
  }

  /* ------------------------------------------------------------
     6. ENLACES DE CONTACTO PENDIENTES (placeholder)
     Muestra un aviso en consola y evita la navegación
     mientras href="#" (enlace no configurado).
     ------------------------------------------------------------ */
  ["whatsappBtn", "emailBtn"].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
      if (el.getAttribute("href") === "#") {
        e.preventDefault();
        // eslint-disable-next-line no-console
        console.info(
          "[Veltrix Soft] Enlace pendiente de configurar. " +
          "Edita el atributo href en index.html: busca el comentario TODO (" +
          (id === "whatsappBtn" ? "WHATSAPP" : "EMAIL") + ")."
        );
      }
    });
  });

  /* ------------------------------------------------------------
     7. AÑO ACTUAL EN EL PIE DE PÁGINA
     ------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();