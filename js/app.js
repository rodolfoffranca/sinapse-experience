/**
 * SINAPSE EXPERIENCE & SINAPSE PREMIAÇÃO
 * Landing Page Oficial & RSVP Corporativo — JavaScript Interativo
 */

// ==========================================================================
// 1. CONFIGURAÇÕES GLOBAIS DO EVENTO (Fácil customização)
// ==========================================================================
const EVENT_CONFIG = {
  eventName: "Sinapse Experience & Sinapse Premiação 2026",
  targetDate: new Date("2026-12-11T08:00:00-03:00").getTime(),
  arrivalDate: "10 de Dezembro de 2026 (Quinta-feira)",
  eventDateFormatted: "11 de Dezembro de 2026 (Sexta-feira)",
  venueName: "Ideal Hub — Edifício Corporate Plaza",
  venueAddress: "Rua Alexandre Dumas, 2100 - 14º Andar — Chácara Santo Antônio, São Paulo - SP",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+Alexandre+Dumas,+2100+-+Chacara+Santo+Antonio,+Sao+Paulo+-+SP",
  conciergePhone: "5511945703064", // Telefone oficial da Concierge Sinapse: +55 11 94570-3064
  conciergeName: "Concierge Sinapse VIP",
  // Cole aqui a URL gerada no Google Apps Script (veja o arquivo google-sheets-script.js)
  googleSheetsWebhookUrl: "https://script.google.com/macros/s/AKfycbxl_kxi9TAlIFsISujuA0C753Wr7QIVXdPVEWE93Vi4GkkE7EXexmO2KJj48C8gqrvO/exec"
};

// ==========================================================================
// 2. COUNTDOWN TIMER EM TEMPO REAL
// ==========================================================================
function initCountdown() {
  const daysEl = document.getElementById("countdown-days");
  const hoursEl = document.getElementById("countdown-hours");
  const minutesEl = document.getElementById("countdown-minutes");
  const secondsEl = document.getElementById("countdown-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const difference = EVENT_CONFIG.targetDate - now;

    if (difference <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================================================
// 3. HEADER SCROLL EFFECT & SCROLL SPY
// ==========================================================================
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  const heroSection = document.getElementById("hero");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  const darkSections = document.querySelectorAll(".hero.dark, section.dark");

  function handleScroll() {
    const scrollY = window.scrollY;

    if (!header) return;

    if (scrollY <= 10) {
      header.classList.remove("site-header--scrolled", "site-header--dark-scrolled");
    } else {
      // Identifica se o header está sobreposto a uma seção com fundo escuro
      const headerHeight = header.offsetHeight || 68;
      let isOverDark = false;

      darkSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= headerHeight && rect.bottom > 0) {
          isOverDark = true;
        }
      });

      if (isOverDark) {
        header.classList.remove("site-header--scrolled");
        header.classList.add("site-header--dark-scrolled");
      } else {
        header.classList.remove("site-header--dark-scrolled");
        header.classList.add("site-header--scrolled");
      }
    }

    // Scroll spy
    let currentSectionId = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// ==========================================================================
// 4. MENU MOBILE (DRAWER ERGONÔMICO COM ACESSIBILIDADE)
// ==========================================================================
function initMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("menu-close");
  const drawer = document.getElementById("mobile-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!toggleBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggleBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Fechar ao clicar no backdrop (fora do conteúdo)
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeMenu();
  });

  // Fechar com tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

// ==========================================================================
// 5. BENTO GRID SPOTLIGHT CURSOR INTERACTIVE EFFECT
// ==========================================================================
function initBentoSpotlight() {
  const tiles = document.querySelectorAll(".bento-tile");
  tiles.forEach(tile => {
    tile.addEventListener("mousemove", (e) => {
      const rect = tile.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      tile.style.setProperty("--mouse-x", `${x}px`);
      tile.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

// ==========================================================================
// 6. MÁSCARA TELEFÔNICA BRASILEIRA (00) 00000-0000
// ==========================================================================
function applyPhoneMask(input) {
  input.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      // Formato com 9 dígitos: (11) 99999-9999
      e.target.value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (value.length > 6) {
      // Formato com 8 dígitos parcial: (11) 9999-9999
      e.target.value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (value.length > 2) {
      e.target.value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else if (value.length > 0) {
      e.target.value = value.replace(/^(\d*)$/, "($1");
    }
  });
}

// ==========================================================================
// 7. SISTEMA DE INSCRIÇÃO RSVP CORPORATIVO (TITULAR + ATÉ 4 LÍDERES)
// ==========================================================================
let leadersList = [];
const MAX_LEADERS = 4;

function renderLeaders() {
  const container = document.getElementById("leaders-container");
  const countEl = document.getElementById("leaders-count");
  const addBtn = document.getElementById("btn-add-leader");
  const emptyMsg = document.getElementById("empty-leaders-msg");

  if (!container || !countEl || !addBtn) return;

  // Atualizar contador visual
  countEl.textContent = `${leadersList.length} / ${MAX_LEADERS}`;

  // Desabilitar botão ao atingir 4
  if (leadersList.length >= MAX_LEADERS) {
    addBtn.disabled = true;
    addBtn.classList.add("btn--disabled");
    addBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      Capacidade Máxima Atingida (4 Líderes)
    `;
  } else {
    addBtn.disabled = false;
    addBtn.classList.remove("btn--disabled");
    addBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Adicionar Líder da Equipe (${leadersList.length}/${MAX_LEADERS})
    `;
  }

  // Se não há líderes
  if (leadersList.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    container.innerHTML = "";
    return;
  } else {
    if (emptyMsg) emptyMsg.style.display = "none";
  }

  // Renderizar cards de cada líder
  container.innerHTML = leadersList.map((leader, index) => {
    return `
      <div class="leader-item-box" data-index="${index}">
        <div class="leader-item-header">
          <span class="leader-item-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Líder 0${index + 1}
          </span>
          <button type="button" class="btn-remove-leader" onclick="removeLeader(${index})" aria-label="Remover Líder 0${index + 1}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
            Remover
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nome Completo do Líder <span class="req">*</span></label>
            <input type="text" class="form-control leader-name" placeholder="Ex: Rodrigo Mendes" value="${leader.name || ''}" autocomplete="name" autocapitalize="words" required oninput="updateLeaderField(${index}, 'name', this.value)">
          </div>

          <div class="form-group">
            <label class="form-label">Área / Cargo Estratégico <span class="req">*</span></label>
            <select class="form-control leader-role" required onchange="updateLeaderField(${index}, 'role', this.value)">
              <option value="" disabled ${!leader.role ? 'selected' : ''}>Selecione a área do líder</option>
              <option value="Líder Comercial" ${leader.role === 'Líder Comercial' ? 'selected' : ''}>Líder Comercial</option>
              <option value="Líder de Estoque / Logística" ${leader.role === 'Líder de Estoque / Logística' ? 'selected' : ''}>Líder de Estoque / Logística</option>
              <option value="Líder Financeiro" ${leader.role === 'Líder Financeiro' ? 'selected' : ''}>Líder Financeiro</option>
              <option value="Líder de Instrumentação" ${leader.role === 'Líder de Instrumentação' ? 'selected' : ''}>Líder de Instrumentação</option>
              <option value="Outra Área de Liderança" ${leader.role === 'Outra Área de Liderança' ? 'selected' : ''}>Outra Área de Liderança</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">WhatsApp Corporativo <span class="req">*</span></label>
            <input type="tel" class="form-control leader-phone" placeholder="(00) 00000-0000" value="${leader.phone || ''}" autocomplete="tel" inputmode="tel" required oninput="updateLeaderField(${index}, 'phone', this.value)">
          </div>

          <div class="form-group">
            <label class="form-label">Tamanho de Camisa (Kit Oficial) <span class="req">*</span></label>
            <select class="form-control leader-shirt" required onchange="updateLeaderField(${index}, 'shirt', this.value)">
              <option value="" disabled ${!leader.shirt ? 'selected' : ''}>Selecione o tamanho</option>
              <option value="P" ${leader.shirt === 'P' ? 'selected' : ''}>P</option>
              <option value="M" ${leader.shirt === 'M' ? 'selected' : ''}>M</option>
              <option value="G" ${leader.shirt === 'G' ? 'selected' : ''}>G</option>
              <option value="GG" ${leader.shirt === 'GG' ? 'selected' : ''}>GG</option>
              <option value="XG" ${leader.shirt === 'XG' ? 'selected' : ''}>XG</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Aplicar máscaras de telefone para os novos campos
  document.querySelectorAll(".leader-phone").forEach(input => applyPhoneMask(input));
}

// Funções globais chamadas pelo HTML inline
window.updateLeaderField = function (index, field, value) {
  if (leadersList[index]) {
    leadersList[index][field] = value;
  }
};

window.removeLeader = function (index) {
  leadersList.splice(index, 1);
  renderLeaders();
};

function initRSVPForm() {
  const form = document.getElementById("rsvp-form");
  const addBtn = document.getElementById("btn-add-leader");
  const titularPhone = document.getElementById("titular-phone");

  if (titularPhone) {
    applyPhoneMask(titularPhone);
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (leadersList.length < MAX_LEADERS) {
        leadersList.push({
          name: "",
          role: "",
          phone: "",
          shirt: ""
        });
        renderLeaders();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

// ==========================================================================
// 8. SUBMISSÃO DO FORMULÁRIO & MODAL DE SUCESSO
// ==========================================================================
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const companyInput = document.getElementById("company-name");
  const cityInput = document.getElementById("company-city");
  const titularNameInput = document.getElementById("titular-name");
  const titularPhoneInput = document.getElementById("titular-phone");
  const titularEmailInput = document.getElementById("titular-email");
  const titularShirtInput = document.getElementById("titular-shirt");
  const termsAgreedInput = document.getElementById("terms-agree");

  const requiredFields = [
    { el: companyInput, name: "Nome da Distribuidora" },
    { el: cityInput, name: "Cidade / UF" },
    { el: titularNameInput, name: "Nome do Titular (Dono/Sócio)" },
    { el: titularPhoneInput, name: "WhatsApp do Titular" },
    { el: titularEmailInput, name: "E-mail Corporativo" },
    { el: titularShirtInput, name: "Tamanho de Camisa do Titular" }
  ];

  for (const field of requiredFields) {
    if (!field.el || !field.el.value.trim()) {
      field.el.classList.add("has-error");
      field.el.scrollIntoView({ behavior: "smooth", block: "center" });
      field.el.focus();
      setTimeout(() => field.el.classList.remove("has-error"), 3500);
      alert(`Por favor, preencha o campo obrigatório: ${field.name}.`);
      return;
    }
  }

  if (!termsAgreedInput.checked) {
    termsAgreedInput.focus();
    termsAgreedInput.scrollIntoView({ behavior: "smooth", block: "center" });
    alert("Por favor, confirme a ciência da recomendação de chegada e do traje do jantar.");
    return;
  }

  // Validar se os líderes adicionados estão com dados completos
  for (let i = 0; i < leadersList.length; i++) {
    const l = leadersList[i];
    if (!l.name || !l.role || !l.phone || !l.shirt) {
      const leaderCard = document.querySelector(`.leader-item-box[data-index="${i}"]`);
      if (leaderCard) {
        leaderCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      alert(`Por favor, complete todos os dados do Líder 0${i + 1} ou remova o card.`);
      return;
    }
  }

  const company = companyInput.value.trim();
  const cityUf = cityInput.value.trim();
  const titularName = titularNameInput.value.trim();
  const titularPhone = titularPhoneInput.value.trim();
  const titularEmail = titularEmailInput.value.trim();
  const titularShirt = titularShirtInput.value;

  const submitBtn = document.getElementById("btn-submit-rsvp");
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg style="animation: spin 1s linear infinite; width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Processando Inscrição Exclusiva...
  `;

  const payload = {
    timestamp: new Date().toISOString(),
    timestampFormatted: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    company,
    cityUf,
    titularName,
    titularPhone,
    titularEmail,
    titularShirt,
    totalAttendees: 1 + leadersList.length,
    leadersCount: leadersList.length,
    leaders: [...leadersList],
    termsAgreed: true
  };

  // Salvar backup de segurança no localStorage do navegador
  try {
    const existing = JSON.parse(localStorage.getItem("sinapse_rsvp_history") || "[]");
    existing.push(payload);
    localStorage.setItem("sinapse_rsvp_history", JSON.stringify(existing));
  } catch (err) {
    console.warn("Não foi possível salvar localmente:", err);
  }

  // Enviar para o Google Sheets se o webhook estiver configurado
  if (EVENT_CONFIG.googleSheetsWebhookUrl && EVENT_CONFIG.googleSheetsWebhookUrl.trim() !== "") {
    fetch(EVENT_CONFIG.googleSheetsWebhookUrl.trim(), {
      method: "POST",
      mode: "no-cors", // Necessário para evitar bloqueio de CORS do Google Apps Script
      keepalive: true,
      headers: {
        // text/plain é "safelisted" em no-cors; application/json faz o navegador bloquear a requisição
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn("Erro no envio para o Google Sheets:", err);
    });
  }

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    showSuccessModal({
      company,
      cityUf,
      titularName,
      titularPhone,
      titularEmail,
      titularShirt,
      leaders: leadersList
    });
  }, 700);
}

function showSuccessModal(data) {
  const modal = document.getElementById("success-modal");
  const summaryBox = document.getElementById("modal-summary-content");
  const whatsappBtn = document.getElementById("btn-modal-whatsapp");
  const calendarBtn = document.getElementById("btn-modal-calendar");

  if (!modal || !summaryBox) return;

  const totalAttendees = 1 + data.leaders.length;

  let leadersHtml = "";
  if (data.leaders.length > 0) {
    leadersHtml = `
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line);">
        <strong style="color: var(--text); font-size: 0.88rem; display: block; margin-bottom: 6px;">Líderes Confirmados:</strong>
        ${data.leaders.map((l, i) => `
          <div style="font-size: 0.84rem; color: var(--muted); margin-bottom: 4px;">
            • <strong>${l.name}</strong> (${l.role} · Camisa ${l.shirt})
          </div>
        `).join("")}
      </div>
    `;
  }

  summaryBox.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">Distribuidora:</span>
      <span class="summary-value">${data.company}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Cidade / UF:</span>
      <span class="summary-value">${data.cityUf}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Titular (Dono/Sócio):</span>
      <span class="summary-value">${data.titularName} (Camisa ${data.titularShirt})</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Total de Vagas Garantidas:</span>
      <span class="summary-value" style="color: var(--accent); font-weight: 700;">${totalAttendees} pessoas (Titular + ${data.leaders.length} líderes)</span>
    </div>
    ${leadersHtml}
  `;

  // Construir link dinâmico para o WhatsApp da Concierge
  let leaderNamesTxt = data.leaders.length > 0
    ? `\nLíderes que me acompanharão: ${data.leaders.map(l => `${l.name} (${l.role})`).join(", ")}`
    : "";

  const whatsappMessage = encodeURIComponent(
    `Olá! Sou ${data.titularName}, sócio/titular da distribuidora ${data.company} (${data.cityUf}). ` +
    `Acabamos de confirmar presença no *Sinapse Experience & Sinapse Premiação 2026* ` +
    `para o total de ${totalAttendees} pessoa(s).${leaderNamesTxt}\n\n` +
    `Gostaria de falar com a Concierge VIP para alinhar a hospedagem nos hotéis parceiros e detalhes logísticos da nossa equipe!`
  );

  if (whatsappBtn) {
    whatsappBtn.href = `https://wa.me/${EVENT_CONFIG.conciergePhone}?text=${whatsappMessage}`;
  }

  if (calendarBtn) {
    calendarBtn.onclick = function () {
      downloadCalendarInvite(data);
    };
  }

  const gcalBtn = document.getElementById("btn-modal-gcal");
  if (gcalBtn) {
    const gcalTitle = encodeURIComponent("Sinapse Experience & Sinapse Premiação 2026");
    const gcalDetails = encodeURIComponent(
      `Imersão Executiva exclusiva para distribuidores parceiros de OPME (Trauma e Coluna).\n` +
      `- 08h00 às 18h00: Sinapse Experience\n` +
      `- 19h30: Sinapse Premiação (Jantar de Gala - Passeio Completo)\n\n` +
      `Inscrição confirmada: ${data.company} (${data.titularName} + ${data.leaders.length} líderes).`
    );
    const gcalLocation = encodeURIComponent(EVENT_CONFIG.venueAddress);
    // 11/12/2026 08:00 BRT (11:00 UTC) até 11/12/2026 23:30 BRT (12/12/2026 02:30 UTC)
    const gcalDates = "20261211T110000Z/20261212T023000Z";
    gcalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalDates}&details=${gcalDetails}&location=${gcalLocation}`;
  }

  modal.classList.add("is-active");
  document.body.style.overflow = "hidden";
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("is-active");
    document.body.style.overflow = "";
  }
}

// ==========================================================================
// 9. GERADOR DE CONVITE .ICS (CALENDÁRIO)
// ==========================================================================
function downloadCalendarInvite(data) {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sinapse Import//Sinapse Experience 2026//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:sinapse-experience-2026-" + Date.now() + "@sinapseimport.com.br",
    "DTSTAMP:20261014T120000Z",
    "DTSTART:20261211T110000Z", // 08:00 BRT
    "DTEND:20261212T020000Z",   // 23:00 BRT
    "SUMMARY:Sinapse Experience & Sinapse Premiação 2026",
    `DESCRIPTION:Imersão Executiva exclusiva para distribuidores de OPME (Trauma e Coluna) promovida pela Sinapse Import.\\n\\nProgramação:\\n- 08h00 às 18h00: Sinapse Experience (Imersão Executiva)\\n- 19h30: Sinapse Premiação (Jantar de Gala - Passeio Completo)\\n\\nInscrição confirmada para: ${data.company} (Titular: ${data.titularName})`,
    `LOCATION:${EVENT_CONFIG.venueAddress}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Sinapse_Experience_2026.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 10. COMPORTAMENTO ERGONÔMICO DO CTA FIXO (.ctafix)
// Oculta automaticamente quando o usuário entra no formulário RSVP ou rodapé
// para não sobrepor botões e inputs no mobile
// ==========================================================================
function initFloatingCta() {
  const ctafix = document.querySelector(".ctafix");
  const rsvpSection = document.getElementById("rsvp");
  const footer = document.querySelector(".foot");

  if (!ctafix) return;

  // Visível apenas após a Hero (scrollY > 500) e até o formulário (#rsvp) entrar na tela
  function updateCta() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const rsvpTop = rsvpSection ? rsvpSection.getBoundingClientRect().top : Infinity;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
    const inForm = rsvpTop < vh || footerTop < vh;
    ctafix.classList.toggle("is-hidden", scrollY <= 500 || inForm);
    ctafix.classList.toggle("is-on", scrollY > 500 && !inForm);
  }

  window.addEventListener("scroll", updateCta, { passive: true });
  window.addEventListener("resize", updateCta);
  updateCta();
}

// ==========================================================================
// 10b. ACCORDION DOS PILARES (MOBILE)
// ==========================================================================
function initPillarsAccordion() {
  const tiles = document.querySelectorAll(".bento-tile");
  const mq = window.matchMedia("(max-width: 768px)");

  tiles.forEach((tile, i) => {
    const toggle = () => {
      if (!mq.matches) return;
      const open = tile.classList.toggle("is-open");
      tile.setAttribute("aria-expanded", open);
    };
    tile.addEventListener("click", toggle);
    tile.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  function sync() {
    tiles.forEach((tile, i) => {
      if (mq.matches) {
        tile.setAttribute("role", "button");
        tile.setAttribute("tabindex", "0");
        tile.setAttribute("aria-expanded", tile.classList.contains("is-open"));
      } else {
        tile.removeAttribute("role");
        tile.removeAttribute("tabindex");
        tile.removeAttribute("aria-expanded");
      }
    });
  }
  if (tiles[0]) tiles[0].classList.add("is-open");
  sync();
  mq.addEventListener("change", sync);
}

// ==========================================================================
// 11. INICIALIZAÇÃO GERAL
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initHeaderScroll();
  initMobileMenu();
  initBentoSpotlight();
  initRSVPForm();
  initFloatingCta();
  initPillarsAccordion();

  // Fechar modal no clique de fechar ou backdrop
  const modal = document.getElementById("success-modal");
  const closeBtn = document.getElementById("modal-close-btn");

  if (closeBtn) closeBtn.addEventListener("click", closeSuccessModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeSuccessModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSuccessModal();
  });
});

