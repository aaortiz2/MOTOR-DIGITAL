// servidor-backend/routes_cotizaciones.js
//
// Buscador de repuestos + creación de una cotización completa (cabecera
// en "Cotización" y todas sus líneas en "Detalle_Cotizacion") como una
// sola transacción: o se guarda todo, o no se guarda nada.
//
// Se registra en server.js con:
//   const registrarRutasCotizaciones = require('./routes_cotizaciones');
//   registrarRutasCotizaciones(app, pool);

function registrarRutasCotizaciones(app, pool) {
  // ---------------------------------------------------------------------
  // GET /api/repuestos/buscar?q=...
  // Busca repuestos por nombre o marca, para ir agregándolos a la proforma.
  // ---------------------------------------------------------------------
  app.get('/api/repuestos/buscar', async (req, res) => {
    try {
      // Forzamos a que 'q' sea un string y quitamos espacios en blanco
      const textoBusqueda = (req.query.q || '').toString().trim();

      // Si la búsqueda está vacía, devolvemos los primeros 10 repuestos
      if (textoBusqueda === '') {
        const result = await pool.query(`
          SELECT "Codigo_Repuesto", "Nombre", "Marca", "Precio_Unitario", "Stock_Actual" 
          FROM public."Repuesto" 
          LIMIT 10
        `);
        return res.json(result.rows);
      }

      // Usamos LOWER para que la búsqueda no distinga entre mayúsculas y minúsculas
      const query = `
        SELECT "Codigo_Repuesto", "Nombre", "Marca", "Precio_Unitario", "Stock_Actual"
        FROM public."Repuesto"
        WHERE LOWER("Nombre") LIKE LOWER($1) OR LOWER("Marca") LIKE LOWER($1)
        LIMIT 10`;
      
      const busqueda = `%${textoBusqueda}%`; 
      const result = await pool.query(query, [busqueda]);
      
      console.log(`Buscando repuesto: "${textoBusqueda}" - Encontrados: ${result.rows.length}`);
      res.json(result.rows);
    } catch (err) {
      console.error('Error al buscar repuestos:', err);
      res.status(500).json({ success: false, message: 'Error al buscar repuestos.' });
    }
  });

  // ---------------------------------------------------------------------
  // POST /api/cotizaciones
  // Guarda la cotización y todas sus líneas de una sola vez.
  //
  // Body esperado:
  // {
  //   id_Cliente, id_trabajador, id_Moto (puede ser null),
  //   Observaciones (opcional),
  //   items: [{ Codigo_Repuesto, Cantidad, Precio_Unitario, Descuento }]
  // }
  // ---------------------------------------------------------------------
  app.post('/api/cotizaciones', async (req, res) => {
    const { id_Cliente, id_trabajador, id_Moto, Observaciones, items } = req.body;

    if (!id_Cliente || !id_trabajador || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'id_Cliente, id_trabajador y al menos un repuesto (items) son obligatorios.',
      });
    }

    // El total SIEMPRE se calcula aquí en el servidor, nunca se confía en el
    // total que mande el navegador (para que nadie lo pueda manipular).
    const itemsConSubtotal = items.map((item) => {
      const cantidad = Number(item.Cantidad);
      const precio = Number(item.Precio_Unitario);
      const descuento = Number(item.Descuento) || 0;
      const subtotal = cantidad * precio - descuento;
      return {
        Codigo_Repuesto: item.Codigo_Repuesto,
        Cantidad: cantidad,
        Precio_Unitario: precio,
        Descuento: descuento,
        Subtotal: subtotal,
      };
    });

    const montoTotal = itemsConSubtotal.reduce((acc, i) => acc + i.Subtotal, 0);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fechaHoy = new Date().toISOString().slice(0, 10);
      
      // Tu tabla Cotización requiere fecha_Validez (NOT NULL). 
      // Le sumamos 30 días a la fecha actual por defecto.
      const fechaValidez = new Date();
      fechaValidez.setDate(fechaValidez.getDate() + 30);
      const fechaValidezStr = fechaValidez.toISOString().slice(0, 10);

      const cotizacionResult = await client.query(
        `INSERT INTO public."Cotización"
           ("id_Cliente", "id_trabajador", "id_Moto", "fecha_Cotizacion", "fecha_Validez", "estado_Cotizacion", "Observaciones", "Monto_Total")
         VALUES ($1, $2, $3, $4, $5, 'Pendiente', $6, $7)
         RETURNING "id_Cotizacion"`,
        [id_Cliente, id_trabajador, id_Moto || null, fechaHoy, fechaValidezStr, Observaciones || null, montoTotal]
      );

      const id_Cotizacion = cotizacionResult.rows[0].id_Cotizacion;

      for (const item of itemsConSubtotal) {
        await client.query(
          `INSERT INTO public."Detalle_Cotizacion"
             ("id_Cotizacion", "Codigo_Repuesto", "Cantidad", "Precio_Unitario", "Descuento", "Subtotal")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id_Cotizacion, item.Codigo_Repuesto, item.Cantidad, item.Precio_Unitario, item.Descuento, item.Subtotal]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        id_Cotizacion,
        Monto_Total: montoTotal,
        items: itemsConSubtotal,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al crear la cotización:', err);
      res.status(500).json({ success: false, message: 'No se pudo guardar la cotización.' });
    } finally {
      client.release();
    }
  });

  // ---------------------------------------------------------------------
  // GET /api/cotizaciones/total
  // Suma el Monto_Total de todas las cotizaciones (o filtradas por estado).
  // Útil para un panel de "cuánto se ha cotizado en total".
  // ---------------------------------------------------------------------
  app.get('/api/cotizaciones/total', async (req, res) => {
    const { estado } = req.query;
    try {
      const query = estado
        ? `SELECT COALESCE(SUM("Monto_Total"), 0) AS total, COUNT(*) AS cantidad
           FROM public."Cotización" WHERE "estado_Cotizacion" = $1`
        : `SELECT COALESCE(SUM("Monto_Total"), 0) AS total, COUNT(*) AS cantidad
           FROM public."Cotización"`;
      const result = estado ? await pool.query(query, [estado]) : await pool.query(query);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error al calcular el total de cotizaciones:', err);
      res.status(500).json({ success: false, message: 'No se pudo calcular el total.' });
    }
  });
}

module.exports = registrarRutasCotizaciones;