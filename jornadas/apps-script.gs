/**
 * TRAMA — Receptor del formulario de la landing.
 * Pegá este código en Apps Script (ver SETUP.md), publicá como Web App
 * y copiá la URL en FORM_ENDPOINT dentro de script.js.
 */

// Pestaña donde se escriben las consultas.
var SHEET_NAME = 'Consultas';

// Orden de columnas (debe coincidir con la fila de encabezados de la hoja).
var HEADERS = [
  'Fecha', 'Nombre', 'Empresa', 'Cargo', 'WhatsApp', 'Email',
  'Actividad', 'Personas', 'Mes', 'Mensaje',
  'Variante (origen)', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'Página', 'Enviado en'
];

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Anti-spam: si vino el honeypot con algo, respondemos ok y no guardamos.
    if (p.empresa_web) {
      return json({ result: 'ok', skipped: 'honeypot' });
    }

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      p.nombre || '', p.empresa || '', p.cargo || '',
      p.whatsapp || '', p.email || '',
      p.actividad || '', p.personas || '', p.mes || '', p.mensaje || '',
      p.variante || '', p.utm_source || '', p.utm_medium || '',
      p.utm_campaign || '', p.utm_content || '', p.utm_term || '',
      p.pagina || '', p.enviado_en || ''
    ]);

    return json({ result: 'ok' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
