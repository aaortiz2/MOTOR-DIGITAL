import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Añadido
import './Eliminar_Mecanico.css';

export default function Eliminar_Mecanico() {
  const navigate = useNavigate(); // <-- Hook de navegación
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trabajadores');
      if (response.ok) {
        const data = await response.json();
        setTrabajadores(data);
      }
    } catch (error) {
      console.error('Error de red al conectar con el servidor:', error);
    }
  };

  const handleEliminar = async (id, nombreCompleto, rol) => {
    const confirmado = window.confirm(`¿Estás seguro de eliminar al ${rol || 'trabajador'} "${nombreCompleto}" de la base de datos?`);
    
    if (!confirmado) return;

    try {
      const response = await fetch(`http://localhost:3000/api/trabajadores/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMensaje({ texto: `Se eliminó correctamente a ${nombreCompleto}`, tipo: 'exito' });
        setTrabajadores(trabajadores.filter(t => t.id_trabajador !== id));
      } else {
        setMensaje({ texto: 'No se pudo eliminar al trabajador.', tipo: 'error' });
      }
    } catch (error) {
      console.error('Error en la petición de eliminación:', error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  const trabajadoresFiltrados = trabajadores.filter(t => {
    const texto = `${t.nombre} ${t.apellido} ${t.usuario || ''} ${t.rol || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="eliminar-screen">
      <div className="eliminar-card">
        
        <div className="eliminar-header">
          <h1>🛠️ Gestión de Personal</h1>
          <p>Eliminar Mecánico o Ayudante</p>
        </div>

        {mensaje.texto && (
          <div className={`alerta-mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="buscador-container">
          <span className="buscador-icon">🔍</span>
          <input 
            type="text" 
            className="buscador-input"
            placeholder="Buscar por nombre, apellido, usuario o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="lista-trabajadores">
          {trabajadoresFiltrados.length > 0 ? (
            trabajadoresFiltrados.map((t) => (
              <div key={t.id_trabajador} className="trabajador-item">
                <div className="trabajador-info">
                  <span className="trabajador-nombre">{t.nombre} {t.apellido}</span>
                  <div className="trabajador-detalles">
                    <span className={`rol-badge ${t.rol?.toLowerCase() === 'ayudante' ? 'rol-ayudante' : 'rol-mecanico'}`}>
                      {t.rol || 'Sin Rol'}
                    </span>
                    {t.usuario && <span className="usuario-tag">@{t.usuario}</span>}
                  </div>
                </div>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleEliminar(t.id_trabajador, `${t.nombre} ${t.apellido}`, t.rol)}
                >
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <div className="sin-resultados">No se encontraron mecánicos o ayudantes con ese criterio.</div>
          )}
        </div>

        {/* Botón de retorno vinculado al menú administrador */}
        <button className="btn-volver-panel" onClick={() => navigate(-1)}>
          ← Volver al Panel
        </button>

      </div>
    </div>
  );
}