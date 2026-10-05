/* ============================================================
   TRAMA — Landing de captación
   ?v= preselecciona la actividad y guarda el origen; captura UTMs;
   las 3 propuestas y el formulario envían a Google Sheets (Apps Script).
   ============================================================ */

/* ►►► ÚNICO LUGAR A CONFIGURAR ◄◄◄
   Pegá la URL del Web App de Google Apps Script (ver SETUP.md).
   Vacío = el form valida y confirma, pero NO envía datos todavía. */
var FORM_ENDPOINT = "";

/* Actividad preseleccionada según el reel de origen (?v=) */
var ACTIVITY_BY_V = {
  cierre: "Cierre de año",
  plan: "Planificación 2027",
  trama: "Entrenamiento personalizado"
};

var params = new URLSearchParams(location.search);
var rawV = (params.get("v") || "").toLowerCase().trim();
var isKnown = ACTIVITY_BY_V.hasOwnProperty(rawV);

/* ---------- Helpers ---------- */
function setVal(id, value) { var el = document.getElementById(id); if (el) el.value = value; }
function selectActivity(value) {
  var radios = document.querySelectorAll('input[name="actividad"]');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].value === value) { radios[i].checked = true; return true; }
  }
  return false;
}
function goToForm() {
  var target = document.getElementById("form");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Origen + UTMs en campos ocultos ---------- */
setVal("f-variante", isKnown ? rawV : "directo");
setVal("f-utm-source", params.get("utm_source") || "");
setVal("f-utm-medium", params.get("utm_medium") || "");
setVal("f-utm-campaign", params.get("utm_campaign") || "");
setVal("f-utm-content", params.get("utm_content") || "");
setVal("f-utm-term", params.get("utm_term") || "");
setVal("f-pagina", location.href);

/* Preselección por variante (sin parámetro = sin preselección) */
if (isKnown) selectActivity(ACTIVITY_BY_V[rawV]);

/* ---------- Las 3 propuestas: elegir + ir al form ---------- */
document.querySelectorAll(".option").forEach(function (btn) {
  btn.addEventListener("click", function () {
    selectActivity(btn.getAttribute("data-activity"));
    showError("actividad", "");
    goToForm();
  });
});

/* ---------- Smooth scroll de anclas ---------- */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ---------- Validación y envío ---------- */
var form = document.getElementById("lead-form");
var submitBtn = document.getElementById("submit-btn");
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(key, msg) {
  var p = document.querySelector('.err[data-err-for="' + key + '"]');
  if (p) p.textContent = msg || "";
}
function clearErrors() {
  document.querySelectorAll(".err").forEach(function (p) { p.textContent = ""; });
  document.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
}

function validate() {
  clearErrors();
  var ok = true, firstInvalid = null;

  var nombre = document.getElementById("nombre");
  if (!nombre.value.trim()) {
    showError("nombre", "Decinos tu nombre y apellido.");
    nombre.classList.add("invalid"); ok = false; firstInvalid = firstInvalid || nombre;
  }

  var empresa = document.getElementById("empresa");
  if (!empresa.value.trim()) {
    showError("empresa", "Decinos de qué empresa u organización escribís.");
    empresa.classList.add("invalid"); ok = false; firstInvalid = firstInvalid || empresa;
  }

  var wa = document.getElementById("whatsapp");
  var email = document.getElementById("email");
  var waVal = wa.value.trim(), emailVal = email.value.trim();
  if (!waVal && !emailVal) {
    showError("contacto", "Dejanos un WhatsApp o un email para poder responderte.");
    wa.classList.add("invalid"); email.classList.add("invalid"); ok = false; firstInvalid = firstInvalid || wa;
  } else if (emailVal && !EMAIL_RE.test(emailVal)) {
    showError("contacto", "Revisá el email: parece incompleto.");
    email.classList.add("invalid"); ok = false; firstInvalid = firstInvalid || email;
  } else if (waVal && !emailVal && waVal.replace(/\D/g, "").length < 6) {
    showError("contacto", "Revisá el WhatsApp: faltan dígitos.");
    wa.classList.add("invalid"); ok = false; firstInvalid = firstInvalid || wa;
  }

  var actividad = form.querySelector('input[name="actividad"]:checked');
  if (!actividad) {
    showError("actividad", "Elegí una opción.");
    ok = false; firstInvalid = firstInvalid || document.querySelector('input[name="actividad"]');
  }

  if (!ok && firstInvalid) firstInvalid.focus();
  return ok;
}

function showSuccess() {
  form.hidden = true;
  var done = document.getElementById("form-done");
  done.hidden = false;
  done.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Honeypot: bot -> confirmamos sin enviar
  if (form.querySelector('input[name="empresa_web"]').value) { showSuccess(); return; }
  if (!validate()) return;

  var data = new URLSearchParams();
  new FormData(form).forEach(function (value, key) {
    if (key === "empresa_web") return;
    data.append(key, value);
  });
  data.append("enviado_en", new Date().toISOString());

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";

  if (FORM_ENDPOINT) {
    fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", body: data })
      .then(showSuccess)
      .catch(showSuccess); // respuesta opaca (no-cors): confirmamos igual
  } else {
    console.warn("[TRAMA] FORM_ENDPOINT vacío: el formulario no envía datos todavía. Ver SETUP.md.");
    showSuccess();
  }
});

["whatsapp", "email"].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("input", function () { showError("contacto", ""); el.classList.remove("invalid"); });
});
