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
 * 6. (Uma vez) Rode a função configurarPlanilha: formata o cabeçalho, cria a
 *    lista de Status e a aba "Resumo" com os totais e as camisas por tamanho.
 *
 * O que este script faz:
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

// Rode UMA VEZ pelo editor (Executar > configurarPlanilha)
function configurarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getAba_();
  var n = CABECALHO.length;

  // Cabeçalho
  sheet.getRange(1, 1, 1, n).setValues([CABECALHO])
    .setBackground("#172259").setFontColor("#FFFFFF").setFontWeight("bold")
    .setVerticalAlignment("middle").setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.setRowHeight(1, 40);
  var larguras = [110, 130, 220, 150, 220, 140, 230, 80, 80, 200, 140, 140, 80, 200, 140, 140, 80, 120, 120, 260];
  larguras.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  // Formatos
  sheet.getRange("B2:B").setNumberFormat("dd/mm/yyyy hh:mm");
  sheet.getRange("F2:F").setNumberFormat("@");
  sheet.getRange("L2:L").setNumberFormat("@");
  sheet.getRange("P2:P").setNumberFormat("@");

  // Lista de Status
  var regra = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Nova", "Confirmada", "Contato feito", "Cancelada"], true)
    .setAllowInvalid(false).build();
  sheet.getRange("S2:S").setDataValidation(regra);

  // Aba Resumo
  var r = ss.getSheetByName("Resumo") || ss.insertSheet("Resumo");
  r.clear();
  var I = "'" + ABA + "'!";
  var linhas = [
    ["Resumo das inscrições", ""],
    ["Distribuidoras inscritas", "=COUNTA(" + I + "A2:A)"],
    ["Total de pessoas", "=SUM(" + I + "I2:I)"],
    ["Titulares", "=COUNTA(" + I + "E2:E)"],
    ["Líderes", "=COUNTA(" + I + "J2:J)+COUNTA(" + I + "N2:N)"],
    ["Líderes comerciais", "=COUNTIF(" + I + "K2:K,\"Líder Comercial\")+COUNTIF(" + I + "O2:O,\"Líder Comercial\")"],
    ["Líderes financeiros", "=COUNTIF(" + I + "K2:K,\"Líder Financeiro\")+COUNTIF(" + I + "O2:O,\"Líder Financeiro\")"],
    ["", ""],
    ["Camisas (kit oficial)", ""]
  ];
  ["P", "M", "G", "GG", "XG"].forEach(function (t) {
    linhas.push(["Tamanho " + t, "=COUNTIF(" + I + "H2:H,\"" + t + "\")+COUNTIF(" + I + "M2:M,\"" + t + "\")+COUNTIF(" + I + "Q2:Q,\"" + t + "\")"]);
  });
  linhas.push(["", ""], ["Status", ""]);
  ["Nova", "Confirmada", "Contato feito", "Cancelada"].forEach(function (st) {
    linhas.push([st, "=COUNTIF(" + I + "S2:S,\"" + st + "\")"]);
  });
  r.getRange(1, 1, linhas.length, 2).setValues(linhas);
  r.setColumnWidth(1, 240); r.setColumnWidth(2, 110);
  r.getRange("A1").setFontSize(14).setFontWeight("bold").setFontColor("#172259");
  ["A9", "A17"].forEach(function (a) { r.getRange(a).setFontWeight("bold").setFontColor("#172259"); });
  r.getRange("B2:B").setFontWeight("bold");
  ss.setActiveSheet(sheet);
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
