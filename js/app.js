/**
 * SINAPSE EXPERIENCE 2026 — v2
 * Landing page + inscrição (titular + até 2 líderes)
 */

// ==========================================================================
// 1. CONFIGURAÇÃO — edite aqui
// ==========================================================================
const EVENT_CONFIG = {
  eventName: "Sinapse Experience 2026",
  targetDate: new Date("2026-12-11T08:00:00-03:00").getTime(),
  venueName: "Ideal Hub — Edifício Corporate Plaza",
  venueAddress: "Rua Alexandre Dumas, 2100 - 14º andar — Chácara Santo Antônio, São Paulo - SP",

  // Noite de Celebração — no mesmo local da imersão (usado no convite de agenda)
  dinner: {
    name: "Ideal Hub — mesmo local da imersão",
    address: "",
    mapsQuery: ""
  },

  // Concierge (WhatsApp)
  conciergePhone: "559185866664", // +55 91 8586-6664

  // Envio das inscrições por e-mail (FormSubmit).
  // Na 1ª inscrição o FormSubmit manda um e-mail de ATIVAÇÃO para esse endereço — é só clicar em "Activate Form".
  notifyEmail: "alexia.rodrigues@sinapseimport.com",

  // Planilhas Google (Apps Script). Cada inscrição é enviada para TODAS as URLs da lista.
  // 1) planilha antiga (já existente)  2) planilha "Inscrições — Sinapse Experience 2026" (cole a URL /exec abaixo)
  googleSheetsWebhooks: [
    "https://script.google.com/macros/s/AKfycbxl_kxi9TAlIFsISujuA0C753Wr7QIVXdPVEWE93Vi4GkkE7EXexmO2KJj48C8gqrvO/exec",
    "" // ← URL do App da Web da planilha nova
  ],

  maxLeaders: 2,
  leaderRoles: ["Líder Comercial", "Líder Financeiro"]
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ==========================================================================
// 2. LOCAL DO JANTAR (preenche a partir do config)
// ==========================================================================
function applyDinner() {
  const d = EVENT_CONFIG.dinner;
  const card = $("[data-dinner-card]");
  if (!d.name) {
    if (card) card.setAttribute("data-pending", "");
    return;
  }
  $$("[data-dinner-short]").forEach((el) => (el.textContent = d.name));
  $$("[data-dinner-line]").forEach((el) => (el.textContent = `${d.name}${d.address ? " · " + d.address : ""}`));
  const n = $("[data-dinner-name]");
  const a = $("[data-dinner-address]");
  if (n) n.textContent = d.name;
  if (a) a.textContent = d.address || "";
  if (card) {
    card.removeAttribute("data-pending");
    if (d.mapsQuery) {
      const body = $(".venue__body", card);
      const actions = document.createElement("div");
      actions.className = "venue__actions";
      const q = encodeURIComponent(d.mapsQuery);
      actions.innerHTML = `<a class="btn btn--light btn--sm" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google Maps</a><a class="btn btn--ghost-light btn--sm" href="https://waze.com/ul?q=${q}" target="_blank" rel="noopener">Waze</a>`;
      body.appendChild(actions);
    }
  }
}

// ==========================================================================
// 3. COUNTDOWN (bloco da inscrição + dock flutuante)
// ==========================================================================
function initCountdown() {
  const els = { d: $$('[data-cd="d"]'), h: $$('[data-cd="h"]'), m: $$('[data-cd="m"]'), s: $$('[data-cd="s"]') };
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const diff = Math.max(0, EVENT_CONFIG.targetDate - Date.now());
    const v = {
      d: Math.floor(diff / 864e5),
      h: Math.floor((diff % 864e5) / 36e5),
      m: Math.floor((diff % 36e5) / 6e4),
      s: Math.floor((diff % 6e4) / 1e3)
    };
    for (const k in els) els[k].forEach((el) => (el.textContent = pad(v[k])));
  }
  tick();
  setInterval(tick, 1000);
}

// ==========================================================================
// 4. NAV, DRAWER, SCROLL SPY, DOCK
// ==========================================================================
function initNav() {
  const nav = $("#nav");
  const hero = $(".hero");
  const toggle = $("#nav-toggle");
  const drawer = $("#drawer");
  const dock = $("#dock");
  const rsvp = $("#rsvp");
  const foot = $(".foot");
  const links = $$(".nav__links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  function onScroll() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    nav.classList.toggle("is-solid", window.scrollY > 20);

    const vh = window.innerHeight;
    const inForm = rsvp.getBoundingClientRect().top < vh * 0.85 && rsvp.getBoundingClientRect().bottom > 0;
    const inFoot = foot.getBoundingClientRect().top < vh;
    const showDock = heroBottom < vh * 0.4 && !inForm && !inFoot;
    dock.classList.toggle("is-on", showDock);
    dock.setAttribute("aria-hidden", String(!showDock));
    $("a", dock).tabIndex = showDock ? 0 : -1;

    let current = null;
    sections.forEach((sec) => { if (sec.getBoundingClientRect().top < vh * 0.4) current = sec; });
    links.forEach((a) => a.classList.toggle("is-active", current && a.getAttribute("href") === "#" + current.id));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  function setDrawer(open) {
    drawer.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false); });
}

// ==========================================================================
// 5. FORMULÁRIO
// ==========================================================================
let leaders = [];

function phoneMask(input) {
  input.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    else if (v.length > 0) v = v.replace(/^(\d*)$/, "($1");
    e.target.value = v;
  });
}

function renderLeaders() {
  const wrap = $("#leaders");
  const add = $("#add-leader");
  const count = $("#leaders-count");
  const max = EVENT_CONFIG.maxLeaders;

  wrap.innerHTML = leaders.map((l, i) => {
    const roleOpts = EVENT_CONFIG.leaderRoles
      .map((r) => `<option ${l.role === r ? "selected" : ""}>${esc(r)}</option>`).join("");
    const shirtOpts = ["P", "M", "G", "GG", "XG"]
      .map((s) => `<option ${l.shirt === s ? "selected" : ""}>${s}</option>`).join("");
    return `
      <div class="leader" data-i="${i}">
        <div class="leader__head">
          <span class="leader__title">Líder ${i + 1}</span>
          <button type="button" class="leader__remove" data-remove="${i}" aria-label="Remover líder ${i + 1}">Remover</button>
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="l${i}-name">Nome completo</label>
            <input id="l${i}-name" type="text" data-f="name" value="${esc(l.name)}" autocomplete="off" autocapitalize="words" placeholder="Nome do líder">
            <p class="field__err" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="l${i}-role">Área</label>
            <div class="select"><select id="l${i}-role" data-f="role" required>
              <option value="" ${l.role ? "" : "selected"} disabled>Selecione</option>${roleOpts}
            </select></div>
            <p class="field__err" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="l${i}-phone">WhatsApp</label>
            <input id="l${i}-phone" type="tel" inputmode="tel" data-f="phone" data-phone value="${esc(l.phone)}" placeholder="(00) 00000-0000">
            <p class="field__err" aria-live="polite"></p>
          </div>
          <div class="field">
            <label for="l${i}-shirt">Camisa (kit oficial)</label>
            <div class="select"><select id="l${i}-shirt" data-f="shirt" required>
              <option value="" ${l.shirt ? "" : "selected"} disabled>Selecione</option>${shirtOpts}
            </select></div>
            <p class="field__err" aria-live="polite"></p>
          </div>
        </div>
      </div>`;
  }).join("");

  $$("[data-phone]", wrap).forEach(phoneMask);
  $$(".leader", wrap).forEach((box) => {
    const i = Number(box.dataset.i);
    $$("[data-f]", box).forEach((el) => {
      const ev = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, () => { leaders[i][el.dataset.f] = el.value; clearError(el); });
    });
  });
  $$("[data-remove]", wrap).forEach((b) => b.addEventListener("click", () => {
    leaders.splice(Number(b.dataset.remove), 1);
    renderLeaders();
    add.focus();
  }));

  count.textContent = `${leaders.length} / ${max}`;
  add.disabled = leaders.length >= max;
  $("span", add).textContent = leaders.length >= max ? "Limite de líderes atingido" : "Adicionar líder";
}

function setError(el, msg) {
  const f = el.closest(".field");
  if (!f) return;
  f.classList.add("has-error");
  const p = $(".field__err", f);
  if (p) p.textContent = msg;
  el.setAttribute("aria-invalid", "true");
}
function clearError(el) {
  const f = el.closest(".field");
  if (!f) return;
  f.classList.remove("has-error");
  const p = $(".field__err", f);
  if (p) p.textContent = "";
  el.removeAttribute("aria-invalid");
}

function validate() {
  let first = null;
  const req = [
    ["#company-name", "Informe o nome da distribuidora."],
    ["#company-city", "Informe cidade e UF."],
    ["#titular-name", "Informe o nome do titular."],
    ["#titular-phone", "Informe um WhatsApp válido."],
    ["#titular-email", "Informe um e-mail válido."],
    ["#titular-shirt", "Selecione o tamanho da camisa."]
  ];
  req.forEach(([sel, msg]) => {
    const el = $(sel);
    let ok = el.value.trim() !== "";
    if (ok && el.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    if (ok && el.type === "tel") ok = el.value.replace(/\D/g, "").length >= 10;
    if (!ok) { setError(el, msg); first = first || el; } else clearError(el);
  });

  $$(".leader").forEach((box) => {
    $$("[data-f]", box).forEach((el) => {
      let ok = el.value.trim() !== "";
      if (ok && el.dataset.f === "phone") ok = el.value.replace(/\D/g, "").length >= 10;
      if (!ok) { setError(el, "Campo obrigatório."); first = first || el; } else clearError(el);
    });
  });

  const terms = $("#terms-agree");
  const termsErr = $("#terms-err");
  if (!terms.checked) { termsErr.textContent = "Confirme que está ciente da chegada e do traje."; first = first || terms; }
  else termsErr.textContent = "";

  if (first) {
    first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    setTimeout(() => first.focus({ preventScroll: true }), 300);
    return false;
  }
  return true;
}

async function sendEmail(p) {
  const leaderFields = {};
  p.leaders.forEach((l, i) => {
    leaderFields[`Líder ${i + 1}`] = `${l.name} · ${l.role} · ${l.phone} · Camisa ${l.shirt}`;
  });
  const body = {
    _subject: `Nova inscrição Sinapse Experience — ${p.company} (${p.totalAttendees} pessoa${p.totalAttendees > 1 ? "s" : ""}) · ${p.submissionId}`,
    _template: "table",
    _captcha: "false",
    _replyto: p.titularEmail,
    "Distribuidora": p.company,
    "Cidade / UF": p.cityUf,
    "Titular": p.titularName,
    "WhatsApp do titular": p.titularPhone,
    "E-mail": p.titularEmail,
    "Camisa do titular": p.titularShirt,
    "Total de pessoas": `${p.totalAttendees} (titular + ${p.leadersCount} líder${p.leadersCount === 1 ? "" : "es"})`,
    ...leaderFields,
    "Ciente de chegada 10/12 e traje": "Sim",
    "Data da inscrição": p.timestampFormatted,
    "ID da inscrição": p.submissionId
  };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${EVENT_CONFIG.notifyEmail}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    return res.ok;
  } catch (e) {
    console.warn("FormSubmit:", e);
    return false;
  } finally { clearTimeout(t); }
}

async function sendSheets(p) {
  const urls = (EVENT_CONFIG.googleSheetsWebhooks || []).map((u) => (u || "").trim()).filter(Boolean);
  if (!urls.length) return false;
  const results = await Promise.all(urls.map(async (url) => {
    try {
      await fetch(url, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(p)
      });
      return true;
    } catch (e) {
      console.warn("Sheets:", url, e);
      return false;
    }
  }));
  return results.some(Boolean);
}

// ID curto para cruzar e-mail × planilha (ex.: SX-K3F9Q2)
function makeSubmissionId() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  const rnd = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(6)) : Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
  for (let i = 0; i < 6; i++) id += abc[rnd[i] % abc.length];
  return "SX-" + id;
}

function initForm() {
  const form = $("#rsvp-form");
  const add = $("#add-leader");
  phoneMask($("#titular-phone"));
  $$("#rsvp-form input, #rsvp-form select").forEach((el) => {
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => clearError(el));
  });
  $("#terms-agree").addEventListener("change", () => ($("#terms-err").textContent = ""));

  add.addEventListener("click", () => {
    if (leaders.length >= EVENT_CONFIG.maxLeaders) return;
    const used = leaders.map((l) => l.role);
    const suggested = EVENT_CONFIG.leaderRoles.find((r) => !used.includes(r)) || "";
    leaders.push({ name: "", role: suggested, phone: "", shirt: "" });
    renderLeaders();
    const last = $$(".leader").pop();
    if (last) $("input", last).focus();
  });
  renderLeaders();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = $("#btn-submit");
    const status = $("#form-status");
    const label = $(".btn__label", btn);
    const original = label.textContent;
    btn.disabled = true;
    label.textContent = "Enviando inscrição…";
    const icon = $(".i", btn); if (icon) icon.style.display = "none";
    const spinner = document.createElement("span"); spinner.className = "spin"; btn.appendChild(spinner);
    status.textContent = ""; status.classList.remove("is-error");

    const now = new Date();
    const p = {
      submissionId: makeSubmissionId(),
      source: location.href.split("#")[0],
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      company: $("#company-name").value.trim(),
      cityUf: $("#company-city").value.trim(),
      titularName: $("#titular-name").value.trim(),
      titularPhone: $("#titular-phone").value.trim(),
      titularEmail: $("#titular-email").value.trim(),
      titularShirt: $("#titular-shirt").value,
      leaders: leaders.map((l) => ({ ...l, name: l.name.trim() })),
      leadersCount: leaders.length,
      totalAttendees: 1 + leaders.length,
      termsAgreed: true
    };

    try { const h = JSON.parse(localStorage.getItem("sinapse_rsvp_history") || "[]"); h.push(p); localStorage.setItem("sinapse_rsvp_history", JSON.stringify(h)); } catch (_) {}

    const [mailOk, sheetOk] = await Promise.all([sendEmail(p), sendSheets(p)]);

    btn.disabled = false; label.textContent = original; spinner.remove(); if (icon) icon.style.display = "";

    if (mailOk || sheetOk) {
      openModal(p);
      form.reset(); leaders = []; renderLeaders();
    } else {
      status.classList.add("is-error");
      status.innerHTML = `Não conseguimos enviar agora. Verifique sua conexão e tente de novo — ou fale com a <a href="https://wa.me/${EVENT_CONFIG.conciergePhone}" target="_blank" rel="noopener" style="text-decoration:underline">Concierge no WhatsApp</a>.`;
    }
  });
}

// ==========================================================================
// 6. MODAL + CALENDÁRIO
// ==========================================================================
let lastFocus = null;
function openModal(p) {
  const modal = $("#success-modal");
  const rows = [
    ["Protocolo", p.submissionId],
    ["Distribuidora", p.company],
    ["Cidade / UF", p.cityUf],
    ["Titular", p.titularName],
    ...p.leaders.map((l, i) => [`Líder ${i + 1}`, `${l.name} · ${l.role}`]),
    ["Total", `${p.totalAttendees} pessoa${p.totalAttendees > 1 ? "s" : ""}`]
  ];
  $("#modal-summary").innerHTML = rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");

  const names = p.leaders.length ? `\nLíderes: ${p.leaders.map((l) => `${l.name} (${l.role})`).join(", ")}` : "";
  const msg = encodeURIComponent(
    `Olá! Sou ${p.titularName}, da distribuidora ${p.company} (${p.cityUf}). ` +
    `Acabamos de confirmar presença no *Sinapse Experience 2026* — ${p.totalAttendees} pessoa(s).${names}\n\n` +
    `Gostaria de ajuda com hospedagem e passagens.`
  );
  $("#modal-whats").href = `https://wa.me/${EVENT_CONFIG.conciergePhone}?text=${msg}`;

  const details = encodeURIComponent(
    `Sinapse Experience 2026\n- 08h–08h45: Credenciamento e café\n- 09h–18h: Imersão executiva (${EVENT_CONFIG.venueName})\n- 20h–23h: Noite de Celebração${EVENT_CONFIG.dinner.name ? " (" + EVENT_CONFIG.dinner.name + ")" : ""} · traje passeio completo\n\nInscrição: ${p.company} — ${p.titularName} + ${p.leadersCount} líder(es).`
  );
  $("#modal-gcal").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Sinapse Experience 2026")}&dates=20261211T110000Z/20261212T020000Z&details=${details}&location=${encodeURIComponent(EVENT_CONFIG.venueAddress)}`;
  $("#modal-ics").onclick = () => downloadIcs(p);

  lastFocus = document.activeElement;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add("is-open"));
  document.body.style.overflow = "hidden";
  $("#modal-close").focus();
}
function closeModal() {
  const modal = $("#success-modal");
  if (modal.hidden) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => { modal.hidden = true; }, 250);
  if (lastFocus) lastFocus.focus();
}
function downloadIcs(p) {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sinapse Import//Sinapse Experience 2026//PT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sinapse-experience-2026-${Date.now()}@sinapseimport.com.br`,
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
    "DTSTART:20261211T110000Z", "DTEND:20261212T020000Z",
    "SUMMARY:Sinapse Experience 2026",
    `DESCRIPTION:08h–08h45 Credenciamento e café\\n09h–18h Imersão executiva\\n20h–23h Noite de Celebração (traje passeio completo)\\n\\nInscrição: ${p.company} — ${p.titularName}`,
    `LOCATION:${EVENT_CONFIG.venueAddress.replace(/,/g, "\\,")}`,
    "STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "Sinapse_Experience_2026.ics" });
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function initModal() {
  const modal = $("#success-modal");
  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

// ==========================================================================
// 7. HERO — indicador dia/noite sincronizado com o vídeo
// ==========================================================================
function initHeroPhase() {
  const v = $("#hero-video");
  const bar = $("#phase-progress");
  const rows = $$(".phase__row");
  if (!v || !bar) return;
  // o vídeo anoitece (cidade) por volta de 45% da duração
  const NIGHT_AT = 0.45;
  let raf = null;
  function tick() {
    if (v.duration) {
      const p = v.currentTime / v.duration;
      bar.style.transform = `scaleX(${p})`;
      const night = p >= NIGHT_AT;
      rows.forEach((r) => r.classList.toggle("is-active", (r.dataset.phase === "night") === night));
    }
    raf = requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(raf); raf = null; }
  });
  io.observe(v);
}

// ==========================================================================
// 8. MOVIMENTO (GSAP + ScrollTrigger)
// ==========================================================================
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
  };
  walk(el);
  return $$(".w", el);
}

function initDayNight(g) {
  const sec = $(".dn");
  if (!sec) return;
  const timeEl = $("#dn-time");
  const track = $("#dn-track");
  const clock = { t: 8 }; // horas decimais 08:00 → 23:00
  const fmt = (t) => `${String(Math.floor(t)).padStart(2, "0")}:${String(Math.floor((t % 1) * 60 / 15) * 15).padStart(2, "0")}`;

  const tl = g.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7,
      onUpdate: (self) => sec.classList.toggle("is-night", self.progress > 0.56)
    }
  });
  g.set("#dn-night", { y: 0, yPercent: 101 });
  tl.fromTo("#dn-frame", { scale: 0.9 }, { scale: 1, duration: 0.2, ease: "power2.out" }, 0)
    .to(clock, { t: 18, duration: 0.35, onUpdate: () => { timeEl.textContent = fmt(clock.t); } }, 0)
    .to(track, { scaleX: 10 / 15, duration: 0.35 }, 0)
    // anoitecer: o card da noite sobe e cobre o do dia
    .to("#dn-day", { scale: 0.9, yPercent: -3, opacity: 0.35, duration: 0.3, ease: "power1.inOut" }, 0.38)
    .to("#dn-night", { yPercent: 0, duration: 0.3, ease: "power2.inOut" }, 0.38)
    .to(sec, { backgroundColor: "#0A1130", duration: 0.25 }, 0.4)
    .to(clock, { t: 23, duration: 0.3, onUpdate: () => { timeEl.textContent = fmt(clock.t); } }, 0.38)
    .to(track, { scaleX: 1, duration: 0.3 }, 0.38)
    .to({}, { duration: 0.2 }); // respiro no fim
}

function initPillarStack(g) {
  const cards = $$(".pcard");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    g.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
      scale: 0.94, filter: "brightness(0.8)", ease: "none",
      scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true }
    });
  });
}

function initMarquee() {
  const t = $(".marquee__track");
  if (!t) return;
  t.innerHTML += t.innerHTML; // duplica para loop contínuo
}

function initMotion() {
  const g = window.gsap;
  const ST = window.ScrollTrigger;
  if (!g || !ST || reduceMotion) {
    document.documentElement.classList.remove("js-motion");
    return;
  }
  g.registerPlugin(ST);

  // Hero
  const tl = g.timeline({ defaults: { ease: "expo.out" } });
  tl.to("[data-hero-frame]", { clipPath: "inset(0% 0% 0% 0% round 32px)", duration: 1.4, ease: "expo.inOut" }, 0)
    .fromTo(".hero__video", { scale: 1.14 }, { scale: 1, duration: 2.2 }, 0)
    .to("[data-hero-line]", { y: 0, duration: 1.2, stagger: 0.09 }, 0.55)
    .to("[data-hero-item]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.8);

  // Reveals
  ST.batch("[data-reveal]", {
    start: "top 88%", once: true,
    onEnter: (els) => g.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 })
  });

  // Parallax
  $$("[data-parallax]").forEach((img) => {
    g.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Palavras acendendo
  $$("[data-reveal-words]").forEach((el) => {
    const words = splitWords(el);
    g.to(words, { opacity: 1, stagger: 0.04, ease: "none", scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.6 } });
  });

  // Contadores
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const obj = { v: 0 };
    el.textContent = "0";
    g.to(obj, { v: target, duration: 1.4, ease: "power2.out", snap: { v: 1 }, scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => (el.textContent = obj.v) });
  });

  initDayNight(g);
  initPillarStack(g);

  window.addEventListener("load", () => ST.refresh());
}

// ==========================================================================
// 9. INIT
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  applyDinner();
  initCountdown();
  initNav();
  initForm();
  initModal();
  initMarquee();
  initMotion();
  initHeroPhase();

  const v = $("#hero-video");
  if (v) {
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) { v.removeAttribute("autoplay"); v.pause(); }
    else v.play().catch(() => {});
  }
});
