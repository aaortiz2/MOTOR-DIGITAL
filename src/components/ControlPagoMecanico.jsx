import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlPagoMecanico.css';

export default function ControlPagoMecanico() {
  const navigate = useNavigate();
  const [mecanicos, setMecanicos] = useState([]);
  const [pagosEstado, setPagosEstado] = useState({}); // Controla verde/rojo por id_reparacion

  // Fecha actual formateada para la barra superior
  const fechaActualFormateada = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    cargarControlPagos();
  }, []);

  const cargarControlPagos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/control-pagos');
      const data = await response.json();
      if (data.success) {
        setMecanicos(data.data);
        
        // Inicializamos estados de pago (Por defecto: Pendiente / Rojo, excepto si ya está pagado)
        const estadoInicial = {};
        data.data.forEach(mecanico => {
          mecanico.reparaciones.forEach(rep => {
            // ID 1 en tu BD ya está finalizada, la ponemos como saldada (true) por defecto como ejemplo inicial
            estadoInicial[rep.id_Reparacion] = rep.id_Reparacion === 1 ? true : false;
          });
        });
        setPagosEstado(estadoInicial);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Alternar estado de pago (Verde: saldado <-> Rojo: pendiente)
  const togglePago = (idReparacion) => {
    setPagosEstado(prev => ({
      ...prev,
      [idReparacion]: !prev[idReparacion]
    }));
  };

  return (
    <div className="pagos-screen">
      <div className="pagos-container">
        
        {/* BARRA SUPERIOR CON LA FECHA ACTUAL */}
        <div className="fecha-actual-bar">
          <span className="fecha-texto">📅 Hoy: {fechaActualFormateada}</span>
          <span className="tarifa-badge">Tarifa: 50 Bs / Moto Terminada</span>
        </div>

        <div className="pagos-card">
          <div className="pagos-header">
            <h1>💰 Control de Pagos a Mecánicos</h1>
            <p>Liquidación semanal (Sábados) por motocicletas reparadas</p>
          </div>

          <div className="lista-mecanicos">
            {mecanicos.length > 0 ? (
              mecanicos.map((mecanico) => {
                // Filtramos motos finalizadas (que tienen fecha_salida o estado completado)
                const motosTerminadas = mecanico.reparaciones.filter(r => r.fecha_salida !== null);
                // Cálculo del total a pagar (50 Bs por cada moto terminada asignada)
                const totalACobrar = motosTerminadas.length * 50;

                return (
                  <div key={mecanico.id_trabajador} className="mecanico-pago-card">
                    
                    <div className="mecanico-info-top">
                      <div className="mecanico-nombre-rol">
                        <h3>{mecanico.nombre} {mecanico.apellido}</h3>
                        <span className="rol-tag">{mecanico.rol || 'Técnico'}</span>
                      </div>
                      <div className="total-cobro-box">
                        <span className="total-label">Total a Pagar (Sábado)</span>
                        <span className="total-monto">{totalACobrar} Bs</span>
                      </div>
                    </div>

                    {/* Lista de reparaciones asociadas */}
                    <div className="reparaciones-asociadas">
                      {mecanico.reparaciones.length > 0 ? (
                        mecanico.reparaciones.map((rep) => {
                          const estaSaldado = pagosEstado[rep.id_Reparacion] || false;
                          const esFinalizada = rep.fecha_salida !== null;

                          return (
                            <div key={rep.id_Reparacion} className="reparacion-fila">
                              <span className="rep-desc">
                                🔧 {rep.descripcion || `Reparación #${rep.id_Reparacion}`}
                              </span>
                              
                              <span className="rep-plazo">
                                🏁 Plazo: {rep.fecha_salida ? new Date(rep.fecha_salida).toLocaleDateString() : 'En Proceso'}
                              </span>

                              <span className={`rep-estado-badge ${esFinalizada ? 'estado-finalizada' : 'estado-proceso'}`}>
                                {esFinalizada ? 'Terminada (50 Bs)' : 'En Proceso (0 Bs)'}
                              </span>

                              {/* Botón de pago interactivo Verde / Rojo */}
                              <button
                                className={`btn-estado-pago ${estaSaldado ? 'saldado' : 'pendiente'}`}
                                onClick={() => togglePago(rep.id_Reparacion)}
                              >
                                {estaSaldado ? '✔ Saldado' : '✖ Pendiente'}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="sin-reparaciones">Sin reparaciones asignadas actualmente.</div>
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="sin-reparaciones" style={{ textAlign: 'center' }}>No hay mecánicos registrados en la base de datos.</div>
            )}
          </div>

          {/* Botón para volver al menú */}
          <button className="btn-volver-panel" onClick={() => navigate('/admin')}>
            ← Volver al Panel de Administrador
          </button>

        </div>
      </div>
    </div>
  );
}