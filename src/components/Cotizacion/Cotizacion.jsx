import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cotizacion.css';

// URL base de nuestro servidor backend en Node.js
const API_BASE = 'http://localhost:3000/api';

export default function Cotizacion({ usuarioLogueado, onVolver }) {
  const navigate = useNavigate();

  // 1. TRABAJADOR AUTOMÁTICO SEGÚN SESIÓN
  // Guardamos los datos del trabajador que inició sesión para registrar quién hace la cotización
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
  const [items, setItems] = useState([]); // Aquí se guardan los repuestos que se van agregando a la tabla
  const [guardando, setGuardando] = useState(false);
  
  // Estado para controlar el modal final y saber si ya se guardó (aquí obtendremos el ID para el PDF)
  const [cotizacionGuardada, setCotizacionGuardada] = useState(null); 

  // Fecha extraída automáticamente del dispositivo
  const [fechaActual] = useState(
    new Date().toLocaleDateString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  );

  // Datos del trabajador, para guardar quién hizo la cotización.
  // Se ejecuta al cargar la pantalla.
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

  // Verificamos el rol del usuario para habilitar o no el botón de reparación
  const rol = (trabajador?.Rol || localStorage.getItem('rol') || '').toLowerCase();
  const esMecanico = rol.includes('mecanico');

  const nombreTrabajador = trabajador
    ? `${trabajador.Nombre} ${trabajador.Apellido}`
    : cargandoTrabajador
      ? 'Cargando...'
      : 'Sesión no identificada';

  // Búsqueda en tiempo real estilo Google Search (clientes)
  // Usamos un "debounce" (setTimeout) para no saturar el servidor con cada letra que se escribe.
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

  // Búsqueda en tiempo real de repuestos, para ir armando la proforma
  useEffect(() => {
    // Si el usuario borra todo el texto, limpiamos la lista de sugerencias
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
          // Verificamos que lo que llegue sea un arreglo (array)
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

  // Se ejecuta al presionar "Aceptar Cliente" en el modal 1
  const handleAceptarCliente = () => {
    if (clienteSeleccionado) {
      setModalClienteOpen(false);
      setPreguntaMotoOpen(true); // Pasamos al modal 2 (¿Tiene moto?)
    }
  };

  // Se ejecuta al responder SÍ o NO en el modal 2
  const handleRespuestaTieneMoto = (tiene) => {
    setPreguntaMotoOpen(false);
    if (tiene && clienteSeleccionado) {
      // Si tiene moto, buscamos en la BD las motos que le pertenecen a ese cliente
      fetch(`${API_BASE}/motos/cliente/${clienteSeleccionado.id_Cliente}`)
        .then((res) => res.json())
        .then((data) => {
          setMotosCliente(data);
          setModalMotoOpen(true); // Abrimos modal 3 (Lista de motos)
        })
        .catch((err) => console.error("Error al buscar motos:", err));
    }
  };

  // Se ejecuta al guardar una moto nueva desde el modal 3
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
          setMotoSeleccionada(data.moto); // Seleccionamos la moto recién creada
          setModoNuevaMoto(false);
          setModalMotoOpen(false);
        }
      })
      .catch((err) => console.error("Error al guardar moto:", err));
  };

  // Limpia los datos del cliente y moto para empezar de cero
  const reiniciarProceso = () => {
    setClienteSeleccionado(null);
    setMotoSeleccionada(null);
    setModalClienteOpen(true);
  };

  // Solo un mecánico puede pasar a registrar la reparación 
  const handleIrAReparacion = () => {
    if (!esMecanico || !clienteSeleccionado) return;
    // Navegamos a la pantalla de revisión pasando los datos del cliente y la moto
    navigate('/revision', {
      state: {
        cliente: clienteSeleccionado,
        moto: motoSeleccionada,
      },
    });
  };

  // --- Lógica de la proforma (lista de repuestos) ---

  // Agrega un repuesto a la tabla
  const agregarRepuesto = (repuesto) => {
    setItems((prev) => {
      // Verificamos si el repuesto ya está en la tabla
      const yaExiste = prev.find((i) => i.Codigo_Repuesto === repuesto.Codigo_Repuesto);
      if (yaExiste) {
        // Si ya existe, solo le sumamos 1 a la cantidad
        return prev.map((i) =>
          i.Codigo_Repuesto === repuesto.Codigo_Repuesto
            ? { ...i, Cantidad: i.Cantidad + 1 }
            : i
        );
      }
      // Si no existe, lo agregamos como una nueva fila
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
    // Limpiamos el buscador después de agregar
    setBusquedaRepuesto('');
    setRepuestosSugeridos([]);
  };

  // Actualiza la cantidad o el descuento de un repuesto en la tabla
  const actualizarItem = (codigo, campo, valor) => {
    setItems((prev) =>
      prev.map((i) =>
        i.Codigo_Repuesto === codigo ? { ...i, [campo]: Math.max(0, Number(valor) || 0) } : i
      )
    );
  };

  // Elimina una fila de la tabla
  const quitarItem = (codigo) => {
    setItems((prev) => prev.filter((i) => i.Codigo_Repuesto !== codigo));
  };

  // Calcula el subtotal de una fila: (Cantidad * Precio) - Descuento
  const calcularSubtotal = (item) => item.Cantidad * item.Precio_Unitario - item.Descuento;

  // Suma todos los subtotales de la tabla para obtener el total final
  const montoTotal = items.reduce((acc, item) => acc + calcularSubtotal(item), 0);

  // Se ejecuta al presionar el botón verde de "Guardar Cotización"
  const handleGuardarCotizacion = () => {
    if (!clienteSeleccionado || items.length === 0 || !trabajador?.id_Usuarios) return;

    setGuardando(true);
    fetch(`${API_BASE}/cotizaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_Cliente: clienteSeleccionado.id_Cliente,
        id_trabajador: trabajador.id_Usuarios,
        id_Moto: motoSeleccionada?.id_Motocicleta || null,
        Observaciones: '',
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
          // Si se guarda con éxito, abrimos el modal 4 guardando la respuesta (que incluye el ID)
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

  // Prepara la pantalla para hacer una nueva cotización desde cero
  const handleNuevaCotizacion = () => {
    setItems([]);
    setCotizacionGuardada(null);
    reiniciarProceso();
  };

  return (
    <div className="cotizacion-screen">
      {/* HEADER DE MOTO REPUESTOS EL BARATÓN */}
      <header className="cotizacion-header">
        <div className="header-brand">
          <h1>MOTO REPUESTOS EL BARATÓN</h1>
          <p>Módulo de Registro de Cotizaciones Web</p>
        </div>

        {/* TRABAJADOR REGISTRADO AUTOMÁTICAMENTE */}
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

      {/* FICHA PRINCIPAL CON DATOS REGISTRADOS EN PANTALLA */}
      <main className="cotizacion-card-main">
        <div className="main-card-header">
          <h2>📋 Resumen de Cotización Registrar</h2>
          
          {/* Contenedor para agrupar los botones a la derecha */}
          <div className="header-acciones">
            
            {/* Botón para volver al menú principal  */}
            <button 
              className="btn-cancelar-volver" 
              onClick={() => (onVolver ? onVolver() : navigate(-1))}
            >
              ⬅️ Cancelar / Volver al Inicio
            </button>

            {clienteSeleccionado && (
              <button className="btn-reintentar" onClick={reiniciarProceso}>
                🔄 Cambiar cliente / moto
              </button>
            )}

          </div>
        </div>

        <div className="datos-grid">
          {/* TRABAJADOR */}
          <div className="dato-box">
            <span className="dato-label">Trabajador:</span>
            <p className="dato-valor">{nombreTrabajador}</p>
            {!cargandoTrabajador && trabajador && (
              <p className="dato-sub">{trabajador.Rol}</p>
            )}
          </div>

          {/* CLIENTE */}
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

          {/* FECHA ACTUAL */}
          <div className="dato-box">
            <span className="dato-label">Fecha Actual:</span>
            <p className="dato-fecha">{fechaActual}</p>
          </div>
        </div>

        {/* MOTO */}
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

        {/* LISTA DE REPUESTOS */}
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

          {/* MOSTRAR LISTA DE SUGERENCIAS CON EL BOTÓN DE AGREGAR */}
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

          <button
            className="btn-guardar-cotizacion"
            disabled={!clienteSeleccionado || items.length === 0 || guardando}
            onClick={handleGuardarCotizacion}
          >
            {guardando ? 'Guardando...' : '💾 Guardar Cotización'}
          </button>
        </div>

        {/* REPARACIÓN / MANO DE OBRA — restringido por rol */}
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

      {/* ========================================================= */}
      {/* MODAL 1: BUSCADOR TIPO GOOGLE DE CLIENTES                 */}
      {/* ========================================================= */}
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

            {/* SUGERENCIAS ESTILO GOOGLE */}
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

      {/* ========================================================= */}
      {/* MODAL 2: ¿TIENE MOTO?                                     */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL 3: BUSCADOR / REGISTRO DE MOTO                      */}
      {/* ========================================================= */}
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
                          <p className="moto-desc">{m.Marca} {m.Modelo} - Color: {m.Color}</p>
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
                  <input
                    required
                    type="text"
                    placeholder="Placa (Ej. 1234-ABC)"
                    value={nuevaMoto.Placa}
                    onChange={(e) => setNuevaMoto({ ...nuevaMoto, Placa: e.target.value })}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Marca (Ej. Honda)"
                    value={nuevaMoto.Marca}
                    onChange={(e) => setNuevaMoto({ ...nuevaMoto, Marca: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Modelo (Ej. Wave 110)"
                    value={nuevaMoto.Modelo}
                    onChange={(e) => setNuevaMoto({ ...nuevaMoto, Modelo: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Color (Ej. Rojo)"
                    value={nuevaMoto.Color}
                    onChange={(e) => setNuevaMoto({ ...nuevaMoto, Color: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Kilometraje Actual"
                    value={nuevaMoto.Kilometraje_Actual}
                    onChange={(e) => setNuevaMoto({ ...nuevaMoto, Kilometraje_Actual: e.target.value })}
                  />
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

      {/* ========================================================= */}
      {/* MODAL 4: COTIZACIÓN GUARDADA CON ÉXITO Y BOTÓN DE PDF     */}
      {/* ========================================================= */}
      {cotizacionGuardada && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <span className="modal-icon-bike">✅</span>
            <h3>Cotización N° {cotizacionGuardada.id_Cotizacion} guardada</h3>
            <p>Total de la proforma:</p>
            <p className="placa-highlight" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              Bs {Number(cotizacionGuardada.Monto_Total).toFixed(2)}
            </p>
            
            <div className="confirm-buttons" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* BOTÓN PARA DESCARGAR EL PDF: Abre una nueva pestaña que apunta a la ruta del backend que genera el documento */}
              <a 
                href={`http://localhost:3000/api/cotizaciones/${cotizacionGuardada.id_Cotizacion}/pdf`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <button className="btn-confirm-yes" style={{ width: '100%', backgroundColor: '#3b82f6', color: '#fff', padding: '12px' }}>
                  📥 Descargar Cotización en PDF
                </button>
              </a>

              {/* BOTONES PARA NUEVA COTIZACIÓN O VOLVER */}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button 
                  className="btn-confirm-no" 
                  onClick={handleNuevaCotizacion}
                  style={{ flex: 1, padding: '12px' }}
                >
                  ➕ Nueva Cotización
                </button>
                <button
                  className="btn-confirm-no"
                  onClick={() => (onVolver ? onVolver() : navigate(-1))}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Volver al Menú
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}