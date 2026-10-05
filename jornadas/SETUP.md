# TRAMA — Landing de captación

Una sola página estática (`index.html` + `styles.css` + `script.js`), sin framework.
Se sube a cualquier hosting (Netlify, Vercel, GitHub Pages, un FTP común).
Fotos reales de TRAMA en `img/`.

## Estructura (versión directa)

Header → Hero (título inclusivo + foto) → De qué se trata → Tres formas de vivirla
(Cierre de año / Planificación 2027 / Entrenamiento personalizado) → Cómo es la
jornada (5 pasos) → Formulario → Pie.

## Las 4 formas de entrar (`?v=`)

El contenido de la página es el mismo para todos; el parámetro solo **preselecciona la
actividad** en el formulario y **guarda el origen**:

- `?v=cierre` → preselecciona “Cierre de año”
- `?v=plan` → preselecciona “Planificación 2027”
- `?v=trama` → preselecciona “Entrenamiento personalizado”
- sin parámetro → sin preselección (origen `directo`)

También se puede elegir tocando una de las tres tarjetas de propuestas (preselecciona y
baja al formulario). Las **UTMs** (`utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `utm_term`) se capturan de la URL en campos ocultos. La **variante de
origen** y la **actividad elegida** se guardan por separado.

> Como el título y la imagen son los mismos para todas las variantes, el **preview al
> compartir por WhatsApp es único** para todos los enlaces (ya no hace falta generar
> archivos por variante).

---

## 1) Conectar el formulario a Google Sheets (Apps Script)

1. Creá una Google Sheet nueva (tu base de consultas).
2. **Extensiones → Apps Script**. Borrá todo y pegá el contenido de **`apps-script.gs`**. Guardá.
3. **Implementar → Nueva implementación → Aplicación web**.
   - *Ejecutar como*: **Yo**.
   - *Quién tiene acceso*: **Cualquier persona**.
   - Implementar y **autorizar** los permisos.
4. Copiá la **URL del Web App** (termina en `/exec`).
5. En `script.js`, pegala en la primera línea configurable:

   ```js
   var FORM_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```

6. Cada envío crea una fila en la pestaña **Consultas** (se crea sola con los encabezados).

> Mientras `FORM_ENDPOINT` esté vacío, el formulario valida y muestra el mensaje de
> éxito, pero **no** guarda nada. La página ya es publicable; lo conectás cuando quieras.

---

## 2) Qué falta completar

- **Plazo** del mensaje de éxito: hoy dice “24 horas hábiles” (marcado en amarillo).
- **Email** del pie: hoy `hola@tramaoutdoors.com.ar` (marcado “a confirmar”).
- **Logo**: va la reconstrucción en SVG (wordmark Schibsted Grotesk + camino con los
  tres mojones). Si tenés el archivo original, lo reemplazo.
- **Imagen para compartir** (`og:image`): hoy usa `img/equipo-banner.jpg`. Si querés una
  distinta (ideal 1200×630), la cambio.
- **Formatos** (media jornada / jornada completa) y la **evaluación 4,8**: quedaron
  fuera de esta versión directa. Si los querés de nuevo, los sumo.

## Fotos

Reales de TRAMA, en `img/` (optimizadas): `equipo-banner.jpg` (hero), `outdoor-desarrollo.jpg`
(Cierre), `exp-4.jpg` (Planificación), `outdoor-jornadas.jpg` (Entrenamiento). Para
cambiar alguna, reemplazá el archivo manteniendo el nombre, o pasame otras.

---

## Probar localmente

```bash
python3 -m http.server 5173
```

Abrir `http://localhost:5173/` (o con `?v=cierre`, `?v=plan`, `?v=trama`).
