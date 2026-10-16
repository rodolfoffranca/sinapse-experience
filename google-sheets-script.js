/**
 * ============================================================================
 * SINAPSE EXPERIENCE 2026 — Integração das inscrições com Google Sheets
 * Planilha: "Inscrições — Sinapse Experience 2026"
 * ============================================================================
 *
 * COMO INSTALAR (resumo — o passo a passo completo foi enviado no chat):
 * 1. Abra a planilha > Extensões > Apps Script.
 * 2. Apague o conteúdo do arquivo Código.gs e cole este arquivo inteiro. Salve.
 * 3. Implantar > Nova implantação > tipo "App da Web".
 *      Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 * 4. Autorize o acesso com a conta Google dona da planilha.
 * 5. Copie a "URL do app da Web" (termina com /exec) e coloque em
 *    js/app.js > EVENT_CONFIG.googleSheetsWebhooks.
 * 6. Rode a função configurarPlanilha pelo editor (Executar). Ela:
 *    - acerta o fuso para São Paulo e o idioma para português;
 *    - apaga linhas de teste (ID "SX-TESTE…" ou sem ID);
 *    - formata a aba "Inscrições" (cabeçalho por grupo, faixas, cores de status, filtro);
 *    - cria a aba "Painel" (totais, camisas, status e últimas inscrições).
 *    Pode rodar de novo quando quiser: ela refaz o visual sem mexer nos dados.
 *
 * Atualizar só o visual NÃO exige nova implantação: o doPost não mudou.
 *
 * O que o webhook faz:
 * - Grava cada inscrição como uma linha na aba "Inscrições".
 * - Usa o "ID da inscrição" (ex.: SX-K3F9Q2) — o mesmo que vai no assunto do
 *   e-mail — para cruzar planilha × e-mail (dupla verificação).
 * - Ignora envios repetidos com o mesmo ID.
 * - (Opcional) manda um e-mail de aviso a cada inscrição: preencha AVISO_EMAIL.
 * ============================================================================
 */

var ABA = "Inscrições";
var AVISO_EMAIL = ""; // opcional: ex. "alexia.rodrigues@sinapseimport.com" — deixe vazio para não enviar

var CABECALHO = [
  "ID da inscrição", "Data / hora", "Distribuidora", "Cidade / UF",
  "Titular (dono/sócio)", "WhatsApp do titular", "E-mail", "Camisa do titular",
  "Total de pessoas",
  "Líder 1 — Nome", "Líder 1 — Área", "Líder 1 — WhatsApp", "Líder 1 — Camisa",
  "Líder 2 — Nome", "Líder 2 — Área", "Líder 2 — WhatsApp", "Líder 2 — Camisa",
  "Ciente da chegada 10/12 e do traje", "Status", "Observações"
];

var STATUS = ["Nova", "Contato feito", "Confirmada", "Cancelada"];

// Identidade visual (mesma paleta do site)
var COR = {
  tinta: "#0E1638", navy: "#172259", azul: "#2C86CC", azulEsc: "#1D5FA8",
  dourado: "#E9C27A", texto: "#1E2440", cinza: "#6B7290", linha: "#E6EAF3",
  banda: "#F5F8FD", card: "#F2F5FB", divisor: "#C9D3E6"
};
var FONTE = "Inter";
var MONO = "Roboto Mono";

// Cores de cada status: [fundo, texto, barra do painel]
var COR_STATUS = {
  "Nova":          ["#FFF1CC", "#8A5A00", "#E9B949"],
  "Contato feito": ["#E1EDFB", "#1D5FA8", "#2C86CC"],
  "Confirmada":    ["#DCF3E5", "#127A45", "#1F9D5C"],
  "Cancelada":     ["#EEEFF3", "#8A8FA3", "#B5BACB"]
};

/* =============================== VISUAL ================================== */

// Rode pelo editor (Executar > configurarPlanilha). Pode rodar de novo quando quiser.
function configurarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("America/Sao_Paulo");
  ss.setSpreadsheetLocale("pt_BR");

  var sheet = getAba_();
  limparTestes();
  formatarInscricoes_(sheet);
  var painel = montarPainel_(ss, sheet);

  ss.setActiveSheet(painel);
  SpreadsheetApp.flush();
}

// Apaga linhas de teste: ID começando com "SX-TESTE", distribuidora "TESTE…" ou linha sem ID
function limparTestes() {
  var sheet = getAba_();
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var vals = sheet.getRange(2, 1, last - 1, 3).getValues();
  var apagadas = 0;
  for (var i = vals.length - 1; i >= 0; i--) {
    var id = String(vals[i][0] || "").trim();
    var empresa = String(vals[i][2] || "").trim();
    if (id === "" || id.indexOf("SX-TESTE") === 0 || /^TESTE/i.test(empresa)) {
      sheet.deleteRow(i + 2);
      apagadas++;
    }
  }
  return apagadas;
}

function formatarInscricoes_(sheet) {
  var n = CABECALHO.length;
  var maxR = sheet.getMaxRows();
  if (maxR < 500) { sheet.insertRowsAfter(maxR, 500 - maxR); maxR = 500; }
  var maxC = sheet.getMaxColumns();
  if (maxC > n) sheet.deleteColumns(n + 1, maxC - n);

  // Limpa visual anterior (sem tocar nos dados)
  sheet.getBandings().forEach(function (b) { b.remove(); });
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.setConditionalFormatRules([]);

  var tudo = sheet.getRange(1, 1, maxR, n);
  tudo.setFontFamily(FONTE).setFontSize(10).setFontColor(COR.texto)
    .setFontWeight("normal").setVerticalAlignment("middle")
    .setHorizontalAlignment("left").setBackground(null)
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
    .setBorder(false, false, false, false, false, false);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(COR.azul);

  // Cabeçalho com cores por grupo: ID | titular | líder 1 | líder 2 | controle
  var cab = sheet.getRange(1, 1, 1, n);
  cab.setValues([CABECALHO]).setFontColor("#FFFFFF").setFontWeight("bold")
    .setFontSize(9).setHorizontalAlignment("center").setWrap(true);
  [[1, 1, COR.tinta], [2, 8, COR.navy], [10, 4, COR.azul], [14, 4, COR.azulEsc],
   [18, 1, COR.navy], [19, 1, COR.dourado], [20, 1, COR.navy]].forEach(function (g) {
    sheet.getRange(1, g[0], 1, g[1]).setBackground(g[2]);
  });
  sheet.getRange(1, 19).setFontColor(COR.tinta);
  sheet.setRowHeight(1, 52);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);

  var larguras = [118, 136, 230, 150, 210, 150, 230, 84, 84, 200, 140, 150, 84, 200, 140, 150, 84, 120, 140, 280];
  larguras.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  // Linhas de dados
  var linhas = maxR - 1;
  sheet.setRowHeights(2, linhas, 34);
  var col = function (c) { return sheet.getRange(2, c, linhas, 1); };

  col(1).setFontFamily(MONO).setFontColor(COR.azul).setFontWeight("bold");
  col(2).setNumberFormat("dd/mm/yyyy  HH:mm").setFontColor(COR.cinza).setHorizontalAlignment("center");
  col(3).setFontWeight("bold").setFontColor(COR.tinta);
  col(7).setFontColor(COR.cinza);
  [6, 12, 16].forEach(function (c) { col(c).setNumberFormat("@"); });
  [8, 9, 13, 17, 18, 19].forEach(function (c) { col(c).setHorizontalAlignment("center"); });
  col(9).setNumberFormat("0").setFontWeight("bold").setFontSize(11).setFontColor(COR.navy);
  col(19).setFontWeight("bold");
  col(20).setFontColor(COR.cinza);

  // Faixas alternadas + linhas finas + separadores entre os grupos
  var dados = sheet.getRange(2, 1, linhas, n);
  dados.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
    .setFirstRowColor("#FFFFFF").setSecondRowColor(COR.banda);
  dados.setBorder(null, null, null, null, null, true, COR.linha, SpreadsheetApp.BorderStyle.SOLID);
  [1, 9, 13, 17].forEach(function (c) {
    sheet.getRange(1, c, maxR, 1).setBorder(null, null, null, true, null, null, COR.divisor, SpreadsheetApp.BorderStyle.SOLID);
  });

  // Lista de Status
  var regraLista = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS, true).setAllowInvalid(false).build();
  col(19).setDataValidation(regraLista);

  // Cores condicionais
  var regras = [];
  regras.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$S2="Cancelada"')
    .setFontColor("#A3A8BA").setStrikethrough(true)
    .setRanges([sheet.getRange(2, 1, linhas, 18)]).build());
  STATUS.forEach(function (st) {
    regras.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(st).setBackground(COR_STATUS[st][0]).setFontColor(COR_STATUS[st][1])
      .setRanges([col(19)]).build());
  });
  regras.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Sim").setFontColor("#127A45").setBold(true).setRanges([col(18)]).build());
  regras.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Não").setFontColor("#C0392B").setBold(true).setRanges([col(18)]).build());
  sheet.setConditionalFormatRules(regras);

  // Filtro em todas as colunas
  sheet.getRange(1, 1, maxR, n).createFilter();
}

function montarPainel_(ss, inscricoes) {
  ["Resumo", "Painel"].forEach(function (nome) {
    var s = ss.getSheetByName(nome);
    if (s) ss.deleteSheet(s);
  });
  var p = ss.insertSheet("Painel", 0);
  var NC = 13, NR = 40;
  if (p.getMaxColumns() > NC) p.deleteColumns(NC + 1, p.getMaxColumns() - NC);
  if (p.getMaxRows() > NR) p.deleteRows(NR + 1, p.getMaxRows() - NR);

  p.setHiddenGridlines(true);
  p.setTabColor(COR.navy);
  p.getRange(1, 1, NR, NC).setFontFamily(FONTE).setFontSize(10).setFontColor(COR.texto)
    .setVerticalAlignment("middle");
  [24, 170, 110, 18, 170, 110, 18, 170, 110, 18, 170, 110, 24]
    .forEach(function (w, i) { p.setColumnWidth(i + 1, w); });
  for (var r = 1; r <= NR; r++) p.setRowHeight(r, 26);

  var I = "'" + ABA + "'!";
  var ATIVA = I + "S2:S,\"<>Cancelada\"";

  // Cabeçalho do painel
  p.setRowHeight(1, 20);
  p.getRange("B2").setValue("SINAPSE EXPERIENCE 2026").setFontSize(9).setFontWeight("bold").setFontColor(COR.azul);
  p.getRange("B3").setValue("Painel de inscrições").setFontSize(24).setFontWeight("bold").setFontColor(COR.navy);
  p.setRowHeight(3, 46);
  p.getRange("B4").setValue("11 de dezembro · Ideal Hub · São Paulo").setFontColor(COR.cinza);
  p.getRange("H4:L4").merge();
  p.getRange("H4").setHorizontalAlignment("right").setFontColor(COR.cinza)
    .setFormula('="Última inscrição: "&IF(COUNT(' + I + 'B2:B),TEXT(MAX(' + I + 'B2:B),"dd/mm · HH:mm"),"—")');
  p.getRange("B5:L5").setBorder(null, null, true, null, null, null, COR.linha, SpreadsheetApp.BorderStyle.SOLID);
  p.setRowHeight(5, 14);
  p.setRowHeight(6, 18);

  // Cards de totais (linhas 7–9)
  var cards = [
    { c: 2, rot: "PESSOAS INSCRITAS", f: "=SUMIFS(" + I + "I2:I," + ATIVA + ")", sub: "titulares + líderes",
      bg: COR.navy, fg: "#FFFFFF", sfg: "#AFC0E6" },
    { c: 5, rot: "DISTRIBUIDORAS", f: "=COUNTIFS(" + I + "A2:A,\"<>\"," + ATIVA + ")", sub: "inscrições ativas" },
    { c: 8, rot: "LÍDERES", f: "=COUNTIFS(" + I + "J2:J,\"<>\"," + ATIVA + ")+COUNTIFS(" + I + "N2:N,\"<>\"," + ATIVA + ")",
      subF: '="Comercial "&(COUNTIFS(' + I + 'K2:K,"Líder Comercial",' + ATIVA + ')+COUNTIFS(' + I + 'O2:O,"Líder Comercial",' + ATIVA + '))' +
            '&"  ·  Financeiro "&(COUNTIFS(' + I + 'K2:K,"Líder Financeiro",' + ATIVA + ')+COUNTIFS(' + I + 'O2:O,"Líder Financeiro",' + ATIVA + '))' },
    { c: 11, rot: "AGUARDANDO CONTATO", f: "=COUNTIF(" + I + "S2:S,\"Nova\")", sub: "status \"Nova\"",
      bg: "#FFF4D6", fg: "#7A5200", sfg: "#A27A2A" }
  ];
  cards.forEach(function (k) {
    p.getRange(7, k.c, 3, 2).setBackground(k.bg || COR.card).setHorizontalAlignment("center");
    [7, 8, 9].forEach(function (row) { p.getRange(row, k.c, 1, 2).merge(); });
    p.getRange(7, k.c).setValue(k.rot).setFontSize(8).setFontWeight("bold").setFontColor(k.sfg || COR.cinza)
      .setVerticalAlignment("bottom");
    p.getRange(8, k.c).setFormula(k.f).setNumberFormat("0").setFontSize(30).setFontWeight("bold")
      .setFontColor(k.fg || COR.navy);
    var s = p.getRange(9, k.c).setFontSize(9).setFontColor(k.sfg || COR.cinza).setVerticalAlignment("top");
    if (k.subF) s.setFormula(k.subF); else s.setValue(k.sub);
  });
  p.setRowHeight(7, 30); p.setRowHeight(8, 50); p.setRowHeight(9, 30);
  p.setRowHeight(10, 30);

  // Títulos das seções do meio
  var titulo = function (a1, txt) {
    p.getRange(a1).setValue(txt).setFontSize(12).setFontWeight("bold").setFontColor(COR.navy);
  };
  var subcab = function (a1s) {
    a1s.forEach(function (a) {
      p.getRange(a[0]).setValue(a[1]).setFontSize(8).setFontWeight("bold").setFontColor(COR.cinza);
    });
  };
  titulo("B11", "Camisas do kit oficial");
  titulo("H11", "Status das inscrições");
  subcab([["B12", "TAMANHO"], ["C12", "QTD."], ["H12", "STATUS"], ["I12", "QTD."]]);
  ["B12:F12", "H12:L12"].forEach(function (a) {
    p.getRange(a).setBorder(null, null, true, null, null, null, COR.linha, SpreadsheetApp.BorderStyle.SOLID);
  });
  p.getRange("C12").setHorizontalAlignment("center");
  p.getRange("I12").setHorizontalAlignment("center");

  // Camisas (linhas 13–17) + total (18)
  var tamanhos = ["P", "M", "G", "GG", "XG"];
  tamanhos.forEach(function (t, i) {
    var row = 13 + i;
    p.getRange(row, 2).setValue("Tamanho " + t).setFontWeight("bold");
    p.getRange(row, 3).setFormula(
      '=COUNTIFS(' + I + 'H2:H,"' + t + '",' + ATIVA + ')+COUNTIFS(' + I + 'M2:M,"' + t + '",' + ATIVA +
      ')+COUNTIFS(' + I + 'Q2:Q,"' + t + '",' + ATIVA + ')')
      .setHorizontalAlignment("center").setFontWeight("bold").setFontColor(COR.navy);
    p.getRange(row, 5, 1, 2).merge();
    p.getRange(row, 5).setFormula('=SPARKLINE(C' + row + ',{"charttype","bar";"max",MAX($C$13:$C$17,1);"color1","' + COR.azul + '"})');
  });
  p.getRange("B18").setValue("Total de camisas").setFontWeight("bold").setFontColor(COR.navy);
  p.getRange("C18").setFormula("=SUM(C13:C17)").setHorizontalAlignment("center").setFontWeight("bold").setFontColor(COR.navy);
  p.getRange("B18:F18").setBorder(true, null, null, null, null, null, COR.divisor, SpreadsheetApp.BorderStyle.SOLID);

  // Status (linhas 13–16) + total (18)
  STATUS.forEach(function (st, i) {
    var row = 13 + i;
    p.getRange(row, 8).setValue(st).setFontWeight("bold")
      .setBackground(COR_STATUS[st][0]).setFontColor(COR_STATUS[st][1]).setHorizontalAlignment("center");
    p.getRange(row, 9).setFormula('=COUNTIF(' + I + 'S2:S,"' + st + '")')
      .setHorizontalAlignment("center").setFontWeight("bold").setFontColor(COR.navy);
    p.getRange(row, 11, 1, 2).merge();
    p.getRange(row, 11).setFormula('=SPARKLINE(I' + row + ',{"charttype","bar";"max",MAX($I$13:$I$16,1);"color1","' + COR_STATUS[st][2] + '"})');
  });
  p.getRange("H18").setValue("Total de inscrições").setFontWeight("bold").setFontColor(COR.navy);
  p.getRange("I18").setFormula("=SUM(I13:I16)").setHorizontalAlignment("center").setFontWeight("bold").setFontColor(COR.navy);
  p.getRange("H18:L18").setBorder(true, null, null, null, null, null, COR.divisor, SpreadsheetApp.BorderStyle.SOLID);
  for (var rr = 13; rr <= 18; rr++) p.setRowHeight(rr, 30);
  p.setRowHeight(19, 30);

  // Últimas inscrições (linhas 21–32)
  titulo("B20", "Últimas inscrições");
  var gid = inscricoes.getSheetId();
  p.getRange("H20:L20").merge();
  p.getRange("H20").setHorizontalAlignment("right")
    .setFormula('=HYPERLINK("#gid=' + gid + '","Ver todas as inscrições →")')
    .setFontColor(COR.azul).setFontWeight("bold");
  var colunas = [
    // [coluna do painel, coluna de origem, rótulo]
    [2, "C", "DISTRIBUIDORA"], [3, "I", "PESSOAS"], [5, "E", "TITULAR"], [6, "D", "CIDADE / UF"],
    [8, "B", "RECEBIDA EM"], [9, "S", "STATUS"], [11, "F", "WHATSAPP"], [12, "A", "PROTOCOLO"]
  ];
  colunas.forEach(function (c) {
    p.getRange(21, c[0]).setValue(c[2]).setFontSize(8).setFontWeight("bold").setFontColor(COR.cinza);
  });
  p.getRange("B21:L21").setBorder(null, null, true, null, null, null, COR.linha, SpreadsheetApp.BorderStyle.SOLID);
  var QTD = 10;
  for (var k = 1; k <= QTD; k++) {
    var row = 21 + k;
    colunas.forEach(function (c) {
      var f = 'IFERROR(INDEX(SORT(' + I + c[1] + '2:' + c[1] + ',' + I + 'B2:B,FALSE),' + k + '),"")';
      if (k === 1 && c[0] === 2) f = 'IF(COUNTA(' + I + 'A2:A)=0,"Ainda não há inscrições",' + f + ')';
      p.getRange(row, c[0]).setFormula('=' + f);
    });
    p.getRange(row, 2, 1, 11).setBackground(k % 2 === 0 ? COR.banda : "#FFFFFF")
      .setBorder(null, null, true, null, null, null, COR.linha, SpreadsheetApp.BorderStyle.SOLID);
    p.setRowHeight(row, 30);
  }
  var ult = p.getRange(22, 2, QTD, 11);
  p.getRange(22, 2, QTD, 1).setFontWeight("bold").setFontColor(COR.tinta);
  p.getRange(22, 3, QTD, 1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor(COR.navy);
  p.getRange(22, 6, QTD, 1).setFontColor(COR.cinza);
  p.getRange(22, 8, QTD, 1).setNumberFormat("dd/mm · HH:mm").setFontColor(COR.cinza);
  p.getRange(22, 9, QTD, 1).setHorizontalAlignment("center").setFontWeight("bold");
  p.getRange(22, 11, QTD, 1).setNumberFormat("@");
  p.getRange(22, 12, QTD, 1).setFontFamily(MONO).setFontColor(COR.azul).setFontWeight("bold");
  ult.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  var regras = STATUS.map(function (st) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(st)
      .setBackground(COR_STATUS[st][0]).setFontColor(COR_STATUS[st][1])
      .setRanges([p.getRange(22, 9, QTD, 1)]).build();
  });
  p.setConditionalFormatRules(regras);

  // Rodapé
  p.getRange("B34").setValue("Atualiza sozinho a cada inscrição do site. O protocolo (SX-…) é o mesmo do assunto do e-mail — use para conferir os dois.")
    .setFontSize(9).setFontColor(COR.cinza);
  p.getRange("B35").setValue("Para mudar o andamento de uma inscrição, troque a coluna Status na aba Inscrições.")
    .setFontSize(9).setFontColor(COR.cinza);

  p.setFrozenRows(0);
  return p;
}

/* ============================== WEBHOOK ================================== */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Rodar doPost direto pelo editor (sem dados) não cria linha vazia
    if (!data.submissionId && !data.company) {
      return json_({ status: "ignored", message: "sem dados de inscrição" });
    }

    var sheet = getAba_();
    var id = String(data.submissionId || "");

    // Evita duplicar a mesma inscrição
    if (id && jaExiste_(sheet, id)) {
      return json_({ status: "duplicate", id: id });
    }

    var leaders = data.leaders || [];
    var l1 = leaders[0] || {};
    var l2 = leaders[1] || {};

    var linha = [
      id,
      new Date(),
      data.company || "",
      data.cityUf || "",
      data.titularName || "",
      data.titularPhone || "",
      data.titularEmail || "",
      data.titularShirt || "",
      Number(data.totalAttendees || 1 + leaders.length),
      l1.name || "", l1.role || "", l1.phone || "", l1.shirt || "",
      l2.name || "", l2.role || "", l2.phone || "", l2.shirt || "",
      data.termsAgreed ? "Sim" : "Não",
      "Nova",
      ""
    ];

    sheet.appendRow(linha);

    if (AVISO_EMAIL) {
      MailApp.sendEmail({
        to: AVISO_EMAIL,
        subject: "Planilha: nova inscrição " + id + " — " + (data.company || ""),
        body: "Nova inscrição registrada na planilha.\n\n" +
          "ID: " + id + "\nDistribuidora: " + (data.company || "") +
          "\nTitular: " + (data.titularName || "") +
          "\nTotal de pessoas: " + (data.totalAttendees || "") +
          "\n\nPlanilha: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      });
    }

    return json_({ status: "success", id: id });
  } catch (err) {
    return json_({ status: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Abrir a URL /exec no navegador mostra se o webhook está no ar
function doGet() {
  return json_({ status: "online", service: "Sinapse Experience 2026 — inscrições", time: new Date().toISOString() });
}

// Rode esta função uma vez pelo editor para testar (cria uma linha de TESTE)
function testarInscricao() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        submissionId: "SX-TESTE1",
        company: "TESTE — pode apagar esta linha",
        cityUf: "São Paulo / SP",
        titularName: "Teste",
        titularPhone: "(11) 90000-0000",
        titularEmail: "teste@exemplo.com",
        titularShirt: "M",
        totalAttendees: 1,
        leaders: [],
        termsAgreed: true
      })
    }
  };
  Logger.log(doPost(fake).getContent());
}

/* ============================== AUXILIARES =============================== */

function getAba_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ABA);
  if (!sheet) {
    // a planilha nasce com uma aba só: usa ela e renomeia
    sheet = ss.getSheets()[0];
    sheet.setName(ABA);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CABECALHO);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, CABECALHO.length)
      .setBackground("#172259").setFontColor("#FFFFFF").setFontWeight("bold");
  }
  return sheet;
}

function jaExiste_(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return true;
  }
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
