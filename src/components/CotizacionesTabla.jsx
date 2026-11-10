import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CotizacionesTabla.css';

export default function CotizacionesTabla() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCotizacionesCompletas();
  }, []);

  const cargarCotizacionesCompletas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cotizaciones-completa');
      const data = await response.json();
      if (data.success) {
        setCotizaciones(data.data);
      }
    } catch (error) {
      console.error('Error al obtener datos de cotizaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="cotiz-total-screen">
      <div className="cotiz-total-container">
        
        <div className="cotiz-total-card">
          <div className="cotiz-total-header">
            <h1>📑 Registro Completo de Cotizaciones</h1>
            <p>Visualización detallada de todos los campos de la tabla Cotización</p>
          </div>

          <div className="lista-cotizaciones-detallada">
            {cargando ? (
              <div className="sin-datos">Cargando registros de la base de datos...</div>
            ) : cotizaciones.length > 0 ? (
              cotizaciones.map((cot) => (
                <div key={cot.id_Cotizacion} className="cotizacion-detalle-item">
                  
                  {/* Encabezado con ID y Monto Total */}
                  <div className="cotiz-item-top">
                    <span className="cotiz-id-badge">Cotización #{cot.id_Cotizacion}</span>
                    <span className="cotiz-total-monto">
                      Total: {cot.Monto_Total !== undefined && cot.Monto_Total !== null ? `${cot.Monto_Total} Bs` : 'No especificado'}
                    </span>
                  </div>

                  {/* Rejilla dinámica que expone cada columna de la cotización */}
                  <div className="cotiz-grid-datos">
                    
                    {/* Cliente */}
                    <div className="cotiz-celda">
                      <span className="celda-label">Cliente (ID: {cot.id_Cliente})</span>
                      <span className="celda-valor">
                        {cot.ClienteNombre ? `${cot.ClienteNombre} ${cot.ClienteApellido}` : 'Cliente no asignado'}
                      </span>
                    </div>

                    {/* Celular del cliente */}
                    <div className="cotiz-celda">
                      <span className="celda-label">Celular de Contacto</span>
                      <span className="cotiz-valor" style={{ color: '#38bdf8' }}>
                        {cot.ClienteCelular || 'Sin número'}
                      </span>
                    </div>

                    {/* Fecha de Cotización */}
                    <div className="cotiz-celda">
                      <span className="celda-label">Fecha de Cotización</span>
                      <span className="celda-valor">
                        {cot.fecha_Cotizacion ? new Date(cot.fecha_Cotizacion).toLocaleDateString() : 'No registrada'}
                      </span>
                    </div>

                    {/* Fecha de Validez */}
                    <div className="cotiz-celda">
                      <span className="celda-label">Fecha de Validez</span>
                      <span className="celda-valor">
                        {cot.fecha_Validez ? new Date(cot.fecha_Validez).toLocaleDateString() : 'No registrada'}
                      </span>
                    </div>

                    {/* Estado de Cotización */}
                    <div className="cotiz-celda">
                      <span className="celda-label">Estado</span>
                      <span className="cotiz-valor" style={{ color: '#fbbf24' }}>
                        {cot.estado_Cotizacion || 'Pendiente'}
                      </span>
                    </div>

                    {/* Renderizado dinámico de cualquier otro campo adicional */}
                    {Object.entries(cot).map(([key, value]) => {
                      if ([
                        'id_Cotizacion', 'id_Cliente', 'ClienteNombre', 'ClienteApellido', 
                        'ClienteCelular', 'fecha_Cotizacion', 'fecha_Validez', 
                        'estado_Cotizacion', 'Monto_Total'
                      ].includes(key)) {
                        return null;
                      }
                      return (
                        <div key={key} className="cotiz-celda">
                          <span className="celda-label">{key.replace(/_/g, ' ')}</span>
                          <span className="celda-valor">
                            {value !== null && value !== undefined ? String(value) : '---'}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                </div>
              ))
            ) : (
              <div className="sin-datos">No se encontraron registros en la tabla Cotización.</div>
            )}
          </div>

          {/* Botón para volver */}
          <button className="btn-volver-panel" onClick={() => navigate('/admin')}>
            ← Volver al Panel de Administrador
          </button>

        </div>
      </div>
    </div>
  );
}