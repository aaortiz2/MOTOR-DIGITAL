import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ControlReparaciones.css';

const API_BASE = 'http://localhost:3000/api';

export default function ControlReparaciones() {
  const navigate = useNavigate();
  const [reparaciones, setReparaciones] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Obtenemos el nombre del administrador logueado
  const nombreAdmin = localStorage.getItem('nombreUsuario') || 'Administrador';

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resReparaciones, resMecanicos] = await Promise.all([
          fetch(`${API_BASE}/reparaciones`),
          fetch(`${API_BASE}/mecanicos`)
        ]);

        if (!resReparaciones.ok) throw new Error('Error al cargar reparaciones del servidor');
        if (!resMecanicos.ok) throw new Error('Error al cargar mecánicos del servidor');

        const dataReparaciones = await resReparaciones.json();
        const dataMecanicos = await resMecanicos.json();

        setReparaciones(Array.isArray(dataReparaciones) ? dataReparaciones : []);
        setMecanicos(Array.isArray(dataMecanicos) ? dataMecanicos : []);
        
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos. Verifica que el servidor backend esté encendido.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleAsignarMecanico = (idReparacion, idMecanico) => {
    fetch(`${API_BASE}/reparaciones/${idReparacion}/asignar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_Mecanico: idMecanico })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setReparaciones(reparaciones.map(rep => {
          if (rep.id_Reparacion === idReparacion) {
            const mecEncontrado = mecanicos.find(m => m.id_Mecanico.toString() === idMecanico);
            return { 
              ...rep, 
              id_Mecanico: idMecanico || null, 
              MecanicoNombre: mecEncontrado ? mecEncontrado.nombre : null, 
              MecanicoApellido: mecEncontrado ? mecEncontrado.apellido : null 
            };
          }
          return rep;
        }));
      }
    })
    .catch(err => console.error("Error al asignar mecánico:", err));
  };

  const handleCambiarEstado = (idReparacion, nuevoEstado) => {
    fetch(`${API_BASE}/reparaciones/${idReparacion}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Estado_Reparacion: nuevoEstado })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setReparaciones(reparaciones.map(rep => 
          rep.id_Reparacion === idReparacion ? { ...rep, Estado_Reparacion: nuevoEstado } : rep
        ));
      }
    })
    .catch(err => console.error("Error al cambiar estado:", err));
  };

  return (
    <div className="control-container">
      
      {/* HEADER CON ESTILO DEL SISTEMA */}
      <header className="control-header">
        <div className="header-brand">
          <h1>MOTO REPUESTOS EL BARATÓN</h1>
          <p>Control de Reparaciones y Taller</p>
        </div>
        
        <div className="header-right">
          <div className="trabajador-badge">
            <span className="badge-icon">👤</span>
            <div>
              <p className="badge-rol">Atendido por (Admin):</p>
              <p className="badge-nombre">{nombreAdmin}</p>
            </div>
          </div>
          <button className="btn-volver-menu" onClick={() => navigate('/admin')}>
            ⬅ Volver al Inicio
          </button>
        </div>
      </header>

      {/* TARJETA PRINCIPAL CON LA TABLA */}
      <main className="control-card">
        <div className="card-title-bar">
          <h2>🔧 Gestión de Reparaciones (Taller)</h2>
        </div>

        {cargando ? (
          <div className="mensaje-estado">Cargando taller...</div>
        ) : error ? (
          <div className="mensaje-error">{error}</div>
        ) : (
          <table className="tabla-reparaciones">
            <thead>
              <tr>
                <th>ID Rep.</th>
                <th>Cliente</th>
                <th>Moto</th>
                <th>Mecánico Asignado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reparaciones.length > 0 ? (
                reparaciones.map(rep => (
                  <tr key={rep.id_Reparacion}>
                    <td><strong>#{rep.id_Reparacion}</strong></td>
                    <td>{rep.ClienteNombre} {rep.ClienteApellido}</td>
                    <td><strong className="placa-highlight">{rep.Placa}</strong> <small>({rep.MotoMarca})</small></td>
                    
                    <td>
                      <select 
                        value={rep.id_Mecanico || ''} 
                        onChange={(e) => handleAsignarMecanico(rep.id_Reparacion, e.target.value)}
                        className="select-asignar"
                      >
                        <option value="">-- Sin asignar --</option>
                        {mecanicos.map(mec => (
                          <option key={mec.id_Mecanico} value={mec.id_Mecanico}>
                            {mec.nombre} {mec.apellido}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select 
                        value={rep.Estado_Reparacion} 
                        onChange={(e) => handleCambiarEstado(rep.id_Reparacion, e.target.value)}
                        className={`select-estado estado-${rep.Estado_Reparacion.toLowerCase().replace(' ', '-')}`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="tabla-vacia">No hay reparaciones registradas aún.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}