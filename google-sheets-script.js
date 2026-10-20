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
 *    (para atualizar sem trocar a URL: Implantar > Gerenciar implantações >
 *     lápis > Versão: "Nova versão" > Implantar)
 * 4. Autorize o acesso com a conta Google dona da planilha.
 * 5. Copie a "URL do app da Web" (termina com /exec) e coloque em
 *    js/app.js > EVENT_CONFIG.googleSheetsWebhooks.
 *
 * O que este script faz:
 * - Grava cada inscrição como uma linha na aba "Inscrições".
 * - Escreve cada valor na coluna pelo NOME do cabeçalho. Por isso a ordem das
 *   colunas pode mudar na planilha sem quebrar a integração.
 * - Cria sozinho as colunas de crachá ("Crachá do titular", "Líder 1 — Crachá",
 *   "Líder 2 — Crachá") ao lado dos nomes, se ainda não existirem.
 * - Usa o "ID da inscrição" (ex.: SX-K3F9Q2) — o mesmo que vai no assunto do
 *   e-mail — para cruzar planilha × e-mail (dupla verificação).
 * - Ignora envios repetidos com o mesmo ID.
 * - (Opcional) manda um e-mail de aviso a cada inscrição: preencha AVISO_EMAIL.
 *
 * Ações de manutenção (POST com {"acao": "..."}; não criam inscrição):
 * - "configurar"   → só cria as colunas que faltarem.
 * - "limparTestes" → apaga linhas cujo ID começa com "SX-TESTE".
 * ============================================================================
 */

var ABA = "Inscrições";
var AVISO_EMAIL = ""; // opcional: ex. "alexia.rodrigues@sinapseimport.com" — deixe vazio para não enviar

// Ordem usada quando a planilha está vazia
var CABECALHO = [
  "ID da inscrição", "Data / hora", "Distribuidora", "Cidade / UF",
  "Titular (dono/sócio)", "Crachá do titular", "WhatsApp do titular", "E-mail", "Camisa do titular",
  "Total de pessoas",
  "Líder 1 — Nome", "Líder 1 — Crachá", "Líder 1 — Área", "Líder 1 — WhatsApp", "Líder 1 — Camisa",
  "Líder 2 — Nome", "Líder 2 — Crachá", "Líder 2 — Área", "Líder 2 — WhatsApp", "Líder 2 — Camisa",
  "Ciente da chegada 10/12 e do traje", "Status", "Observações"
];

// Colunas de crachá: [nome da coluna, coluna que ela deve seguir]
var COLUNAS_CRACHA = [
  ["Crachá do titular", "Titular (dono/sócio)"],
  ["Líder 1 — Crachá", "Líder 1 — Nome"],
  ["Líder 2 — Crachá", "Líder 2 — Nome"]
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
    garantirColunasCracha_(sheet);

    if (data.acao === "configurar") {
      return json_({ status: "ok", acao: "configurar", colunas: cabecalho_(sheet) });
    }
    if (data.acao === "limparTestes") {
      return json_({ status: "ok", acao: "limparTestes", apagadas: limparTestes_(sheet) });
    }

    // Rodar doPost direto pelo editor (sem dados) não cria linha vazia
    if (!data.submissionId && !data.company) {
      return json_({ status: "ignored", message: "sem dados de inscrição" });
    }

    var id = String(data.submissionId || "");

    // Evita duplicar a mesma inscrição
    if (id && jaExiste_(sheet, id)) {
      return json_({ status: "duplicate", id: id });
    }

    var leaders = data.leaders || [];
    var l1 = leaders[0] || {};
    var l2 = leaders[1] || {};

    var valores = {
      "ID da inscrição": id,
      "Data / hora": new Date(),
      "Distribuidora": data.company || "",
      "Cidade / UF": data.cityUf || "",
      "Titular (dono/sócio)": data.titularName || "",
      "Crachá do titular": data.titularBadge || "",
      "WhatsApp do titular": data.titularPhone || "",
      "E-mail": data.titularEmail || "",
      "Camisa do titular": data.titularShirt || "",
      "Total de pessoas": Number(data.totalAttendees || 1 + leaders.length),
      "Líder 1 — Nome": l1.name || "",
      "Líder 1 — Crachá": l1.badge || "",
      "Líder 1 — Área": l1.role || "",
      "Líder 1 — WhatsApp": l1.phone || "",
      "Líder 1 — Camisa": l1.shirt || "",
      "Líder 2 — Nome": l2.name || "",
      "Líder 2 — Crachá": l2.badge || "",
      "Líder 2 — Área": l2.role || "",
      "Líder 2 — WhatsApp": l2.phone || "",
      "Líder 2 — Camisa": l2.shirt || "",
      "Ciente da chegada 10/12 e do traje": data.termsAgreed ? "Sim" : "Não",
      "Status": "Nova",
      "Observações": ""
    };

    // Monta a linha na ordem dos cabeçalhos da planilha
    var cab = cabecalho_(sheet);
    Object.keys(valores).forEach(function (k) {
      if (cab.indexOf(k) === -1) {
        cab.push(k);
        sheet.getRange(1, cab.length).setValue(k);
      }
    });
    var linha = cab.map(function (h) { return valores.hasOwnProperty(h) ? valores[h] : ""; });

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

// Rode esta função pelo editor para testar (cria uma linha de TESTE)
function testarInscricao() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        submissionId: "SX-TESTE1",
        company: "TESTE — pode apagar esta linha",
        cityUf: "São Paulo / SP",
        titularName: "Teste da Silva",
        titularBadge: "Teste",
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

// Rode pelo editor para criar as colunas de crachá sem esperar uma inscrição
function configurarColunas() {
  garantirColunasCracha_(getAba_());
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

function cabecalho_(sheet) {
  var n = sheet.getLastColumn();
  if (n < 1) return [];
  var cab = sheet.getRange(1, 1, 1, n).getValues()[0].map(function (v) { return String(v).trim(); });
  while (cab.length && cab[cab.length - 1] === "") cab.pop();
  return cab;
}

// Insere cada coluna de crachá logo depois da coluna do nome correspondente
// (a coluna nova herda o visual da coluna do nome: cabeçalho, faixas e largura)
function garantirColunasCracha_(sheet) {
  COLUNAS_CRACHA.forEach(function (par) {
    var cab = cabecalho_(sheet);
    if (cab.indexOf(par[0]) !== -1) return;
    var depois = cab.indexOf(par[1]);
    if (depois === -1) return; // sem a coluna do nome: o doPost cria no fim
    var col = depois + 1; // posição (1-based) da coluna do nome
    sheet.insertColumnAfter(col);
    sheet.getRange(1, col + 1).setValue(par[0]);
    sheet.setColumnWidth(col + 1, sheet.getColumnWidth(col));
  });
}

function limparTestes_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  var apagadas = 0;
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).indexOf("SX-TESTE") === 0) {
      sheet.deleteRow(i + 2);
      apagadas++;
    }
  }
  return apagadas;
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
