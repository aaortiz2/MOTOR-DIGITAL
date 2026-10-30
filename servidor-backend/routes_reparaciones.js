// servidor-backend/routes_reparaciones.js

function registrarRutasReparaciones(app, pool) {
  
  // =====================================================================
  // 1. OBTENER TODAS LAS REPARACIONES (Para la tabla del Admin)
  // Hacemos JOIN para traer los datos de la moto, cliente y mecánico.
  // =====================================================================
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

  // =====================================================================
  // 2. ASIGNAR UN MECÁNICO A UNA REPARACIÓN
  // =====================================================================
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

  // =====================================================================
  // 3. ACTUALIZAR EL ESTADO DE LA REPARACIÓN
  // =====================================================================
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

  // =====================================================================
  // 4. LISTAR MECÁNICOS (Para el <select> del Admin)
  // =====================================================================
  app.get('/api/mecanicos', async (req, res) => {
    try {
      const query = `
        SELECT m."id_Mecanico", t.nombre, t.apellido
        FROM public."Mecanico" m
        JOIN public."Trabajador" t ON m."id_Mecanico" = t.id_trabajador
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error al obtener mecánicos' });
    }
  });
}

module.exports = registrarRutasReparaciones;