// ==========================================================
// LÓGICA PRINCIPAL - SALÓN & NAILS (Yamina, Katya, Gisel)
// ==========================================================

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => '$' + Math.round(Number(n || 0)).toLocaleString('es-AR');
const iso = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
const hoy = () => iso(new Date());
const d = n => { const t = new Date(); t.setDate(t.getDate() - n); return iso(t); };

const PAGOS = [['Efectivo','💵 Efectivo'],['Transferencia','🏦 Transf.'],['Débito','💳 Débito'],['Crédito','💳 Crédito'],['Mercado Pago','📱 MP']];

const comisionDuena = m => Math.round(m * 0.4 * 100) / 100;
const gananciaChica = m => Math.round(m * 0.6 * 100) / 100;
const minutos = h => { const [a,b] = (h || '00:00').split(':').map(Number); return a*60+b; };

const STORAGE_KEY = 'salon_crm_v7_final';

// Personas y contraseñas
let PERSONAS = {
  yamina: { nombre: 'Yamina', rol: 'duena', cargo: 'Dueña', icono: '💇‍♀️', color: '#8a384f', pin: '1234' },
  yamila: { nombre: 'Yamina', rol: 'duena', cargo: 'Dueña', icono: '💇‍♀️', color: '#8a384f', pin: '1234' },
  katya:  { nombre: 'Katya',  rol: 'manicurista', cargo: 'Manicurista', icono: '💅', color: '#a83868', pin: '1111' },
  gisel:  { nombre: 'Gisel',  rol: 'manicurista', cargo: 'Manicurista', icono: '✨', color: '#644190', pin: '2222' }
};

// Generador de Semilla inicial
function generarSeedViva() {
  return {
    clientas: [
      { id:'c1', nombre:'Silvia Perez', tel:'11 4455-8899', alerta:'Sensible al amoníaco. No superar 20 vol en raíces.', obs:'Viene cada 3 semanas para retoque y nutrición.' },
      { id:'c2', nombre:'Marta González', tel:'11 2345-6789', alerta:'Pelo poroso en puntas. Mantener altura 7 u 8 ceniza.', obs:'Clienta histórica. Le gusta café cortado.' },
      { id:'c3', nombre:'Florencia V.', tel:'11 9988-7766', alerta:'', obs:'Prefiere turnos combinados (color + uñas con Katya).' },
      { id:'c4', nombre:'Romina Benitez', tel:'11 3322-1144', alerta:'Uñas quebradizas, le sienta bien el kapping acrílico.', obs:'Fanática del nail art con Gisel.' },
      { id:'c5', nombre:'Claudia Ruiz', tel:'11 6677-8800', alerta:'Alisado hace 4 meses. No realizar decoloración alta.', obs:'Corte y botox.' },
      { id:'c6', nombre:'Marcela López', tel:'11 5544-3322', alerta:'Canas rebeldes al 80% en sienes (usar base 6.0).', obs:'Paga siempre por transferencia.' },
      { id:'c7', nombre:'Valentina Ríos', tel:'11 2233-4455', alerta:'Pelo fino, aclara muy rápido.', obs:'Mechas balayage cada 3 meses.' },
      { id:'c8', nombre:'Laura Díaz', tel:'11 7788-9900', alerta:'', obs:'Corte y peinado para eventos.' }
    ],
    visitas: [
      { id:1, cid:'c2', fecha:hoy(), servicio:'Tintura', formula:'Tintura: 7.1, 45g | 8.0, 15g (LOréal) — Oxidante: 20vol, 90g', total:36000, pago:'Efectivo' },
      { id:2, cid:'c6', fecha:hoy(), servicio:'Tintura', formula:'Tintura: 6.0, 50g | 6.1, 10g (Majirel) — Oxidante: 20vol, 60g', total:34000, pago:'Transferencia' },
      { id:3, cid:'c1', fecha:d(1), servicio:'Hidratación / Botox', formula:'Producto: Botox Nutritivo Argán, 50g — Baño de luz 10 min en bacha', total:28000, pago:'Mercado Pago' },
      { id:4, cid:'c7', fecha:d(2), servicio:'Mechas / Reflejos', formula:'Polvo Decolorante: Azul 9 tonos, 40g — Oxidante: 30vol, 80g — Matizador: 9.21, 30g con 10vol', total:55000, pago:'Transferencia' },
      { id:5, cid:'c5', fecha:d(3), servicio:'Corte / Split Ender', formula:'Corte en capas y eliminación de puntas abiertas con Split Ender', total:16000, pago:'Efectivo' },
      { id:6, cid:'c2', fecha:d(28), servicio:'Tintura', formula:'Tintura: 7.1, 60g — Oxidante: 20vol, 90g', total:32000, pago:'Efectivo' },
      { id:7, cid:'c1', fecha:d(35), servicio:'Tintura', formula:'Tintura: 6.0, 50g — Oxidante: 20vol, 50g', total:30000, pago:'Débito' },
      { id:8, cid:'c8', fecha:d(65), servicio:'Corte', formula:'Corte bob y peinado con ondas', total:15000, pago:'Efectivo' }
    ],
    turnos: [
      { id:1, mId:'katya', fecha:hoy(), inicio:'10:00', fin:'11:00', trabajo:'Semipermanente', detalle:'francesa blanca', monto:12000, pago:'Efectivo', cid:'c3' },
      { id:2, mId:'gisel', fecha:hoy(), inicio:'11:15', fin:'12:45', trabajo:'Capping en acrílico', detalle:'baby boomer', monto:18000, pago:'Transferencia', cid:'c4' },
      { id:3, mId:'katya', fecha:hoy(), inicio:'14:00', fin:'15:30', trabajo:'Soft gel', detalle:'diseño a mano alzada', monto:20000, pago:'Mercado Pago', cid:'c2' },
      { id:4, mId:'gisel', fecha:hoy(), inicio:'16:00', fin:'17:00', trabajo:'Semipermanente', detalle:'rojo clásico', monto:12000, pago:'Efectivo', cid:'c1' },
      { id:5, mId:'katya', fecha:d(1), inicio:'15:00', fin:'16:00', trabajo:'Retiro + spa', detalle:'', monto:8000, pago:'Débito', cid:'c5' },
      { id:6, mId:'gisel', fecha:d(2), inicio:'10:30', fin:'12:00', trabajo:'Capping en acrílico', detalle:'nude con glitter', monto:18000, pago:'Efectivo', cid:'c6' },
      { id:7, mId:'katya', fecha:d(3), inicio:'16:30', fin:'17:30', trabajo:'Semipermanente', detalle:'lila pastel', monto:12000, pago:'Transferencia', cid:'c7' }
    ],
    personas: PERSONAS
  };
}

let DB = cargarLocalDB();
let turnos = DB.turnos || [];
let clientas = DB.clientas || [];
let visitas = DB.visitas || [];
if (DB.personas) PERSONAS = { ...PERSONAS, ...DB.personas };

function cargarLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.clientas) && p.clientas.length >= 2) return p;
    }
  } catch(e) { console.error('Error cargando DB local:', e); }
  const s = generarSeedViva();
  guardarLocalDB(s);
  return s;
}

function guardarLocalDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || { turnos, clientas, visitas, personas: PERSONAS }));
  } catch(e) { console.error('Error guardando DB local:', e); }
}

// Sincronización automática con Supabase al iniciar
async function sincronizarConSupabase() {
  if (!DB_API.isOnline()) return;

  try {
    const [cRemote, vRemote, tRemote] = await Promise.all([
      DB_API.getClientes(),
      DB_API.getVisitas(),
      DB_API.getTurnos()
    ]);

    if (Array.isArray(cRemote) && cRemote.length > 0) clientas = cRemote;
    if (Array.isArray(vRemote)) visitas = vRemote;
    if (Array.isArray(tRemote)) turnos = tRemote;

    // Sincronizar PINes y usuarios desde Supabase
    if (supabaseClient) {
      const { data: uRemote } = await supabaseClient.from('usuarios').select('*');
      if (uRemote && uRemote.length) {
        uRemote.forEach(u => {
          if (PERSONAS[u.usuario_key]) {
            PERSONAS[u.usuario_key].pin = u.pin;
            PERSONAS[u.usuario_key].nombre = u.nombre;
          }
        });
      }
    }

    guardarLocalDB();
    refrescarVistasActuales();

    // Activar escucha en tiempo real
    DB_API.subscribeRealtime(
      // Cambio en turnos
      async () => {
        const t = await DB_API.getTurnos();
        if (Array.isArray(t)) { turnos = t; guardarLocalDB(); refrescarVistasActuales(); toast('💅 Turnos actualizados en vivo'); }
      },
      // Cambio en visitas
      async () => {
        const v = await DB_API.getVisitas();
        if (Array.isArray(v)) { visitas = v; guardarLocalDB(); refrescarVistasActuales(); toast('✂️ Visitas actualizadas en vivo'); }
      },
      // Cambio en clientas
      async () => {
        const c = await DB_API.getClientes();
        if (Array.isArray(c)) { clientas = c; guardarLocalDB(); refrescarVistasActuales(); toast('👩 Clientas actualizadas en vivo'); }
      }
    );
  } catch(e) {
    console.error('Error sincronizando Supabase:', e);
  }
}

function refrescarVistasActuales() {
  if (U) {
    if ($('s-inicio').classList.contains('on')) cargarInicio();
    if ($('s-clientas').classList.contains('on')) renderClientas($('buscar').value);
    if ($('s-visita').classList.contains('on')) prepararVisitaPelo();
    if ($('s-turno').classList.contains('on')) { prepararTurno(); calRender(); }
    if ($('s-reportes').classList.contains('on')) cargarReporte();
  }
}

let U = null, periodo = 'hoy', repPeriodo = 'hoy', calFecha = null, calPeloFecha = null, pinUsuarioSeleccionado = null;
let servicioPeluqueriaActivo = 'Tintura';
let servicioSillonActivo = 'Tintura';
let turnoActivoId = null;
let visitaActivaId = null;

function estadoDeTurno(t) {
  if (!t) return 'pendiente';
  if (t.estado) return t.estado;
  const p = String(t.pago || '');
  if (p === 'PENDIENTE') return 'pendiente';
  if (p.startsWith('EN_MESA')) return 'en_mesa';
  return 'cobrado';
}

function badgeEstadoTurno(t) {
  const est = estadoDeTurno(t);
  if (est === 'pendiente') return `<span class="estado-pill pendiente">🕒 En espera</span>`;
  if (est === 'en_mesa') return `<span class="estado-pill en-mesa">⏳ En mesa (${esc(t.inicioReal || t.inicio)})</span>`;
  return `<span class="estado-pill cobrado">✔ Cobrado</span>`;
}

function estadoDeVisita(v) {
  if (!v) return 'cobrado';
  if (v.estado) return v.estado;
  return 'cobrado';
}

function badgeEstadoVisita(v) {
  const est = estadoDeVisita(v);
  if (est === 'pendiente') return `<span class="estado-pill pendiente">🕒 Turno agendado</span>`;
  if (est === 'en_sillon') return `<span class="estado-pill en-mesa">⏳ En sillón (${esc(v.inicioReal || v.inicio || '10:00')})</span>`;
  return `<span class="estado-pill cobrado">✔ Cobrado</span>`;
}

const TABS = {
  duena: [
    ['inicio', '🏠', 'Inicio'],
    ['clientas', '👩', 'Clientas'],
    ['visita', '✂️', 'Ficha Pelo'],
    ['turno', '💅', 'Turnos Uñas'],
    ['reportes', '📊', 'Caja & Rindes']
  ],
  manicurista: [
    ['turno', '💅', 'Registrar'],
    ['inicio', '📋', 'Mi Jornada & Rinde']
  ]
};

// ---------- SISTEMA DE LOGIN Y PIN ----------
function abrirSelectorUsuario() {
  U = null;
  $('splash-login').style.display = 'flex';
  $('modal-pin').style.display = 'none';
  $('pin-input').value = '';
}

function solicitarPin(key) {
  pinUsuarioSeleccionado = key;
  const p = PERSONAS[key];
  $('pin-avatar').textContent = p.icono;
  $('pin-user-title').textContent = `Hola, ${p.nombre}`;
  $('pin-user-desc').textContent = `Ingresá la contraseña de ${p.nombre}`;
  $('pin-input').value = '';
  $('modal-pin').style.display = 'flex';
  setTimeout(() => $('pin-input').focus(), 100);
}

function cerrarModalPin() {
  $('modal-pin').style.display = 'none';
  pinUsuarioSeleccionado = null;
}

function verificarPin() {
  if (!pinUsuarioSeleccionado) return;
  const p = PERSONAS[pinUsuarioSeleccionado];
  const inputPin = $('pin-input').value.trim();

  if (inputPin === p.pin) {
    const key = pinUsuarioSeleccionado;
    cerrarModalPin();
    iniciarSesion(key);
  } else {
    toast('⚠️ Contraseña incorrecta', true);
    $('pin-input').value = '';
    $('pin-input').focus();
  }
}

$('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') verificarPin();
});

function iniciarSesion(key) {
  U = { key, ...PERSONAS[key] };
  $('splash-login').style.display = 'none';

  if ($('h-icon')) $('h-icon').textContent = U.icono;
  if ($('h-user')) $('h-user').textContent = U.nombre + (U.rol === 'duena' ? ' · Dueña' : ' · Uñas');

  const banner = $('banner-modo');
  if (U.rol === 'duena') {
    banner.innerHTML = `<div>✨ <strong>Atelier Yamina:</strong> Gestión de historia clínica capilar, agenda de uñas y caja general.</div>`;
    $('t_manic_box').style.display = 'block';
  } else {
    banner.innerHTML = `<div>💅 <strong>Espacio ${U.nombre}:</strong> Tocá el turno de tu clienta para <strong>iniciar la atención</strong>, sumar extras y <strong>finalizar el cobro</strong>.</div>`;
    $('t_manic_box').style.display = 'none';
  }

  $('tabs').innerHTML = TABS[U.rol].map(([t,i,l]) =>
    `<button data-t="${t}" onclick="irA('${t}')"><span class="icon">${i}</span><span>${l}</span></button>`).join('');

  irA(U.rol === 'duena' ? 'inicio' : 'turno');
}

function cambiarMiPin() {
  if (!U) return;
  const actual = prompt(`Ingresá tu contraseña actual de ${U.nombre}:`);
  if (actual !== PERSONAS[U.key].pin) return toast('Contraseña actual incorrecta', true);
  const nueva = prompt('Ingresá tu NUEVA contraseña (números o texto):');
  if (!nueva || !nueva.trim()) return toast('No se modificó la clave', true);
  PERSONAS[U.key].pin = nueva.trim();
  guardarLocalDB();
  if (DB_API.isOnline() && supabaseClient) {
    supabaseClient.from('usuarios').update({ pin: nueva.trim() }).eq('usuario_key', U.key).then();
  }
  toast('Contraseña actualizada ✔');
}

function irA(tab) {
  document.querySelectorAll('section').forEach(s => s.classList.toggle('on', s.id === 's-' + tab));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  if (tab === 'inicio') cargarInicio();
  if (tab === 'clientas') renderClientas($('buscar').value);
  if (tab === 'visita') prepararVisitaPelo();
  if (tab === 'reportes') cargarReporte();
  if (tab === 'turno') prepararTurno();
}

function toast(t, err) {
  const el = $('toast'); el.textContent = t; el.className = 'show' + (err ? ' err' : '');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.className = '', 2400);
}

function chips(el, items, onPick) {
  el.innerHTML = items.map(([v,l]) => `<button type="button" class="chip" data-v="${esc(v)}">${esc(l)}</button>`).join('');
  el.onclick = e => {
    const b = e.target.closest('.chip'); if (!b) return;
    el.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); onPick && onPick(b.dataset.v);
  };
  return el;
}
const valor = el => (el.querySelector('.chip.on') || {}).dataset?.v || '';
const elegir = (el, v) => el.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.v === v));

function sumarMin(hhmm, min) {
  const [h,m] = hhmm.split(':').map(Number); const t = h*60+m+min;
  return String(Math.floor(t/60)%24).padStart(2,'0') + ':' + String(t%60).padStart(2,'0');
}
function rango(p) {
  const t = new Date();
  if (p === 'hoy') return [hoy(), hoy()];
  if (p === 'semana') { const m = new Date(t); m.setDate(t.getDate() - ((t.getDay()+6)%7)); return [iso(m), hoy()]; }
  return [iso(new Date(t.getFullYear(), t.getMonth(), 1)), hoy()];
}

// ---------- INICIO / MI JORNADA ----------
function turnosPeriodo() {
  const [a,b] = rango(periodo);
  return turnos.filter(t => t.fecha >= a && t.fecha <= b).sort((x,y) => (x.fecha+x.inicio < y.fecha+y.inicio ? 1 : -1));
}
function visitasPeriodo() {
  const [a,b] = rango(periodo);
  return visitas.filter(v => v.fecha >= a && v.fecha <= b);
}

function cargarInicio() {
  const ts = turnosPeriodo();

  if (U.rol === 'duena') {
    const vs = visitasPeriodo();
    const vsCobradas = vs.filter(v => estadoDeVisita(v) === 'cobrado');
    const peluq = vsCobradas.reduce((s,v) => s + v.total, 0);
    const comisionesACobrar = ['katya', 'gisel'].map(k => {
      const p = PERSONAS[k];
      const misT = ts.filter(t => t.mId === k && estadoDeTurno(t) === 'cobrado');
      const misPend = ts.filter(t => t.mId === k && estadoDeTurno(t) !== 'cobrado');
      const gen = misT.reduce((s,t) => s + t.monto, 0);
      return {
        key: k,
        nombre: p.nombre,
        turnos: misT.length,
        pendientes: misPend.length,
        totalCobradoPorElla: gen,
        debeEntregarAYamina: comisionDuena(gen),
        suGanancia: gananciaChica(gen)
      };
    });

    const totalComisionesYamina = comisionesACobrar.reduce((s,c) => s + c.debeEntregarAYamina, 0);
    const totalTurnosCobrados = comisionesACobrar.reduce((s,c) => s + c.turnos, 0);

    $('inicioCont').innerHTML = `
      <div class="kpis">
        <div class="kpi rose"><small>Peluquería (100% tuya)</small><big>${money(peluq)}</big><small>${vsCobradas.length} cobradas</small></div>
        <div class="kpi verde"><small>A cobrar uñas (40%)</small><big>${money(totalComisionesYamina)}</big><small>${totalTurnosCobrados} turnos cobrados</small></div>
        <div class="kpi noir"><small>Tu Ganancia Neta</small><big>${money(peluq + totalComisionesYamina)}</big><small>Total salón</small></div>
      </div>

      <div class="card">
        <h3>💅 Rendiciones de Manicuría</h3>
        <p class="section-sub">Calculado sobre los turnos finalizados y cobrados por cada manicurista:</p>
        ${comisionesACobrar.map(m => `
          <div class="item">
            <div>
              <b>${esc(m.nombre)}</b>
              <small>${m.turnos} cobrados${m.pendientes ? ` · ${m.pendientes} en espera/mesa` : ''} · Recaudó ${money(m.totalCobradoPorElla)}</small>
              <small style="color:var(--txt-sec);">Su 60% neto: <strong>${money(m.suGanancia)}</strong></small>
            </div>
            <div style="text-align:right">
              <span style="font-size:11px; color:var(--txt-muted); display:block; text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">Te transfiere / entrega</span>
              <b style="color:var(--p); font-size:18px; font-family:var(--font-serif);">${money(m.debeEntregarAYamina)}</b>
              <small style="color:var(--g); font-weight:700;">Tu 40% salón</small>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3>✂️ Agenda y Atenciones de Peluquería (${vs.length})</h3>
        ${vs.length ? vs.map(v => {
          const clienta = clientas.find(c => c.id === v.cid)?.nombre || v.clienta_nombre || 'Clienta';
          const est = estadoDeVisita(v);
          return `
            <div class="item" style="cursor:pointer;" onclick="irA('visita'); seleccionarVisitaPelo(${v.id});">
              <div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <b>${esc(clienta)}</b> · <span style="color:var(--p-rose-deep); font-weight:700; font-size:13px;">${esc(v.servicio)}</span>
                  ${badgeEstadoVisita(v)}
                </div>
                <small>${esc(v.fecha)}${v.inicio ? ` (${v.inicio}–${v.fin})` : ''}${est === 'cobrado' ? ' · ' + esc(v.pago) : ''}</small>
                ${v.formula ? `<div class="formula-pill">🧪 ${esc(v.formula)}</div>` : ''}
              </div>
              <div style="text-align:right; flex-shrink:0;" onclick="event.stopPropagation();">
                ${est === 'cobrado' ? `<b style="font-family:var(--font-serif); font-size:16px;">${money(v.total)}</b>` : `<button class="mini noir-btn" onclick="irA('visita'); seleccionarVisitaPelo(${v.id});">▶️ Atender</button>`}
                <br>
                <button class="mini danger" style="margin-top:6px; font-size:10.5px; padding:4px 9px;" onclick="eliminarVisita(${v.id})">Borrar</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="vacio">Sin atenciones de peluquería en este período</div>'}
      </div>

      <div class="card">
        <h3>💅 Turnos de Nail Studio (${ts.length})</h3>
        ${ts.length ? ts.map(t => {
          const clienta = clientas.find(c => c.id === t.cid)?.nombre || t.clientaManual || 'Clienta';
          const est = estadoDeTurno(t);
          return `
            <div class="item" style="cursor:pointer;" onclick="irA('turno'); seleccionarTurno(${t.id});">
              <div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <b>${esc(PERSONAS[t.mId]?.nombre || t.mId)}</b>
                  <span style="color:var(--txt-muted); font-size:12px;">con</span>
                  <strong>${esc(clienta)}</strong>
                  ${badgeEstadoTurno(t)}
                </div>
                <small>${esc(t.trabajo)}${t.detalle ? ' · ' + esc(t.detalle) : ''} · ${esc(t.fecha)} (${t.inicio}–${t.fin})${est === 'cobrado' ? ' · ' + esc(t.pago) : ''}</small>
              </div>
              <div style="text-align:right; flex-shrink:0;" onclick="event.stopPropagation();">
                <b style="font-family:var(--font-serif); font-size:16px;">${est === 'cobrado' ? money(t.monto) : (t.monto ? money(t.monto) + ' (est.)' : 'A cobrar')}</b>
                ${est === 'cobrado' ? `<small style="color:var(--g); font-weight:700;">Tu 40%: ${money(comisionDuena(t.monto))}</small>` : `<br><button class="mini" style="margin-top:4px; font-size:10.5px; padding:4px 9px;" onclick="irA('turno'); seleccionarTurno(${t.id});">Abrir ›</button>`}
                <button class="mini danger" style="margin-top:5px; font-size:10.5px; padding:4px 9px;" onclick="eliminarTurno(${t.id})">Borrar</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="vacio">Sin turnos de manicuría en este período</div>'}
      </div>
    `;
  } else {
    // VISTA PRIVADA DE CADA MANICURISTA (Katya o Gisel)
    const mios = ts.filter(t => t.mId === U.key);
    const miosCobrados = mios.filter(t => estadoDeTurno(t) === 'cobrado');
    const miosPendientes = mios.filter(t => estadoDeTurno(t) !== 'cobrado');
    const totCobradoEnMano = miosCobrados.reduce((s,t) => s + t.monto, 0);
    const miPlata = gananciaChica(totCobradoEnMano);
    const deboEntregarAYamina = comisionDuena(totCobradoEnMano);

    $('inicioCont').innerHTML = `
      <div class="kpis">
        <div class="kpi verde">
          <small>Tu ganancia limpia (60%)</small>
          <big>${money(miPlata)}</big>
          <small>De ${money(totCobradoEnMano)} cobrados (${miosCobrados.length} turnos)</small>
        </div>
        <div class="kpi noir">
          <small>A rendir a Yamina (40%)</small>
          <big>${money(deboEntregarAYamina)}</big>
          <small>Tu liquidación de salón</small>
        </div>
      </div>

      ${miosPendientes.length ? `
        <div class="card" style="background:var(--p-rose-soft) !important; border-color:var(--p-rose) !important;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <div>
              <b style="font-size:14.5px;">⏳ Tenés ${miosPendientes.length} ${miosPendientes.length === 1 ? 'clienta pendiente' : 'clientas pendientes'} de finalizar/cobrar</b>
              <small style="display:block; color:var(--txt-sec); margin-top:2px;">Tocá un turno para iniciar la atención o cerrar el cobro</small>
            </div>
            <button class="mini noir-btn" onclick="irA('turno'); seleccionarTurno(${miosPendientes[0].id});">Ir a Mesa ›</button>
          </div>
        </div>
      ` : ''}

      <div class="card">
        <h3>💅 Mis Turnos y Liquidación Personal (${mios.length})</h3>
        ${mios.length ? mios.map(t => {
          const clienta = clientas.find(c => c.id === t.cid)?.nombre || t.clientaManual || 'Clienta';
          const est = estadoDeTurno(t);
          return `
            <div class="item" style="cursor:pointer;" onclick="irA('turno'); seleccionarTurno(${t.id});">
              <div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <b>${esc(clienta)}</b>
                  ${badgeEstadoTurno(t)}
                </div>
                <small style="color:var(--p-rose-deep); font-weight:700;">${esc(t.trabajo)}${t.detalle ? ' · ' + esc(t.detalle) : ''}</small>
                <small>${esc(t.fecha)} (${t.inicio}–${t.fin})${est === 'cobrado' ? ' · ' + esc(t.pago) : ''}</small>
              </div>
              <div style="text-align:right; flex-shrink:0;" onclick="event.stopPropagation();">
                ${est === 'cobrado' ? `
                  <b style="font-family:var(--font-serif); font-size:16px;">${money(t.monto)}</b>
                  <small style="color:var(--g); font-weight:700;">Tu 60%: ${money(gananciaChica(t.monto))}</small>
                  <small style="color:var(--txt-muted);">40% Salón: ${money(comisionDuena(t.monto))}</small>
                ` : `
                  <button class="mini noir-btn" onclick="irA('turno'); seleccionarTurno(${t.id});">▶️ Atender / Cobrar</button>
                `}
                <br>
                <button class="mini danger" style="margin-top:5px; font-size:10.5px; padding:4px 9px;" onclick="eliminarTurno(${t.id})">Borrar</button>
              </div>
            </div>
          `;
        }).join('') : '<div class="vacio">No tenés turnos en este período</div>'}
      </div>
    `;
  }
}

// ---------- CLIENTAS (Yamina) ----------
function renderClientas(q) {
  q = (q || '').toLowerCase();
  const lista = clientas.filter(c => (c.nombre + ' ' + (c.tel || '')).toLowerCase().includes(q));
  $('listaClientas').innerHTML = lista.length ? lista.map(c => `
    <div class="item client-row" onclick="abrirClienta('${c.id}')">
      <div>
        <b>${esc(c.nombre)}</b>
        <small>${esc(c.tel || 'Sin teléfono')}${c.alerta ? ' · ⚠️ ' + esc(c.alerta) : ''}</small>
      </div>
      <span class="mini" style="pointer-events:none;">Ver ficha ›</span>
    </div>`).join('')
    : '<div class="vacio">No encontramos clientas con ese nombre.</div>';
}

function abrirClienta(id) {
  irA('clientas');
  const c = clientas.find(x => x.id === id); if (!c) return;
  const vs = visitas.filter(v => v.cid === id).sort((a,b) => a.fecha < b.fecha ? 1 : -1);
  const ms = turnos.filter(t => t.cid === id).sort((a,b) => a.fecha < b.fecha ? 1 : -1);
  const u = vs[0];

  $('perfil').innerHTML = `
    <div class="card card-featured">
      <div class="resumen-cabecera">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <small>Última visita: ${u ? esc(u.fecha) : 'Sin visitas previas'}</small>
          <span style="font-size:11px; background:rgba(255,255,255,0.16); padding:3px 10px; border-radius:999px; font-weight:700;">${vs.length} fichas</span>
        </div>
        ${u ? `
          <div style="font-family:var(--font-serif); font-size:18px; font-weight:700; margin-top:6px;">${esc(u.servicio)}</div>
          <div class="formula-tag">🧪 ${esc(u.formula || 'Sin fórmula')}</div>
          <button class="btn-repeat" onclick="repetirFormula('${esc(u.formula)}')">
            🔄 Usar esta misma fórmula hoy
          </button>
        ` : '<div style="margin-top:6px; font-size:13px;">Primera atención en el salón ✨</div>'}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:start; gap:10px;">
        <div>
          <h2 style="margin:0; font-size:22px;">${esc(c.nombre)}</h2>
          <small style="color:var(--txt-muted); font-size:12.5px;">${esc(c.tel || 'Sin teléfono')}${c.cumple ? ' · 🎂 ' + esc(c.cumple) : ''}</small>
        </div>
        ${c.tel ? `<button class="mini excel-btn" onclick="abrirWppClienta('${esc(c.tel)}', '${esc(c.nombre)}')">💬 WhatsApp</button>` : ''}
      </div>

      ${c.alerta ? `
        <div class="alerta-box" style="margin-top:12px;">
          <span>⚠️</span>
          <div><strong>Diagnóstico / Alerta Capilar:</strong> ${esc(c.alerta)}</div>
        </div>
      ` : ''}

      ${c.obs ? `<div style="font-size:13px; color:var(--txt-sec); margin-top:8px; background:var(--p-rose-soft); padding:10px 14px; border-radius:12px;"><strong>Notas de estilo:</strong> ${esc(c.obs)}</div>` : ''}

      <h3 style="margin-top:18px; border-top:1px solid var(--border); padding-top:14px;">✂️ Historial Químico y Peluquería (${vs.length})</h3>
      ${vs.length ? vs.map(v => `
        <div class="item">
          <div>
            <b>${esc(v.servicio)}</b> · <span style="font-size:12px; color:var(--txt-muted);">${esc(v.fecha)}</span>
            <div class="formula-pill">🧪 ${esc(v.formula || 'Sin fórmula')}</div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <b style="font-family:var(--font-serif); font-size:16px;">${money(v.total)}</b>
            <small>${esc(v.pago)}</small>
          </div>
        </div>
      `).join('') : '<div class="vacio">Sin visitas de peluquería registradas</div>'}

      <h3 style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">💅 Historial de Manicuría (${ms.length})</h3>
      ${ms.length ? ms.map(t => `
        <div class="item">
          <div>
            <b>${esc(t.trabajo)}</b> <span style="font-size:12px; color:var(--txt-muted);">con ${esc(PERSONAS[t.mId]?.nombre || t.mId)}</span>
            <small>${esc(t.fecha)} · ${esc(t.detalle || 'Diseño clásico')}</small>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <b style="font-family:var(--font-serif); font-size:16px;">${money(t.monto)}</b>
            <small>${esc(t.pago)}</small>
          </div>
        </div>
      `).join('') : '<div class="vacio">Sin turnos de uñas registrados</div>'}

      <div style="display:flex; gap:8px; margin-top:16px;">
        <button class="mini btn-sec" style="flex:1; padding:10px;" onclick="$('perfil').innerHTML=''">Cerrar ficha</button>
        <button class="mini danger" style="padding:10px 14px;" onclick="eliminarClienta('${c.id}')">Eliminar clienta</button>
      </div>
    </div>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function abrirWppClienta(tel, nombre) {
  const num = tel.replace(/\D/g, '');
  if (!num) return toast('Teléfono no válido', true);
  const url = `https://wa.me/${num.startsWith('54') ? num : '549' + num}?text=${encodeURIComponent(`¡Hola ${nombre.split(' ')[0]}! Te escribimos de la peluquería 🥰`)}`;
  window.open(url, '_blank');
}

async function eliminarClienta(id) {
  if (!confirm('¿Eliminar esta clienta y sus visitas?')) return;
  clientas = clientas.filter(c => c.id !== id);
  visitas = visitas.filter(v => v.cid !== id);
  turnos = turnos.filter(t => t.cid !== id);
  guardarLocalDB();
  await DB_API.deleteCliente(id);
  $('perfil').innerHTML = '';
  renderClientas('');
  filtrarSelect('');
  toast('Clienta eliminada');
}

async function guardarClienta() {
  const nom = $('c_nombre').value.trim();
  if (!nom) return toast('Ingresá el nombre de la clienta', true);
  const nueva = {
    id: 'c_' + Date.now(),
    nombre: nom,
    tel: $('c_tel').value.trim(),
    cumple: $('c_cumple').value,
    alerta: $('c_alerta').value.trim(),
    obs: $('c_obs').value.trim()
  };
  clientas.push(nueva);
  guardarLocalDB();
  await DB_API.saveCliente(nueva);

  ['c_nombre','c_tel','c_cumple','c_alerta','c_obs'].forEach(i => $(i).value = '');
  $('det_nueva_clienta').removeAttribute('open');
  toast('Clienta guardada ✔');
  renderClientas('');
  filtrarSelect('');
}

// ---------- VISITA PELUQUERÍA, CALENDARIO YAMINA & SILLÓN EN VIVO ----------
function prepararVisitaPelo() {
  filtrarSelect($('v_buscar')?.value || '');
  if ($('v_fecha') && !$('v_fecha').value) $('v_fecha').value = hoy();
  if ($('v_inicio') && !$('v_inicio').value) {
    $('v_inicio').value = horaAhoraTexto();
  }
  if ($('v_dur') && !valor($('v_dur'))) elegir($('v_dur'), '90');
  actualizarFinPelo(duracionPeloActual());
  if (!calPeloFecha) calPeloFecha = hoy();
  renderPanelAtencionPelo();
  calPeloRender();
}

function duracionPeloActual() { return +valor($('v_dur')) || 90; }
function actualizarFinPelo(min) {
  if ($('v_inicio') && $('v_inicio').value && $('v_fin')) {
    $('v_fin').value = sumarMin($('v_inicio').value, min);
  }
}

function filtrarSelect(q) {
  q = (q || '').toLowerCase();
  const sel = $('v_clienta'), actual = sel.value;
  sel.innerHTML = '<option value="">— Elegir clienta de la lista (o escribir abajo) —</option>' +
    clientas.filter(c => c.nombre.toLowerCase().includes(q))
      .map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join('');
  if (actual && sel.querySelector(`option[value="${actual}"]`)) {
    sel.value = actual;
  }
  verHistorial();
}

function verHistorial() {
  const id = $('v_clienta').value;
  if (!id) return $('historial').innerHTML = '';
  const c = clientas.find(x => x.id === id);
  const vs = visitas.filter(v => v.cid === id && v.formula).sort((a,b) => a.fecha < b.fecha ? 1 : -1);
  const u = vs[0];

  $('historial').innerHTML = `
    ${c && c.alerta ? `
      <div class="alerta-box">
        <span>⚠️</span>
        <div><strong>Diagnóstico / Alerta Capilar:</strong> ${esc(c.alerta)}</div>
      </div>
    ` : ''}
    <div class="resumen-cabecera">
      <small>Última receta aplicada${u ? ' · ' + esc(u.fecha) : ''}</small>
      ${u ? `
        <div style="font-family:var(--font-serif); font-size:17px; font-weight:700; margin-top:5px;">${esc(u.servicio)}</div>
        <div class="formula-tag">🧪 ${esc(u.formula || 'Sin fórmula')}</div>
        <button class="btn-repeat" onclick="repetirFormula('${esc(u.formula)}')">
          🔄 Usar esta misma fórmula hoy
        </button>
      ` : '<div style="margin-top:6px; font-size:13px;">Primera visita de esta clienta en el salón ✨</div>'}
    </div>`;
}

function repetirFormula(formulaStr) {
  toast('Fórmula previa cargada en la visita ✔');
  if ($('seccion_tecnica_dinamica')) $('seccion_tecnica_dinamica').dataset.formulaRepetida = formulaStr;
  if ($('sillon_formula_manual')) $('sillon_formula_manual').value = formulaStr;
}

function renderFormularioTecnico(targetContainerId = 'seccion_tecnica_dinamica', servicio = servicioPeluqueriaActivo, prefix = '') {
  const s = servicio;
  const cont = $(targetContainerId);
  if (!cont) return;
  delete cont.dataset.formulaRepetida;

  const idTint = prefix + 'g_tintura';
  const idMarca = prefix + 'f_marca';
  const idOxi = prefix + 'g_oxi';
  const idDeco = prefix + 'g_deco';
  const idMatiz = prefix + 'g_matiz';
  const idProd = prefix + 'g_prod';
  const idObsTrat = prefix + 'f_obs_trat';
  const idObsCorte = prefix + 'f_obs_corte';

  if (s === 'Tintura') {
    cont.innerHTML = `
      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>🎨 Tintura / Mezcla de Color</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idTint}', 'Nro de tintura (ej: 8.1)', 'Gramos (ej: 45g)')">➕ [+] Tintura</button>
        </div>
        <div id="${idTint}"></div>
        <label>Marca:</label>
        <input id="${idMarca}" placeholder="Ej: Majirel, LOréal, Alfaparf...">
      </div>

      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>💧 Oxidante / Agua</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idOxi}', 'Volumen (ej: 20vol)', 'Gramos / ml (ej: 90g)')">➕ [+] Oxidante</button>
        </div>
        <div id="${idOxi}"></div>
      </div>
    `;
    agregarRenglon(idTint, 'Nro (ej: 7.1)', '45g');
    agregarRenglon(idOxi, '20 vol', '90g');
  } else if (s === 'Mechas / Reflejos') {
    cont.innerHTML = `
      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>✨ Polvo Decolorante</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idDeco}', 'Tipo / Nro (ej: Azul 9 tonos)', 'Gramos (ej: 40g)')">➕ [+] Decolorante</button>
        </div>
        <div id="${idDeco}"></div>
      </div>

      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>🎨 Matizador / Tintura</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idMatiz}', 'Tono (ej: 9.21)', 'Gramos (ej: 30g)')">➕ [+] Matizador</button>
        </div>
        <div id="${idMatiz}"></div>
      </div>

      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>💧 Oxidante</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idOxi}', 'Volumen (ej: 30vol o 10vol)', 'Gramos / ml')">➕ [+] Oxidante</button>
        </div>
        <div id="${idOxi}"></div>
      </div>
    `;
    agregarRenglon(idDeco, 'Azul 9 tonos', '40g');
    agregarRenglon(idOxi, '30 vol', '80g');
  } else if (s === 'Hidratación / Botox' || s === 'Alisado / Keratina') {
    cont.innerHTML = `
      <div class="tecnica-grupo">
        <div class="tecnica-header">
          <span>🧴 Producto Aplicado</span>
          <button type="button" class="mini" onclick="agregarRenglon('${idProd}', 'Marca / Tipo de producto', 'Gramos / ml')">➕ [+] Producto</button>
        </div>
        <div id="${idProd}"></div>
        <label>Observaciones del tratamiento:</label>
        <input id="${idObsTrat}" placeholder="Ej: Gorro térmico 20 min, enjuague neutro...">
      </div>
    `;
    agregarRenglon(idProd, s === 'Hidratación / Botox' ? 'Botox Nutritivo Argán' : 'Keratina antifrizz', '50g');
  } else {
    cont.innerHTML = `
      <div class="tecnica-grupo">
        <label style="margin-top:0;">Detalle / Observaciones del trabajo:</label>
        <textarea id="${idObsCorte}" rows="2" placeholder="Ej: Corte en capas, flequillo cortina, saneamiento de puntas..."></textarea>
      </div>
    `;
  }
}

function agregarRenglon(idCont, placeholder1, placeholder2) {
  const c = $(idCont);
  if (!c) return;
  const div = document.createElement('div');
  div.className = 'tecnica-renglon';
  div.innerHTML = `
    <input class="f_col1" placeholder="${placeholder1}">
    <input class="f_col2" placeholder="${placeholder2}">
    <button type="button" class="x" onclick="this.parentElement.remove()">✕</button>
  `;
  c.appendChild(div);
}

function agregarProductoVenta(nombre = '', precio = '', contId = 'f_productos') {
  const c = $(contId);
  if (!c) return;
  const div = document.createElement('div');
  div.className = 'tecnica-renglon';
  div.innerHTML = `
    <input class="p_nom" value="${esc(nombre)}" placeholder="Producto (ej: Shampoo matizador)">
    <input class="p_pre" value="${esc(precio)}" type="number" placeholder="$ Precio">
    <button type="button" class="x" onclick="this.parentElement.remove()">✕</button>
  `;
  c.appendChild(div);
}

function compilarFormulaTexto(prefix = '', servicio = servicioPeluqueriaActivo, prodContId = 'f_productos') {
  if (!prefix && $('seccion_tecnica_dinamica')?.dataset.formulaRepetida) {
    return $('seccion_tecnica_dinamica').dataset.formulaRepetida;
  }
  const s = servicio;
  const partes = [];

  const leerGrupo = (id, etiqueta) => {
    const el = $(prefix + id);
    if (!el) return;
    const items = [];
    el.querySelectorAll('.tecnica-renglon').forEach(r => {
      const v1 = r.querySelector('.f_col1')?.value.trim();
      const v2 = r.querySelector('.f_col2')?.value.trim();
      if (v1) items.push(v1 + (v2 ? ', ' + v2 : ''));
    });
    if (items.length) partes.push(`${etiqueta}: ${items.join(' | ')}`);
  };

  if (s === 'Tintura') {
    leerGrupo('g_tintura', 'Tintura');
    const marca = $(prefix + 'f_marca')?.value.trim();
    if (marca) partes.push(`(${marca})`);
    leerGrupo('g_oxi', 'Oxidante');
  } else if (s === 'Mechas / Reflejos') {
    leerGrupo('g_deco', 'Decolorante');
    leerGrupo('g_matiz', 'Matizador');
    leerGrupo('g_oxi', 'Oxidante');
  } else if (s === 'Hidratación / Botox' || s === 'Alisado / Keratina') {
    leerGrupo('g_prod', 'Producto');
    const obs = $(prefix + 'f_obs_trat')?.value.trim();
    if (obs) partes.push(`Obs: ${obs}`);
  } else {
    const obs = $(prefix + 'f_obs_corte')?.value.trim();
    if (obs) partes.push(obs);
  }

  const prods = [];
  $(prodContId)?.querySelectorAll('.tecnica-renglon').forEach(r => {
    const nom = r.querySelector('.p_nom')?.value.trim();
    const pre = r.querySelector('.p_pre')?.value.trim();
    if (nom) prods.push(`${nom} ($${pre || '0'})`);
  });
  if (prods.length) partes.push(`🛍️ Venta: ${prods.join(', ')}`);

  return partes.join(' — ');
}

function togglePagoMixto() {
  const tipo = $('v_pago_tipo').value;
  $('caja_pago_simple').style.display = tipo === 'simple' ? 'block' : 'none';
  $('caja_pago_mixto').style.display = tipo === 'mixto' ? 'block' : 'none';
}

async function guardarVisita(modoEstado = 'pendiente') {
  const fecha = $('v_fecha')?.value || hoy();
  const ini = $('v_inicio')?.value || '10:00';
  const fin = $('v_fin')?.value || '11:30';
  const cid = $('v_clienta').value;
  const manual = $('v_clienta_manual')?.value.trim() || '';

  if (!cid && !manual) return toast('Elegí o escribí el nombre de la clienta', true);
  if (modoEstado === 'cobrado' && !$('v_total').value) return toast('Ingresá el monto cobrado', true);

  let finalCid = cid;
  let finalNom = manual;
  if (!finalCid && manual) {
    const nuevaC = { id: 'c_' + Date.now(), nombre: manual, tel: '', alerta: '', obs: 'Agendada en calendario de peluquería' };
    clientas.push(nuevaC);
    await DB_API.saveCliente(nuevaC);
    finalCid = nuevaC.id;
  } else if (finalCid) {
    finalNom = clientas.find(c => c.id === finalCid)?.nombre || 'Clienta';
  }

  const formula = modoEstado === 'cobrado' ? compilarFormulaTexto() : '';
  let metodoPago = valor($('v_pago')) || 'Efectivo';

  if (modoEstado === 'cobrado' && $('v_pago_tipo').value === 'mixto') {
    const ef = $('v_pago_efectivo').value || 0;
    const tr = $('v_pago_transf').value || 0;
    metodoPago = `Mixto ($${ef} Efec + $${tr} Transf)`;
  }

  const nuevaVisita = {
    id: Date.now(),
    cid: finalCid,
    clienta_nombre: finalNom,
    fecha: fecha,
    inicio: ini,
    fin: fin,
    inicioReal: modoEstado === 'cobrado' ? ini : '',
    estado: modoEstado,
    servicio: servicioPeluqueriaActivo,
    formula: formula,
    total: modoEstado === 'cobrado' ? (+$('v_total').value || 0) : 0,
    pago: metodoPago
  };

  visitas.push(nuevaVisita);
  guardarLocalDB();
  await DB_API.saveVisita(nuevaVisita);
  syncGoogleSheetsVisita(nuevaVisita, true);

  toast(modoEstado === 'pendiente' ? '📅 Turno agendado en el Calendario de Yamina ✔' : '¡Atención y ficha registradas con éxito! ✔');
  if ($('v_total')) $('v_total').value = '';
  if ($('v_clienta_manual')) $('v_clienta_manual').value = '';
  if ($('f_productos')) $('f_productos').innerHTML = '';
  if ($('v_pago_efectivo')) $('v_pago_efectivo').value = '';
  if ($('v_pago_transf')) $('v_pago_transf').value = '';
  if ($('det_carga_directa_pelo')) $('det_carga_directa_pelo').removeAttribute('open');

  calPeloFecha = fecha;
  visitaActivaId = nuevaVisita.id;
  renderFormularioTecnico();
  prepararVisitaPelo();
  cargarInicio();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- CALENDARIO DE PELUQUERÍA (YAMINA) & MODO SILLÓN EN VIVO ----------
function calPeloMover(n) {
  const x = new Date((calPeloFecha || hoy()) + 'T12:00:00');
  x.setDate(x.getDate() + n);
  calPeloFecha = iso(x);
  calPeloRender();
}

function calPeloRender() {
  if (!$('calPeloCont')) return;
  if (!calPeloFecha) calPeloFecha = hoy();
  const HORA_PX = 52, H_INI = 8, H_FIN = 22;
  const horas = []; for (let h = H_INI; h < H_FIN; h++) horas.push(h);
  const alto = horas.length * HORA_PX;

  if ($('calPeloLbl')) {
    $('calPeloLbl').textContent = (calPeloFecha === hoy() ? 'Hoy · ' : '') +
      new Date(calPeloFecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'short' });
  }

  const dia = visitas
    .filter(v => v.fecha === calPeloFecha)
    .sort((a,b) => (a.inicio || '10:00') < (b.inicio || '10:00') ? -1 : 1);

  if ($('cola_pelo_dia')) {
    $('cola_pelo_dia').innerHTML = dia.length ? `
      <div class="cola-dia-wrap">
        ${dia.map(v => {
          const cli = clientas.find(c => c.id === v.cid)?.nombre || v.clienta_nombre || 'Clienta';
          const est = estadoDeVisita(v);
          const iconoEst = est === 'en_sillon' ? '⏳' : (est === 'cobrado' ? '✔' : '🕒');
          return `
            <button type="button" class="turno-cola-btn ${visitaActivaId === v.id ? 'activo' : ''}" onclick="seleccionarVisitaPelo(${v.id})">
              <b>${iconoEst} ${esc(cli)}</b>
              <small>${esc(v.inicio || '10:00')} hs · ${esc(v.servicio)}</small>
            </button>
          `;
        }).join('')}
      </div>
    ` : '';
  }

  const gutter = `<div class="cal-h"><div style="height:34px;border:0"></div>${horas.map(h => `<div>${String(h).padStart(2,'0')}:00</div>`).join('')}</div>`;

  const bl = dia.map((v, idx) => {
    const iniStr = v.inicio || String(Math.min(10 + idx * 2, 19)).padStart(2,'0') + ':00';
    const finStr = v.fin || sumarMin(iniStr, 90);
    const s = minutos(iniStr), e = Math.max(minutos(finStr), s + 45);
    const top = (s - H_INI*60) / 60 * HORA_PX;
    const h = Math.max((e - s) / 60 * HORA_PX, 32);
    const clienta = clientas.find(c => c.id === v.cid)?.nombre || v.clienta_nombre || 'Clienta';
    const est = estadoDeVisita(v);
    const tagEst = est === 'en_sillon' ? '⏳ EN SILLÓN' : (est === 'cobrado' ? '✔' : '🕒');
    const bgCol = est === 'en_sillon' ? '#8a384f' : (est === 'cobrado' ? '#161416' : '#c46880');
    const bordeActivo = visitaActivaId === v.id ? 'outline: 3px solid #161416; z-index:5;' : '';

    return `
      <div class="bloque" onclick="seleccionarVisitaPelo(${v.id})" title="Tocá para atender o ver fórmula"
        style="top:${top}px; height:${h}px; background-color:${bgCol}; ${bordeActivo}">
        <b>${tagEst} ${esc(clienta)} · ${esc(v.servicio)}</b>
        <span>${iniStr}–${finStr}${est === 'cobrado' && v.total ? ' · ' + money(v.total) : ''}${v.formula ? ' · 🧪 ' + esc(v.formula) : ''}</span>
      </div>
    `;
  }).join('');

  $('calPeloCont').innerHTML = `
    <div class="cal-wrap">
      ${gutter}
      <div class="cal-col">
        <div class="cal-tit" style="background-color:#f8dfe4; color:#161416;">💇‍♀️ Sillón Yamina · Agenda de Peluquería & Color</div>
        <div class="cal-grid" style="height:${alto}px">${horas.map(() => '<div class="cal-hora"></div>').join('')}${bl}</div>
      </div>
    </div>
    ${dia.length ? '' : '<div class="vacio" style="margin-top:8px;">No hay turnos de peluquería agendados en esta fecha</div>'}
  `;
}

function seleccionarVisitaPelo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;
  visitaActivaId = v.id;
  servicioSillonActivo = v.servicio || 'Tintura';
  renderPanelAtencionPelo();
  calPeloRender();
  const el = $('panel_atencion_pelo');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarPanelAtencionPelo() {
  visitaActivaId = null;
  renderPanelAtencionPelo();
  calPeloRender();
}

function renderPanelAtencionPelo() {
  const cont = $('panel_atencion_pelo');
  if (!cont) return;

  const v = visitas.find(x => x.id === Number(visitaActivaId));
  if (!v) {
    cont.innerHTML = '';
    return;
  }

  const cObj = clientas.find(c => c.id === v.cid);
  const clientaNombre = cObj?.nombre || v.clienta_nombre || 'Clienta';
  const est = estadoDeVisita(v);

  // Buscar última fórmula histórica de esta clienta
  const previas = visitas
    .filter(x => x.cid && x.cid === v.cid && x.id !== v.id && x.formula)
    .sort((a,b) => a.fecha < b.fecha ? 1 : -1);
  const ultFormula = previas[0];

  let pillHtml = `<span class="estado-pill pendiente">🕒 Turno Agendado · En Espera</span>`;
  if (est === 'en_sillon') pillHtml = `<span class="estado-pill en-mesa">⏳ Atendiendo en Sillón (desde ${esc(v.inicioReal || v.inicio || '10:00')})</span>`;
  if (est === 'cobrado') pillHtml = `<span class="estado-pill cobrado">✔ Ficha Guardada y Cobrada</span>`;

  cont.innerHTML = `
    <div class="atencion-card">
      <div class="atencion-hero">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          ${pillHtml}
          <button class="mini" style="background:rgba(255,255,255,0.16) !important; border:0; color:#fff !important; padding:4px 10px;" onclick="cerrarPanelAtencionPelo()">✕ Cerrar</button>
        </div>

        <div class="atencion-clienta-nombre">${esc(clientaNombre)}</div>

        <div style="font-size:13px; opacity:0.92; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:6px;">
          <span>💇‍♀️ Yamina · <strong>${esc(v.servicio)}</strong> · 🕒 ${esc(v.inicio || '10:00')} a ${esc(v.fin || '11:30')} hs</span>
          <div style="display:flex; gap:6px;">
            <button class="mini" style="background:rgba(255,255,255,0.18) !important; border:0; color:#fff !important; padding:4px 10px;" onclick="agendarEnCalendarioNativo(${v.id})">📅 Calendario Celu</button>
            ${cObj?.tel ? `<button class="mini excel-btn" style="padding:4px 10px;" onclick="abrirWppClienta('${esc(cObj.tel)}', '${esc(clientaNombre)}')">💬 WhatsApp</button>` : ''}
          </div>
        </div>
      </div>

      ${cObj?.alerta ? `
        <div class="alerta-box" style="margin-bottom:12px;">
          <span>⚠️</span>
          <div><strong>Alerta Capilar:</strong> ${esc(cObj.alerta)}</div>
        </div>
      ` : ''}

      ${ultFormula ? `
        <div style="background:var(--p-rose-soft); border:1px dashed var(--p-rose); border-radius:16px; padding:12px 14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <small style="font-weight:800; color:var(--p-rose-deep); text-transform:uppercase; font-size:10.5px;">🧪 Última fórmula de ${esc(clientaNombre)} (${esc(ultFormula.fecha)})</small>
            ${est === 'en_sillon' ? `<button type="button" class="mini noir-btn" style="padding:4px 10px; font-size:11px;" onclick="usarFormulaEnSillon('${esc(ultFormula.formula)}')">🔄 Repetir esta fórmula</button>` : ''}
          </div>
          <div style="font-size:12.5px; color:var(--txt); font-weight:600; margin-top:4px;">${esc(ultFormula.formula)}</div>
        </div>
      ` : ''}

      ${est === 'pendiente' ? `
        <div style="text-align:center; padding:4px 0 8px;">
          <p style="font-size:13px; color:var(--txt-sec); margin:0 0 12px;">
            Cuando <strong>${esc(clientaNombre)}</strong> pase al sillón, tocá el botón para iniciar la atención y cargar su fórmula:
          </p>
          <button class="btn-iniciar-mesa" onclick="iniciarAtencionPelo(${v.id})">
            ▶️ INICIAR ATENCIÓN EN SILLÓN
          </button>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="mini btn-sec" style="flex:1; padding:10px;" onclick="pasarACobroPelo(${v.id})">🧪 Cargar Fórmula y Cobrar</button>
            <button class="mini danger" style="padding:10px 14px;" onclick="eliminarVisita(${v.id})">🗑️ Cancelar turno</button>
          </div>
        </div>
      ` : ''}

      ${est === 'en_sillon' ? `
        <div>
          <label style="margin-top:0;">Trabajo Realizado</label>
          <div class="chips" id="sillon_serv_chips"></div>

          <div id="sillon_tecnica_dinamica"></div>

          <label>✍️ Resumen / Ajuste Manual de Fórmula (opcional)</label>
          <input id="sillon_formula_manual" value="${esc(v.formula || '')}" placeholder="Si repetiste fórmula o querés agregar una nota rápida aparece acá...">

          <div style="margin-top:14px; border-top:1px dashed var(--p-rose-border); padding-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="margin:0;">🛍️ Venta de Productos (opcional)</label>
              <button type="button" class="mini" onclick="agregarProductoVenta('', '', 'sillon_productos')">+ Agregar producto</button>
            </div>
            <div id="sillon_productos" style="margin-top:8px;"></div>
          </div>

          <div style="margin-top:14px; border-top:1px solid var(--border); padding-top:12px;">
            <label style="margin-top:0; font-size:12px; color:var(--p);">💵 Monto Total a Cobrar ($)</label>
            <input id="sillon_total" type="number" value="${v.total || ''}" placeholder="Ej: 38000" style="font-size:18px; font-weight:800; background:#fff !important; border-color:var(--p) !important;">

            <label>Modalidad de Pago</label>
            <select id="sillon_pago_tipo" onchange="togglePagoMixtoSillon()">
              <option value="simple">Pago Simple (un solo medio)</option>
              <option value="mixto">Pago Mixto (Efectivo + Transferencia)</option>
            </select>

            <div id="sillon_caja_simple" style="margin-top:8px;">
              <div class="chips" id="sillon_pago_chips"></div>
            </div>

            <div id="sillon_caja_mixto" style="display:none; margin-top:10px; background:var(--p-rose-soft); border:1px solid var(--p-rose-border); border-radius:16px; padding:12px;">
              <div class="row2">
                <div>
                  <label style="margin-top:0;">Efectivo ($)</label>
                  <input id="sillon_pago_efec" type="number" placeholder="Ej: 20000" style="background:#fff !important;">
                </div>
                <div>
                  <label style="margin-top:0;">Transferencia ($)</label>
                  <input id="sillon_pago_transf" type="number" placeholder="Ej: 18000" style="background:#fff !important;">
                </div>
              </div>
            </div>

            <button class="btn-finalizar-mesa" onclick="finalizarYCobrarPelo(${v.id})">
              ✨ FINALIZAR ATENCIÓN, GUARDAR FICHA Y COBRAR
            </button>
          </div>
        </div>
      ` : ''}

      ${est === 'cobrado' ? `
        <div>
          <div style="background:var(--g-bg); border:1px solid var(--g-border); border-radius:16px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--g); display:block;">Total Cobrado (100% Yamina)</span>
              <strong style="font-family:var(--font-serif); font-size:24px; color:var(--g);">${money(v.total)}</strong>
            </div>
            <div style="text-align:right;">
              <span style="font-size:12px; font-weight:700; color:var(--txt-sec); display:block;">Medio de Pago</span>
              <strong style="font-size:14px; color:var(--txt);">${esc(v.pago)}</strong>
            </div>
          </div>
          <div style="margin-top:10px; font-size:13px; color:var(--txt); background:var(--p-rose-soft); border:1px solid var(--p-rose-border); padding:11px 14px; border-radius:14px;">
            <strong>🧪 Fórmula aplicada:</strong> ${esc(v.formula || 'Sin fórmula especificada')}
          </div>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <button class="mini btn-sec" style="flex:1; padding:10px;" onclick="reabrirVisitaPelo(${v.id})">✏️ Modificar Fórmula / Cobro</button>
            <button class="mini danger" style="padding:10px 14px;" onclick="eliminarVisita(${v.id})">🗑️ Borrar</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if ($('sillon_serv_chips')) {
    const SERVICIOS_DOCX = [
      'Tintura', 'Mechas / Reflejos', 'Hidratación / Botox',
      'Alisado / Keratina', 'Corte / Split Ender', 'Peinado'
    ];
    chips($('sillon_serv_chips'), SERVICIOS_DOCX.map(s => [s, s]), s => {
      servicioSillonActivo = s;
      renderFormularioTecnico('sillon_tecnica_dinamica', s, 'sil_');
    });
    elegir($('sillon_serv_chips'), servicioSillonActivo);
    renderFormularioTecnico('sillon_tecnica_dinamica', servicioSillonActivo, 'sil_');
  }

  if ($('sillon_pago_chips')) {
    chips($('sillon_pago_chips'), PAGOS);
    elegir($('sillon_pago_chips'), v.pago && !v.pago.startsWith('Mixto') ? v.pago : 'Efectivo');
  }
}

function usarFormulaEnSillon(formulaStr) {
  if ($('sillon_formula_manual')) {
    $('sillon_formula_manual').value = formulaStr;
    toast('🔄 Fórmula anterior copiada en la ficha ✔');
  }
}

function togglePagoMixtoSillon() {
  const tipo = $('sillon_pago_tipo')?.value;
  if ($('sillon_caja_simple')) $('sillon_caja_simple').style.display = tipo === 'simple' ? 'block' : 'none';
  if ($('sillon_caja_mixto')) $('sillon_caja_mixto').style.display = tipo === 'mixto' ? 'block' : 'none';
}

async function iniciarAtencionPelo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;
  v.estado = 'en_sillon';
  v.inicioReal = horaAhoraTexto();
  guardarLocalDB();
  await DB_API.saveVisita(v);
  toast('▶️ ¡Atención iniciada en el sillón de Yamina!');
  renderPanelAtencionPelo();
  calPeloRender();
  cargarInicio();
}

async function pasarACobroPelo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;
  v.estado = 'en_sillon';
  v.inicioReal = v.inicioReal || v.inicio || '10:00';
  guardarLocalDB();
  await DB_API.saveVisita(v);
  renderPanelAtencionPelo();
  calPeloRender();
}

async function finalizarYCobrarPelo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;

  const montoFinal = Number($('sillon_total')?.value || 0);
  if (!montoFinal || montoFinal <= 0) {
    $('sillon_total')?.focus();
    return toast('Ingresá el monto total a cobrar', true);
  }

  const fManual = ($('sillon_formula_manual')?.value || '').trim();
  const fCompilada = compilarFormulaTexto('sil_', servicioSillonActivo, 'sillon_productos');
  const formulaFinal = fManual ? (fCompilada && !fManual.includes(fCompilada) ? `${fManual} — ${fCompilada}` : fManual) : fCompilada;

  let pagoFinal = valor($('sillon_pago_chips')) || 'Efectivo';
  if ($('sillon_pago_tipo')?.value === 'mixto') {
    const ef = Number($('sillon_pago_efec')?.value || 0);
    const tr = Number($('sillon_pago_transf')?.value || 0);
    pagoFinal = `Mixto ($${ef} Efec + $${tr} Transf)`;
  }

  v.servicio = servicioSillonActivo;
  v.formula = formulaFinal;
  v.total = montoFinal;
  v.pago = pagoFinal;
  v.estado = 'cobrado';

  guardarLocalDB();
  await DB_API.saveVisita(v);
  syncGoogleSheetsVisita(v, false);

  toast('✨ ¡Atención y fórmula técnica guardadas con éxito!');
  renderPanelAtencionPelo();
  calPeloRender();
  cargarInicio();
}

async function reabrirVisitaPelo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;
  v.estado = 'en_sillon';
  guardarLocalDB();
  await DB_API.saveVisita(v);
  renderPanelAtencionPelo();
  calPeloRender();
  cargarInicio();
}

// Botón universal para guardar el turno en iPhone (iOS Calendar) o Google Calendar con 1 toque
function agendarEnCalendarioNativo(id) {
  const v = visitas.find(x => x.id === Number(id));
  if (!v) return;
  const cObj = clientas.find(c => c.id === v.cid);
  const clientaNombre = cObj?.nombre || v.clienta_nombre || 'Clienta';
  const fechaLimpia = (v.fecha || hoy()).replace(/-/g, '');
  const iniLimpia = (v.inicio || '10:00').replace(':', '') + '00';
  const finLimpia = (v.fin || '11:30').replace(':', '') + '00';

  const titulo = `✂️ OLALÁ: ${clientaNombre} (${v.servicio})`;
  const detalles = `Clienta: ${clientaNombre}${cObj?.tel ? ' - Tel: ' + cObj.tel : ''}${v.formula ? ' - Fórmula: ' + v.formula : ''}`;

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fechaLimpia}T${iniLimpia}/${fechaLimpia}T${finLimpia}&details=${encodeURIComponent(detalles)}`;
  window.open(gcalUrl, '_blank');
}

// ---------- REGISTRAR Y ATENDER TURNO UÑAS ----------
function prepararTurno() {
  $('t_clienta').innerHTML = '<option value="">— Elegir de lista (o escribir abajo) —</option>' + clientas.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join('');
  if (!$('t_fecha').value) $('t_fecha').value = hoy();
  if (!$('t_inicio').value) horaAhora();
  if (!valor($('t_dur'))) elegir($('t_dur'), '60');
  actualizarFin(duracionActual());
  if (!calFecha) calFecha = hoy();
  renderPanelAtencion();
  calRender();
}

function horaAhoraTexto() {
  const n = new Date();
  return String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}

function horaAhora() {
  $('t_inicio').value = horaAhoraTexto();
  actualizarFin(duracionActual());
}
function duracionActual() { return +valor($('t_dur')) || 60; }
function actualizarFin(min) { if ($('t_inicio').value) $('t_fin').value = sumarMin($('t_inicio').value, min); }

async function guardarTurno(modoEstado = 'pendiente') {
  const fecha = $('t_fecha').value;
  const ini = $('t_inicio').value;
  const fin = $('t_fin').value;
  const trab = valor($('t_trab')) || 'Semipermanente';
  const mId = U.rol === 'duena' ? valor($('t_manic')) : U.key;
  const monto = +$('t_monto').value || 0;
  const det = $('t_detalle').value.trim();
  const cid = $('t_clienta').value;
  const manual = $('t_clienta_manual').value.trim();

  if (!fecha || !ini || !fin) return toast('Completá fecha y horario', true);
  if (!cid && !manual) return toast('Elegí o escribí la clienta', true);
  if (modoEstado === 'cobrado' && !monto) return toast('Ingresá el monto cobrado', true);

  let finalCid = cid;
  let finalNom = manual;
  if (!finalCid && manual) {
    const nuevaC = { id: 'c_' + Date.now(), nombre: manual, tel: '', alerta: '', obs: 'Agendada en turno de uñas' };
    clientas.push(nuevaC);
    await DB_API.saveCliente(nuevaC);
    finalCid = nuevaC.id;
  } else if (finalCid) {
    finalNom = clientas.find(c => c.id === finalCid)?.nombre || 'Clienta';
  }

  const nuevoTurno = {
    id: Date.now(),
    mId,
    fecha,
    inicio: ini,
    fin,
    trabajo: trab,
    detalle: det,
    monto,
    pago: valor($('t_pago')) || 'Efectivo',
    estado: modoEstado,
    inicioReal: modoEstado === 'cobrado' ? ini : '',
    cid: finalCid,
    clientaManual: finalNom
  };

  turnos.push(nuevoTurno);
  guardarLocalDB();
  await DB_API.saveTurno(nuevoTurno);
  if (modoEstado === 'cobrado') {
    syncGoogleSheetsTurno(nuevoTurno);
  }

  toast(modoEstado === 'pendiente' ? '📅 Turno agendado en mesa ✔' : '✔ Turno registrado y cobrado');
  $('t_monto').value = '';
  $('t_detalle').value = '';
  $('t_clienta_manual').value = '';
  calFecha = fecha;
  turnoActivoId = nuevoTurno.id;
  prepararTurno();
  cargarInicio();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- MODO MESA EN VIVO (INICIAR, SUMAR ADICIONALES Y COBRAR) ----------
function seleccionarTurno(id) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;
  if (U.rol !== 'duena' && t.mId !== U.key) {
    return toast(`🔒 Turno de la agenda de ${PERSONAS[t.mId]?.nombre || t.mId}`);
  }
  turnoActivoId = t.id;
  renderPanelAtencion();
  calRender();
  const el = $('panel_atencion_turno');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarPanelAtencion() {
  turnoActivoId = null;
  renderPanelAtencion();
  calRender();
}

function renderPanelAtencion() {
  const cont = $('panel_atencion_turno');
  if (!cont) return;

  const t = turnos.find(x => x.id === Number(turnoActivoId));
  if (!t || (U && U.rol !== 'duena' && t.mId !== U.key)) {
    cont.innerHTML = '';
    return;
  }

  const cObj = clientas.find(c => c.id === t.cid);
  const clientaNombre = cObj?.nombre || t.clientaManual || 'Clienta';
  const prof = PERSONAS[t.mId] || { nombre: t.mId, icono: '💅' };
  const est = estadoDeTurno(t);

  let pillHtml = `<span class="estado-pill pendiente">🕒 Turno Agendado · En Espera</span>`;
  if (est === 'en_mesa') pillHtml = `<span class="estado-pill en-mesa">⏳ Atendiendo en Mesa Ahora (desde ${esc(t.inicioReal || t.inicio)})</span>`;
  if (est === 'cobrado') pillHtml = `<span class="estado-pill cobrado">✔ Atención Finalizada y Cobrada</span>`;

  cont.innerHTML = `
    <div class="atencion-card">
      <div class="atencion-hero">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          ${pillHtml}
          <button class="mini" style="background:rgba(255,255,255,0.16) !important; border:0; color:#fff !important; padding:4px 10px;" onclick="cerrarPanelAtencion()">✕ Cerrar</button>
        </div>

        <div class="atencion-clienta-nombre">${esc(clientaNombre)}</div>

        <div style="font-size:13px; opacity:0.92; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:6px;">
          <span>${prof.icono} ${esc(prof.nombre)} · <strong>${esc(t.trabajo)}</strong> · 🕒 ${esc(t.inicio)} a ${esc(t.fin)} hs</span>
          ${cObj?.tel ? `<button class="mini excel-btn" style="padding:4px 10px;" onclick="abrirWppClienta('${esc(cObj.tel)}', '${esc(clientaNombre)}')">💬 WhatsApp</button>` : ''}
        </div>
      </div>

      ${est === 'pendiente' ? `
        <div style="text-align:center; padding:4px 0 8px;">
          <p style="font-size:13px; color:var(--txt-sec); margin:0 0 12px;">
            Cuando <strong>${esc(clientaNombre)}</strong> se siente en la mesa, pulsá el botón para iniciar la atención:
          </p>
          <button class="btn-iniciar-mesa" onclick="iniciarAtencionTurno(${t.id})">
            ▶️ INICIAR ATENCIÓN EN MESA
          </button>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="mini btn-sec" style="flex:1; padding:10px;" onclick="pasarACobroTurno(${t.id})">💳 Ir directo a Cobrar</button>
            <button class="mini danger" style="padding:10px 14px;" onclick="eliminarTurno(${t.id})">🗑️ Cancelar turno</button>
          </div>
        </div>
      ` : ''}

      ${est === 'en_mesa' ? `
        <div>
          <label style="margin-top:0;">➕ Sumar Adicionales Rápidos (1 toque)</label>
          <div class="extras-grid">
            <button type="button" class="extra-chip" onclick="agregarExtraTurno(${t.id}, 'Retiro', 3000)">+ Retiro ($3.000)</button>
            <button type="button" class="extra-chip" onclick="agregarExtraTurno(${t.id}, 'Nail Art / Diseño', 2500)">+ Nail Art ($2.500)</button>
            <button type="button" class="extra-chip" onclick="agregarExtraTurno(${t.id}, 'French / Baby Boomer', 2000)">+ French / Boomer ($2.000)</button>
            <button type="button" class="extra-chip" onclick="agregarExtraTurno(${t.id}, 'Strass / Deco', 1500)">+ Strass ($1.500)</button>
            <button type="button" class="extra-chip" onclick="agregarExtraTurno(${t.id}, 'Reconstrucción uña', 2000)">+ Uña rota ($2.000)</button>
          </div>

          <label>💅 Detalle de Color, Base y Trabajo Realizado</label>
          <input id="at_detalle" value="${esc(t.detalle || '')}" placeholder="Ej: Base ruber vía láctea + French blanca...">

          <div style="margin-top:14px; border-top:1px solid var(--border); padding-top:12px;">
            <label style="margin-top:0; font-size:12px; color:var(--p);">💵 Total a Cobrar a ${esc(clientaNombre)} ($)</label>
            <input id="at_monto" type="number" value="${t.monto || ''}" placeholder="Ingresá el monto final a cobrar (ej: 18000)" style="font-size:18px; font-weight:800; background:#fff !important; border-color:var(--p) !important;">

            <label>Modalidad de Pago</label>
            <select id="at_pago_tipo" onchange="togglePagoMixtoTurno()">
              <option value="simple">Pago Simple (un solo medio)</option>
              <option value="mixto">Pago Mixto (Efectivo + Transferencia)</option>
            </select>

            <div id="at_caja_simple" style="margin-top:8px;">
              <div class="chips" id="at_pago_chips"></div>
            </div>

            <div id="at_caja_mixto" style="display:none; margin-top:10px; background:var(--p-rose-soft); border:1px solid var(--p-rose-border); border-radius:16px; padding:12px;">
              <div class="row2">
                <div>
                  <label style="margin-top:0;">Efectivo ($)</label>
                  <input id="at_pago_efec" type="number" placeholder="Ej: 10000" style="background:#fff !important;">
                </div>
                <div>
                  <label style="margin-top:0;">Transferencia ($)</label>
                  <input id="at_pago_transf" type="number" placeholder="Ej: 8000" style="background:#fff !important;">
                </div>
              </div>
            </div>

            <button class="btn-finalizar-mesa" onclick="finalizarYCobrarTurno(${t.id})">
              ✨ FINALIZAR ATENCIÓN Y COBRAR
            </button>
          </div>
        </div>
      ` : ''}

      ${est === 'cobrado' ? `
        <div>
          <div style="background:var(--g-bg); border:1px solid var(--g-border); border-radius:16px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--g); display:block;">Total Cobrado</span>
              <strong style="font-family:var(--font-serif); font-size:24px; color:var(--g);">${money(t.monto)}</strong>
            </div>
            <div style="text-align:right;">
              <span style="font-size:12px; font-weight:700; color:var(--txt-sec); display:block;">Medio de Pago</span>
              <strong style="font-size:14px; color:var(--txt);">${esc(t.pago)}</strong>
            </div>
          </div>
          ${t.detalle ? `<div style="margin-top:10px; font-size:13px; color:var(--txt-sec); background:var(--p-rose-soft); padding:10px 14px; border-radius:12px;"><strong>Trabajo y diseño:</strong> ${esc(t.detalle)}</div>` : ''}
          <div style="display:flex; gap:8px; margin-top:12px;">
            <button class="mini btn-sec" style="flex:1; padding:10px;" onclick="reabrirTurno(${t.id})">✏️ Modificar / Editar Cobro</button>
            <button class="mini danger" style="padding:10px 14px;" onclick="eliminarTurno(${t.id})">🗑️ Borrar</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if ($('at_pago_chips')) {
    chips($('at_pago_chips'), PAGOS);
    elegir($('at_pago_chips'), t.pago && !t.pago.startsWith('Mixto') ? t.pago : 'Efectivo');
  }
}

async function iniciarAtencionTurno(id) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;
  t.estado = 'en_mesa';
  t.inicioReal = horaAhoraTexto();
  guardarLocalDB();
  await DB_API.saveTurno(t);
  toast('▶️ ¡Atención iniciada en mesa!');
  renderPanelAtencion();
  calRender();
  cargarInicio();
}

async function pasarACobroTurno(id) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;
  t.estado = 'en_mesa';
  t.inicioReal = t.inicioReal || t.inicio;
  guardarLocalDB();
  await DB_API.saveTurno(t);
  renderPanelAtencion();
  calRender();
}

function agregarExtraTurno(id, extraNom, extraPrecio) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;
  const detInput = $('at_detalle');
  const montoInput = $('at_monto');
  if (detInput) {
    const actual = detInput.value.trim();
    detInput.value = actual ? `${actual} + ${extraNom}` : extraNom;
    t.detalle = detInput.value;
  }
  if (montoInput) {
    const actualMonto = Number(montoInput.value) || 0;
    montoInput.value = actualMonto + Number(extraPrecio || 0);
    t.monto = Number(montoInput.value);
  }
  toast(`➕ Se sumó ${extraNom}`);
}

function togglePagoMixtoTurno() {
  const tipo = $('at_pago_tipo')?.value;
  if ($('at_caja_simple')) $('at_caja_simple').style.display = tipo === 'simple' ? 'block' : 'none';
  if ($('at_caja_mixto')) $('at_caja_mixto').style.display = tipo === 'mixto' ? 'block' : 'none';
}

async function finalizarYCobrarTurno(id) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;

  const montoFinal = Number($('at_monto')?.value || 0);
  if (!montoFinal || montoFinal <= 0) {
    $('at_monto')?.focus();
    return toast('Ingresá el monto total a cobrar', true);
  }

  let pagoFinal = valor($('at_pago_chips')) || 'Efectivo';
  if ($('at_pago_tipo')?.value === 'mixto') {
    const ef = Number($('at_pago_efec')?.value || 0);
    const tr = Number($('at_pago_transf')?.value || 0);
    pagoFinal = `Mixto ($${ef} Efec + $${tr} Transf)`;
  }

  t.detalle = ($('at_detalle')?.value || '').trim();
  t.monto = montoFinal;
  t.pago = pagoFinal;
  t.estado = 'cobrado';

  guardarLocalDB();
  await DB_API.saveTurno(t);
  syncGoogleSheetsTurno(t);

  toast('✨ ¡Atención finalizada y cobrada con éxito!');
  renderPanelAtencion();
  calRender();
  cargarInicio();
}

async function reabrirTurno(id) {
  const t = turnos.find(x => x.id === Number(id));
  if (!t) return;
  t.estado = 'en_mesa';
  guardarLocalDB();
  await DB_API.saveTurno(t);
  renderPanelAtencion();
  calRender();
  cargarInicio();
}

async function eliminarTurno(id) {
  if (!confirm('¿Eliminar este turno de uñas?')) return;
  turnos = turnos.filter(t => t.id !== Number(id));
  if (turnoActivoId === Number(id)) turnoActivoId = null;
  guardarLocalDB();
  await DB_API.deleteTurno(id);
  toast('Turno eliminado');
  prepararTurno();
  cargarInicio();
}

async function eliminarVisita(id) {
  if (!confirm('¿Eliminar este turno / registro de peluquería?')) return;
  visitas = visitas.filter(v => v.id !== Number(id));
  if (visitaActivaId === Number(id)) visitaActivaId = null;
  guardarLocalDB();
  await DB_API.deleteVisita(id);
  toast('Registro eliminado');
  prepararVisitaPelo();
  cargarInicio();
}

function calMover(n) {
  const x = new Date((calFecha || hoy()) + 'T12:00:00');
  x.setDate(x.getDate() + n);
  calFecha = iso(x);
  calRender();
}

function calRender() {
  if (!calFecha) calFecha = hoy();
  const HORA_PX = 52, H_INI = 8, H_FIN = 22;
  const horas = []; for (let h = H_INI; h < H_FIN; h++) horas.push(h);
  const alto = horas.length * HORA_PX;

  $('calLbl').textContent = (calFecha === hoy() ? 'Hoy · ' : '') +
    new Date(calFecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'short' });

  const manicuristas = [
    { key: 'katya', nombre: '💅 Katya (Mesa 1)', bg: '#fdf2f6', col: '#a83868' },
    { key: 'gisel', nombre: '✨ Gisel (Mesa 2)', bg: '#f6f2fb', col: '#644190' }
  ];

  const dia = turnos.filter(t => t.fecha === calFecha).sort((a,b) => a.inicio < b.inicio ? -1 : 1);

  // Renderizar tira rápida de clientas del día para la usuaria activa
  const misTurnosDia = U && U.rol !== 'duena' ? dia.filter(t => t.mId === U.key) : dia;
  if ($('cola_turnos_dia')) {
    $('cola_turnos_dia').innerHTML = misTurnosDia.length ? `
      <div class="cola-dia-wrap">
        ${misTurnosDia.map(t => {
          const cli = clientas.find(c => c.id === t.cid)?.nombre || t.clientaManual || 'Clienta';
          const est = estadoDeTurno(t);
          const iconoEst = est === 'en_mesa' ? '⏳' : (est === 'cobrado' ? '✔' : '🕒');
          return `
            <button type="button" class="turno-cola-btn ${turnoActivoId === t.id ? 'activo' : ''}" onclick="seleccionarTurno(${t.id})">
              <b>${iconoEst} ${esc(cli)}</b>
              <small>${t.inicio} hs · ${esc(t.trabajo)}</small>
            </button>
          `;
        }).join('')}
      </div>
    ` : '';
  }

  // Alerta de superposición en mesa compartida
  let hayConflictoMesa = false;
  for (let i = 0; i < dia.length; i++) {
    for (let j = i + 1; j < dia.length; j++) {
      if (dia[i].mId !== dia[j].mId) {
        const s1 = minutos(dia[i].inicio), e1 = minutos(dia[i].fin);
        const s2 = minutos(dia[j].inicio), e2 = minutos(dia[j].fin);
        if (Math.max(s1, s2) < Math.min(e1, e2)) {
          hayConflictoMesa = true;
          break;
        }
      }
    }
  }
  $('aviso_mesa').style.display = hayConflictoMesa ? 'flex' : 'none';

  const gutter = `<div class="cal-h"><div style="height:32px;border:0"></div>${horas.map(h => `<div>${String(h).padStart(2,'0')}:00</div>`).join('')}</div>`;

  const cols = manicuristas.map(m => {
    const bl = dia.filter(t => t.mId === m.key).map(t => {
      const s = minutos(t.inicio), e = minutos(t.fin) || s + 60;
      const top = (s - H_INI*60) / 60 * HORA_PX;
      const h = Math.max((e - s) / 60 * HORA_PX, 28);
      const esMio = !U || U.rol === 'duena' || t.mId === U.key;
      const clienta = clientas.find(c => c.id === t.cid)?.nombre || t.clientaManual || 'Clienta';
      const est = estadoDeTurno(t);
      const tagEst = est === 'en_mesa' ? '⏳ EN MESA' : (est === 'cobrado' ? '✔' : '🕒');
      const bordeActivo = turnoActivoId === t.id ? 'outline: 3px solid #161416; z-index:5;' : '';

      return `
        <div class="bloque" onclick="seleccionarTurno(${t.id})" title="Tocá para abrir atención"
          style="top:${top}px; height:${h}px; background-color:${m.col}; opacity:${esMio ? '1' : '0.68'}; ${bordeActivo}">
          <b>${tagEst} ${esc(esMio ? clienta : 'Mesa reservada')}</b>
          <span>${t.inicio}–${t.fin}${esMio ? ' · ' + esc(t.trabajo) : ''}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="cal-col">
        <div class="cal-tit" style="background-color:${m.bg}; color:${m.col};">${esc(m.nombre)}</div>
        <div class="cal-grid" style="height:${alto}px">${horas.map(() => '<div class="cal-hora"></div>').join('')}${bl}</div>
      </div>
    `;
  }).join('');

  $('calCont').innerHTML = `<div class="cal-wrap">${gutter}${cols}</div>${dia.length ? '' : '<div class="vacio">No hay turnos agendados en esta fecha</div>'}`;
}

// ---------- CAJA Y REPORTES (Yamina) ----------
function cargarReporte() {
  const [a,b] = rango(repPeriodo);
  const vs = visitas.filter(v => v.fecha >= a && v.fecha <= b && estadoDeVisita(v) === 'cobrado');
  const ts = turnos.filter(t => t.fecha >= a && t.fecha <= b && estadoDeTurno(t) === 'cobrado');

  const peluq = vs.reduce((s,v) => s + v.total, 0);
  const manGen = ts.reduce((s,t) => s + t.monto, 0);
  const aCobrarYamina = comisionDuena(manGen);
  const ticketPromedio = vs.length ? Math.round(peluq / vs.length) : 0;

  const ranking = {};
  vs.forEach(v => { ranking[v.servicio] = (ranking[v.servicio] || 0) + 1; });
  const rankingList = Object.entries(ranking).sort((x,y) => y[1] - x[1]);

  const ultimasVisitas = {};
  visitas.forEach(v => {
    if (!ultimasVisitas[v.cid] || v.fecha > ultimasVisitas[v.cid]) ultimasVisitas[v.cid] = v.fecha;
  });
  const hoyD = new Date(hoy() + 'T00:00:00');
  const inactivas = clientas.map(c => {
    const ult = ultimasVisitas[c.id];
    if (!ult) return null;
    const dias = Math.round((hoyD - new Date(ult + 'T00:00:00')) / 86400000);
    return dias >= 45 ? { id: c.id, nombre: c.nombre, tel: c.tel, dias, ult } : null;
  }).filter(Boolean).sort((x,y) => y.dias - x.dias);

  $('repCont').innerHTML = `
    <div class="kpis">
      <div class="kpi rose"><small>Peluquería (100%)</small><big>${money(peluq)}</big><small>${vs.length} atenciones</small></div>
      <div class="kpi verde"><small>Comisiones Uñas (40%)</small><big>${money(aCobrarYamina)}</big><small>${ts.length} turnos</small></div>
      <div class="kpi noir"><small>Ganancia Total</small><big>${money(peluq + aCobrarYamina)}</big><small>Caja neta</small></div>
      <div class="kpi"><small>Ticket Promedio</small><big>${money(ticketPromedio)}</big><small>Peluquería</small></div>
    </div>

    <div class="card">
      <h3>🏆 Servicios Más Solicitados</h3>
      ${rankingList.length ? rankingList.map(([serv, cant], idx) => `
        <div class="item">
          <div><b>${idx + 1}. ${esc(serv)}</b></div>
          <div><span class="mini" style="pointer-events:none;">${cant} ${cant === 1 ? 'atención' : 'atenciones'}</span></div>
        </div>
      `).join('') : '<div class="vacio">Sin servicios registrados en este período</div>'}
    </div>

    <div class="card">
      <h3>📲 Liquidación de Comisiones por WhatsApp</h3>
      <p class="section-sub">Enviá con un toque el detalle de turnos y el 40% que corresponde transferir al salón:</p>
      ${['katya', 'gisel'].map(k => {
        const p = PERSONAS[k];
        const misT = ts.filter(t => t.mId === k);
        const tot = misT.reduce((s,t) => s + t.monto, 0);
        const aYamina = comisionDuena(tot);
        const su60 = gananciaChica(tot);
        return `
          <div class="wpp-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <b style="font-family:var(--font-serif); font-size:17px;">${p.icono} ${p.nombre}</b>
              <span style="font-size:13px; font-weight:700; color:var(--txt-sec);">Recaudó: ${money(tot)} (${misT.length} turnos)</span>
            </div>
            <div style="font-size:13px; margin-top:6px; color:var(--txt-sec); display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span>Su ganancia (60%): <strong style="color:var(--g);">${money(su60)}</strong></span>
              <span>A rendir a Yamina (40%): <strong style="color:var(--p); font-size:14px;">${money(aYamina)}</strong></span>
            </div>
            <div style="display:flex; gap:8px; margin-top:12px;">
              <button class="mini noir-btn" style="flex:1; padding:9px;" onclick="enviarWpp('${p.nombre}', ${misT.length}, ${tot}, ${su60}, ${aYamina})">
                📲 Enviar por WhatsApp
              </button>
              <button class="mini btn-sec" style="padding:9px 14px;" onclick="copiarWpp('${p.nombre}', ${misT.length}, ${tot}, ${su60}, ${aYamina})">
                📋 Copiar
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <h3>🌸 Radar de Clientas Inactivas (+45 días)</h3>
      <p class="section-sub">Clientas que no registran visitas recientes para recuperar por WhatsApp</p>
      ${inactivas.length ? inactivas.map(c => `
        <div class="item">
          <div>
            <b>${esc(c.nombre)}</b>
            <small>Hace ${c.dias} días sin visita (Última: ${esc(c.ult)})</small>
          </div>
          <div>
            ${c.tel ? `<button class="mini excel-btn" onclick="abrirWppClienta('${esc(c.tel)}', '${esc(c.nombre)}')">💬 Contactar</button>` : ''}
          </div>
        </div>
      `).join('') : '<div class="vacio">¡Todas las clientas están al día con sus visitas! ✨</div>'}
    </div>
  `;
}

function armarTextoWpp(nombre, cant, tot, su60, aYamina) {
  return `✂️ *OLALÁ ESTILISTA* · Rendición de Manicuría\n\n` +
         `¡Hola ${nombre}! Te comparto el resumen del período:\n` +
         `💅 Turnos realizados: ${cant}\n` +
         `💵 Total cobrado: $${tot.toLocaleString('es-AR')}\n\n` +
         `✨ *Tu ganancia (60%): $${su60.toLocaleString('es-AR')}*\n` +
         `🏛️ *A rendir a Yamina (40% salón): $${aYamina.toLocaleString('es-AR')}*\n\n` +
         `¡Muchas gracias! 🌸`;
}

function enviarWpp(nombre, cant, tot, su60, aYamina) {
  const txt = armarTextoWpp(nombre, cant, tot, su60, aYamina);
  const url = `https://wa.me/?text=${encodeURIComponent(txt)}`;
  window.open(url, '_blank');
}

function copiarWpp(nombre, cant, tot, su60, aYamina) {
  const txt = armarTextoWpp(nombre, cant, tot, su60, aYamina);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => toast('Texto copiado al portapapeles ✔'));
  } else {
    alert(txt);
  }
}


// ---------- EXPORTACIÓN A EXCEL Y GOOGLE SHEETS EN VIVO ----------
function descargarExcelHistoriasClinicas() {
  if (!visitas || !visitas.length) return toast('No hay atenciones de peluquería registradas', true);

  const cabeceras = [
    'Fecha',
    'Clienta',
    'Teléfono',
    'Servicio Realizado',
    'Fórmula Técnica Aplicada (Tinturas, Gramos, Oxidante)',
    'Total Cobrado ($)',
    'Forma de Pago',
    'Alerta Capilar',
    'Observaciones Clienta'
  ];

  const filas = visitas.map(v => {
    const c = clientas.find(x => x.id === v.cid) || {};
    const celda = t => '"' + String(t ?? '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ') + '"';
    return [
      celda(v.fecha),
      celda(c.nombre || 'Clienta'),
      celda(c.tel || 'Sin teléfono'),
      celda(v.servicio || ''),
      celda(v.formula || 'Sin fórmula'),
      celda(v.total || 0),
      celda(v.pago || ''),
      celda(c.alerta || ''),
      celda(c.obs || '')
    ].join(';');
  });

  const csv = '\uFEFF' + cabeceras.join(';') + '\n' + filas.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Formulas_Peluqueria_Yamina_${hoy()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('📊 Fórmulas de Yamina descargadas a Excel');
}

function descargarExcelClientas() {
  if (!clientas || !clientas.length) return toast('No hay clientas para exportar', true);

  const cabeceras = ['Nombre', 'Teléfono', 'Cumpleaños', 'Alerta Capilar', 'Observaciones'];
  const filas = clientas.map(c => {
    const celda = t => '"' + String(t ?? '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ') + '"';
    return [
      celda(c.nombre),
      celda(c.tel || ''),
      celda(c.cumple || ''),
      celda(c.alerta || ''),
      celda(c.obs || '')
    ].join(';');
  });

  const csv = '\uFEFF' + cabeceras.join(';') + '\n' + filas.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Directorio_Clientas_Yamina_${hoy()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('👩 Directorio de clientas descargado a Excel');
}

function obtenerUrlPuenteGoogle() {
  return (typeof GOOGLE_BRIDGE_URL_FIJA !== 'undefined' && GOOGLE_BRIDGE_URL_FIJA)
    ? GOOGLE_BRIDGE_URL_FIJA
    : localStorage.getItem('SALON_GOOGLE_SHEETS_URL');
}

async function syncGoogleSheetsVisita(visitaData, soloCalendario = false) {
  const url = obtenerUrlPuenteGoogle();
  if (!url) return;

  const c = clientas.find(x => x.id === visitaData.cid) || {};
  const payload = {
    tipo: soloCalendario ? 'agendar_calendario_pelo' : 'visita_pelo',
    agendarEnCalendario: true,
    fecha: visitaData.fecha,
    inicio: visitaData.inicio || '10:00',
    fin: visitaData.fin || '11:30',
    clienta: c.nombre || visitaData.clienta_nombre || 'Clienta',
    telefono: c.tel || '',
    servicio: visitaData.servicio,
    formula: visitaData.formula,
    total: visitaData.total,
    pago: visitaData.pago,
    alerta: c.alerta || '',
    observaciones: c.obs || ''
  };

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('☁️ Sincronizado automáticamente con Google Drive / Calendar');
  } catch(e) {
    console.warn('Error al enviar al puente de Google:', e);
  }
}

async function syncGoogleCalendarYamina() {
  const url = obtenerUrlPuenteGoogle();
  if (!url) return;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.status === 'ok' && Array.isArray(data.eventos)) {
      let huboNuevos = false;
      for (const ev of data.eventos) {
        const yaExiste = visitas.some(v =>
          v.fecha === ev.fecha &&
          (v.inicio || '10:00') === ev.inicio &&
          (v.clienta_nombre || '').toLowerCase() === (ev.titulo || '').replace('✂️', '').split('·')[0].trim().toLowerCase()
        );
        if (!yaExiste && ev.fecha) {
          const partesTit = (ev.titulo || 'Clienta').replace('✂️', '').split('·');
          const nomCli = partesTit[0].trim() || 'Clienta Calendario';
          const servCli = (partesTit[1] || 'Peluquería').trim();
          const matchC = clientas.find(c => c.nombre.toLowerCase() === nomCli.toLowerCase());
          const nuevaV = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            cid: matchC ? matchC.id : null,
            clienta_nombre: nomCli,
            fecha: ev.fecha,
            inicio: ev.inicio || '10:00',
            fin: ev.fin || '11:00',
            inicioReal: '',
            estado: 'pendiente',
            servicio: servCli,
            formula: ev.descripcion || '',
            total: 0,
            pago: 'Efectivo'
          };
          visitas.push(nuevaV);
          await DB_API.saveVisita(nuevaV);
          huboNuevos = true;
        }
      }
      if (huboNuevos) {
        guardarLocalDB();
        refrescarVistasActuales();
      }
    }
  } catch (e) {
    console.warn('No se pudo leer calendario remoto:', e);
  }
}

async function syncGoogleSheetsTurno(turnoData) {
  const url = obtenerUrlPuenteGoogle();
  if (!url) return;

  const c = clientas.find(x => x.id === turnoData.cid) || {};
  const payload = {
    tipo: 'turno_unas',
    fecha: turnoData.fecha,
    inicio: turnoData.inicio,
    fin: turnoData.fin,
    manicurista: PERSONAS[turnoData.mId]?.nombre || turnoData.mId,
    clienta: c.nombre || turnoData.clientaManual || 'Clienta',
    trabajo: turnoData.trabajo,
    detalle: turnoData.detalle || '',
    total: turnoData.monto,
    pago: turnoData.pago
  };

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('☁️ Turno respaldado en Google Sheets');
  } catch(e) {
    console.warn('Error al enviar turno a Google Sheets:', e);
  }
}

function descargarBackup() {
  const data = JSON.stringify({ turnos, clientas, visitas, personas: PERSONAS }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `salon_backup_${hoy()}.json`;
  a.click();
  toast('Copia de seguridad descargada 📥');
}

function restablecerDatosEjemplo() {
  if (!confirm('¿Restablecer los datos de ejemplo con visitas de hoy y de la semana?')) return;
  DB = generarSeedViva();
  turnos = DB.turnos;
  clientas = DB.clientas;
  visitas = DB.visitas;
  guardarLocalDB();
  toast('Datos de ejemplo recargados con éxito ✨');
  cargarInicio();
  if (calFecha) calRender();
}

// Inicializar la aplicación
function init() {
  chips($('per'), [['hoy','Hoy'],['semana','Semana'],['mes','Mes']], v => { periodo = v; cargarInicio(); });
  chips($('rep_per'), [['hoy','Hoy'],['semana','Semana'],['mes','Mes']], v => { repPeriodo = v; cargarReporte(); });
  elegir($('per'),'hoy'); elegir($('rep_per'),'hoy');

  const SERVICIOS_DOCX = [
    'Tintura', 'Mechas / Reflejos', 'Hidratación / Botox',
    'Alisado / Keratina', 'Corte / Split Ender', 'Peinado'
  ];
  chips($('v_serv_chips'), SERVICIOS_DOCX.map(s => [s, s]), s => {
    servicioPeluqueriaActivo = s;
    renderFormularioTecnico();
  });
  elegir($('v_serv_chips'), 'Tintura');

  chips($('v_pago'), PAGOS); elegir($('v_pago'), 'Efectivo');
  chips($('t_pago'), PAGOS); elegir($('t_pago'), 'Efectivo');

  chips($('t_trab'), ['Semipermanente','Capping en acrílico','Soft gel','Poly gel','Retiro'].map(s => [s,s]));
  elegir($('t_trab'), 'Semipermanente');

  chips($('v_dur'), [['30','30 min'],['60','1 h'],['90','1 h 30'],['120','2 h'],['180','3 h']], m => actualizarFinPelo(+m));
  elegir($('v_dur'), '90');

  chips($('t_dur'), [['30','30 min'],['45','45 min'],['60','1 h'],['90','1 h 30']], m => actualizarFin(+m));
  elegir($('t_dur'), '60');

  chips($('t_manic'), [['katya','💅 Katya'],['gisel','✨ Gisel']]);
  elegir($('t_manic'), 'katya');

  if ($('v_inicio')) $('v_inicio').oninput = () => actualizarFinPelo(duracionPeloActual());
  $('t_inicio').oninput = () => actualizarFin(duracionActual());
  $('v_buscar').oninput = e => filtrarSelect(e.target.value);
  $('buscar').oninput = e => renderClientas(e.target.value);
  $('v_clienta').onchange = verHistorial;
  
  renderFormularioTecnico();
  abrirSelectorUsuario();
  sincronizarConSupabase();
  syncGoogleCalendarYamina();
}

window.addEventListener('DOMContentLoaded', init);
