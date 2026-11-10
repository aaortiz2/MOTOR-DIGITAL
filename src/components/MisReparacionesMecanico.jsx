import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MisReparacionesMecanico.css';

export default function MisReparacionesMecanico() {
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (!nombreUsuario) {
      navigate('/');
      return;
    }
    cargarMisReparacionesPendientes(nombreUsuario);
  }, [navigate]);

  const cargarMisReparacionesPendientes = async (nombreUsuario) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reparaciones/mis-pendientes/${nombreUsuario}`);
      const data = await response.json();
      if (data.success) {
        setReparaciones(data.reparaciones);
      }
    } catch (error) {
      console.error('Error al cargar mis reparaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mis-rep-screen">
      <div className="mis-rep-container">
        
        <div className="mis-rep-card">
          <div className="mis-rep-header">
            <h1>🛠️ Mis Reparaciones Pendientes</h1>
            <p>Motocicletas asignadas actualmente en taller</p>
          </div>

          <div className="lista-mis-reparaciones">
            {cargando ? (
              <div className="sin-datos">Cargando tus reparaciones asignadas...</div>
            ) : reparaciones.length > 0 ? (
              reparaciones.map((rep) => (
                <div key={rep.id_Reparacion} className="reparacion-pendiente-item">
                  
                  {/* Encabezado de la tarjeta */}
                  <div className="rep-item-top">
                    <span className="rep-id-badge">Reparación #{rep.id_Reparacion}</span>
                    <span className="rep-estado-pendiente">⏳ Pendiente en Taller</span>
                  </div>

                  {/* Datos explícitos detallados */}
                  <div className="rep-grid-datos">
                    
                    <div className="rep-celda">
                      <span className="celda-label">Motocicleta</span>
                      <span className="celda-valor">{rep.MotoMarca} ({rep.MotoPlaca})</span>
                    </div>

                    <div className="rep-celda">
                      <span className="celda-label">Modelo / Color</span>
                      <span className="celda-valor">{rep.MotoModelo} / {rep.MotoColor || 'N/A'}</span>
                    </div>

                    <div className="rep-celda">
                      <span className="celda-label">Propietario (Cliente)</span>
                      <span className="celda-valor">{rep.ClienteNombre} {rep.ClienteApellido}</span>
                    </div>

                    <div className="rep-celda">
                      <span className="celda-label">Celular de Contacto</span>
                      <span className="celda-valor" style={{ color: '#38bdf8' }}>{rep.ClienteCelular || 'Sin número'}</span>
                    </div>

                    <div className="rep-celda">
                      <span className="celda-label">Fecha de Ingreso</span>
                      <span className="celda-valor">{new Date(rep.Fecha_Ingreso).toLocaleDateString()}</span>
                    </div>

                    <div className="rep-celda">
                      <span className="celda-label">Kilometraje Actual</span>
                      <span className="celda-valor">{rep.MotoKilometraje || 0} km</span>
                    </div>

                  </div>

                  {/* Descripción del trabajo */}
                  <div className="rep-descripcion-box">
                    <span className="celda-label">Descripción / Diagnóstico del Trabajo</span>
                    <p className="descripcion-texto">{rep.Descripcion_Trabajo || 'Sin descripción detallada.'}</p>
                  </div>

                </div>
              ))
            ) : (
              <div className="sin-datos">No tienes reparaciones pendientes asignadas en este momento.</div>
            )}
          </div>

          {/* Botón para regresar al menú de mecánico */}
          <button className="btn-volver-panel" onClick={() => navigate('/mecanico')}>
            ← Volver al Panel Mecánico
          </button>

        </div>
      </div>
    </div>
  );
}