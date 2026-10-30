import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './menu_Mecanico.css';

export default function MenuMecanico() {
  const navigate = useNavigate();

  const [trabajador, setTrabajador] = useState(null); // { Nombre, Apellido, Rol }
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const nombreUsuario = localStorage.getItem('nombreUsuario');

    // Si no hay nadie logueado, de vuelta al login.
    if (!nombreUsuario) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/api/trabajador/${nombreUsuario}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTrabajador(data.trabajador);
        }
      })
      .catch((err) => {
        console.error('No se pudo obtener los datos del trabajador:', err);
      })
      .finally(() => setCargando(false));
  }, [navigate]);

  const rol = (trabajador?.Rol || localStorage.getItem('rol') || '').toLowerCase();
  const esMecanico = rol.includes('mecanico');

  // Opciones específicas para el trabajo diario del mecánico.
  // "restringida: true" marca las opciones que solo debe poder abrir un mecánico,
  // no un recepcionista/ayudante que entre a esta misma pantalla.
  const mecanicoOptions = [
    {
      id: 'crear-cotizacion',
      title: 'Crear Cotización',
      desc: 'Generar presupuesto de repuestos y mano de obra',
      path: '/cotizaciones',
      badge: 'NUEVO TRABAJO',
      restringida: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      )
    },
    {
      id: 'mis-reparaciones',
      title: 'Mis Reparaciones',
      desc: 'Motos asignadas, estado de avance y diagnósticos',
      path: '/revision',
      badge: 'EN TALLER',
      restringida: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      id: 'mi-agenda',
      title: 'Mi Lista Agenda',
      desc: 'Turnos del día, mantenimientos y entregas pendientes',
      path: '/notificaciones',
      badge: 'HOY',
      restringida: false, // la agenda la puede ver cualquiera que entre aquí
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      )
    }
  ];

  const handleCardClick = (item) => {
    if (item.restringida && !esMecanico) return; // bloqueado para no-mecánicos
    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="menu-mecanico-container">
      {/* Encabezado del área técnica */}
      <header className="menu-mecanico-header">
        <div className="mecanico-header-info">
          <span className="mecanico-badge">ESTACIÓN DE TRABAJO TÉCNICA</span>
          <h1 className="menu-mecanico-title">PANEL <span>MECÁNICO</span></h1>
          <p className="menu-mecanico-text">
            {cargando
              ? 'Cargando datos del trabajador...'
              : trabajador
                ? `Bienvenido, ${trabajador.Nombre} ${trabajador.Apellido} — ${esMecanico ? 'Mecánico' : 'Recepción'}`
                : 'Gestión de diagnósticos, repuestos y mantenimientos'}
          </p>
        </div>
        <button className="btn-logout-mecanico" onClick={handleLogout}>
          SALIR
        </button>
      </header>

      {/* Rejilla de acceso directo para el mecánico */}
      <main className="menu-mecanico-grid">
        {mecanicoOptions.map((item) => {
          const bloqueada = item.restringida && !esMecanico;
          return (
            <div
              key={item.id}
              className={`mecanico-card${bloqueada ? ' mecanico-card-restringida' : ''}`}
              onClick={() => handleCardClick(item)}
              aria-disabled={bloqueada}
            >
              <div className="card-top-bar">
                <div className="card-icon-mecanico">{item.icon}</div>
                <span className="card-tag">{bloqueada ? 'RESTRINGIDO' : item.badge}</span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">
                  {bloqueada ? 'Disponible solo para el rol de mecánico.' : item.desc}
                </p>
              </div>

              <div className="card-action-bar">
                <span>{bloqueada ? 'SIN ACCESO' : 'ABRIR PANEL'}</span>
                {!bloqueada && <span className="card-arrow">&rarr;</span>}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
  