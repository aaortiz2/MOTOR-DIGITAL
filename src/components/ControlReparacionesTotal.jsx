import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlReparacionesTotal.css';

export default function ControlReparacionesTotal() {
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarReparacionesCompletas();
  }, []);

  const cargarReparacionesCompletas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/reparaciones-completa');
      const data = await response.json();
      if (data.success) {
        setReparaciones(data.data);
      }
    } catch (error) {
      console.error('Error al obtener datos de reparaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rep-total-screen">
      <div className="rep-total-container">
        
        <div className="rep-total-card">
          <div className="rep-total-header">
            <h1>📋 Registro Completo de Reparaciones</h1>
            <p>Visualización detallada de todos los campos de la tabla Reparación</p>
          </div>

          <div className="lista-reparaciones-detallada">
            {cargando ? (
              <div className="sin-datos">Cargando registros de la base de datos...</div>
            ) : reparaciones.length > 0 ? (
              reparaciones.map((rep) => {
                const esFinalizada = rep.Fecha_Salida !== null;

                return (
                  <div key={rep.id_Reparacion} className="reparacion-detalle-item">
                    
                    {/* Encabezado con ID y Estado */}
                    <div className="rep-item-top">
                      <span className="rep-id-badge">Reparación #{rep.id_Reparacion}</span>
                      <span className={`rep-estado-global ${esFinalizada ? 'estado-completado' : 'estado-proceso'}`}>
                        {esFinalizada ? '✔ Finalizada' : '⏳ En Proceso'}
                      </span>
                    </div>

                    {/* Rejilla explícita con TODOS los datos de la tabla */}
                    <div className="rep-grid-datos">
                      
                      {/* 1. id_Cotizacion */}
                      <div className="dato-celda">
                        <span className="celda-label">ID Cotización</span>
                        <span className="celda-valor">#{rep.id_Cotizacion}</span>
                      </div>

                      {/* 2. id_Moto + Detalles */}
                      <div className="dato-celda">
                        <span className="celda-label">Motocicleta (ID: {rep.id_Moto})</span>
                        <span className="celda-valor">
                          {rep.MotoMarca ? `${rep.MotoMarca} (${rep.MotoPlaca})` : `Moto #${rep.id_Moto}`}
                        </span>
                      </div>

                      {/* 3. id_Mecanico + Nombre */}
                      <div className="dato-celda">
                        <span className="celda-label">Mecánico Asignado (ID: {rep.id_Mecanico})</span>
                        <span className="celda-valor">
                          {rep.MecanicoNombre ? `${rep.MecanicoNombre} ${rep.MecanicoApellido}` : 'Sin Asignar'}
                        </span>
                      </div>

                      {/* 4. Propietario / Cliente */}
                      <div className="dato-celda">
                        <span className="celda-label">Cliente Propietario</span>
                        <span className="celda-valor">
                          {rep.ClienteNombre ? `${rep.ClienteNombre} ${rep.ClienteApellido}` : 'No registrado'}
                        </span>
                      </div>

                      {/* 5. Fecha de Ingreso */}
                      <div className="dato-celda">
                        <span className="celda-label">Fecha de Ingreso</span>
                        <span className="celda-valor">
                          {rep.Fecha_Ingreso ? new Date(rep.Fecha_Ingreso).toLocaleDateString() : 'Sin fecha'}
                        </span>
                      </div>

                      {/* 6. Fecha de Salida */}
                      <div className="dato-celda">
                        <span className="celda-label">Fecha de Salida</span>
                        <span className="celda-valor" style={{ color: rep.Fecha_Salida ? '#4ade80' : '#fbbf24' }}>
                          {rep.Fecha_Salida ? new Date(rep.Fecha_Salida).toLocaleDateString() : 'Pendiente (En Taller)'}
                        </span>
                      </div>

                    </div>

                    {/* 7. Descripcion_Trabajo explícita */}
                    <div className="rep-descripcion-box">
                      <span className="celda-label">Descripción del Trabajo (Tabla Reparación)</span>
                      <p className="descripcion-texto">{rep.Descripcion_Trabajo || 'Sin descripción detallada.'}</p>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="sin-datos">No se encontraron registros en la tabla Reparación.</div>
            )}
          </div>

          {/* Botón de retorno al panel de administración */}
          <button className="btn-volver-panel" onClick={() => navigate('/admin')}>
            ← Volver al Panel de Administrador
          </button>

        </div>
      </div>
    </div>
  );
}