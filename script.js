/**
 * script.js — Interactividad con Bootstrap 5 + Conexión API PHP
 * IA en Educación & Investigación
 *
 * Usa Bootstrap ScrollSpy, Collapse (menú móvil) y eventos nativos.
 * Funciones propias: podcast toggle, conferencias feedback, fetch API.
 */

/* ── BASE URL DE LA API ──────────────────────────────────────── */
const API_URL = '';  // Los PHP están en la misma carpeta que el proyecto

/* ══════════════════════════════════════════════════════════════
   CARGA DE DATOS DESDE LA BASE DE DATOS
══════════════════════════════════════════════════════════════ */

/* ── CARGAR DIVULGACIÓN ──────────────────────────────────────── */
async function cargarDivulgacion() {
  const lista = document.querySelector('#divulgacion .list-group');
  if (!lista) return;

  // Íconos según tipo
  const iconos = {
    'Libro'      : { emoji: '📖', clase: 'icon-purple' },
    'Infografía' : { emoji: '📊', clase: 'icon-green'  },
    'Reporte'    : { emoji: '📑', clase: 'icon-green'  },
    'Artículo'   : { emoji: '📰', clase: 'icon-blue'   }
  };

  // Texto del enlace según tipo
  const textoEnlace = {
    'Libro'      : '→ Leer libro',
    'Infografía' : '→ Ver infografía',
    'Reporte'    : '→ Leer reporte',
    'Artículo'   : '→ Leer artículo'
  };

  try {
    const res  = await fetch(`${API_URL}divulgacion.php`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = '<p class="text-muted text-center">No hay publicaciones disponibles.</p>';
      return;
    }

    lista.innerHTML = data.map(pub => {
      const tipo   = pub.Tipo || 'Artículo';
      const icono  = iconos[tipo]      || { emoji: '📄', clase: 'icon-blue' };
      const enlace = textoEnlace[tipo] || '→ Ver publicación';
      const autor  = pub.Autores       || '';

      return `
        <a href="${pub.url}" target="_blank" rel="noopener noreferrer"
           class="list-group-item list-group-item-action shadow-sm mb-2">
          <div class="d-flex gap-3">
            <div class="divul-icon ${icono.clase} flex-shrink-0">${icono.emoji}</div>
            <div class="w-100">
              <small class="text-muted d-block mb-1">${tipo}</small>
              <h6 class="fw-medium mb-1">${pub.Titulo}</h6>
              <p class="text-muted small mb-2">${autor}</p>
              <span class="ia-link-tag">${enlace}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

  } catch (err) {
    console.error('[Divulgación] Error al cargar:', err);
    lista.innerHTML = '<p class="text-danger text-center">Error al cargar publicaciones.</p>';
  }
}

/* ── CARGAR PODCAST ──────────────────────────────────────────── */
async function cargarPodcast() {
  const lista = document.querySelector('#podcast .list-group');
  if (!lista) return;

  try {
    const res      = await fetch(`${API_URL}podcast.php`);
    const episodios = await res.json();

    if (!Array.isArray(episodios) || episodios.length === 0) {
      lista.innerHTML = '<p class="text-muted text-center">No hay episodios disponibles.</p>';
      return;
    }

    lista.innerHTML = episodios.map(ep => {
      // Formatear fecha
      const fecha = ep.fecha_publicacion
        ? new Date(ep.fecha_publicacion).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric'
          })
        : '';

      return `
        <a href="${ep.URL}" target="_blank" rel="noopener noreferrer"
           class="list-group-item shadow-sm mb-2"
           style="text-decoration: none; color: inherit;">
          <div class="d-flex gap-3 align-items-start">
            <div class="flex-shrink-0">
              <button type="button"
                class="btn btn-sm btn-primary rounded-circle"
                style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                <i class="bi bi-play-fill"></i>
              </button>
            </div>
            <div class="flex-grow-1 min-w-0">
              <small class="text-muted d-block mb-1">
                Ep. ${ep.ID_podcast} · ${fecha}
              </small>
              <h6 class="fw-medium mb-1">${ep.Titulo}</h6>
              <p class="text-muted small mb-0">
                ${ep.Duracion_min} min · con ${ep.Invitado}
              </p>
            </div>
          </div>
        </a>
      `;
    }).join('');

  } catch (err) {
    console.error('[Podcast] Error al cargar:', err);
    lista.innerHTML = '<p class="text-danger text-center">Error al cargar episodios.</p>';
  }
}

/* ── CARGAR CURSOS ───────────────────────────────────────────── */
async function cargarCursos() {
  const contenedor = document.querySelector('#cursos .row');
  if (!contenedor) return;

  // Estilos de banner según índice
  const banners  = ['banner-purple', 'banner-blue', 'banner-green', 'banner-mixed'];
  const dots     = ['dot-green', 'dot-orange', 'dot-blue', 'dot-green'];

  // IDs para la página de detalle (se mantiene compatibilidad con detalle-curso.html)
  const slugMap = {
    'Introducción a la IA para docentes'     : 'introduccion-ia-docentes',
    'Machine Learning en ciencias'           : 'machine-learning-ciencias',
    'Procesamiento de lenguaje natural'      : 'procesamiento-lenguaje-natural',
    'Ética e IA responsable en educación'    : 'etica-ia-educacion'
  };

  try {
    const res    = await fetch(`${API_URL}cursos.php`);
    const cursos = await res.json();

    if (!Array.isArray(cursos) || cursos.length === 0) {
      contenedor.innerHTML = '<p class="text-muted text-center">No hay cursos disponibles.</p>';
      return;
    }

    contenedor.innerHTML = cursos.map((curso, i) => {
      const banner   = banners[i % banners.length];
      const dot      = dots[i % dots.length];
      const precio   = parseFloat(curso.precio) > 0 ? `$${curso.precio}` : 'Gratuito';
      const cursoId  = slugMap[curso.titulo] || `curso-${curso.id_curso}`;
      const precioNum = parseFloat(curso.precio) || 0;

      return `
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card ia-card h-100 border-0"
               data-curso-id="${cursoId}" style="cursor: pointer;">
            <div class="curso-banner ${banner}">
              <span class="curso-price">${precio}</span>
              <div class="curso-dot ${dot}"></div>
              <span class="curso-chip">${curso.nivel}</span>
            </div>
            <div class="card-body">
              <h6 class="card-title fw-medium">${curso.titulo}</h6>
              <p class="card-text text-muted small">${curso.descripcion}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="badge ia-level-badge">${curso.nivel}</span>
                <small class="text-muted">${curso.duracion_hrs} hrs</small>
              </div>
              <button type="button"
                class="btn btn-primary w-100 mt-4 btn-inscribirse"
                data-course="${curso.titulo}"
                data-price="${precioNum}">
                Inscribirse
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reasignar eventos a los nuevos elementos
    setupInscripcionEventos();

  } catch (err) {
    console.error('[Cursos] Error al cargar:', err);
    contenedor.innerHTML = '<p class="text-danger text-center">Error al cargar cursos.</p>';
  }
}

/* ── CARGAR CONFERENCIAS ─────────────────────────────────────── */
async function cargarConferencias() {
  const contenedor = document.querySelector('#conferencias .row');
  if (!contenedor) return;

  try {
    const res          = await fetch(`${API_URL}conferencias.php`);
    const conferencias = await res.json();

    if (!Array.isArray(conferencias) || conferencias.length === 0) {
      contenedor.innerHTML = '<p class="text-muted text-center">No hay conferencias disponibles.</p>';
      return;
    }

    contenedor.innerHTML = conferencias.map(conf => {
      const fecha    = new Date(conf.fecha_evento);
      const dia      = fecha.getDate().toString().padStart(2, '0');
      const mes      = fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      const precio   = parseFloat(conf.precio) > 0 ? `$${conf.precio}` : 'Gratuita';
      const precioNum = parseFloat(conf.precio) || 0;
      const ciudad   = conf.ciudad ? `<span class="badge ia-conf-tag">${conf.ciudad}</span>` : '';

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card ia-card overflow-hidden h-100 border-0">
            <div class="conf-head d-flex justify-content-between align-items-start p-3">
              <div class="conf-date-box text-center">
                <div class="conf-day">${dia}</div>
                <div class="conf-month">${mes}</div>
              </div>
              <span class="conf-mode-badge">${conf.modalidad}</span>
            </div>
            <div class="card-body">
              <h6 class="fw-medium">${conf.titulo}</h6>
              <p class="text-muted small">${conf.ponente} · ${conf.institucion}</p>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge ia-conf-tag">${conf.modalidad}</span>
                ${ciudad}
                <span class="badge ia-conf-tag">${conf.duracion_dias} día(s)</span>
                <span class="badge ia-conf-tag">${precio}</span>
              </div>
            </div>
            <button class="btn btn-conf-register btn-inscribirse w-100 rounded-0"
              data-course="${conf.titulo}"
              data-price="${precioNum}">
              Inscribirse →
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Reasignar eventos a los nuevos elementos
    setupInscripcionEventos();

  } catch (err) {
    console.error('[Conferencias] Error al cargar:', err);
    contenedor.innerHTML = '<p class="text-danger text-center">Error al cargar conferencias.</p>';
  }
}

/* ── ENVIAR CONTACTO A LA BD ─────────────────────────────────── */
async function enviarContacto(nombre, email, mensaje) {
  try {
    const res  = await fetch(`${API_URL}contacto.php`, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ nombre, email, mensaje })
    });

    return await res.json();

  } catch (err) {
    console.error('[Contacto] Error al enviar:', err);
    return { error: 'No se pudo conectar con el servidor' };
  }
}

/* ══════════════════════════════════════════════════════════════
   INTERACTIVIDAD — igual que antes
══════════════════════════════════════════════════════════════ */

/* ── 1. SCROLL SUAVE PARA ENLACES INTERNOS ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Cerrar menú móvil si está abierto
    const navCollapse = document.getElementById('navMenu');
    if (navCollapse && navCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
      if (bsCollapse) bsCollapse.hide();
    }
  });
});

/* ── 2. SCROLL SPY MANUAL (Intersection Observer) ───────────── */
(function initScrollSpy() {
  const sectionIds = ['cursos', 'divulgacion', 'podcast', 'conferencias'];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      document.querySelectorAll('.ia-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

/* ── 3. INSCRIPCIÓN — SETUP DE EVENTOS ──────────────────────── */
function setupInscripcionEventos() {
  // Botones de inscripción
  document.querySelectorAll('.btn-inscribirse').forEach(btn => {
    // Evitar duplicar listeners
    if (btn.dataset.listenerAsignado) return;
    btn.dataset.listenerAsignado = 'true';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const nombreCurso  = this.getAttribute('data-course');
      const precioActual = parseInt(this.getAttribute('data-price')) || 0;
      window.abrirFormularioInscripcion(nombreCurso, precioActual);
    });
  });

  // Tarjetas de cursos → abrir detalle
  document.querySelectorAll('[data-curso-id]').forEach(card => {
    if (card.dataset.listenerAsignado) return;
    card.dataset.listenerAsignado = 'true';

    card.addEventListener('click', function (e) {
      if (e.target.closest('.btn-inscribirse')) return;
      const cursoId = this.getAttribute('data-curso-id');
      window.open('detalle-curso.html?id=' + cursoId, '_blank');
    });
  });
}

/* ── 4. FORMULARIO DE INSCRIPCIÓN (ventana emergente) ────────── */
window.abrirFormularioInscripcion = function(nombreCurso, precio) {
  const html    = generarHTMLFormulario(nombreCurso, precio);
  const ventana = window.open('', 'inscripcion_' + Date.now(), 'width=600,height=700,scrollbars=yes');

  if (!ventana) {
    alert('Por favor permite las ventanas emergentes para continuar');
    return;
  }

  ventana.document.write(html);
  ventana.document.close();
};

function generarHTMLFormulario(nombreCurso, precio) {
  const tienePago  = precio > 0;
  const pasoTotal  = tienePago ? 2 : 1;
  const precioTexto = tienePago ? 'Precio: $' + precio : 'Evento Gratuito';

  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Inscripción - ' + nombreCurso + '</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"><style>body { background: linear-gradient(135deg, #2d1b69 0%, #0f2d6b 100%); padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; } .container { max-width: 500px; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); } .header { text-align: center; margin-bottom: 30px; } .header h2 { color: #2d1b69; font-weight: 600; margin-bottom: 5px; } .curso-nombre { color: #666; font-size: 0.9rem; margin-bottom: 20px; } .paso-titulo { font-size: 0.85rem; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; } .form-label { font-weight: 500; color: #333; font-size: 0.9rem; margin-bottom: 8px; } .form-control, .form-select { border-radius: 6px; border: 1px solid #ddd; } .form-control:focus, .form-select:focus { border-color: #2d1b69; box-shadow: 0 0 0 0.2rem rgba(45, 27, 105, 0.15); } .precio-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #34d399; } .precio-info strong { color: #2d1b69; } .botones { display: flex; gap: 10px; margin-top: 25px; } .btn-cancelar, .btn-siguiente { flex: 1; } .confirmacion { text-align: center; padding: 40px 20px; } .confirmacion i { font-size: 4rem; color: #34d399; margin-bottom: 20px; } .confirmacion h3 { color: #2d1b69; margin-bottom: 10px; } .confirmacion p { color: #666; margin-bottom: 0; }</style></head><body><div class="container"><div class="header"><h2>Inscripción</h2><div class="curso-nombre">' + nombreCurso + '</div></div><div id="paso1" class="paso"><div class="paso-titulo">Paso 1 de ' + pasoTotal + ': Información Personal</div><form id="form-paso1"><div class="mb-3"><label for="nombre" class="form-label">Nombre Completo *</label><input type="text" class="form-control" id="nombre" required></div><div class="mb-3"><label for="email" class="form-label">Email *</label><input type="email" class="form-control" id="email" required></div><div class="mb-3"><label for="telefono" class="form-label">Teléfono *</label><input type="tel" class="form-control" id="telefono" required></div><div class="mb-3"><label for="edad" class="form-label">Edad *</label><input type="number" class="form-control" id="edad" required></div><div class="mb-3"><label for="perfil" class="form-label">Perfil *</label><select class="form-select" id="perfil" required><option value="">Selecciona tu perfil</option><option value="docente">Docente</option><option value="estudiante">Estudiante</option><option value="investigador">Investigador</option><option value="otro">Otro</option></select></div><div class="precio-info"><strong>' + precioTexto + '</strong></div></form></div><div id="paso2" class="paso" style="display:none;"><div class="paso-titulo">Paso 2 de 2: Método de Pago</div><form id="form-paso2"><div class="mb-3"><label for="tipo-tarjeta" class="form-label">Tipo de Tarjeta *</label><select class="form-select" id="tipo-tarjeta" required><option value="">Selecciona el tipo</option><option value="debito">Débito</option><option value="credito">Crédito</option></select></div><div class="mb-3"><label for="num-tarjeta" class="form-label">Número de Tarjeta *</label><input type="text" class="form-control" id="num-tarjeta" placeholder="0000 0000 0000 0000" required></div><div class="row"><div class="col-6 mb-3"><label for="fecha" class="form-label">MM/AA *</label><input type="text" class="form-control" id="fecha" placeholder="MM/AA" required></div><div class="col-6 mb-3"><label for="cvv" class="form-label">CVV *</label><input type="text" class="form-control" id="cvv" placeholder="000" required></div></div><div class="mb-3"><label for="nombre-tarjeta" class="form-label">Nombre (en tarjeta) *</label><input type="text" class="form-control" id="nombre-tarjeta" required></div></form></div><div id="confirmacion" style="display:none;"><div class="confirmacion"><i class="bi bi-check-circle"></i><h3>¡Inscripción Realizada!</h3><p>Te has inscrito exitosamente.<br>Revisa tu email para más detalles.</p></div></div><div class="botones"><button type="button" class="btn btn-secondary btn-cancelar" id="btn-cancelar">Cancelar</button><button type="button" class="btn btn-primary btn-siguiente" id="btn-siguiente">Siguiente</button></div></div><script>let pasoActual = 1; const tienePago = ' + (tienePago ? 'true' : 'false') + '; const btnSiguiente = document.getElementById("btn-siguiente"); const btnCancelar = document.getElementById("btn-cancelar"); btnCancelar.addEventListener("click", () => window.close()); btnSiguiente.addEventListener("click", () => { if (pasoActual === 1) { if (!validarPaso1()) return; if (tienePago) { mostrarPaso(2); } else { mostrarConfirmacion(); } } else if (pasoActual === 2) { if (!validarPaso2()) return; mostrarConfirmacion(); } else if (pasoActual === 3) { window.close(); } }); function mostrarPaso(paso) { pasoActual = paso; document.getElementById("paso1").style.display = paso === 1 ? "block" : "none"; document.getElementById("paso2").style.display = paso === 2 ? "block" : "none"; document.getElementById("confirmacion").style.display = "none"; btnCancelar.style.display = paso === 3 ? "none" : "inline-block"; btnSiguiente.textContent = paso === 2 ? "Finalizar" : "Siguiente"; } function mostrarConfirmacion() { pasoActual = 3; document.getElementById("paso1").style.display = "none"; document.getElementById("paso2").style.display = "none"; document.getElementById("confirmacion").style.display = "block"; btnSiguiente.textContent = "Cerrar"; btnCancelar.style.display = "none"; } function validarPaso1() { const nombre = document.getElementById("nombre").value.trim(); const email = document.getElementById("email").value.trim(); const telefono = document.getElementById("telefono").value.trim(); const edad = document.getElementById("edad").value.trim(); const perfil = document.getElementById("perfil").value; if (!nombre || !email || !telefono || !edad || !perfil) { alert("Por favor completa todos los campos"); return false; } if (!/^\\d+$/.test(edad)) { alert("La edad debe ser un número válido"); return false; } return true; } function validarPaso2() { const tipo = document.getElementById("tipo-tarjeta").value; const num = document.getElementById("num-tarjeta").value.replace(/\\s/g, ""); const fecha = document.getElementById("fecha").value; const cvv = document.getElementById("cvv").value; const nombre = document.getElementById("nombre-tarjeta").value.trim(); if (!tipo || !num || !fecha || !cvv || !nombre) { alert("Por favor completa todos los datos de pago"); return false; } if (!/^\\d{16}$/.test(num)) { alert("El número de tarjeta debe tener 16 dígitos"); return false; } if (!/^\\d{2}\\/\\d{2}$/.test(fecha)) { alert("La fecha debe estar en formato MM/AA"); return false; } if (!/^\\d{3}$/.test(cvv)) { alert("El CVV debe tener 3 dígitos"); return false; } return true; }</script></body></html>';
}

/* ── 5. MODAL DE CONTACTO → envía a la BD ────────────────────── */
(function initContacto() {
  const form = document.querySelector('#contactModal form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre  = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const mensaje = form.querySelector('#message').value.trim();
    const btnEnviar = form.querySelector('button[type="submit"]');

    btnEnviar.disabled    = true;
    btnEnviar.textContent = 'Enviando...';

    const resultado = await enviarContacto(nombre, email, mensaje);

    if (resultado.success) {
      form.reset();
      btnEnviar.textContent = '¡Enviado!';
      btnEnviar.classList.replace('btn-primary', 'btn-success');

      setTimeout(() => {
        // Cerrar modal y restaurar botón
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (modal) modal.hide();
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar';
        btnEnviar.classList.replace('btn-success', 'btn-primary');
      }, 2000);

    } else {
      alert('Error: ' + (resultado.error || 'No se pudo enviar el mensaje'));
      btnEnviar.disabled    = false;
      btnEnviar.textContent = 'Enviar';
    }
  });
})();

/* ── 6. NAVBAR — RESALTAR ENLACE AL HACER CLIC ──────────────── */
document.querySelectorAll('.ia-nav-link').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.ia-nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── 7. INICIALIZAR TODO AL CARGAR LA PÁGINA ─────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cargarDivulgacion();
  cargarPodcast();
  cargarCursos();
  cargarConferencias();
  setupInscripcionEventos();
});

console.log('[IA Educación · Bootstrap 5 + API PHP] Scripts cargados correctamente.');






/**
 * script.js — Interactividad con Bootstrap 5
 * IA en Educación & Investigación
 *
 * Usa Bootstrap ScrollSpy, Collapse (menú móvil) y eventos nativos.
 * Funciones propias: podcast toggle, conferencias feedback.
 */

/* ── 1. SCROLL SUAVE PARA ENLACES INTERNOS ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Cerrar menú móvil si está abierto (Bootstrap Collapse API)
    const navCollapse = document.getElementById('navMenu');
    if (navCollapse && navCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
      if (bsCollapse) bsCollapse.hide();
    }
  });
});

/* ── 2. SCROLL SPY MANUAL (Intersection Observer) ───────────── */
// Marca el nav-link activo según la sección visible en pantalla
(function initScrollSpy() {
  const sectionIds = ['cursos', 'divulgacion', 'podcast', 'conferencias'];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      document.querySelectorAll('.ia-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

/* ── 3. PODCAST — TOGGLE PLAY / PAUSA ───────────────────────── */
(function initPodcast() {
  document.querySelectorAll('.pod-play-btn').forEach(btn => {

    btn.addEventListener('click', function () {
      const isPlaying = this.dataset.playing === 'true';
      const icon = this.querySelector('i');
      const card = this.closest('.pod-card');

      if (isPlaying) {
        // → Pausar
        this.dataset.playing = 'false';
        this.classList.remove('playing');
        icon.className = 'bi bi-play-fill';
        setWaveActive(card, false);
      } else {
        // Pausar cualquier otro episodio activo
        document.querySelectorAll('.pod-play-btn[data-playing="true"]').forEach(other => {
          other.dataset.playing = 'false';
          other.classList.remove('playing');
          other.querySelector('i').className = 'bi bi-play-fill';
          setWaveActive(other.closest('.pod-card'), false);
        });

        // → Reproducir este
        this.dataset.playing = 'true';
        this.classList.add('playing');
        icon.className = 'bi bi-pause-fill';
        setWaveActive(card, true);
      }
    });

  });

  /**
   * Activa o desactiva la animación de las barras de onda.
   * @param {HTMLElement} card
   * @param {boolean}     active
   */
  function setWaveActive(card, active) {
    if (!card) return;
    card.querySelectorAll('.pod-bar').forEach(bar => {
      if (active) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
  }
})();

/* ── 4. PODCAST — REPRODUCIR AUDIO LOCAL DESDE BOTÓN ─────────── */
(function initAudioPodcast() {
  let activeAudio = null;
  let activeBtn = null;

  document.querySelectorAll('.pod-audio-btn').forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const src = this.dataset.audioSrc;
      if (!src) return;

      if (!this._audioPlayer) {
        const audio = new Audio(src);
        audio.preload = 'none';

        audio.addEventListener('ended', () => resetAudioButton(this));
        this._audioPlayer = audio;
      }

      if (activeAudio && activeAudio !== this._audioPlayer) {
        activeAudio.pause();
        if (activeBtn) resetAudioButton(activeBtn, false);
      }

      if (this._audioPlayer.paused) {
        this._audioPlayer.play().catch(() => {});
        activeAudio = this._audioPlayer;
        activeBtn = this;
        this.querySelector('i').className = 'bi bi-pause-fill';
      } else {
        this._audioPlayer.pause();
        resetAudioButton(this);
      }
    });
  });

  function resetAudioButton(button, resetTime = true) {
    if (!button) return;
    const icon = button.querySelector('i');
    if (icon) icon.className = 'bi bi-play-fill';
    if (button._audioPlayer && resetTime) button._audioPlayer.currentTime = 0;
    if (activeBtn === button) activeBtn = null;
    if (activeAudio === button._audioPlayer) activeAudio = null;
  }
})();

/* ── 5. INSCRIPCIÓN Y TARJETAS DE CURSOS ──────────────────────── */
(function initInscripcion() {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInscripcion);
  } else {
    setupInscripcion();
  }

  function setupInscripcion() {
    // Botones de inscripción (abre ventana emergente)
    document.querySelectorAll('.btn-inscribirse').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const nombreCurso = this.getAttribute('data-course');
        const precioActual = parseInt(this.getAttribute('data-price')) || 0;
        window.abrirFormularioInscripcion(nombreCurso, precioActual);
      });
    });

    // Tarjetas de cursos (abre pestaña con detalles)
    document.querySelectorAll('[data-curso-id]').forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-inscribirse')) return;
        const cursoId = this.getAttribute('data-curso-id');
        window.open('detalle-curso.html?id=' + cursoId, '_blank');
      });
    });
  }

  window.abrirFormularioInscripcion = function(nombreCurso, precio) {
    const html = generarHTMLFormulario(nombreCurso, precio);
    const ventana = window.open('', 'inscripcion_' + Date.now(), 'width=600,height=700,scrollbars=yes');

    if (!ventana) {
      alert('Por favor permite las ventanas emergentes para continuar');
      return;
    }

    ventana.document.write(html);
    ventana.document.close();
  };

  function generarHTMLFormulario(nombreCurso, precio) {
    const tienePago = precio > 0;
    const pasoTotal = tienePago ? 2 : 1;
    const precioTexto = tienePago ? 'Precio: $' + precio : 'Evento Gratuito';

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Inscripción - ' + nombreCurso + '</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"><style>body { background: linear-gradient(135deg, #2d1b69 0%, #0f2d6b 100%); padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; } .container { max-width: 500px; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); } .header { text-align: center; margin-bottom: 30px; } .header h2 { color: #2d1b69; font-weight: 600; margin-bottom: 5px; } .curso-nombre { color: #666; font-size: 0.9rem; margin-bottom: 20px; } .paso-titulo { font-size: 0.85rem; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; } .form-label { font-weight: 500; color: #333; font-size: 0.9rem; margin-bottom: 8px; } .form-control, .form-select { border-radius: 6px; border: 1px solid #ddd; } .form-control:focus, .form-select:focus { border-color: #2d1b69; box-shadow: 0 0 0 0.2rem rgba(45, 27, 105, 0.15); } .precio-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #34d399; } .precio-info strong { color: #2d1b69; } .botones { display: flex; gap: 10px; margin-top: 25px; } .btn-cancelar, .btn-siguiente { flex: 1; } .confirmacion { text-align: center; padding: 40px 20px; } .confirmacion i { font-size: 4rem; color: #34d399; margin-bottom: 20px; } .confirmacion h3 { color: #2d1b69; margin-bottom: 10px; } .confirmacion p { color: #666; margin-bottom: 0; }</style></head><body><div class="container"><div class="header"><h2>Inscripción</h2><div class="curso-nombre">' + nombreCurso + '</div></div><div id="paso1" class="paso"><div class="paso-titulo">Paso 1 de ' + pasoTotal + ': Información Personal</div><form id="form-paso1"><div class="mb-3"><label for="nombre" class="form-label">Nombre Completo *</label><input type="text" class="form-control" id="nombre" required></div><div class="mb-3"><label for="email" class="form-label">Email *</label><input type="email" class="form-control" id="email" required></div><div class="mb-3"><label for="telefono" class="form-label">Teléfono *</label><input type="tel" class="form-control" id="telefono" required></div><div class="mb-3"><label for="edad" class="form-label">Edad *</label><input type="number" class="form-control" id="edad" required></div><div class="mb-3"><label for="perfil" class="form-label">Perfil *</label><select class="form-select" id="perfil" required><option value="">Selecciona tu perfil</option><option value="docente">Docente</option><option value="estudiante">Estudiante</option><option value="investigador">Investigador</option><option value="otro">Otro</option></select></div><div class="precio-info"><strong>' + precioTexto + '</strong></div></form></div><div id="paso2" class="paso" style="display:none;"><div class="paso-titulo">Paso 2 de 2: Método de Pago</div><form id="form-paso2"><div class="mb-3"><label for="tipo-tarjeta" class="form-label">Tipo de Tarjeta *</label><select class="form-select" id="tipo-tarjeta" required><option value="">Selecciona el tipo</option><option value="debito">Débito</option><option value="credito">Crédito</option></select></div><div class="mb-3"><label for="num-tarjeta" class="form-label">Número de Tarjeta *</label><input type="text" class="form-control" id="num-tarjeta" placeholder="0000 0000 0000 0000" required></div><div class="row"><div class="col-6 mb-3"><label for="fecha" class="form-label">MM/AA *</label><input type="text" class="form-control" id="fecha" placeholder="MM/AA" required></div><div class="col-6 mb-3"><label for="cvv" class="form-label">CVV *</label><input type="text" class="form-control" id="cvv" placeholder="000" required></div></div><div class="mb-3"><label for="nombre-tarjeta" class="form-label">Nombre (en tarjeta) *</label><input type="text" class="form-control" id="nombre-tarjeta" required></div></form></div><div id="confirmacion" style="display:none;"><div class="confirmacion"><i class="bi bi-check-circle"></i><h3>¡Inscripción Realizada!</h3><p>Te has inscrito exitosamente.<br>Revisa tu email para más detalles.</p></div></div><div class="botones"><button type="button" class="btn btn-secondary btn-cancelar" id="btn-cancelar">Cancelar</button><button type="button" class="btn btn-primary btn-siguiente" id="btn-siguiente">Siguiente</button></div></div><script>let pasoActual = 1; const tienePago = ' + (tienePago ? 'true' : 'false') + '; const btnSiguiente = document.getElementById("btn-siguiente"); const btnCancelar = document.getElementById("btn-cancelar"); btnCancelar.addEventListener("click", () => window.close()); btnSiguiente.addEventListener("click", () => { if (pasoActual === 1) { if (!validarPaso1()) return; if (tienePago) { mostrarPaso(2); } else { mostrarConfirmacion(); } } else if (pasoActual === 2) { if (!validarPaso2()) return; mostrarConfirmacion(); } else if (pasoActual === 3) { window.close(); } }); function mostrarPaso(paso) { pasoActual = paso; document.getElementById("paso1").style.display = paso === 1 ? "block" : "none"; document.getElementById("paso2").style.display = paso === 2 ? "block" : "none"; document.getElementById("confirmacion").style.display = "none"; btnCancelar.style.display = paso === 3 ? "none" : "inline-block"; btnSiguiente.textContent = paso === 2 ? "Finalizar" : "Siguiente"; } function mostrarConfirmacion() { pasoActual = 3; document.getElementById("paso1").style.display = "none"; document.getElementById("paso2").style.display = "none"; document.getElementById("confirmacion").style.display = "block"; btnSiguiente.textContent = "Cerrar"; btnCancelar.style.display = "none"; } function validarPaso1() { const nombre = document.getElementById("nombre").value.trim(); const email = document.getElementById("email").value.trim(); const telefono = document.getElementById("telefono").value.trim(); const edad = document.getElementById("edad").value.trim(); const perfil = document.getElementById("perfil").value; if (!nombre || !email || !telefono || !edad || !perfil) { alert("Por favor completa todos los campos"); return false; } if (!/^\\d+$/.test(edad)) { alert("La edad debe ser un número válido"); return false; } return true; } function validarPaso2() { const tipo = document.getElementById("tipo-tarjeta").value; const num = document.getElementById("num-tarjeta").value.replace(/\\s/g, ""); const fecha = document.getElementById("fecha").value; const cvv = document.getElementById("cvv").value; const nombre = document.getElementById("nombre-tarjeta").value.trim(); if (!tipo || !num || !fecha || !cvv || !nombre) { alert("Por favor completa todos los datos de pago"); return false; } if (!/^\\d{16}$/.test(num)) { alert("El número de tarjeta debe tener 16 dígitos"); return false; } if (!/^\\d{2}\\/\\d{2}$/.test(fecha)) { alert("La fecha debe estar en formato MM/AA"); return false; } if (!/^\\d{3}$/.test(cvv)) { alert("El CVV debe tener 3 dígitos"); return false; } return true; }</script></body></html>';
  }
})();

/* ── 6. NAVBAR — RESALTAR ENLACE AL HACER CLIC ──────────────── */
document.querySelectorAll('.ia-nav-link').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.ia-nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

console.log('[IA Educación · Bootstrap 5] Scripts cargados correctamente.');
