/* ============ CONFIGURAÇÕES ============ */
// N° oficial do WhatsApp (DDI 55 + DDD + número, só dígitos)
const WHATS_NUMBER = "5511955009362";

// Mensagens padrão
const MSG_GERAL =
  "Olá! Vim pelo site da M3 Automóveis. Quero agendar uma visita/atendimento.";
const MSG_VIDEO =
  "Olá! Acabei de ver as entregas da M3. Quero entender minha melhor opção para comprar meu carro.";
const MSG_VEICULO = (modelo) =>
  `Olá! Tenho interesse no ${modelo}. Podem enviar mais detalhes e condições?`;

/* ============ HELPERS ============ */
const waLink = (msg) =>
  `https://wa.me/${WHATS_NUMBER}?text=${encodeURIComponent(msg)}`;
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

/* ============ HEADER / NAV ============ */
const nav = $("#nav");
const burger = $("#hamburger");

burger?.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("show");
});

/* Fecha o menu ao clicar em um link */
$$(".nav a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("show");
    burger.setAttribute("aria-expanded", "false");
  })
);

/* ============ CTA WHATSAPP ============ */
$("#ctaHeroWhats")?.setAttribute("href", waLink(MSG_GERAL));
$("#ctaAboutWhats")?.setAttribute("href", waLink(MSG_GERAL));
$("#ctaFooterWhats")?.setAttribute("href", waLink(MSG_GERAL));
$("#floatWhats")?.setAttribute("href", waLink(MSG_GERAL));

/* Prepara o link 'Quero este' com o modelo na mensagem (target _blank) */
$$(".vehicle-card .whatsVehicle").forEach((link) => {
  const card = link.closest(".vehicle-card");
  const modelo = card?.dataset?.modelo || "veículo";
  const href = waLink(MSG_VEICULO(modelo));
  link.setAttribute("href", href);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener");

  // Evita que o clique borbulhe para o trilho do carrossel
  link.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

/* ============ SMOOTH SCROLL (mobile-friendly + header offset) ============ */
(function smoothAnchors() {
  const header = document.querySelector(".header");
  const scroller = document.scrollingElement || document.documentElement;

  // Easing cubic
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function animateScrollTo(targetY, duration = 650) {
    const startY = scroller.scrollTop;
    const dist = targetY - startY;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      scroller.scrollTop = startY + dist * ease(t);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const headerOffset = () => (header ? header.offsetHeight : 0);

  function scrollToHash(hash) {
    // Caso especial: voltar ao topo
    if (hash === "#topo" || hash === "#home" || hash === "#") {
      animateScrollTo(0, 650);
      return;
    }

    const el = document.querySelector(hash);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + scroller.scrollTop - headerOffset();

    animateScrollTo(Math.max(0, y), 650);
  }

  // Delegação para todos os links internos
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // Se o alvo existir, nós controlamos a rolagem
    if (href === "#topo" || document.querySelector(href)) {
      e.preventDefault();
      scrollToHash(href);

      // Fecha o menu mobile, se aberto
      document.getElementById("nav")?.classList.remove("show");
      document
        .getElementById("hamburger")
        ?.setAttribute("aria-expanded", "false");
    }
  });

  // Se a página abrir já com hash, aplica offset
  window.addEventListener("load", () => {
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => scrollToHash(location.hash), 0);
    }
  });
})();

/* ============ VITRINE: CARROSSEL OTIMIZADO ============ */
(function initCarousel() {
  const root = $("#carousel");
  if (!root) return;

  const track = $(".carousel__track", root);
  const prev = $(".carousel__btn.prev", root);
  const next = $(".carousel__btn.next", root);
  const dotsWrap = $("#carouselDots");
  const cards = $$(".vehicle-card", track);
  if (!track || !dotsWrap || cards.length === 0) return;

  const GAP = 22; // mesmo valor do gap no CSS
  let index = 0;

  // Constrói os dots (1 por card)
  dotsWrap.innerHTML = "";
  cards.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });

  const updateDots = () => {
    $$("#carouselDots button").forEach((d, i) =>
      d.setAttribute("aria-selected", String(i === index))
    );
  };

  const goTo = (i) => {
    index = Math.max(0, Math.min(i, cards.length - 1));
    const cardWidth = cards[0].offsetWidth;
    const scrollLeft = index * (cardWidth + GAP);
    track.scrollTo({ left: scrollLeft, behavior: "smooth" });
    updateDots();
  };

  prev?.addEventListener("click", () => goTo(index - 1));
  next?.addEventListener("click", () => goTo(index + 1));

  // Atualiza os dots conforme o usuário arrasta
  track.addEventListener("scroll", () => {
    const cardWidth = cards[0].offsetWidth;
    const newIndex = Math.round(track.scrollLeft / (cardWidth + GAP));
    if (newIndex !== index) {
      index = newIndex;
      updateDots();
    }
  });

  // Inicializa estado
  updateDots();
})();

/* ============ MODAL DE VÍDEO (Clientes Felizes) ============ */
const modal = $("#videoModal");
const modalInner = $(".modal__inner");
const modalVideo = $("#modalVideo");
const closeModalBtn = $("#closeModal");
const backdrop = $("#modalBackdrop");
const ctaVideoWhats = $("#ctaVideoWhats");

function openModal(src, poster, title, isVertical = false) {
  if (!modal || !modalInner || !modalVideo) return;

  modalInner.classList.toggle("is-vertical", !!isVertical);

  // carrega o vídeo sob demanda
  modalVideo.src = src;
  if (poster) modalVideo.setAttribute("poster", poster);
  modalVideo.muted = true; // para garantir autoplay no mobile
  modalVideo.play().catch(() => {});

  // CTA
  ctaVideoWhats?.setAttribute("href", waLink(`${MSG_VIDEO} (Vídeo: ${title})`));

  // exibe modal
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!modal || !modalVideo || !modalInner) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.removeAttribute("poster");
  modalVideo.load();

  modalInner.classList.remove("is-vertical");
}

// Abertura a partir dos cards .openVideo
$$(".openVideo").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const el = e.currentTarget;
    const innerVideo = el.querySelector("video");

    const src =
      (el.dataset.video && el.dataset.video.trim()) ||
      innerVideo?.currentSrc ||
      innerVideo?.getAttribute("src");

    const poster =
      (el.dataset.poster && el.dataset.poster.trim()) ||
      innerVideo?.getAttribute("poster") ||
      "";

    const title = el.closest(".video-card")?.dataset?.title || "Entrega";
    const isVertical = (el.dataset.orientation || "vertical") === "vertical";

    if (!src) {
      console.warn("Vídeo sem src válido. Verifique data-video/src.");
      return;
    }
    openModal(src, poster, title, isVertical);
  });
});

closeModalBtn?.addEventListener("click", closeModal);
backdrop?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ============ UTILIDADES ============ */
$("#year").textContent = new Date().getFullYear();

/* Exemplo 'Detalhes' (placeholder) */
$$(".moreInfo").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".vehicle-card");
    const modelo = card?.dataset?.modelo || "Veículo";
    alert(
      `Exemplo: abrir detalhes do ${modelo}. Aqui você pode trocar por um modal simples de fotos/descrição.`
    );
  });
});

/* ============ HERO: vídeo à direita (autoplay mudo, unmute, sem loop) ============ */
(function setupHeroVideo() {
  const heroVideo = document.getElementById("heroVideo");
  const heroUnmute = document.getElementById("heroUnmute");
  if (!heroVideo) return;

  // Garante atributos que ajudam no autoplay e no iOS
  heroVideo.setAttribute("playsinline", "");
  heroVideo.playsInline = true;
  heroVideo.loop = false;
  heroVideo.muted = true; // começa mudo para autoplay
  heroVideo.autoplay = true;

  // Tenta iniciar o autoplay mudo assim que possível
  const tryPlayMuted = () => heroVideo.play().catch(() => {});
  if (document.readyState === "complete") tryPlayMuted();
  else window.addEventListener("load", tryPlayMuted);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlayMuted();
  });

  // Função robusta para tocar COM SOM quando o usuário clica
  const playWithSound = async () => {
    try {
      if (heroVideo.readyState < 2) heroVideo.load();
      if (heroVideo.currentTime === 0) {
        try {
          heroVideo.currentTime = 0.001;
        } catch {}
      }
      heroVideo.muted = false;
      heroVideo.volume = 1;
      await heroVideo.play();
      heroUnmute?.classList.add("is-hidden");
      heroVideo.removeAttribute("controls");
    } catch (err) {
      heroVideo.setAttribute("controls", "controls");
      console.warn("Reprodução com som falhou:", err);
    }
  };

  heroUnmute?.addEventListener("click", (e) => {
    e.preventDefault();
    playWithSound();
  });
  heroVideo.addEventListener("click", () => {
    if (heroVideo.muted) playWithSound();
  });

  heroVideo.addEventListener("ended", () => {
    // sem loop
  });

  heroVideo.addEventListener("error", () => {
    heroVideo.setAttribute("controls", "controls");
    console.warn("Erro no heroVideo:", heroVideo.error);
  });
})();

/* ============ VOLTAR AO TOPO ============ */
// const backTop = $(".backtop");
// backTop?.addEventListener("click", (e) => {
//   e.preventDefault();
//   window.scrollTo({ top: 0, behavior: "smooth" });
// });
