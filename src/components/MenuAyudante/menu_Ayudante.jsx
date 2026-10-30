import React from 'react';
import { useNavigate } from 'react-router-dom';
import './menu_Ayudante.css';

export default function MenuAyudante() {
  const navigate = useNavigate();

  // Opciones principales de apoyo y recepción
  const ayudanteOptions = [
    {
      id: 'crear-cotizacion',
      title: 'Crear Cotización',
      desc: 'Generar presupuestos para clientes en mostrador o consultas',
      path: '/cotizaciones',
      badge: 'PRESUPUESTOS',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      )
    },
    {
      id: 'registrar-cliente',
      title: 'Registrar Cliente',
      desc: 'Alta de nuevos propietarios y datos de motocicletas',
      path: '/registro-cliente',
      badge: 'MOSTRADOR',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    }
  ];

  return (
    <div className="menu-ayudante-container">
      {/* Encabezado del área de recepción y soporte */}
      <header className="menu-ayudante-header">
        <div className="ayudante-header-info">
          <span className="ayudante-badge">RECEPCIÓN Y APOYO TÉCNICO</span>
          <h1 className="menu-ayudante-title">PANEL <span>AYUDANTE</span></h1>
          <p className="menu-ayudante-text">Atención al cliente, cotizaciones e ingreso de vehículos</p>
        </div>
        <button className="btn-logout-ayudante" onClick={() => navigate('/')}>
          SALIR
        </button>
      </header>

      {/* Rejilla de tarjetas amplias para el ayudante */}
      <main className="menu-ayudante-grid">
        {ayudanteOptions.map((item) => (
          <div
            key={item.id}
            className="ayudante-card"
            onClick={() => navigate(item.path)}
          >
            <div className="card-top-bar-ayudante">
              <div className="card-icon-ayudante">{item.icon}</div>
              <span className="card-tag-ayudante">{item.badge}</span>
            </div>

            <div className="card-content-ayudante">
              <h3 className="card-title-ayudante">{item.title}</h3>
              <p className="card-desc-ayudante">{item.desc}</p>
            </div>

            <div className="card-action-bar-ayudante">
              <span>INGRESAR AHORA</span>
              <span className="card-arrow-ayudante">&rarr;</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}