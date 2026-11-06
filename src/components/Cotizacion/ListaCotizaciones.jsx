import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListaCotizaciones.css';

const API_BASE = 'http://localhost:3000/api';

export default function ListaCotizaciones({ onVolver }) {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const nombreAdmin = localStorage.getItem('nombreUsuario') || 'Administrador';

  useEffect(() => {
    fetch(`${API_BASE}/cotizaciones`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCotizaciones(data);
      })
      .catch(err => console.error("Error al cargar cotizaciones:", err))
      .finally(() => setCargando(false));
  }, []);

  // Función para actualizar el estado directamente desde la tabla
  const handleCambiarEstado = (idCotizacion, nuevoEstado) => {
    fetch(`${API_BASE}/cotizaciones/${idCotizacion}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoEstado })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Actualizamos la tabla visualmente sin recargar la página
          setCotizaciones(cotizaciones.map(cot => 
            cot.id_Cotizacion === idCotizacion 
              ? { ...cot, estado_Cotizacion: nuevoEstado } 
              : cot
          ));
          if (nuevoEstado.includes('Aprobada') || nuevoEstado.includes('Total')) {
            alert("✅ Estado actualizado y stock descontado del inventario.");
          }
        } else {
          alert("Error al actualizar el estado.");
        }
      })
      .catch(err => console.error("Error de red:", err));
  };

  const cotizacionesFiltradas = cotizaciones.filter(cot => {
    if (filtroEstado === 'Todas') return true;
    return cot.estado_Cotizacion === filtroEstado;
  });

  const getEstadoColor = (estado) => {
    if (estado === 'Aprobada' || estado === 'Con Reparación - Total') return '#22c55e'; 
    if (estado === 'Denegada') return '#ef4444'; 
    if (estado === 'Con Reparación - Pendiente') return '#f59e0b'; 
    return '#64748b'; 
  };

  return (
    <div className="lista-container">
      <header className="lista-header">
        <div className="header-brand">
          <span className="brand-badge">SISTEMA MOTO REPUESTOS</span>
          <h1 className="lista-title">HISTORIAL DE <span>COTIZACIONES</span></h1>
          <p className="lista-text">Revisa, filtra y descarga los presupuestos generados</p>
        </div>
        
        <div className="header-right">
          <div className="admin-badge">
            <span className="badge-icon">👤</span>
            <div>
              <p className="badge-rol">Admin:</p>
              <p className="badge-nombre">{nombreAdmin}</p>
            </div>
          </div>
          <button className="btn-volver-inicio" onClick={() => (onVolver ? onVolver() : navigate('/admin'))}>
            ⬅ VOLVER AL INICIO
          </button>
        </div>
      </header>

      <main className="lista-card">
        <div className="lista-controls">
          <h2 className="lista-subtitle">📋 Listado General</h2>
          
          <div className="filtros">
            <label>Filtrar Estado:</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="select-filtro">
              <option value="Todas">Todas las cotizaciones</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Denegada">Denegadas</option>
              <option value="Con Reparación - Pendiente">Con Reparación - Pendiente</option>
              <option value="Con Reparación - Total">Con Reparación - Total</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="mensaje-estado">Cargando el historial...</div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla-cotizaciones">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Moto (Placa)</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.length > 0 ? (
                  cotizacionesFiltradas.map(cot => (
                    <tr key={cot.id_Cotizacion}>
                      <td><strong className="num-cot">#{cot.id_Cotizacion}</strong></td>
                      <td>{cot.ClienteNombre} {cot.ClienteApellido}</td>
                      <td>
                        {cot.Placa ? (
                          <span><strong>{cot.Placa}</strong> <small>({cot.MotoMarca})</small></span>
                        ) : (
                          <span className="sin-moto">Sin moto</span>
                        )}
                      </td>
                      <td>{new Date(cot.fecha_Cotizacion).toLocaleDateString('es-BO')}</td>
                      <td><strong>Bs {Number(cot.Monto_Total).toFixed(2)}</strong></td>
                      <td>
                        <span className="badge-estado" style={{ backgroundColor: getEstadoColor(cot.estado_Cotizacion) }}>
                          {cot.estado_Cotizacion}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          
                          {/* SELECTOR PARA CAMBIAR ESTADO */}
                          <select 
                            className="select-estado-tabla"
                            value={cot.estado_Cotizacion}
                            onChange={(e) => handleCambiarEstado(cot.id_Cotizacion, e.target.value)}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aprobada">Aprobada</option>
                            <option value="Denegada">Denegada</option>
                            <option value="Con Reparación - Pendiente">Con Rep. - Pendiente</option>
                            <option value="Con Reparación - Total">Con Rep. - Total</option>
                          </select>

                          <a 
                            href={`http://localhost:3000/api/cotizaciones/${cot.id_Cotizacion}/pdf`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-descargar-pdf"
                          >
                            📥 PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="tabla-vacia">No hay cotizaciones que coincidan con el filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}