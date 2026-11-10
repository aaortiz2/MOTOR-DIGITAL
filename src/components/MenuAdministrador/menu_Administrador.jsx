import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './menu_Administrador.css';

export default function MenuAdministrador() {
  const navigate = useNavigate();

  const [trabajador, setTrabajador] = useState(null); // { Nombre, Apellido, Rol }
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const nombreUsuario = localStorage.getItem('nombreUsuario');

    // Si no hay nadie logueado, redirige al login.
    if (!nombreUsuario) {
      navigate('/');
      return;
    }

    // Consulta al backend apuntando a la tabla Trabajador
    fetch(`http://localhost:3000/api/trabajador/${nombreUsuario}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTrabajador(data.trabajador);
        }
      })
      .catch((err) => {
        console.error('No se pudo obtener los datos del administrador:', err);
      })
      .finally(() => setCargando(false));
  }, [navigate]);

  const rol = (trabajador?.Rol || localStorage.getItem('rol') || '').toLowerCase();
  const esAdmin = rol.includes('admin') || rol.includes('administrador');

  // Opciones del menú del administrador estructuradas con badge y restringida
  const adminOptions = [
    {
      id: 'reg-mecanico',
      title: 'Registrar Mecánico',
      desc: 'Alta de personal técnico en taller',
      path: '/registro-mecanico',
      badge: 'PERSONAL',
      restringida: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    },
    {
      id: 'nueva-cotizacion',
      title: 'Nueva Cotización',
      desc: 'Crear presupuesto de repuestos y servicios',
      path: '/cotizacion',
      badge: 'NUEVO TRABAJO',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      )
    },
    {
      id: 'elim-mecanico',
      title: 'Eliminar Mecánico',
      desc: 'Baja o suspensión de personal técnico',
      path: '/eliminar-mecanico',
      badge: 'GESTIÓN',
      restringida: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="18" y1="11" x2="22" y2="11" />
        </svg>
      )
    },
    {
      id: 'reg-cliente',
      title: 'Registrar Cliente',
      desc: 'Crear ficha y registro de propietario',
      path: '/registro-cliente',
      badge: 'REGISTRO',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M9 21v-2a4 4 0 0 1 4-4h1" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6m3-3h-6" />
        </svg>
      )
    },
    {
      id: 'pago-mecanico',
      title: 'Control Pago Mecánico',
      desc: 'Gestión de comisiones, sueldos y trabajos',
      path: '/pago-mecanico',
      badge: 'FINANZAS',
      restringida: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      id: 'rep-completa',
      title: 'Tabla Reparaciones',
      desc: 'Visualización detallada de todos los datos de reparación',
      path: '/reparaciones-completa',
      badge: 'BASE DE DATOS',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
          <path d="M19 3h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
          <path d="M9 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" />
          <path d="M19 13h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" />
        </svg>
      )
    },
    {
      id: 'cotiz-tabla',
      title: 'Tabla Cotizaciones',
      desc: 'Visualización explícita de todos los datos de cotización',
      path: '/cotizaciones-tabla',
      badge: 'BASE DE DATOS',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      id: 'repuestos',
      title: 'Repuestos',
      desc: 'Inventario de refacciones originales TVS',
      path: '/repuestos',
      badge: 'INVENTARIO',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      )
    },
    {
      id: 'control-clientes',
      title: 'Control Clientes',
      desc: 'Historial de motos, servicios y garantías',
      path: '/control-clientes',
      badge: 'CLIENTES',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M9 21v-2a4 4 0 0 1 4-4h1" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6m3-3h-6" />
        </svg>
      )
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      desc: 'Avisos, alertas y mensajes del sistema',
      path: '/notificaciones',
      badge: 'ALERTAS',
      restringida: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    }
  ];

  const handleCardClick = (item) => {
    if (item.restringida && !esAdmin) return;
    navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="menu-admin-container">
      {/* Encabezado del área de administración con el nombre del trabajador */}
      <header className="menu-admin-header">
        <div className="header-info">
          <span className="brand-badge">SISTEMA MOTO REPUESTOS</span>
          <h1 className="menu-admin-title">PANEL <span>ADMINISTRADOR</span></h1>
          <p className="menu-admin-text">
            {cargando
              ? 'Cargando datos del trabajador...'
              : trabajador
                ? `Bienvenido, ${trabajador.Nombre} ${trabajador.Apellido} — ${trabajador.Rol || 'Administrador'}`
                : 'Gestión integral de taller, repuestos y servicios'}
          </p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          SALIR
        </button>
      </header>

      {/* Rejilla de tarjetas idéntica en estructura a la del mecánico */}
      <main className="menu-admin-grid">
        {adminOptions.map((item) => {
          const bloqueada = item.restringida && !esAdmin;
          return (
            <div
              key={item.id}
              className={`admin-card${bloqueada ? ' admin-card-restringida' : ''}`}
              onClick={() => handleCardClick(item)}
              aria-disabled={bloqueada}
            >
              <div className="card-top-bar">
                <div className="card-icon">{item.icon}</div>
                <span className="card-tag">{bloqueada ? 'RESTRINGIDO' : item.badge}</span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">
                  {bloqueada ? 'Disponible solo para el rol de administrador.' : item.desc}
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