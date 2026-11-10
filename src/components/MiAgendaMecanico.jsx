import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MiAgendaMecanico.css';

export default function MiAgendaMecanico() {
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAgendaRevisiones();
  }, []);

  const cargarAgendaRevisiones = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agenda/revisiones-pendientes');
      const data = await response.json();
      if (data.success) {
        setAgenda(data.agenda);
      }
    } catch (error) {
      console.error('Error al cargar la agenda de revisiones:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="agenda-screen">
      <div className="agenda-container">
        
        <div className="agenda-card">
          <div className="agenda-header">
            <h1>📅 Mi Lista Agenda — Revisiones</h1>
            <p>Motocicletas terminadas a espera de revisión final</p>
          </div>

          <div className="lista-agenda-items">
            {cargando ? (
              <div className="sin-datos">Cargando agenda de revisiones...</div>
            ) : agenda.length > 0 ? (
              agenda.map((item) => (
                <div key={item.id_Revision} className="agenda-item">
                  
                  {/* Encabezado de la tarjeta */}
                  <div className="agenda-item-top">
                    <span className="agenda-id-badge">Revisión #{item.id_Revision} (Reparación #{item.id_Reparacion})</span>
                    <span className="agenda-estado-badge">
                      {item.Estado_Revision || 'Pendiente de Revisión'}
                    </span>
                  </div>

                  {/* Datos explícitos combinados de las tablas */}
                  <div className="agenda-grid-datos">
                    
                    <div className="agenda-celda">
                      <span className="celda-label">Motocicleta</span>
                      <span className="celda-valor">{item.MotoMarca} ({item.MotoPlaca})</span>
                    </div>

                    <div className="agenda-celda">
                      <span className="celda-label">Modelo / Color</span>
                      <span className="celda-valor">{item.MotoModelo} / {item.MotoColor || 'N/A'}</span>
                    </div>

                    <div className="agenda-celda">
                      <span className="celda-label">Propietario (Cliente)</span>
                      <span className="celda-valor">{item.ClienteNombre} {item.ClienteApellido}</span>
                    </div>

                    <div className="agenda-celda">
                      <span className="celda-label">Celular de Contacto</span>
                      <span className="celda-valor" style={{ color: '#38bdf8' }}>{item.ClienteCelular || 'Sin número'}</span>
                    </div>

                    <div className="agenda-celda">
                      <span className="celda-label">Fecha de Salida (Reparación)</span>
                      <span className="celda-valor" style={{ color: '#4ade80' }}>
                        {item.Fecha_Salida ? new Date(item.Fecha_Salida).toLocaleDateString() : 'Terminada'}
                      </span>
                    </div>

                    <div className="agenda-celda">
                      <span className="celda-label">Fecha Programada Revisión</span>
                      <span className="celda-valor">
                        {item.Fecha_Revision ? new Date(item.Fecha_Revision).toLocaleDateString() : 'Por definir'}
                      </span>
                    </div>

                  </div>

                  {/* Descripción del trabajo e información adicional */}
                  <div className="agenda-obs-box">
                    <span className="celda-label">Trabajo Realizado / Reparación</span>
                    <p className="obs-texto">{item.Descripcion_Trabajo || 'Sin detalles registrados.'}</p>
                    {item.Observaciones && (
                      <>
                        <span className="celda-label" style={{ marginTop: '8px' }}>Observaciones de Revisión</span>
                        <p className="obs-texto">{item.Observaciones}</p>
                      </>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="sin-datos">No hay motocicletas terminadas a espera de revisión en este momento.</div>
            )}
          </div>

          {/* Botón para volver al menú de mecánico */}
          <button className="btn-volver-panel" onClick={() => navigate('/mecanico')}>
            ← Volver al Panel Mecánico
          </button>

        </div>
      </div>
    </div>
  );
}