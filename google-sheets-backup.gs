/**
 * ====================================================================
 * PUENTE AUTOMÁTICO GOOGLE DRIVE (EXCEL) + GOOGLE / iOS CALENDAR
 * OLALÁ ESTILISTA (Yamina, Katya y Gisel)
 * ====================================================================
 * 
 * Este script cumple DOS funciones automáticas al mismo tiempo:
 * 1. Guarda cada fórmula técnica de peluquería y cada turno de uñas 
 *    en tiempo real en una planilla de Excel dentro de Google Drive.
 * 2. Sincroniza el Calendario de Peluquería de Yamina con el Calendario 
 *    de su celular (Google Calendar / Calendario nativo de iPhone iOS).
 * 
 * GUÍA RÁPIDA (SE HACE UNA SOLA VEZ):
 * 1. En Google Drive, creá una hoja de cálculo: "Respaldo Olalá Estilista"
 * 2. Andá al menú: Extensiones -> Apps Script.
 * 3. Borrá lo que haya y pegá TODO este código.
 * 4. Tocá arriba a la derecha: Implementar -> Nueva implementación.
 * 5. Elegí tipo: "Aplicación web".
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone)
 * 6. Dale a "Implementar", aceptá los permisos de Drive y Calendar,
 *    y copiá la URL que termina en /exec.
 * ====================================================================
 */

// Opcional: Si el script corre en otra cuenta, podés poner acá el mail de Yamina
const CALENDAR_ID_YAMINA = 'primary'; 

function obtenerCalendario() {
  try {
    if (CALENDAR_ID_YAMINA && CALENDAR_ID_YAMINA !== 'primary') {
      const cal = CalendarApp.getCalendarById(CALENDAR_ID_YAMINA);
      if (cal) return cal;
    }
    return CalendarApp.getDefaultCalendar();
  } catch (e) {
    return CalendarApp.getDefaultCalendar();
  }
}

// --------------------------------------------------------------------
// GET: Lee los turnos del Calendario del celular de Yamina hacia la App
// --------------------------------------------------------------------
function doGet(e) {
  try {
    const cal = obtenerCalendario();
    const desde = new Date();
    desde.setDate(desde.getDate() - 7);
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + 45);

    const eventos = cal.getEvents(desde, hasta);
    const turnosCalendario = eventos.map(ev => {
      const ini = ev.getStartTime();
      const fin = ev.getEndTime();
      const fechaIso = Utilities.formatDate(ini, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const horaIni = Utilities.formatDate(ini, Session.getScriptTimeZone(), 'HH:mm');
      const horaFin = Utilities.formatDate(fin, Session.getScriptTimeZone(), 'HH:mm');
      return {
        calEventId: ev.getId(),
        titulo: ev.getTitle() || 'Turno Peluquería',
        descripcion: ev.getDescription() || '',
        fecha: fechaIso,
        inicio: horaIni,
        fin: horaFin
      };
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', eventos: turnosCalendario }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString(), eventos: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------
// POST: Guarda en Excel (Drive) y agenda en el Calendario del celular
// --------------------------------------------------------------------
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. AGENDAR EN EL CALENDARIO DEL CELULAR DE YAMINA (iPhone / Google)
    if (data.tipo === 'agendar_calendario_pelo' || (data.tipo === 'visita_pelo' && data.agendarEnCalendario)) {
      try {
        const cal = obtenerCalendario();
        const [y, m, d] = (data.fecha || '').split('-').map(Number);
        const [h1, min1] = (data.inicio || '10:00').split(':').map(Number);
        const [h2, min2] = (data.fin || '11:00').split(':').map(Number);

        const startDate = new Date(y, m - 1, d, h1, min1, 0);
        const endDate = new Date(y, m - 1, d, h2, min2, 0);

        const titulo = '✂️ ' + (data.clienta || 'Clienta') + ' · ' + (data.servicio || 'Peluquería');
        const desc = (data.formula ? 'Fórmula / Notas: ' + data.formula + '\n' : '') +
                     (data.telefono ? 'Tel: ' + data.telefono + '\n' : '') +
                     'Agendado desde OLALÁ Estilista';

        const ev = cal.createEvent(titulo, startDate, endDate, { description: desc });
        ev.addPopupReminder(60); // Alarma 1 hora antes en el celular
      } catch (calErr) {
        console.warn('No se pudo crear evento en Calendar:', calErr);
      }
    }

    // 2. RESPALDO DE FÓRMULAS Y ATENCIONES CAPILARES (YAMINA) EN EXCEL
    if (data.tipo === 'visita_pelo') {
      let sheet = ss.getSheetByName('Fórmulas Peluquería');
      if (!sheet) {
        sheet = ss.insertSheet('Fórmulas Peluquería');
        sheet.appendRow([
          'Fecha',
          'Horario',
          'Clienta',
          'Teléfono',
          'Servicio',
          'Fórmula Técnica Aplicada (Tintes, Gramos, Oxidante)',
          'Total Cobrado ($)',
          'Forma de Pago',
          'Alerta Capilar',
          'Notas Clienta',
          'Fecha y Hora de Registro'
        ]);
        const headerRange = sheet.getRange(1, 1, 1, 11);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f8dfe4');
        headerRange.setFontColor('#161416');
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        data.fecha,
        (data.inicio || '10:00') + ' a ' + (data.fin || '11:00'),
        data.clienta,
        data.telefono || 'Sin teléfono',
        data.servicio,
        data.formula || 'Sin fórmula registrada',
        data.total,
        data.pago,
        data.alerta || 'Sin alertas',
        data.observaciones || '',
        new Date().toLocaleString('es-AR')
      ]);
    }

    // 3. RESPALDO DE TURNOS DE UÑAS (KATYA Y GISEL) EN EXCEL
    else if (data.tipo === 'turno_unas') {
      let sheet = ss.getSheetByName('Turnos Uñas');
      if (!sheet) {
        sheet = ss.insertSheet('Turnos Uñas');
        sheet.appendRow([
          'Fecha',
          'Horario',
          'Manicurista',
          'Clienta',
          'Trabajo Realizado',
          'Detalle',
          'Total Cobrado ($)',
          'Su 60% ($)',
          'Comisión Yamina 40% ($)',
          'Medio de Pago',
          'Fecha y Hora de Registro'
        ]);
        const headerRange = sheet.getRange(1, 1, 1, 11);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#fae8ff');
        headerRange.setFontColor('#644190');
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        data.fecha,
        data.inicio + ' a ' + data.fin,
        data.manicurista,
        data.clienta,
        data.trabajo,
        data.detalle || '',
        data.total,
        Math.round(data.total * 0.6),
        Math.round(data.total * 0.4),
        data.pago,
        new Date().toLocaleString('es-AR')
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Sincronizado en Drive y Calendar' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
