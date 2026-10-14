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
  venueName: "Espaço JK Iguatemi & Rooftop Eventos Faria Lima",
  venueAddress: "Av. Pres. Juscelino Kubitschek, 2041 - Vila Olímpia / Itaim Bibi, São Paulo - SP, 04543-011",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Pres.+Juscelino+Kubitschek,+2041+-+Vila+Olimpia,+Sao+Paulo+-+SP",
  wazeUrl: "https://waze.com/ul?q=Av.+Pres.+Juscelino+Kubitschek,+2041+Sao+Paulo",
  conciergePhone: "5511987654321", // Telefone oficial da Concierge Sinapse
  conciergeName: "Marcella / Concierge Sinapse VIP"
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

  function handleScroll() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight - 80 : 300;

    if (scrollY > heroHeight) {
      header.classList.add("site-header--scrolled");
    } else {
      header.classList.remove("site-header--scrolled");
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
// 4. MENU MOBILE
// ==========================================================================
function initMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("menu-close");
  const drawer = document.getElementById("mobile-drawer");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!toggleBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
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
  input.addEventListener("input", function(e) {
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
          <button type="button" class="btn-remove-leader" onclick="removeLeader(${index})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
            Remover
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nome Completo do Líder <span class="req">*</span></label>
            <input type="text" class="form-control leader-name" placeholder="Ex: Rodrigo Mendes" value="${leader.name || ''}" required oninput="updateLeaderField(${index}, 'name', this.value)">
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
            <input type="tel" class="form-control leader-phone" placeholder="(00) 00000-0000" value="${leader.phone || ''}" required oninput="updateLeaderField(${index}, 'phone', this.value)">
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
window.updateLeaderField = function(index, field, value) {
  if (leadersList[index]) {
    leadersList[index][field] = value;
  }
};

window.removeLeader = function(index) {
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
  const company = document.getElementById("company-name").value.trim();
  const cityUf = document.getElementById("company-city").value.trim();
  const titularName = document.getElementById("titular-name").value.trim();
  const titularPhone = document.getElementById("titular-phone").value.trim();
  const titularEmail = document.getElementById("titular-email").value.trim();
  const titularShirt = document.getElementById("titular-shirt").value;
  const termsAgreed = document.getElementById("terms-agree").checked;

  if (!company || !cityUf || !titularName || !titularPhone || !titularEmail || !titularShirt) {
    alert("Por favor, preencha todos os campos obrigatórios do Titular.");
    return;
  }

  if (!termsAgreed) {
    alert("Por favor, confirme a ciência da recomendação de chegada e do traje do jantar.");
    return;
  }

  // Validar se os líderes preenchidos estão completos
  for (let i = 0; i < leadersList.length; i++) {
    const l = leadersList[i];
    if (!l.name || !l.role || !l.phone || !l.shirt) {
      alert(`Por favor, complete todos os dados do Líder 0${i + 1} ou remova o card.`);
      return;
    }
  }

  const submitBtn = document.getElementById("btn-submit-rsvp");
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg style="animation: spin 1s linear infinite; width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Processando Inscrição Exclusiva...
  `;

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
  }, 800);
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
    calendarBtn.onclick = function() {
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
// 10. INICIALIZAÇÃO GERAL
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initHeaderScroll();
  initMobileMenu();
  initBentoSpotlight();
  initRSVPForm();

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
