/**
 * ====================================================================
 * RESPALDO AUTOMÁTICO EN GOOGLE DRIVE PARA SALÓN & NAILS (Yamina)
 * ====================================================================
 * 
 * Este script corre dentro de tu Google Drive y recibe silenciosamente 
 * cada fórmula técnica y atención de peluquería para que nunca se pierda nada.
 * 
 * GUÍA DE INSTALACIÓN EN 2 MINUTOS:
 * 1. En tu Google Drive (de Yamina), creá una hoja de cálculo nueva:
 *    Nombre: "Respaldo Salón Yamina"
 * 2. En el menú superior, andá a: Extensiones -> Apps Script.
 * 3. Borrá el código que aparece por defecto y pegá TODO este archivo.
 * 4. Hacé clic arriba a la derecha en: Implementar -> Nueva implementación.
 * 5. Hacé clic en el engranaje a la izquierda y seleccioná: "Aplicación web".
 * 6. Configuración:
 *    - Descripción: "Respaldo automático"
 *    - Ejecutar como: "Yo" (tu cuenta)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) -> ¡IMPORTANTE!
 * 7. Hacé clic en "Implementar", autorizá los permisos de tu cuenta de Google 
 *    y COPIÁ la "URL de la aplicación web" (termina en /exec).
 * 8. Pegá esa URL en la web de Salón & Nails (tocando el botón ⚡ Nube).
 * ====================================================================
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. RESPALDO DE FÓRMULAS CAPILARES (YAMINA)
    if (data.tipo === 'visita_pelo') {
      let sheet = ss.getSheetByName('Fórmulas Peluquería');
      if (!sheet) {
        sheet = ss.insertSheet('Fórmulas Peluquería');
        sheet.appendRow([
          'Fecha',
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
        const headerRange = sheet.getRange(1, 1, 1, 10);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#fce7f3'); // Rosa salón
        headerRange.setFontColor('#8e2b58');
        sheet.setFrozenRows(1);
      }
      
      sheet.appendRow([
        data.fecha,
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
    
    // 2. RESPALDO DE TURNOS DE UÑAS (KATYA Y GISEL)
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
        headerRange.setBackground('#fae8ff'); // Violeta uñas
        headerRange.setFontColor('#7c3aed');
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

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Guardado con éxito en Drive' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
