import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cotizacion.css';

// URL base de nuestro servidor backend en Node.js
const API_BASE = 'http://localhost:3000/api';

export default function Cotizacion({ usuarioLogueado, onVolver }) {
  const navigate = useNavigate();

  // 1. TRABAJADOR AUTOMÁTICO SEGÚN SESIÓN
  const [trabajador, setTrabajador] = useState(null); 
  const [cargandoTrabajador, setCargandoTrabajador] = useState(true);

  // ESTADOS DEL FLUJO DE TRABAJO (Modales)
  const [modalClienteOpen, setModalClienteOpen] = useState(true);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [preguntaMotoOpen, setPreguntaMotoOpen] = useState(false);
  const [modalMotoOpen, setModalMotoOpen] = useState(false);
  const [motosCliente, setMotosCliente] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState(null);

  const [modoNuevaMoto, setModoNuevaMoto] = useState(false);
  const [nuevaMoto, setNuevaMoto] = useState({
    Placa: '', Marca: '', Modelo: '', Color: '', Kilometraje_Actual: ''
  });

  // --- LISTA DE REPUESTOS / PROFORMA ---
  const [busquedaRepuesto, setBusquedaRepuesto] = useState('');
  const [repuestosSugeridos, setRepuestosSugeridos] = useState([]);
  const [items, setItems] = useState([]); 
  const [guardando, setGuardando] = useState(false);
  
  // Campo de observaciones
  const [observaciones, setObservaciones] = useState('');

  // Estado para el modal final
  const [cotizacionGuardada, setCotizacionGuardada] = useState(null); 
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('Aprobada');
  
  // Estado para el check visual de "Guardado"
  const [estadoGuardado, setEstadoGuardado] = useState(false);

  // Fecha extraída automáticamente del dispositivo
  const [fechaActual] = useState(
    new Date().toLocaleDateString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  // Cargar datos del trabajador al iniciar
  useEffect(() => {
    const usuarioSesion = usuarioLogueado || localStorage.getItem('nombreUsuario');

    if (!usuarioSesion) {
      setCargandoTrabajador(false);
      return;
    }

    fetch(`${API_BASE}/trabajador/${usuarioSesion}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTrabajador(data.trabajador);
        }
      })
      .catch((err) => console.error("Error al cargar trabajador:", err))
      .finally(() => setCargandoTrabajador(false));
  }, [usuarioLogueado]);

  const rol = (trabajador?.Rol || localStorage.getItem('rol') || '').toLowerCase();
  const esMecanico = rol.includes('mecanico');

  const nombreTrabajador = trabajador
    ? `${trabajador.Nombre} ${trabajador.Apellido}`
    : cargandoTrabajador
      ? 'Cargando...'
      : 'Sesión no identificada';

  // Búsqueda en tiempo real de clientes
  useEffect(() => {
    if (busquedaCliente.trim() === '') {
      setClientesSugeridos([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`${API_BASE}/clientes/buscar?q=${encodeURIComponent(busquedaCliente)}`)
        .then((res) => res.json())
        .then((data) => setClientesSugeridos(data))
        .catch((err) => console.error("Error buscando clientes:", err));
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaCliente]);

  // Búsqueda en tiempo real de repuestos
  useEffect(() => {
    if (!busquedaRepuesto || busquedaRepuesto.trim() === '') {
      setRepuestosSugeridos([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`${API_BASE}/repuestos/buscar?q=${encodeURIComponent(busquedaRepuesto)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error en la respuesta del servidor");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setRepuestosSugeridos(data);
          } else {
            setRepuestosSugeridos([]);
          }
        })
        .catch((err) => {
          console.error("Error buscando repuestos:", err);
          setRepuestosSugeridos([]);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaRepuesto]);

  const handleAceptarCliente = () => {
    if (clienteSeleccionado) {
      setModalClienteOpen(false);
      setPreguntaMotoOpen(true); 
    }
  };

  const handleRespuestaTieneMoto = (tiene) => {
    setPreguntaMotoOpen(false);
    if (tiene && clienteSeleccionado) {
      fetch(`${API_BASE}/motos/cliente/${clienteSeleccionado.id_Cliente}`)
        .then((res) => res.json())
        .then((data) => {
          setMotosCliente(data);
          setModalMotoOpen(true); 
        })
        .catch((err) => console.error("Error al buscar motos:", err));
    }
  };

  const handleGuardarNuevaMoto = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/motos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_Cliente: clienteSeleccionado.id_Cliente,
        ...nuevaMoto
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMotoSeleccionada(data.moto); 
          setModoNuevaMoto(false);
          setModalMotoOpen(false);
        }
      })
      .catch((err) => console.error("Error al guardar moto:", err));
  };

  const reiniciarProceso = () => {
    setClienteSeleccionado(null);
    setMotoSeleccionada(null);
    setModalClienteOpen(true);
    setObservaciones('');
  };

  const handleIrAReparacion = () => {
    if (!esMecanico || !clienteSeleccionado) return;
    navigate('/revision', {
      state: {
        cliente: clienteSeleccionado,
        moto: motoSeleccionada,
      },
    });
  };

  const agregarRepuesto = (repuesto) => {
    setItems((prev) => {
      const yaExiste = prev.find((i) => i.Codigo_Repuesto === repuesto.Codigo_Repuesto);
      if (yaExiste) {
        return prev.map((i) =>
          i.Codigo_Repuesto === repuesto.Codigo_Repuesto
            ? { ...i, Cantidad: i.Cantidad + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          Codigo_Repuesto: repuesto.Codigo_Repuesto,
          Nombre: repuesto.Nombre,
          Precio_Unitario: Number(repuesto.Precio_Unitario),
          Cantidad: 1,
          Descuento: 0,
        },
      ];
    });
    setBusquedaRepuesto('');
    setRepuestosSugeridos([]);
  };

  const actualizarItem = (codigo, campo, valor) => {
    setItems((prev) =>
      prev.map((i) =>
        i.Codigo_Repuesto === codigo ? { ...i, [campo]: Math.max(0, Number(valor) || 0) } : i
      )
    );
  };

  const quitarItem = (codigo) => {
    setItems((prev) => prev.filter((i) => i.Codigo_Repuesto !== codigo));
  };

  const calcularSubtotal = (item) => item.Cantidad * item.Precio_Unitario - item.Descuento;

  const montoTotal = items.reduce((acc, item) => acc + calcularSubtotal(item), 0);

  const handleGuardarCotizacion = () => {
    if (!clienteSeleccionado || items.length === 0 || !trabajador?.id_trabajador) return;

    setGuardando(true);
    fetch(`${API_BASE}/cotizaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_Cliente: clienteSeleccionado.id_Cliente,
        id_trabajador: trabajador.id_trabajador,
        id_Moto: motoSeleccionada?.id_Motocicleta || null,
        Observaciones: observaciones, 
        items: items.map((i) => ({
          Codigo_Repuesto: i.Codigo_Repuesto,
          Cantidad: i.Cantidad,
          Precio_Unitario: i.Precio_Unitario,
          Descuento: i.Descuento,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCotizacionGuardada(data);
        } else {
          alert(data.message || 'No se pudo guardar la cotización.');
        }
      })
      .catch((err) => {
        console.error('Error al guardar cotización:', err);
        alert('No se pudo conectar con el servidor.');
      })
      .finally(() => setGuardando(false));
  };

  // Cambiar el estado con check visual y redirección automática
  const handleCambiarEstado = () => {
    if (!cotizacionGuardada) return;
    setEstadoGuardado(true);

    fetch(`${API_BASE}/cotizaciones/${cotizacionGuardada.id_Cotizacion}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nuevoEstado: nuevoEstadoSeleccionado })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTimeout(() => {
            if (onVolver) onVolver(); else navigate(-1);
          }, 1500);
        } else {
          setEstadoGuardado(false);
          alert('No se pudo guardar el estado');
        }
      })
      .catch((err) => {
        setEstadoGuardado(false);
        console.error('Error al cambiar estado:', err);
      });
  };

  const handleNuevaCotizacion = () => {
    setItems([]);
    setCotizacionGuardada(null);
    setEstadoGuardado(false);
    reiniciarProceso();
  };

  // Lógica para calcular la deuda si aplica
  const calcularDeuda = () => {
    if (!cotizacionGuardada) return 0;
    if (nuevoEstadoSeleccionado === 'Con Reparación - Pendiente') {
      return cotizacionGuardada.Monto_Total / 2;
    }
    return 0;
  };

  return (
    <div className="cotizacion-screen">
      <header className="cotizacion-header">
        <div className="header-brand">
          <h1>MOTO REPUESTOS EL BARATÓN</h1>
          <p>Módulo de Registro de Cotizaciones Web</p>
        </div>

        <div className="trabajador-badge">
          <span className="badge-icon">👤</span>
          <div>
            <p className="badge-rol">
              Atendido por ({cargandoTrabajador ? 'Cargando...' : (trabajador?.Rol || 'Sin rol')}):
            </p>
            <p className="badge-nombre">{nombreTrabajador}</p>
          </div>
        </div>
      </header>

      <main className="cotizacion-card-main">
        <div className="main-card-header">
          <h2>📋 Resumen de Cotización Registrar</h2>
          
          <div className="header-acciones">
            {/* BOTÓN ROJO ESTILO TALLER */}
            <button 
              className="btn-volver-rojo" 
              onClick={() => (onVolver ? onVolver() : navigate(-1))}
            >
              ⬅ VOLVER AL INICIO
            </button>

            {/* NUEVO BOTÓN AMARILLO ESTILO TALLER */}
            {clienteSeleccionado && (
              <button className="btn-cambiar-amarillo" onClick={reiniciarProceso}>
                🔄 CAMBIAR CLIENTE / MOTO
              </button>
            )}
          </div>
        </div>

        <div className="datos-grid">
          <div className="dato-box">
            <span className="dato-label">Trabajador:</span>
            <p className="dato-valor">{nombreTrabajador}</p>
            {!cargandoTrabajador && trabajador && (
              <p className="dato-sub">{trabajador.Rol}</p>
            )}
          </div>

          <div className="dato-box">
            <span className="dato-label">Cliente:</span>
            {clienteSeleccionado ? (
              <div>
                <p className="dato-valor">{clienteSeleccionado.Nombre} {clienteSeleccionado.Apellido}</p>
                <p className="dato-sub">Celular: {clienteSeleccionado.Celular}</p>
              </div>
            ) : (
              <p className="dato-vacio">Sin cliente seleccionado</p>
            )}
          </div>

          <div className="dato-box">
            <span className="dato-label">Fecha Actual:</span>
            <p className="dato-fecha">{fechaActual}</p>
          </div>
        </div>

        <div className="dato-box moto-box">
          <span className="dato-label">Moto Asociada:</span>
          {motoSeleccionada ? (
            <div className="moto-detalles-grid">
              <div><span className="sub-label">Placa:</span> <strong className="placa-highlight">{motoSeleccionada.Placa}</strong></div>
              <div><span className="sub-label">Color:</span> {motoSeleccionada.Color}</div>
              <div><span className="sub-label">Marca / Modelo:</span> {motoSeleccionada.Marca} {motoSeleccionada.Modelo}</div>
              <div><span className="sub-label">Kilometraje:</span> {motoSeleccionada.Kilometraje_Actual} KM</div>
            </div>
          ) : (
            <p className="dato-vacio">No se registró ninguna motocicleta para esta cotización.</p>
          )}
        </div>

        <div className="dato-box proforma-box">
          <span className="dato-label">Repuestos de la Cotización:</span>

          <div className="repuesto-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Busca un repuesto por nombre o marca..."
              value={busquedaRepuesto}
              onChange={(e) => setBusquedaRepuesto(e.target.value)}
            />
          </div>

          {repuestosSugeridos.length > 0 && (
            <div className="repuesto-suggestions">
              {repuestosSugeridos.map((r) => (
                <div key={r.Codigo_Repuesto} className="repuesto-suggestion-item">
                  <div>
                    <strong>{r.Nombre}</strong> <small>({r.Marca})</small><br/>
                    <span className="repuesto-precio">Bs {Number(r.Precio_Unitario).toFixed(2)}</span>
                    <small> | Stock: {r.Stock_Actual}</small>
                  </div>
                  <button 
                    type="button" 
                    className="btn-agregar-repuesto"
                    onClick={() => agregarRepuesto(r)}
                  >
                    ➕ Agregar
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <p className="dato-vacio">Todavía no agregaste ningún repuesto a esta cotización.</p>
          ) : (
            <table className="proforma-table">
              <thead>
                <tr>
                  <th>Repuesto</th>
                  <th>Cant.</th>
                  <th>P. Unit.</th>
                  <th>Desc.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.Codigo_Repuesto}>
                    <td>{item.Nombre}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.Cantidad}
                        onChange={(e) => actualizarItem(item.Codigo_Repuesto, 'Cantidad', e.target.value)}
                        className="proforma-input"
                      />
                    </td>
                    <td>Bs {item.Precio_Unitario.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.Descuento}
                        onChange={(e) => actualizarItem(item.Codigo_Repuesto, 'Descuento', e.target.value)}
                        className="proforma-input"
                      />
                    </td>
                    <td>Bs {calcularSubtotal(item).toFixed(2)}</td>
                    <td>
                      <button className="btn-quitar-item" onClick={() => quitarItem(item.Codigo_Repuesto)}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {items.length > 0 && (
            <div className="proforma-total">
              <span>Total a invertir en la reparación:</span>
              <strong>Bs {montoTotal.toFixed(2)}</strong>
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <span className="dato-label">Observaciones (Mecánico / Cliente):</span>
            <textarea
              className="proforma-input"
              style={{ width: '100%', height: '60px', resize: 'vertical' }}
              placeholder="Ej: El cliente trajo sus propios repuestos..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <button
            className="btn-guardar-cotizacion"
            disabled={!clienteSeleccionado || items.length === 0 || guardando}
            onClick={handleGuardarCotizacion}
          >
            {guardando ? 'Guardando...' : '💾 Guardar Cotización'}
          </button>
        </div>

        <div className={`dato-box reparacion-box${!esMecanico ? ' reparacion-box-restringida' : ''}`}>
          <span className="dato-label">Reparación / Mano de Obra:</span>
          {esMecanico ? (
            <>
              <p className="dato-sub">
                Como mecánico puedes registrar el diagnóstico y la mano de obra de esta cotización.
              </p>
              <button
                className="btn-aceptar-cliente"
                style={{ marginTop: '12px' }}
                disabled={!clienteSeleccionado}
                onClick={handleIrAReparacion}
              >
                🔧 Registrar Reparación
              </button>
            </>
          ) : (
            <p className="dato-vacio">
              Restringido para tu rol de recepción. Solo un mecánico puede registrar la
              reparación; tú puedes dejar lista la cotización de repuestos y el cliente/moto.
            </p>
          )}
        </div>
      </main>

      {modalClienteOpen && (
        <div className="modal-backdrop">
          <div className="google-search-modal">
            <div className="modal-top">
              <span className="google-logo-style">G</span>
              <h3>Buscador de Clientes</h3>
              <p>Busca en la base de datos de El Baratón</p>
            </div>

            <div className="google-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Escribe el nombre, apellido o celular..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                autoFocus
              />
            </div>

            <div className="google-suggestions">
              {clientesSugeridos.length > 0 ? (
                clientesSugeridos.map((cli) => (
                  <div
                    key={cli.id_Cliente}
                    className={`suggestion-item ${clienteSeleccionado?.id_Cliente === cli.id_Cliente ? 'selected' : ''}`}
                    onClick={() => setClienteSeleccionado(cli)}
                  >
                    <span className="item-icon">👤</span>
                    <div className="item-info">
                      <p className="item-title">{cli.Nombre} {cli.Apellido}</p>
                      <p className="item-sub">Celular: {cli.Celular}</p>
                    </div>
                  </div>
                ))
              ) : busquedaCliente.length > 0 ? (
                <p className="no-results">No se encontraron clientes coincidentes.</p>
              ) : (
                <p className="search-hint">Empieza a escribir para ver sugerencias...</p>
              )}
            </div>

            <button
              className="btn-aceptar-cliente"
              disabled={!clienteSeleccionado}
              onClick={handleAceptarCliente}
            >
              Aceptar Cliente
            </button>
          </div>
        </div>
      )}

      {preguntaMotoOpen && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <span className="modal-icon-bike">🏍️</span>
            <h3>¿El cliente tiene moto?</h3>
            <p>Cliente: <strong>{clienteSeleccionado?.Nombre} {clienteSeleccionado?.Apellido}</strong></p>

            <div className="confirm-buttons">
              <button className="btn-confirm-yes" onClick={() => handleRespuestaTieneMoto(true)}>SÍ</button>
              <button className="btn-confirm-no" onClick={() => handleRespuestaTieneMoto(false)}>NO</button>
            </div>
          </div>
        </div>
      )}

      {modalMotoOpen && (
        <div className="modal-backdrop">
          <div className="google-search-modal">
            {!modoNuevaMoto ? (
              <>
                <div className="modal-top">
                  <h3>Motos del Cliente</h3>
                  <p>Selecciona la motocicleta registrada en PostgreSQL</p>
                </div>

                <div className="motos-list">
                  {motosCliente.length > 0 ? (
                    motosCliente.map((m) => (
                      <div
                        key={m.id_Motocicleta}
                        className="moto-card-item"
                        onClick={() => {
                          setMotoSeleccionada(m);
                          setModalMotoOpen(false);
                        }}
                      >
                        <div>
                          <p className="moto-placa">Placa: {m.Placa}</p>
                          <p className="moto-desc">{m.Marca} {m.Modelo} — Color: {m.Color}</p>
                        </div>
                        <span className="moto-km">{m.Kilometraje_Actual} KM</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">No hay motocicletas registradas para este cliente.</p>
                  )}
                </div>

                <button className="btn-nueva-moto" onClick={() => setModoNuevaMoto(true)}>
                  ➕ Registrar Nueva Moto
                </button>
              </>
            ) : (
              <form onSubmit={handleGuardarNuevaMoto} className="nueva-moto-form">
                <h3>Registrar Nueva Motocicleta</h3>
                <div className="form-grid">
                  <input required type="text" placeholder="Placa (Ej. 1234-ABC)" value={nuevaMoto.Placa} onChange={(e) => setNuevaMoto({ ...nuevaMoto, Placa: e.target.value })} />
                  <input required type="text" placeholder="Marca (Ej. Honda)" value={nuevaMoto.Marca} onChange={(e) => setNuevaMoto({ ...nuevaMoto, Marca: e.target.value })} />
                  <input type="text" placeholder="Modelo (Ej. Wave 110)" value={nuevaMoto.Modelo} onChange={(e) => setNuevaMoto({ ...nuevaMoto, Modelo: e.target.value })} />
                  <input type="text" placeholder="Color (Ej. Rojo)" value={nuevaMoto.Color} onChange={(e) => setNuevaMoto({ ...nuevaMoto, Color: e.target.value })} />
                  <input type="number" placeholder="Kilometraje Actual" value={nuevaMoto.Kilometraje_Actual} onChange={(e) => setNuevaMoto({ ...nuevaMoto, Kilometraje_Actual: e.target.value })} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-guardar">Guardar Moto</button>
                  <button type="button" className="btn-cancelar" onClick={() => setModoNuevaMoto(false)}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {cotizacionGuardada && (
        <div className="modal-backdrop">
          <div className="confirm-modal" style={{ maxWidth: '500px' }}>
            <span className="modal-icon-bike">✅</span>
            <h3>Cotización N° {cotizacionGuardada.id_Cotizacion} guardada</h3>
            <p>Total de la proforma:</p>
            <p className="placa-highlight" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              Bs {Number(cotizacionGuardada.Monto_Total).toFixed(2)}
            </p>
            
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <label className="dato-label">Seleccionar nuevo estado de la cotización:</label>
              <select 
                className="proforma-input" 
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                value={nuevoEstadoSeleccionado}
                onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
                disabled={estadoGuardado}
              >
                <option value="Aprobada">Aprobada (Pagó todo)</option>
                <option value="Denegada">Denegada (Cliente rechazó)</option>
                <option value="Con Reparación - Pendiente">Con Reparación - Pendiente (Pagó mitad)</option>
                <option value="Con Reparación - Total">Con Reparación - Total (Pagó todo)</option>
              </select>
            </div>

            {calcularDeuda() > 0 && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#92400e', fontWeight: 'bold' }}>
                ⚠️ Saldo pendiente a cobrar al recoger: Bs {calcularDeuda().toFixed(2)}
              </div>
            )}

            <div className="confirm-buttons" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <a 
                href={`http://localhost:3000/api/cotizaciones/${cotizacionGuardada.id_Cotizacion}/pdf`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <button className="btn-confirm-yes" style={{ width: '100%', backgroundColor: '#3b82f6', color: '#fff', padding: '12px' }}>
                  📥 Descargar PDF
                </button>
              </a>

              <button 
                className="btn-confirm-yes" 
                style={{ 
                  backgroundColor: estadoGuardado ? '#16a34a' : '#22c55e', 
                  color: '#fff', 
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onClick={handleCambiarEstado}
                disabled={estadoGuardado}
              >
                {estadoGuardado ? (
                  <>✅ Guardado con éxito</>
                ) : (
                  <>💾 Guardar Estado</>
                )}
              </button>

              <button 
                className="btn-confirm-no" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#475569', 
                  color: '#f8fafc', 
                  fontWeight: 'bold',
                  marginTop: '5px'
                }}
                onClick={() => (onVolver ? onVolver() : navigate('/admin'))}
              >
                ❌ Cancelar y Volver al Inicio
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}