/**
 * ==============================================================================
 * MERAKI SPA & BEAUTY — SCRIPT DE CAPTURA AUTOMÁTICA DE LEADS EN GOOGLE SHEETS
 * ==============================================================================
 * Este script recibe automáticamente todos los formularios de la web (Workshop,
 * Citas de Spa y Contacto), detectando la procedencia del cliente (anuncios de
 * Meta Ads, TikTok Ads, videos, enlaces orgánicos o tráfico directo).
 *
 * INSTRUCCIONES DE USO:
 * 1. Abre tu hoja de Google Sheets (crea una nueva en https://sheets.new).
 * 2. Ve a: Extensiones > Apps Script.
 * 3. Borra el código que aparezca y pega TODO este archivo.
 * 4. Arriba en la barra de herramientas, en el menú desplegable selecciona la función:
 *    "configurarHoja" y haz clic en "Ejecutar".
 *    (Google te pedirá autorizar los permisos de tu hoja; acéptalos).
 *    -> ¡Listo! Tu hoja quedará formateada con todos los encabezados y diseño de Meraki.
 * 5. Haz clic en "Implementar" (botón azul arriba a la derecha) > "Nueva implementación".
 *    - Selecciona tipo: "Aplicación web" (icono de engranaje).
 *    - Descripción: "Webhook Leads Meraki"
 *    - Ejecutar como: "Yo" (tu cuenta de Google).
 *    - Quién tiene acceso: "Cualquiera" (Anyone).
 * 6. Haz clic en "Implementar", copia la URL de la Aplicación Web (termina en /exec)
 *    y agrégala en la variable de entorno VITE_LEADS_SHEETS_URL o VITE_WORKSHOP_SHEETS_URL.
 */

// Nombre de la pestaña de leads
var NOMBRE_HOJA = 'Leads Meraki';

// Lista oficial de encabezados alineada al sistema de atribución de la web
var ENCABEZADOS = [
  'Fecha y Hora',
  'Formulario',
  'Código Reserva',
  'Cliente',
  'WhatsApp',
  'Email',
  'Servicio',
  'Modalidad',
  'Distrito',
  'Dirección',
  'Fecha Preferida',
  'Hora Preferida',
  'Adelanto',
  'Total',
  'Origen Resumen',
  'Tipo de Tráfico',
  'Campaña',
  'Video / Anuncio',
  'Fuente',
  'Medio',
  'Click ID (Meta/TikTok/Google)',
  'Landing URL',
  'Estado',
  'Notas'
];

/**
 * FUNCIÓN PARA CONFIGURAR LA HOJA AUTOMÁTICAMENTE
 * Ejecuta esta función UNA SOLA VEZ desde el editor de Apps Script.
 */
function configurarHoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NOMBRE_HOJA);

  // Si no existe la pestaña, renombrar la primera o crearla
  if (!sheet) {
    var activeSheet = ss.getActiveSheet();
    if (activeSheet.getLastRow() === 0 && activeSheet.getLastColumn() === 0) {
      sheet = activeSheet;
      sheet.setName(NOMBRE_HOJA);
    } else {
      sheet = ss.insertSheet(NOMBRE_HOJA, 0);
    }
  }

  // 1. Escribir encabezados en la Fila 1
  var rangeHeaders = sheet.getRange(1, 1, 1, ENCABEZADOS.length);
  rangeHeaders.setValues([ENCABEZADOS]);

  // 2. Estilo visual elegante con los colores oficiales de Meraki
  rangeHeaders
    .setBackground('#5E765E') // Verde oliva institucional de Meraki
    .setFontColor('#FFFFFF') // Texto blanco de alto contraste
    .setFontFamily('Arial')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.setRowHeight(1, 38);

  // 3. Inmovilizar la primera fila para navegación cómoda
  sheet.setFrozenRows(1);

  // 4. Formatear la columna de WhatsApp (Columna 5) como TEXTO plano
  // para evitar que Google Sheets borre el cero inicial o el +51
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setNumberFormat('@');

  // 5. Ajustar anchos iniciales de columnas para lectura óptima
  var columnWidths = {
    1: 155, // Fecha y Hora
    2: 140, // Formulario
    3: 130, // Código
    4: 180, // Cliente
    5: 140, // WhatsApp
    6: 180, // Email
    7: 220, // Servicio
    8: 150, // Modalidad
    9: 130, // Distrito
    10: 200, // Dirección
    11: 130, // Fecha Preferida
    12: 120, // Hora Preferida
    13: 100, // Adelanto
    14: 100, // Total
    15: 260, // Origen Resumen
    16: 180, // Tipo de Tráfico
    17: 160, // Campaña
    18: 160, // Video / Anuncio
    19: 120, // Fuente
    20: 100, // Medio
    21: 150, // Click ID
    22: 240, // Landing URL
    23: 170, // Estado
    24: 250  // Notas
  };

  for (var colIndex in columnWidths) {
    sheet.setColumnWidth(parseInt(colIndex, 10), columnWidths[colIndex]);
  }

  // 6. Activar cuadrícula visible
  sheet.setHiddenGridlines(false);

  ss.toast('¡Hoja configurada exitosamente con todos los encabezados y estilos de Meraki!', 'Configuración Lista', 6);
  Logger.log('Configuración de la hoja completada con éxito.');
}

/**
 * RECEPTOR DE LEADS VÍA WEBHOOK (POST)
 * Se ejecuta automáticamente cada vez que un cliente envía un formulario en la web.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'No payload received' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(NOMBRE_HOJA);

    // Si la hoja aún no ha sido inicializada, configurarla automáticamente
    if (!sheet || sheet.getLastRow() === 0) {
      configurarHoja();
      sheet = ss.getSheetByName(NOMBRE_HOJA);
    }

    var nuevaFila = [
      data.fecha || new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      data.formulario || 'Web Meraki',
      data.codigo || '',
      data.cliente || '',
      data.whatsapp ? "'" + data.whatsapp : '', // Comilla simple asegura formato texto sin perder el +
      data.email || '',
      data.servicio || '',
      data.modalidad || '',
      data.distrito || '',
      data.direccion || '',
      data.fecha_preferida || '',
      data.hora_preferida || '',
      data.adelanto || '',
      data.total || '',
      data.origen_resumen || '',
      data.origen_tipo || '',
      data.origen_campana || '',
      data.origen_video_contenido || '',
      data.origen_fuente || '',
      data.origen_medio || '',
      data.click_id || '',
      data.landing_url || '',
      data.estado || 'Pre-reserva',
      data.notas || ''
    ];

    sheet.appendRow(nuevaFila);

    // Dar formato alineado a la nueva fila agregada
    var lastRow = sheet.getLastRow();
    var dataRange = sheet.getRange(lastRow, 1, 1, ENCABEZADOS.length);
    dataRange
      .setFontFamily('Arial')
      .setFontSize(9.5)
      .setVerticalAlignment('middle');

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', row: lastRow })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Error en doPost: ' + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * COMPROBACIÓN DE ESTADO (GET)
 * Permite verificar si la URL del Webhook está activa desde cualquier navegador.
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'active',
      app: 'Meraki Spa & Beauty - Lead Webhook Service',
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
