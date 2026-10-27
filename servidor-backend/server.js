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

// Encendemos el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('¡El servidor ya está despierto en http://localhost:3000 !');
});