import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlClientes.css';

export default function ControlClientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [clienteFrecuente, setClienteFrecuente] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarControlClientes();
  }, []);

  const cargarControlClientes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/control-clientes');
      const data = await response.json();
      if (data.success) {
        setClientes(data.clientes || []);
        setClienteFrecuente(data.clienteFrecuente || null);
      }
    } catch (error) {
      console.error('Error al cargar datos de clientes:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrado en tiempo real por cualquier texto de la base de datos
  const clientesFiltrados = clientes.filter(c => {
    const texto = Object.values(c).join(' ').toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="clientes-screen">
      <div className="clientes-container">
        
        {/* ESTADÍSTICA SUPERIOR: CLIENTE FRECUENTE (1 punto cada 3 cotizaciones) */}
        {clienteFrecuente && (
          <div className="stats-banner">
            <div className="stats-info">
              <span className="stats-tag">⭐ Cliente Frecuente Destacado</span>
              <h2 className="stats-title">
                {clienteFrecuente.Nombre || clienteFrecuente.nombre || 'Sin Nombre'} {clienteFrecuente.Apellido || clienteFrecuente.apellido || ''}
              </h2>
              <p className="stats-desc">
                Cotizaciones totales: {clienteFrecuente.total_cotizaciones} (Sistema: 1 punto por cada 3 cotizaciones)
              </p>
            </div>
            <div className="stats-badge-puntos">
              🏆 {clienteFrecuente.puntos_frecuente} Puntos Frecuentes
            </div>
          </div>
        )}

        <div className="clientes-card">
          
          <div className="clientes-header">
            <h1>👥 Control de Clientes</h1>
            <p>Visualización de registros en bruto de la tabla Cliente</p>
          </div>

          {/* Buscador inteligente */}
          <div className="buscador-container">
            <span style={{ marginRight: '10px' }}>🔍</span>
            <input 
              type="text" 
              className="buscador-input"
              placeholder="Buscar por nombre, apellido, celular o cualquier dato..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Lista de clientes detallada en bruto */}
          <div className="lista-clientes-grid">
            {cargando ? (
              <div className="sin-datos">Cargando registros desde la base de datos...</div>
            ) : clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente, index) => {
                const idCliente = cliente.id_Cliente || cliente.id_cliente || cliente.id || index;

                return (
                  <div key={idCliente} className="cliente-item-bruto">
                    
                    <div className="cliente-item-top">
                      <span className="cliente-id-badge">ID Cliente: #{idCliente}</span>
                      <span className="cliente-puntos-tag">
                        📊 Cotizaciones: {cliente.total_cotizaciones} | Puntos: {cliente.puntos_frecuente} pts
                      </span>
                    </div>

                    {/* Muestra dinámicamente CADA COLUMNA perteneciente a la tabla Cliente */}
                    <div className="cliente-grid-datos">
                      {Object.entries(cliente).map(([key, value]) => {
                        // Omitimos los campos auxiliares calculados para mostrar estrictamente los datos de la tabla
                        if (['total_cotizaciones', 'puntos_frecuente'].includes(key)) return null;

                        return (
                          <div key={key} className="cliente-celda">
                            <span className="celda-label">{key.replace(/_/g, ' ')}</span>
                            <span className="celda-valor">
                              {value !== null && value !== undefined ? String(value) : '---'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="sin-datos">No se encontraron clientes registrados.</div>
            )}
          </div>

          {/* Botón para volver al menú de administrador */}
          <button className="btn-volver-panel" onClick={() => navigate('/admin')}>
            ← Volver al Panel de Administrador
          </button>

        </div>
      </div>
    </div>
  );
}