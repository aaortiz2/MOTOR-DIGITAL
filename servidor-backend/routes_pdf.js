const PDFDocument = require('pdfkit');

// Función que registra la ruta para generar el PDF
function registrarRutasPDF(app, pool) {
  
  // Ruta GET que recibe el ID de la cotización y devuelve un archivo PDF
  app.get('/api/cotizaciones/:id/pdf', async (req, res) => {
    const { id } = req.params;

    try {
      // 1. CONSULTA SQL: Obtener datos de la cabecera (Cotización + Cliente + Moto)
      // Usamos LEFT JOIN en Moto porque puede que la cotización no tenga moto asociada
      const queryCabecera = `
        SELECT 
          c."id_Cotizacion", 
          c."fecha_Cotizacion", 
          c."fecha_Validez", 
          c."Monto_Total",
          c."Observaciones",
          cl."Nombre" AS "ClienteNombre", 
          cl."Apellido" AS "ClienteApellido", 
          cl."Celular" AS "ClienteCelular",
          m."Placa", 
          m."Marca" AS "MotoMarca", 
          m."Modelo" AS "MotoModelo",
          m."Color" AS "MotoColor"
        FROM public."Cotización" c
        JOIN public."Cliente" cl ON c."id_Cliente" = cl."id_Cliente"
        LEFT JOIN public."Motocicleta" m ON c."id_Moto" = m."id_Motocicleta"
        WHERE c."id_Cotizacion" = $1
      `;
      const resCabecera = await pool.query(queryCabecera, [id]);

      // Si no encuentra la cotización, devolvemos error 404
      if (resCabecera.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada.' });
      }
      const cot = resCabecera.rows[0];

      // 2. CONSULTA SQL: Obtener la lista de repuestos de esa cotización
      const queryDetalles = `
        SELECT 
          d."Cantidad", 
          d."Precio_Unitario", 
          d."Descuento", 
          d."Subtotal",
          r."Nombre" AS "RepuestoNombre", 
          r."Marca" AS "RepuestoMarca"
        FROM public."Detalle_Cotizacion" d
        JOIN public."Repuesto" r ON d."Codigo_Repuesto" = r."Codigo_Repuesto"
        WHERE d."id_Cotizacion" = $1
      `;
      const resDetalles = await pool.query(queryDetalles, [id]);
      const detalles = resDetalles.rows;

      // 3. CREACIÓN DEL DOCUMENTO PDF
      // Configuramos tamaño A4 y márgenes de 40 puntos
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      // Configurar las cabeceras HTTP para que el navegador sepa que es un PDF descargable
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Cotizacion-${cot.id_Cotizacion}.pdf`);
      
      // Conectar el PDF a la respuesta HTTP
      doc.pipe(res);

      // --- DISEÑO DEL PDF ---
      
      // Encabezado del negocio
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b').text('MOTO REPUESTOS "EL BARATÓN"', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Santa Cruz, Bolivia - Teléfono: (591) 77458962', { align: 'center' });
      doc.moveDown(1);
      
      // Línea divisoria horizontal
      doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(1.5).strokeColor('#334155').stroke();
      doc.moveDown(1.5);

      // Título de la Cotización
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(`COTIZACIÓN N° ${cot.id_Cotizacion}`);
      doc.moveDown(0.5);
      
      // Fechas
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      doc.text(`Fecha de Emisión: ${new Date(cot.fecha_Cotizacion).toLocaleDateString('es-BO')}`);
      doc.text(`Válida hasta: ${new Date(cot.fecha_Validez).toLocaleDateString('es-BO')}`);
      doc.moveDown(1.5);

      // Bloque de Datos del Cliente
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('INFORMACIÓN DEL CLIENTE');
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      doc.text(`Nombre: ${cot.ClienteNombre} ${cot.ClienteApellido}`);
      doc.text(`Celular: ${cot.ClienteCelular}`);
      if (cot.Placa) {
        doc.text(`Moto: ${cot.MotoMarca} ${cot.MotoModelo} - Placa: ${cot.Placa} (Color: ${cot.MotoColor})`);
      } else {
        doc.text('Moto: No asociada a esta cotización');
      }
      doc.moveDown(2);

      // --- TABLA DE REPUESTOS ---
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('DETALLE DE LA COTIZACIÓN');
      doc.moveDown(0.5);

      // Definir las coordenadas X de cada columna
      const tableTop = doc.y;
      const itemX = 40;
      const cantX = 320;
      const precioX = 380;
      const descX = 450;
      const subtotalX = 500;

      // Dibujar fondo oscuro para la cabecera de la tabla
      doc.rect(40, tableTop - 5, 515, 20).fill('#1e293b'); 
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      
      // Textos de la cabecera de la tabla
      doc.text('DESCRIPCIÓN', itemX + 5, tableTop);
      doc.text('CANT.', cantX, tableTop);
      doc.text('P. UNIT.', precioX, tableTop);
      doc.text('DESC.', descX, tableTop);
      doc.text('SUBTOTAL', subtotalX, tableTop);

      let y = tableTop + 20;
      doc.fillColor('#334155').font('Helvetica');

      // Bucle para dibujar cada repuesto
      detalles.forEach((item, index) => {
        // Efecto Zebra: pintar fondo gris claro en las filas pares
        if (index % 2 === 0) {
          doc.rect(40, y - 2, 515, 18).fill('#f8fafc');
        }
        
        doc.fillColor('#334155');
        doc.text(`${item.RepuestoNombre} (${item.RepuestoMarca})`, itemX + 5, y, { width: 260 });
        doc.text(item.Cantidad.toString(), cantX, y);
        doc.text(`Bs ${Number(item.Precio_Unitario).toFixed(2)}`, precioX, y);
        doc.text(`Bs ${Number(item.Descuento).toFixed(2)}`, descX, y);
        doc.text(`Bs ${Number(item.Subtotal).toFixed(2)}`, subtotalX, y);
        
        y += 20; // Bajar 20 puntos para la siguiente fila
      });

      // Línea final de la tabla
      doc.moveTo(40, y).lineTo(555, y).lineWidth(1).strokeColor('#cbd5e1').stroke();
      doc.moveDown(1);

      // --- SECCIÓN DE TOTALES ---
      const totalY = doc.y;
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a');
      // Alinear el total a la derecha
      doc.text(`TOTAL A PAGAR:  Bs ${Number(cot.Monto_Total).toFixed(2)}`, 300, totalY, { align: 'right', width: 255 });

      doc.moveDown(3);

      // Si hay observaciones, las imprimimos
      if (cot.Observaciones && cot.Observaciones.trim() !== '') {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('OBSERVACIONES:');
        doc.fontSize(9).font('Helvetica').fillColor('#475569').text(cot.Observaciones);
        doc.moveDown(2);
      }

      // --- FIRMAS ---
      doc.fontSize(10).font('Helvetica').fillColor('#334155');
      const firmaY = 700; // Posición Y cerca del final de la hoja A4
      
      // Firma del Cliente
      doc.moveTo(80, firmaY).lineTo(220, firmaY).stroke();
      doc.text('Firma del Cliente', 80, firmaY + 5, { width: 140, align: 'center' });

      // Firma Autorizada
      doc.moveTo(350, firmaY).lineTo(490, firmaY).stroke();
      doc.text('Firma Autorizada', 350, firmaY + 5, { width: 140, align: 'center' });

      // Pie de página
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8');
      doc.text('Gracias por su preferencia. Esta cotización es válida por 30 días.', 40, 780, { align: 'center', width: 515 });

      // Finalizar la escritura del PDF
      doc.end();

    } catch (err) {
      console.error('Error al generar el PDF:', err);
      res.status(500).json({ success: false, message: 'Error al generar el PDF.' });
    }
  });
}

module.exports = registrarRutasPDF;