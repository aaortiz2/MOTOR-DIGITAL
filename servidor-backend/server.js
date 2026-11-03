const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const registrarRutasCotizaciones = require('./routes_cotizaciones');
const registrarRutasPDF = require('./routes_pdf');
const app = express();
app.use(express.json());
app.use(cors());


// Conexión con tu base de datos de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Baraton',
  password: '123456',
  port: 5432,
});
registrarRutasCotizaciones(app, pool);
registrarRutasPDF(app, pool);
// 1. Endpoint de Login
app.post('/api/login', async (req, res) => {
  const { nombreUsuario, password } = req.body;

  try {
    const query = `
      SELECT id_trabajador, nombre, apellido, "Rol" AS rol, "Contraseña" 
      FROM public."Trabajador" 
      WHERE "Nombre_Usuario" = $1 AND "Contraseña" = $2
    `;
    const result = await pool.query(query, [nombreUsuario, password]);

    if (result.rows.length > 0) {
      const usuarioEncontrado = result.rows[0];
      
      res.json({
        success: true,
        rol: usuarioEncontrado.rol,
        message: 'Acceso concedido',
        user: {
          id: usuarioEncontrado.id_trabajador,
          nombre: usuarioEncontrado.nombre,
          apellido: usuarioEncontrado.apellido
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
});

// 2. Endpoint: Buscar Trabajador por usuario de sesión
app.get('/api/trabajador/:nombreUsuario', async (req, res) => {
  const { nombreUsuario } = req.params;
  try {
    const query = `
      SELECT id_trabajador, nombre AS "Nombre", apellido AS "Apellido", "Rol" AS "Rol" 
      FROM public."Trabajador" 
      WHERE "Nombre_Usuario" = $1
    `;
    const result = await pool.query(query, [nombreUsuario]);
    if (result.rows.length > 0) {
      res.json({ success: true, trabajador: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al consultar trabajador' });
  }
});

// 3. Endpoint: Buscador de Clientes
app.get('/api/clientes/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const query = `
      SELECT "id_Cliente", "Nombre", "Apellido", "Celular" 
      FROM public."Cliente" 
      WHERE "Nombre" ILIKE $1 OR "Apellido" ILIKE $1 OR "Celular" ILIKE $1 
      LIMIT 10`;
    const result = await pool.query(query, [`%${q || ''}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al buscar clientes' });
  }
});

// 4. Endpoint: Obtener motos de un Cliente
app.get('/api/motos/cliente/:idCliente', async (req, res) => {
  const { idCliente } = req.params;
  try {
    const query = `
      SELECT "id_Motocicleta", "Marca", "Modelo", "Placa", "Color", "Kilometraje_Actual" 
      FROM public."Motocicleta" 
      WHERE "id_Cliente" = $1`;
    const result = await pool.query(query, [idCliente]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al consultar motos' });
  }
});

// 5. Endpoint: Registrar nueva moto
app.post('/api/motos', async (req, res) => {
  const { id_Cliente, Marca, Modelo, Placa, Color, Kilometraje_Actual } = req.body;
  try {
    const insertQuery = `
      INSERT INTO public."Motocicleta" ("id_Cliente", "Marca", "Modelo", "Placa", "Color", "Kilometraje_Actual") 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;
    const result = await pool.query(insertQuery, [
      id_Cliente,
      Marca,
      Modelo || 'Estándar',
      Placa,
      Color,
      Kilometraje_Actual || 0
    ]);
    res.json({ success: true, moto: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al registrar la moto' });
  }
});

// 6. NUEVO: Endpoint para Buscar Repuestos en el Inventario
app.get('/api/repuestos/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const query = `
      SELECT "Codigo_Repuesto", "Nombre", "Marca", "Precio_Unitario", "Stock_Actual" 
      FROM public."Repuesto" 
      WHERE "Nombre" ILIKE $1 OR "Marca" ILIKE $1 
      LIMIT 10
    `;
    const result = await pool.query(query, [`%${q || ''}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al buscar repuestos:', err);
    res.status(500).json({ success: false, message: 'Error al buscar repuestos' });
  }
});
// Endpoint para Generar y Descargar la Cotización en PDF
app.get('/api/cotizaciones/:id/pdf', async (req, res) => {
  const { id } = req.params;
  try {
    const cotQuery = `
      SELECT c.*, cl."Nombre" as cli_nombre, cl."Apellido" as cli_apellido, cl."Celular" as cli_celular,
             t.nombre as trab_nombre, t.apellido as trab_apellido
      FROM public."Cotización" c
      JOIN public."Cliente" cl ON c."id_Cliente" = cl."id_Cliente"
      JOIN public."Trabajador" t ON c.id_trabajador = t.id_trabajador
      WHERE c."id_Cotizacion" = $1
    `;
    const cotRes = await pool.query(cotQuery, [id]);
    if (cotRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }
    const cot = cotRes.rows[0];

    const detQuery = `
      SELECT d.*, r."Nombre" as rep_nombre, r."Marca" as rep_marca
      FROM public."Detalle_Cotizacion" d
      JOIN public."Repuesto" r ON d."Codigo_Repuesto" = r."Codigo_Repuesto"
      WHERE d."id_Cotizacion" = $1
    `;
    const detRes = await pool.query(detQuery, [id]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Cotizacion-${id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text('MOTO REPUESTOS "EL BARATÓN"', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Santa Cruz, Bolivia - Teléfono: (591) 77458962', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text(`COTIZACIÓN N° ${cot.id_Cotizacion}`);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Fecha de Emisión: ${new Date(cot.fecha_Cotizacion).toLocaleDateString()}`);
    doc.text(`Válida hasta: ${new Date(cot.fecha_Validez).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN DEL CLIENTE');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nombre: ${cot.cli_nombre} ${cot.cli_apellido}`);
    doc.text(`Celular: ${cot.cli_celular}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('DETALLE DE LA COTIZACIÓN');
    doc.moveDown(0.5);

    detRes.rows.forEach(item => {
      doc.fontSize(10).font('Helvetica').text(
        `${item.rep_nombre} (${item.rep_marca}) — Cant: ${item.Cantidad} | P.Unit: Bs ${Number(item.Precio_Unitario).toFixed(2)} | Subtotal: Bs ${Number(item.Subtotal).toFixed(2)}`
      );
    });

    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL A PAGAR: Bs ${Number(cot.Monto_Total).toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (err) {
    console.error('Error al generar el PDF:', err);
    res.status(500).json({ success: false, message: 'Error al generar el PDF' });
  }
});
// 7. NUEVO: Endpoint para Guardar la Cotización y sus Detalles
app.post('/api/cotizaciones', async (req, res) => {
  const { id_Cliente, id_trabajador, id_Moto, Observaciones, items } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calcular monto total
    let montoTotal = 0;
    items.forEach(i => {
      const sub = (i.Cantidad * i.Precio_Unitario) - (i.Descuento || 0);
      montoTotal += sub;
    });

    // Insertar cabecera de la cotización
    const cotizacionQuery = `
      INSERT INTO public."Cotización" 
      ("id_Cliente", id_trabajador, "id_Moto", "fecha_Cotizacion", "fecha_Validez", "estado_Cotizacion", "Observaciones", "Monto_Total") 
      VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Pendiente', $4, $5) 
      RETURNING "id_Cotizacion", "Monto_Total"
    `;
    const cotizacionResult = await client.query(cotizacionQuery, [
      id_Cliente, 
      id_trabajador, 
      id_Moto || null, 
      Observaciones || '', 
      montoTotal
    ]);
    const idCotizacion = cotizacionResult.rows[0].id_Cotizacion;

    // Insertar cada repuesto en el detalle de cotización
    for (const item of items) {
      const subtotal = (item.Cantidad * item.Precio_Unitario) - (item.Descuento || 0);
      const detalleQuery = `
        INSERT INTO public."Detalle_Cotizacion" 
        ("id_Cotizacion", "Codigo_Repuesto", "Cantidad", "Precio_Unitario", "Descuento", "Subtotal") 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await client.query(detalleQuery, [
        idCotizacion,
        item.Codigo_Repuesto,
        item.Cantidad,
        item.Precio_Unitario,
        item.Desuzento || item.Descuento || 0,
        subtotal
      ]);
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      id_Cotizacion: idCotizacion,
      Monto_Total: montoTotal
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al guardar cotización:', err);
    res.status(500).json({ success: false, message: 'Error al registrar la cotización en la base de datos' });
  } finally {
    client.release();
  }
});

// Encendemos el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('¡El servidor ya está despierto en http://localhost:3000 !');
});