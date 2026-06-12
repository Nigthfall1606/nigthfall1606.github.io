/**
 * script.js â€” IA en EducaciÃ³n & InvestigaciÃ³n
 * Bootstrap 5 + API PHP + Inscripciones con guardado en MySQL
 */

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BASE URL DE LA API  (PHP en la carpeta /api/ del proyecto)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const API_URL = 'api/';

/* â”€â”€ Contacto â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
async function enviarContacto(nombre, email, mensaje) {
  try {
    const res = await fetch(`${API_URL}contacto.php`, {
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   2. INSCRIPCIONES â€” guarda en MySQL vÃ­a PHP
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * Enví­a los datos del formulario al endpoint PHP correspondiente
 * y devuelve el resultado (lanza error si falla).
 */
async function registrarInscripcion(datos) {
  const endpoint = datos.tipo === 'conferencia'
    ? 'inscripcion_conferencia.php'
    : 'inscripcion_curso.php';
  const idKey = datos.tipo === 'conferencia' ? 'id_conferencia' : 'id_curso';

  const response = await fetch(`${API_URL}${endpoint}`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify({
      [idKey]      : datos.id,
      nombre       : datos.nombre,
      email        : datos.email,
      telefono     : datos.telefono,
      edad         : datos.edad,
      perfil       : datos.perfil,
      metodo_pago  : datos.metodo_pago || ''
    })
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Respuesta invalida del servidor');
  }

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'No se pudo registrar la inscripción');
  }

  return result;
}

/**
 * Genera el HTML completo de la ventana emergente de inscripción.
 * El formulario llama a window.opener.registrarInscripcion() para
 * guardar los datos en MySQL antes de mostrar la confirmación.
 */
function generarFormularioInscripcion(tipo, id, nombre, precio) {
  const tienePago = precio > 0;
  const pasoTotal = tienePago ? 2 : 1;
  const precioTexto = tienePago ? 'Precio: $' + precio : 'Evento gratuito';
  const nombreSafe = escaparHTML(nombre);
  const tipoSafe = escaparHTML(tipo);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inscripción - ${nombreSafe}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
  <style>
    body { background: linear-gradient(135deg,#2d1b69,#0f2d6b); padding:20px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; }
    .caja { max-width:500px; background:#fff; border-radius:12px; padding:30px; box-shadow:0 10px 40px rgba(0,0,0,.2); margin:auto; }
    .titulo { text-align:center; margin-bottom:30px; }
    .titulo h2 { color:#2d1b69; font-weight:600; margin-bottom:5px; }
    .subtitulo { color:#666; font-size:.9rem; }
    .paso-label { font-size:.8rem; color:#777; text-transform:uppercase; letter-spacing:1px; margin-bottom:18px; }
    .precio-info { background:#f8f9fa; padding:14px; border-radius:6px; border-left:4px solid #34d399; margin-bottom:16px; }
    .precio-info strong { color:#2d1b69; }
    .botones { display:flex; gap:10px; margin-top:22px; }
    .botones button { flex:1; }
    .confirmacion { text-align:center; padding:40px 20px; }
    .confirmacion .icono { font-size:4rem; color:#34d399; display:block; margin-bottom:16px; }
    .confirmacion h3 { color:#2d1b69; margin-bottom:8px; }
    .confirmacion p  { color:#666; margin:0; }
    .alerta-formulario { display:none; margin-top:16px; }
    .campo-error { border-color:#dc3545 !important; box-shadow:0 0 0 .2rem rgba(220,53,69,.12) !important; }
  </style>
</head>
<body>
<div class="caja">
  <div class="titulo">
    <h2>Inscripción</h2>
    <div class="subtitulo">${nombreSafe}</div>
  </div>

  <div id="paso1">
    <div class="paso-label">Paso 1 de ${pasoTotal}: Información personal</div>
    <div class="mb-3">
      <label class="form-label">Nombre completo *</label>
      <input type="text" class="form-control" id="inp-nombre" autocomplete="name">
    </div>
    <div class="mb-3">
      <label class="form-label">Email *</label>
      <input type="email" class="form-control" id="inp-email" autocomplete="email">
    </div>
    <div class="mb-3">
      <label class="form-label">Teléfono *</label>
      <input type="tel" class="form-control" id="inp-telefono" autocomplete="tel" placeholder="5512345678">
    </div>
    <div class="mb-3">
      <label class="form-label">Edad *</label>
      <input type="number" class="form-control" id="inp-edad" min="1" max="120">
    </div>
    <div class="mb-3">
      <label class="form-label">Perfil *</label>
      <select class="form-select" id="inp-perfil">
        <option value="">Selecciona tu perfil</option>
        <option value="docente">Docente</option>
        <option value="estudiante">Estudiante</option>
        <option value="investigador">Investigador</option>
        <option value="otro">Otro</option>
      </select>
    </div>
    <div class="precio-info"><strong>${precioTexto}</strong></div>
  </div>

  <div id="paso2" style="display:none;">
    <div class="paso-label">Paso 2 de 2: Método de pago</div>
    <div class="mb-3">
      <label class="form-label">Tipo de tarjeta *</label>
      <select class="form-select" id="inp-tipo-tarjeta">
        <option value="">Selecciona el tipo</option>
        <option value="debito">Débito</option>
        <option value="credito">Crédito</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Número de tarjeta *</label>
      <input type="text" class="form-control" id="inp-num-tarjeta" placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric">
    </div>
    <div class="row">
      <div class="col-6 mb-3">
        <label class="form-label">MM/AA *</label>
        <input type="text" class="form-control" id="inp-fecha" placeholder="MM/AA" maxlength="5">
      </div>
      <div class="col-6 mb-3">
        <label class="form-label">CVV *</label>
        <input type="text" class="form-control" id="inp-cvv" placeholder="000" maxlength="3" inputmode="numeric">
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Nombre en la tarjeta *</label>
      <input type="text" class="form-control" id="inp-nombre-tarjeta">
    </div>
  </div>

  <div id="confirmacion" style="display:none;">
    <div class="confirmacion">
      <i class="bi bi-check-circle-fill icono"></i>
      <h3>¡Inscripción registrada!</h3>
      <p id="msg-confirmacion">Tus datos fueron guardados correctamente.</p>
    </div>
  </div>

  <div class="alert alert-danger alerta-formulario" id="error-general" role="alert"></div>

  <div class="botones" id="botones">
    <button type="button" class="btn btn-secondary" id="btn-cancelar">Cancelar</button>
    <button type="button" class="btn btn-primary"   id="btn-siguiente">Siguiente</button>
  </div>
</div>

<script>
  let paso = 1;
  const tienePago = ${tienePago};
  const datosBase = { tipo: "${tipoSafe}", id: ${id} };

  const elPaso1   = document.getElementById('paso1');
  const elPaso2   = document.getElementById('paso2');
  const elConfirm = document.getElementById('confirmacion');
  const elError   = document.getElementById('error-general');
  const btnSig    = document.getElementById('btn-siguiente');
  const btnCan    = document.getElementById('btn-cancelar');

  function limpiarAdvertencia() {
    elError.textContent = '';
    elError.style.display = 'none';
    document.querySelectorAll('.campo-error').forEach(campo => campo.classList.remove('campo-error'));
  }

  function advertencia(mensaje, campoId) {
    elError.textContent = mensaje;
    elError.style.display = 'block';
    if (campoId) {
      const campo = document.getElementById(campoId);
      if (campo) {
        campo.classList.add('campo-error');
        campo.focus();
      }
    }
    return false;
  }

  function validarPaso1() {
    const n = document.getElementById('inp-nombre').value.trim();
    const e = document.getElementById('inp-email').value.trim();
    const t = document.getElementById('inp-telefono').value.trim();
    const a = document.getElementById('inp-edad').value.trim();
    const p = document.getElementById('inp-perfil').value;
    const telefonoDigitos = t.replace(/[^0-9]/g, '');
    const edadNumero = parseInt(a, 10);
    
    if (!n) {
      return advertencia('El nombre es requerido.', 'inp-nombre');
    }
    if (!e) {
      return advertencia('El email es requerido.', 'inp-email');
    }
    if (!/^[^ @]+@[^ @]+[.][^ @]+$/.test(e)) {
      return advertencia('Email inválido. Verifica el formato.', 'inp-email');
    }
    if (!t) {
      return advertencia('El teléfono es requerido.', 'inp-telefono');
    }
    if (telefonoDigitos.length !== 10) {
      return advertencia('Teléfono inválido. Debe tener 10 dígitos.', 'inp-telefono');
    }
    if (!a) {
      return advertencia('La edad es requerida.', 'inp-edad');
    }
    if (!Number.isInteger(edadNumero) || String(edadNumero) !== a || edadNumero <= 0 || edadNumero > 120) {
      return advertencia('Edad inválida. Debe ser un número entre 1 y 120.', 'inp-edad');
    }
    if (!p) {
      return advertencia('El perfil es requerido.', 'inp-perfil');
    }
    return true;
  }

  function validarPaso2() {
    const tipo   = document.getElementById('inp-tipo-tarjeta').value;
    const num    = document.getElementById('inp-num-tarjeta').value.replace(/[^0-9]/g, '');
    const fecha  = document.getElementById('inp-fecha').value;
    const cvvRaw = document.getElementById('inp-cvv').value.trim();
    const cvv    = cvvRaw.replace(/[^0-9]/g, '');
    const nombre = document.getElementById('inp-nombre-tarjeta').value.trim();
    const partesFecha = fecha.split('/');
    const mes = parseInt(partesFecha[0], 10);
    const fechaValida = partesFecha.length === 2
      && partesFecha[0].length === 2
      && partesFecha[1].length === 2
      && partesFecha[0].split('').every(caracter => caracter >= '0' && caracter <= '9')
      && partesFecha[1].split('').every(caracter => caracter >= '0' && caracter <= '9')
      && mes >= 1
      && mes <= 12;
    
    if (!tipo) {
      return advertencia('Selecciona el tipo de tarjeta.', 'inp-tipo-tarjeta');
    }
    if (num.length !== 16) {
      return advertencia('Número de tarjeta inválido. Debe tener 16 dígitos.', 'inp-num-tarjeta');
    }
    if (!fechaValida) {
      return advertencia('Fecha inválida. Usa formato MM/AA.', 'inp-fecha');
    }
    if (cvv.length !== 3 || cvvRaw.length !== 3) {
      return advertencia('CVV inválido. Debe tener 3 dígitos.', 'inp-cvv');
    }
    if (!nombre) {
      return advertencia('El nombre en la tarjeta es requerido.', 'inp-nombre-tarjeta');
    }
    return true;
  }

  function mostrarPaso(n) {
    paso = n;
    elPaso1.style.display   = n === 1 ? 'block' : 'none';
    elPaso2.style.display   = n === 2 ? 'block' : 'none';
    elConfirm.style.display = 'none';
    btnSig.textContent = n === 2 ? 'Finalizar' : 'Siguiente';
    btnCan.style.display = 'inline-block';
  }

  async function enviar() {
    limpiarAdvertencia();
    btnSig.disabled = true;
    btnCan.disabled = true;
    btnSig.textContent = 'Guardando...';

    const payload = {
      ...datosBase,
      nombre      : document.getElementById('inp-nombre').value.trim(),
      email       : document.getElementById('inp-email').value.trim(),
      telefono    : document.getElementById('inp-telefono').value.trim(),
      edad        : parseInt(document.getElementById('inp-edad').value, 10),
      perfil      : document.getElementById('inp-perfil').value,
      metodo_pago : tienePago ? document.getElementById('inp-tipo-tarjeta').value : ''
    };

    try {
      const resultado = await window.opener.registrarInscripcion(payload);
      mostrarConfirmacion(resultado.mensaje || 'Tus datos fueron guardados correctamente.');
    } catch (err) {
      elError.textContent = 'Error: ' + err.message;
      elError.style.display = 'block';
      btnSig.disabled = false;
      btnCan.disabled = false;
      btnSig.textContent = paso === 2 ? 'Finalizar' : 'Siguiente';
    }
  }

  function mostrarConfirmacion(msg) {
    paso = 3;
    elPaso1.style.display   = 'none';
    elPaso2.style.display   = 'none';
    elConfirm.style.display = 'block';
    document.getElementById('msg-confirmacion').textContent = msg;
    btnSig.disabled    = false;
    btnSig.textContent = 'Cerrar';
    btnCan.style.display = 'none';
  }

  btnCan.addEventListener('click', () => window.close());

  btnSig.addEventListener('click', async () => {
    limpiarAdvertencia();

    try {
      if (paso === 1) {
        if (!validarPaso1()) {
          return;
        }
        if (tienePago) {
          mostrarPaso(2);
        } else {
          await enviar();
        }
      } else if (paso === 2) {
        if (!validarPaso2()) {
          return;
        }
        await enviar();
      } else if (paso === 3) {
        window.close();
      }
    } catch (error) {
      elError.textContent = 'Error inesperado: ' + error.message;
      elError.style.display = 'block';
    }
  });
</script>
</body>
</html>`;
}

function escaparHTML(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Abre la ventana emergente de inscripción */
function abrirInscripcion(tipo, id, nombre, precio) {
  if ((tipo !== 'curso' && tipo !== 'conferencia') || !id) {
    alert('No se pudo identificar el elemento para la inscripción.');
    return;
  }
  const ventana = window.open(
    '', 'inscripcion_' + Date.now(), 'width=600,height=780,scrollbars=yes'
  );
  if (!ventana) {
    alert('Por favor permite las ventanas emergentes para continuar.');
    return;
  }
  ventana.document.write(generarFormularioInscripcion(tipo, id, nombre, precio));
  ventana.document.close();
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3. EVENTOS DE INSCRIPCION
   Un solo listener en fase de captura para capturar todos los
   botones .btn-inscribirse, incluyendo los generados dinamicamente.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-inscribirse');
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const tipo   = btn.dataset.tipo;
  const id     = parseInt(btn.dataset.id, 10);
  const nombre = btn.dataset.course || 'Inscripcion';
  const precio = Number(btn.dataset.price);
  const precioEvento = Number.isFinite(precio) ? precio : 0;

  abrirInscripcion(tipo, id, nombre, precioEvento);
}, true);

/* â”€â”€ Tarjetas de cursos â†’ abrir detalle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.addEventListener('click', function (e) {
  if (e.target.closest('.btn-inscribirse')) return;
  const card = e.target.closest('[data-curso-id]');
  if (!card) return;
  window.open('detalle-curso.html?id=' + card.dataset.cursoId, '_blank');
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   4. SCROLL SUAVE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nav = document.getElementById('navMenu');
    if (nav && nav.classList.contains('show')) {
      const bsCol = bootstrap.Collapse.getInstance(nav);
      if (bsCol) bsCol.hide();
    }
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   5. SCROLL SPY (Intersection Observer)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
(function initScrollSpy() {
  const ids = ['divulgacion', 'cursos', 'podcast', 'conferencias'];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.ia-nav-link').forEach(link => {
        link.classList.toggle('active',
          link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   6. NAVBAR â€” resaltar enlace al hacer clic
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.querySelectorAll('.ia-nav-link').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.ia-nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   7. MODAL DE CONTACTO
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
(function initContacto() {
  const form = document.querySelector('#contactModal form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre    = form.querySelector('#name').value.trim();
    const email     = form.querySelector('#email').value.trim();
    const mensaje   = form.querySelector('#message').value.trim();
    const btnEnviar = form.querySelector('button[type="submit"]');

    btnEnviar.disabled    = true;
    btnEnviar.textContent = 'Enviando...';

    const resultado = await enviarContacto(nombre, email, mensaje);

    if (resultado.success) {
      form.reset();
      btnEnviar.textContent = '¡Enviado!';
      btnEnviar.classList.replace('btn-primary', 'btn-success');
      setTimeout(() => {
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   8. INICIALIZAR AL CARGAR LA PÃGINA
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
console.log('[IA EducaciÃ³n Â· Bootstrap 5 + API PHP] Listo.');

