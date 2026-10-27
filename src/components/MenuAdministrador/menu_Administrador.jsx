import React from 'react';
import { useNavigate } from 'react-router-dom';
import './menu_Administrador.css';

export default function MenuAdministrador() {
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'reg-mecanico',
      title: 'Registrar Mecánico',
      desc: 'Alta de personal técnico en taller',
      path: '/registro-mecanico',
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
      id: 'elim-mecanico',
      title: 'Eliminar Mecánico',
      desc: 'Baja o suspensión de personal técnico',
      path: '/eliminar-mecanico',
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
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      id: 'control-reparacion',
      title: 'Control Reparación',
      desc: 'Monitoreo de motocicletas en servicio',
      path: '/revision',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      id: 'cotizaciones',
      title: 'Cotizaciones',
      desc: 'Presupuestos de repuestos y servicios',
      path: '/cotizaciones',
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
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  return (
    <div className="menu-admin-container">
      {/* Encabezado con estética de Taller */}
      <header className="menu-admin-header">
        <div className="header-info">
          <span className="brand-badge">SISTEMA MOTO REPUESTOS</span>
          <h1 className="menu-admin-title">PANEL <span>ADMINISTRADOR</span></h1>
          <p className="menu-admin-text">Gestión integral de taller, repuestos y servicios</p>
        </div>
        <button className="btn-logout" onClick={() => navigate('/')}>
          SALIR
        </button>
      </header>

      {/* Tarjetas interactivas */}
      <main className="menu-admin-grid">
        {adminOptions.map((item) => (
          <div
            key={item.id}
            className="admin-card"
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon">{item.icon}</div>
            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </div>
            <div className="card-arrow">&rarr;</div>
          </div>
        ))}
      </main>
    </div>
  );
}