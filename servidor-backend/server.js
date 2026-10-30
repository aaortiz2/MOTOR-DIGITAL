const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Aquí conectamos con tu base de datos de PostgreSQL
const pool = new Pool({
  user: 'postgres',          // Tu usuario de postgres (cámbialo si usas otro)
  host: 'localhost',
  database: 'Baraton', // <--- ¡CAMBIA ESTO por el nombre real de tu base de datos!
  password: '123456', // <--- ¡CAMBIA ESTO por tu contraseña de postgres!
  port: 5432,
});

// Esta es la ruta a la que tocará la puerta tu página web cuando hagas login
// Endpoint de Login corregido con el nombre exacto de la columna en tu BD
app.post('/api/login', async (req, res) => {
  const { nombreUsuario, password } = req.body;

  try {
    // Nota que aquí usamos "Contaseña" (con la ortografía exacta que tiene en tu PostgreSQL)
    const query = 'SELECT * FROM public."Usuarios" WHERE "Nombre_Usuario" = $1 AND "Contraseña" = $2';
    const result = await pool.query(query, [nombreUsuario, password]);

    if (result.rows.length > 0) {
      const usuarioEncontrado = result.rows[0];

      res.json({
        success: true,
        rol: usuarioEncontrado.Rol, // Devuelve el rol guardado en la BD
        message: 'Acceso concedido'
      });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
});

// Endpoint 1: Buscar Trabajador por usuario de sesión
// Ahora también devuelve id_Usuarios, necesario para guardar quién creó
// cada cotización (columna id_trabajador en la tabla "Cotización").
app.get('/api/trabajador/:nombreUsuario', async (req, res) => {
  const { nombreUsuario } = req.params;
  try {
    const query = 'SELECT "id_Usuarios", "Nombre", "Apellido", "Rol" FROM public."Usuarios" WHERE "Nombre_Usuario" = $1';
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

// Endpoint 2: Buscador estilo Google para Clientes (coincidencias por Nombre, Apellido o Celular)
app.get('/api/clientes/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const busqueda = `%${q || ''}%`;
    const query = `
      SELECT "id_Cliente", "Nombre", "Apellido", "Celular"
      FROM public."Cliente"
      WHERE "Nombre" ILIKE $1 OR "Apellido" ILIKE $1 OR "Celular" ILIKE $1
      LIMIT 10`;
    const result = await pool.query(query, [busqueda]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al buscar clientes' });
  }
});

// Endpoint 3: Obtener motos de un Cliente
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

// Endpoint 4: Registrar nueva moto en la base de datos
app.post('/api/motos', async (req, res) => {
  const { id_Cliente, Marca, Modelo, Placa, Color, Kilometraje_Actual } = req.body;
  try {
    const query = `
      INSERT INTO public."Motocicleta" ("id_Cliente", "Marca", "Modelo", "Placa", "Color", "Kilometraje_Actual")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const result = await pool.query(query, [
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

// Endpoints 5, 6 y 7: buscador de repuestos + creación de cotizaciones + total
const registrarRutasCotizaciones = require('./routes_cotizaciones');
registrarRutasCotizaciones(app, pool);

// Endpoint 8: Generación y descarga de PDF
const registrarRutasPDF = require('./routes_pdf');
registrarRutasPDF(app, pool);

// Endpoint 9: Asignacion de Mecanico
const registrarRutasReparaciones = require('./routes_reparaciones');
registrarRutasReparaciones(app, pool);


// Encendemos el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('¡El servidor ya está despierto en http://localhost:3000 !');
});

