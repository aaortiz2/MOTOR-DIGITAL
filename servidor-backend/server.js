const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Importamos las rutas modulares
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

// =====================================================================
// REGISTRO DE RUTAS MODULARES
// =====================================================================
registrarRutasCotizaciones(app, pool);
registrarRutasPDF(app, pool);

// =====================================================================
// ENDPOINTS PRINCIPALES
// =====================================================================

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
app.get('/api/Trabajador/:nombreUsuario', async (req, res) => {
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

// =====================================================================
// ENDPOINTS DE REPARACIONES (Nuevos para el panel del Admin)
// =====================================================================

// 6. Obtener todas las reparaciones (Para la tabla del Admin)
app.get('/api/reparaciones', async (req, res) => {
  try {
    const query = `
      SELECT 
        r."id_Reparacion", 
        r."id_Moto",
        r."id_Mecanico",
        r."Fecha_Ingreso",
        r."Estado_Reparacion",
        r."Descripcion_Trabajo",
        m."Placa", m."Marca" AS "MotoMarca", m."Modelo" AS "MotoModelo",
        c."Nombre" AS "ClienteNombre", c."Apellido" AS "ClienteApellido",
        t.nombre AS "MecanicoNombre", t.apellido AS "MecanicoApellido"
      FROM public."Reparacion" r
      JOIN public."Motocicleta" m ON r."id_Moto" = m."id_Motocicleta"
      JOIN public."Cliente" c ON m."id_Cliente" = c."id_Cliente"
      LEFT JOIN public."Trabajador" t ON r."id_Mecanico" = t.id_trabajador
      ORDER BY r."id_Reparacion" DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reparaciones:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// 7. Asignar un mecánico a una reparación
app.patch('/api/reparaciones/:id/asignar', async (req, res) => {
  const { id } = req.params;
  const { id_Mecanico } = req.body;

  try {
    // Si se envía un id_Mecanico vacío, lo guardamos como NULL (sin asignar)
    const query = `
      UPDATE public."Reparacion"
      SET "id_Mecanico" = $1
      WHERE "id_Reparacion" = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_Mecanico || null, id]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No encontrada' });

    res.json({ success: true, message: 'Mecánico asignado.', reparacion: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al asignar' });
  }
});

// 8. Actualizar el estado de la reparación
app.patch('/api/reparaciones/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { Estado_Reparacion } = req.body;

  try {
    const query = `
      UPDATE public."Reparacion"
      SET "Estado_Reparacion" = $1
      WHERE "id_Reparacion" = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [Estado_Reparacion, id]);
    res.json({ success: true, message: 'Estado actualizado', reparacion: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
});

// 9. Listar mecánicos (Para el <select> del Admin)
app.get('/api/mecanicos', async (req, res) => {
  try {
    const query = `
      SELECT id_trabajador AS "id_Mecanico", nombre, apellido
      FROM public."Trabajador" 
      WHERE "Rol" = 'Mecanico'
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener mecánicos' });
  }
});

// =====================================================================
// ENDPOINTS PARA GESTIÓN DE TRABAJADORES (Mecánicos y Ayudantes)
// =====================================================================

// 10. Obtener todos los trabajadores para el buscador
app.get('/api/trabajadores', async (req, res) => {
  try {
    const query = `
      SELECT id_trabajador, nombre, apellido, "Rol" AS rol, "Nombre_Usuario" AS usuario 
      FROM public."Trabajador" 
      ORDER BY id_trabajador DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener trabajadores:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// 11. Eliminar un trabajador (Mecánico o Ayudante) por su ID
app.delete('/api/trabajadores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      DELETE FROM public."Trabajador" 
      WHERE id_trabajador = $1 
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
    }

    res.json({ success: true, message: 'Trabajador eliminado correctamente', trabajador: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar trabajador:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar en la base de datos' });
  }
});

// =====================================================================
// ENDPOINT: CONTROL DE PAGOS A MECÁNICOS
// =====================================================================
app.get('/api/control-pagos', async (req, res) => {
  try {
    // Consultamos todos los trabajadores
    const trabajadoresQuery = `
      SELECT id_trabajador, nombre, apellido, "Rol" AS rol 
      FROM public."Trabajador"
      ORDER BY id_trabajador ASC
    `;
    const trabajadoresResult = await pool.query(trabajadoresQuery);

    // Consultamos todas las reparaciones
    const reparacionesQuery = `
      SELECT "id_Reparacion", "id_Mecanico", "Fecha_Ingreso", "Fecha_Salida", "Estado_Reparacion", "Descripcion_Trabajo" 
      FROM public."Reparacion"
    `;
    const reparacionesResult = await pool.query(reparacionesQuery);

    // Unimos los datos en Node.js para asegurar máxima compatibilidad
    const controlPagos = trabajadoresResult.rows.map(trabajador => {
      const reparacionesMecanico = reparacionesResult.rows.filter(
        r => r.id_Mecanico === trabajador.id_trabajador
      );

      return {
        ...trabajador,
        reparaciones: reparacionesMecanico
      };
    });

    res.json({ success: true, data: controlPagos });
  } catch (err) {
    console.error('Error al obtener el control de pagos:', err);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
});
// =====================================================================
// ENDPOINT: OBTENER TODOS LOS DATOS DE LA TABLA REPARACIÓN
// =====================================================================
app.get('/api/reparaciones-completa', async (req, res) => {
  try {
    const query = `
      SELECT 
        r."id_Reparacion", 
        r."id_Cotizacion", 
        r."id_Moto", 
        r."id_Mecanico", 
        r."Fecha_Ingreso", 
        r."Fecha_Salida", 
        r."Descripcion_Trabajo",
        m."Placa" AS "MotoPlaca",
        m."Marca" AS "MotoMarca",
        m."Modelo" AS "MotoModelo",
        c."Nombre" AS "ClienteNombre",
        c."Apellido" AS "ClienteApellido",
        t.nombre AS "MecanicoNombre",
        t.apellido AS "MecanicoApellido"
      FROM public."Reparacion" r
      LEFT JOIN public."Motocicleta" m ON r."id_Moto" = m."id_Motocicleta"
      LEFT JOIN public."Cliente" c ON m."id_Cliente" = c."id_Cliente"
      LEFT JOIN public."Trabajador" t ON r."id_Mecanico" = t.id_trabajador
      ORDER BY r."id_Reparacion" ASC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error al obtener la tabla reparación:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// =====================================================================
// ENDPOINT: OBTENER TODOS LOS DATOS DE LA TABLA COTIZACIÓN
// =====================================================================
app.get('/api/cotizaciones-completa', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        cli."Nombre" AS "ClienteNombre",
        cli."Apellido" AS "ClienteApellido",
        cli."Celular" AS "ClienteCelular"
      FROM public."Cotización" c
      LEFT JOIN public."Cliente" cli ON c."id_Cliente" = cli."id_Cliente"
      ORDER BY c."id_Cotizacion" DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error al obtener la tabla cotización:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
// =====================================================================
// ENDPOINT: OBTENER TODOS LOS DATOS DE LA TABLA REPUESTO
// =====================================================================
app.get('/api/repuestos', async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM public."Repuesto" 
      ORDER BY "Codigo_Repuesto" ASC
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error al obtener los repuestos:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
// =====================================================================
// ENDPOINT: REGISTRAR NUEVO REPUESTO EN LA BASE DE DATOS
// =====================================================================
app.post('/api/repuestos', async (req, res) => {
  const { Nombre, Marca, Descripcion, Unidad_Medida, Precio_Unitario, Stock_Actual } = req.body;
  
  try {
    const query = `
      INSERT INTO public."Repuesto" 
      ("Nombre", "Marca", "Descripcion", "Unidad_Medida", "Precio_Unitario", "Stock_Actual") 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    const result = await pool.query(query, [
      Nombre,
      Marca || 'Genérico',
      Descripcion || '',
      Unidad_Medida || 'Unidad',
      Precio_Unitario || 0,
      Stock_Actual || 0
    ]);

    res.json({ 
      success: true, 
      message: 'Repuesto registrado exitosamente', 
      repuesto: result.rows[0] 
    });
  } catch (err) {
    console.error('Error al registrar repuesto:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar el repuesto' });
  }
});
// =====================================================================
// ENDPOINT: CONTROL DE CLIENTES Y CÁLCULO DE CLIENTE FRECUENTE
// =====================================================================
app.get('/api/control-clientes', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(cot."id_Cotizacion") AS total_cotizaciones
      FROM public."Cliente" c
      LEFT JOIN public."Cotización" cot ON c."id_Cliente" = cot."id_Cliente"
      GROUP BY c."id_Cliente"
      ORDER BY c."id_Cliente" ASC
    `;
    const result = await pool.query(query);
    
    // Procesamos para calcular los puntos (1 punto por cada 3 cotizaciones)
    const clientesConPuntos = result.rows.map(cliente => {
      const totalCot = parseInt(cliente.total_cotizaciones) || 0;
      const puntosFrecuente = Math.floor(totalCot / 3);
      return {
        ...cliente,
        total_cotizaciones: totalCot,
        puntos_frecuente: puntosFrecuente
      };
    });

    // Encontramos al cliente con más cotizaciones para destacarlo arriba
    let clienteFrecuente = null;
    if (clientesConPuntos.length > 0) {
      clienteFrecuente = clientesConPuntos.reduce((prev, current) => 
        (current.total_cotizaciones > prev.total_cotizaciones) ? current : prev
      );
    }

    res.json({ 
      success: true, 
      clientes: clientesConPuntos,
      clienteFrecuente: clienteFrecuente && clienteFrecuente.total_cotizaciones > 0 ? clienteFrecuente : null
    });
  } catch (err) {
    console.error('Error al obtener control de clientes:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
// =====================================================================
// ENDPOINT: OBTENER REPARACIONES PENDIENTES DEL MECÁNICO LOGUEADO
// =====================================================================
app.get('/api/reparaciones/mis-pendientes/:nombreUsuario', async (req, res) => {
  const { nombreUsuario } = req.params;
  try {
    // 1. Encontramos el ID del trabajador según su nombre de usuario
    const trabajadorQuery = `
      SELECT id_trabajador FROM public."Trabajador" WHERE "Nombre_Usuario" = $1
    `;
    const trabajadorRes = await pool.query(trabajadorQuery, [nombreUsuario]);
    
    if (trabajadorRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
    }
    const idMecanico = trabajadorRes.rows[0].id_trabajador;

    // 2. Consultamos solo las reparaciones pendientes (Fecha_Salida IS NULL) de este mecánico
    const query = `
      SELECT 
        r."id_Reparacion", 
        r."id_Cotizacion", 
        r."id_Moto", 
        r."Fecha_Ingreso", 
        r."Fecha_Salida", 
        r."Descripcion_Trabajo",
        m."Placa" AS "MotoPlaca",
        m."Marca" AS "MotoMarca",
        m."Modelo" AS "MotoModelo",
        m."Color" AS "MotoColor",
        m."Kilometraje_Actual" AS "MotoKilometraje",
        c."Nombre" AS "ClienteNombre",
        c."Apellido" AS "ClienteApellido",
        c."Celular" AS "ClienteCelular"
      FROM public."Reparacion" r
      JOIN public."Motocicleta" m ON r."id_Moto" = m."id_Motocicleta"
      JOIN public."Cliente" c ON m."id_Cliente" = c."id_Cliente"
      WHERE r."id_Mecanico" = $1 AND r."Fecha_Salida" IS NULL
      ORDER BY r."id_Reparacion" DESC
    `;
    const result = await pool.query(query, [idMecanico]);
    res.json({ success: true, reparaciones: result.rows });
  } catch (err) {
    console.error('Error al obtener reparaciones pendientes del mecánico:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
// =====================================================================
// ENCENDIDO DEL SERVIDOR
// =====================================================================
app.listen(3000, () => {
  console.log('¡El servidor ya está despierto en http://localhost:3000 !');
});