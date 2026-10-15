/**
 * ============================================================================
 * SINAPSE EXPERIENCE 2026 (Imersão + Noite de Celebração)
 * Google Apps Script — Integração de RSVP com Google Sheets
 * ============================================================================
 * 
 * INSTRUÇÕES RÁPIDAS:
 * 1. Crie uma nova planilha no Google Sheets (ex: "RSVP - Sinapse Experience 2026").
 * 2. No menu superior, clique em: Extensões > Apps Script.
 * 3. Apague o código que estiver lá e cole todo este arquivo.
 * 4. Clique no ícone de disquete (Salvar) ou Ctrl+S.
 * 5. Clique no botão azul "Implantar" (Deploy) > "Nova implantação".
 * 6. Na engrenagem ao lado de "Selecione o tipo", escolha "App da Web" (Web App).
 * 7. Preencha as configurações:
 *    - Descrição: "RSVP Sinapse Experience"
 *    - Executar como: "Eu" (seu e-mail do Google)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone) -> [IMPORTANTE: para a landing page conseguir enviar os dados]
 * 8. Clique em "Implantar". Se pedir autorização, conceda acesso à sua conta.
 * 9. Copie a "URL do app da Web" gerada (termina com /exec).
 * 10. Cole essa URL no arquivo js/app.js na variável:
 *     EVENT_CONFIG.googleSheetsWebhookUrl = "SUA_URL_AQUI";
 * ============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Se a planilha estiver vazia, cria o cabeçalho oficial automaticamente
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Data / Hora",
        "Distribuidora (Empresa)",
        "Cidade / UF",
        "Titular (Dono/Sócio)",
        "WhatsApp Titular",
        "E-mail Corporativo",
        "Tamanho Camisa Titular",
        "Total de Vagas",
        "Qtd Líderes",
        "Líder 01 (Nome | Cargo | WhatsApp | Camisa)",
        "Líder 02 (Nome | Cargo | WhatsApp | Camisa)",
        "Líder 03 (não usado desde out/2026)",
        "Líder 04 (não usado desde out/2026)",
        "Ciente da chegada 10/12 e traje"
      ];
      
      sheet.appendRow(headers);
      
      // Estilização do cabeçalho
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0D1734"); // Fundo Azul Marinho Sinapse
      headerRange.setFontColor("#FFFFFF");  // Texto Branco
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Arial");
      sheet.setFrozenRows(1);
    }
    
    // Processa os dados recebidos da Landing Page
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    var timestamp = data.timestampFormatted || new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    var company = data.company || "";
    var cityUf = data.cityUf || "";
    var titularName = data.titularName || "";
    var titularPhone = data.titularPhone || "";
    var titularEmail = data.titularEmail || "";
    var titularShirt = data.titularShirt || "";
    var totalAttendees = data.totalAttendees || (1 + (data.leaders ? data.leaders.length : 0));
    var leadersCount = data.leadersCount || (data.leaders ? data.leaders.length : 0);
    
    // Formata os líderes para colunas individuais
    var l1 = "—", l2 = "—", l3 = "—", l4 = "—";
    if (data.leaders && data.leaders.length > 0) {
      if (data.leaders[0]) l1 = data.leaders[0].name + " | " + data.leaders[0].role + " | " + data.leaders[0].phone + " | Tam: " + data.leaders[0].shirt;
      if (data.leaders[1]) l2 = data.leaders[1].name + " | " + data.leaders[1].role + " | " + data.leaders[1].phone + " | Tam: " + data.leaders[1].shirt;
      if (data.leaders[2]) l3 = data.leaders[2].name + " | " + data.leaders[2].role + " | " + data.leaders[2].phone + " | Tam: " + data.leaders[2].shirt;
      if (data.leaders[3]) l4 = data.leaders[3].name + " | " + data.leaders[3].role + " | " + data.leaders[3].phone + " | Tam: " + data.leaders[3].shirt;
    } else if (data.leader1) {
      l1 = data.leader1;
      l2 = data.leader2 || "—";
      l3 = data.leader3 || "—";
      l4 = data.leader4 || "—";
    }
    
    var termsAgreed = data.termsAgreed ? "Sim (ciente 10/12 e traje passeio completo)" : "Sim";
    
    // Adiciona a nova linha de confirmação
    sheet.appendRow([
      timestamp,
      company,
      cityUf,
      titularName,
      titularPhone,
      titularEmail,
      titularShirt,
      totalAttendees,
      leadersCount,
      l1,
      l2,
      l3,
      l4,
      termsAgreed
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Inscrição confirmada e registrada com sucesso!",
        company: company,
        totalAttendees: totalAttendees
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "error", 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Endpoint GET apenas para testar no navegador se o webhook está ativo
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "online", 
      service: "Sinapse Experience RSVP Webhook",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
