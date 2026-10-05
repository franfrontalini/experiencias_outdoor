/**
 * TRAMA — Receptor del formulario de la landing /jornadas.
 * Guarda cada consulta en la Sheet y avisa por mail.
 */

var SHEET_NAME = 'Consultas';
var NOTIFY_EMAIL = 'franfrontalini@gmail.com';   // a quién avisar

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

    notify_(p);

    return json({ result: 'ok' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

/** Manda el mail de aviso. Si falla, no interrumpe el guardado. */
function notify_(p) {
  try {
    var actividad = p.actividad || 'Sin especificar';
    var contacto = [];
    if (p.whatsapp) contacto.push('WhatsApp: ' + p.whatsapp);
    if (p.email) contacto.push('Email: ' + p.email);

    var subject = 'Nueva consulta TRAMA — ' + actividad + ': ' + (p.nombre || 's/nombre');

    var body =
      'Nueva consulta desde la landing /jornadas\n' +
      '----------------------------------------\n\n' +
      'Nombre:    ' + (p.nombre || '-') + '\n' +
      'Empresa:   ' + (p.empresa || '-') + '\n' +
      'Cargo:     ' + (p.cargo || '-') + '\n' +
      (contacto.length ? contacto.join('\n') + '\n' : 'Contacto:  -\n') +
      'Actividad: ' + actividad + '\n' +
      'Personas:  ' + (p.personas || '-') + '\n' +
      'Mes:       ' + (p.mes || '-') + '\n' +
      'Mensaje:   ' + (p.mensaje || '-') + '\n\n' +
      'Origen (reel): ' + (p.variante || '-') +
        (p.utm_source ? '  ·  utm_source=' + p.utm_source : '') + '\n' +
      'Página: ' + (p.pagina || '-') + '\n' +
      'Fecha:  ' + new Date().toLocaleString('es-AR');

    var options = { name: 'TRAMA · /jornadas' };
    if (p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      options.replyTo = p.email;   // responder directo al interesado
    }

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body, options);
  } catch (err) {
    // Silencioso: un fallo de mail no debe tirar abajo el guardado.
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
