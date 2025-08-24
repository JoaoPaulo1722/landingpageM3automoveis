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

/* Prepara o link 'Quero este' com o modelo na mensagem */
$$(".vehicle-card .whatsVehicle").forEach((link) => {
  const card = link.closest(".vehicle-card");
  const modelo = card?.dataset?.modelo || "veículo";
  const href = waLink(MSG_VEICULO(modelo));
  link.setAttribute("href", href);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener");

  // Reforço: evita que o clique borbulhe para o trilho do carrossel
  link.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

/* ============ VITRINE: CARROSSEL OTIMIZADO ============ */
(function initCarousel() {
  const root = $("#carousel");
  if (!root) return;

  const track = $(".carousel__track", root);
  const prev = $(".carousel__btn.prev", root);
  const next = $(".carousel__btn.next", root);
  const dotsWrap = $("#carouselDots");
  const cards = $$(".vehicle-card", track);
  if (cards.length === 0) return;

  const GAP = 22; // Mesmo valor do gap no CSS
  let index = 0;

  // Atualiza os dots de navegação
  const updateDots = () => {
    $$("#carouselDots button").forEach((d, i) =>
      d.setAttribute("aria-selected", String(i === index))
    );
  };

  // Constrói os dots (1 por card)
  dotsWrap.innerHTML = "";
  cards.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });

  // Navega para o card de índice 'i'
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

  // Inicializa o estado dos dots
  updateDots();
})();

/* ============ MODAL DE VÍDEO ============ */
const modal = $("#videoModal");
const modalInner = $(".modal__inner");
const modalVideo = $("#modalVideo");
const closeModalBtn = $("#closeModal");
const backdrop = $("#modalBackdrop");
const ctaVideoWhats = $("#ctaVideoWhats");

// Abre modal e adapta largura para vídeos 9:16
function openModal(src, poster, title, isVertical = false) {
  // ajusta o container para vertical
  modalInner.classList.toggle("is-vertical", !!isVertical);

  // carrega o vídeo sob demanda
  modalVideo.src = src;
  if (poster) modalVideo.setAttribute("poster", poster);
  modalVideo.muted = true;
  modalVideo.play().catch(() => {});

  // CTA
  ctaVideoWhats.setAttribute("href", waLink(`${MSG_VIDEO} (Vídeo: ${title})`));

  // exibe modal
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.removeAttribute("poster");
  modalVideo.load();
  modalInner.classList.remove("is-vertical");
}

// Abre a partir dos cards
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

/* Voltar ao topo (footer) */
$(".backtop")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
