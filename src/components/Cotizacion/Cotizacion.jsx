import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, User, Bike, Calendar, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Cotizacion({ usuarioLogueado, onVolver }) {
  // 1. TRABAJADOR AUTOMÁTICO SEGÚN EL LOGIN
  const [trabajador] = useState(usuarioLogueado || {
    Nombre: 'Pepe',
    Apellido: 'Cuella',
    Rol: 'Mecanico'
  });

  // ESTADOS DEL FLUJO DE COTIZACIÓN
  const [modalClienteOpen, setModalClienteOpen] = useState(true);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [preguntaMotoOpen, setPreguntaMotoOpen] = useState(false);
  const [modalMotoOpen, setModalMotoOpen] = useState(false);
  const [motosCliente, setMotosCliente] = useState([]);
  const [motoSeleccionada, setMotoSeleccionada] = useState(null);

  const [modoNuevaMoto, setModoNuevaMoto] = useState(false);
  const [nuevaMoto, setNuevaMoto] = useState({
    Placa: '',
    Marca: '',
    Modelo: '',
    Color: '',
    Kilometraje_Actual: ''
  });

  // Fecha actual extraída del dispositivo
  const [fechaActual] = useState(new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // ==========================================
  // BÚSQUEDA DE CLIENTES EN TIEMPO REAL (Postgres)
  // ==========================================
  useEffect(() => {
    if (busquedaCliente.trim().length === 0) {
      setClientesEncontrados([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/clientes/buscar?q=${encodeURIComponent(busquedaCliente)}`);
        const data = await res.json();
        setClientesEncontrados(data);
      } catch (err) {
        console.error("Error buscando clientes:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  const handleAceptarCliente = () => {
    if (clienteSeleccionado) {
      setModalClienteOpen(false);
      setPreguntaMotoOpen(true);
    }
  };

  // ==========================================
  // GESTIÓN DE MOTOS
  // ==========================================
  const handleRespuestaTieneMoto = async (tiene) => {
    setPreguntaMotoOpen(false);
    if (tiene && clienteSeleccionado) {
      try {
        const res = await fetch(`${API_URL}/motos/cliente/${clienteSeleccionado.id_Cliente}`);
        const data = await res.json();
        setMotosCliente(data);
        setModalMotoOpen(true);
      } catch (err) {
        console.error("Error cargando motos:", err);
      }
    }
  };

  const handleGuardarNuevaMoto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/motos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_Cliente: clienteSeleccionado.id_Cliente,
          ...nuevaMoto
        })
      });
      const motoGuardada = await res.json();
      setMotoSeleccionada(motoGuardada);
      setModoNuevaMoto(false);
      setModalMotoOpen(false);
    } catch (err) {
      console.error("Error al registrar moto:", err);
    }
  };

  const reiniciarFlujo = () => {
    setClienteSeleccionado(null);
    setMotoSeleccionada(null);
    setModalClienteOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      
      {/* HEADER */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg mb-6">
        <div className="flex items-center gap-3">
          {onVolver && (
            <button onClick={onVolver} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-amber-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-amber-400">MOTO REPUESTOS EL BARATÓN</h1>
            <p className="text-xs text-slate-400">Módulo de Creación de Cotizaciones</p>
          </div>
        </div>

        {/* TRABAJADOR AUTOMÁTICO */}
        <div className="bg-slate-700/60 border border-slate-600 px-4 py-2 rounded-lg flex items-center gap-3">
          <User className="text-amber-400 w-5 h-5" />
          <div>
            <p className="text-xs text-slate-400">Rol: {trabajador.Rol}</p>
            <p className="text-sm font-semibold text-white">{trabajador.Nombre} {trabajador.Apellido}</p>
          </div>
        </div>
      </header>

      {/* PANTALLA PRINCIPAL CON DATOS REGISTRADOS */}
      <main className="w-full max-w-4xl bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            📋 Registro de Cotización Actual
          </h2>
          <button onClick={reiniciarFlujo} className="text-xs text-amber-400 hover:underline">
            Cambiar cliente / moto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* TRABAJADOR */}
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold">Trabajador:</span>
            <p className="text-lg font-bold text-slate-200 mt-1">
              {trabajador.Nombre} {trabajador.Apellido}
            </p>
            <span className="inline-block mt-2 text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded border border-amber-400/20 capitalize">
              {trabajador.Rol}
            </span>
          </div>

          {/* CLIENTE */}
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold">Cliente:</span>
            {clienteSeleccionado ? (
              <div>
                <p className="text-lg font-bold text-slate-200 mt-1">
                  {clienteSeleccionado.Nombre} {clienteSeleccionado.Apellido}
                </p>
                <p className="text-xs text-slate-400">Celular: {clienteSeleccionado.Celular}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mt-2">Seleccione un cliente...</p>
            )}
          </div>

          {/* FECHA ACTUAL */}
          <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
            <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Fecha Actual:
            </span>
            <p className="text-sm font-semibold text-slate-200 mt-2 capitalize">
              {fechaActual}
            </p>
          </div>
        </div>

        {/* MOTO */}
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-lg">
          <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1 mb-2">
            <Bike className="w-4 h-4 text-amber-400" /> Moto:
          </span>
          {motoSeleccionada ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Placa:</p>
                <p className="font-bold text-amber-400">{motoSeleccionada.Placa}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Color:</p>
                <p className="font-semibold text-slate-200">{motoSeleccionada.Color}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Marca / Modelo:</p>
                <p className="font-semibold text-slate-200">{motoSeleccionada.Marca} {motoSeleccionada.Modelo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kilometraje Actual:</p>
                <p className="font-semibold text-slate-200">{motoSeleccionada.Kilometraje_Actual} km</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Ninguna moto asociada a esta cotización.</p>
          )}
        </div>
      </main>

      {/* ========================================== */}
      {/* MODAL 1: BUSCADOR TIPO GOOGLE DE CLIENTES  */}
      {/* ========================================== */}
      {modalClienteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-amber-400">Buscar Cliente en Base de Datos</h3>
              <p className="text-xs text-slate-400">Escribe el nombre, apellido o celular del cliente</p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                placeholder="Ej. Juan Pérez..."
                className="w-full bg-slate-900 border border-slate-600 rounded-full py-3 pl-12 pr-4 text-slate-100 focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {clientesEncontrados.map((cli) => (
                <div
                  key={cli.id_Cliente}
                  onClick={() => setClienteSeleccionado(cli)}
                  className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${
                    clienteSeleccionado?.id_Cliente === cli.id_Cliente
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{cli.Nombre} {cli.Apellido}</p>
                    <p className="text-xs text-slate-400">Celular: {cli.Celular}</p>
                  </div>
                  {clienteSeleccionado?.id_Cliente === cli.id_Cliente && (
                    <CheckCircle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAceptarCliente}
              disabled={!clienteSeleccionado}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                clienteSeleccionado
                  ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 cursor-pointer'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Aceptar Cliente
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: ¿TIENE MOTO?                      */}
      {/* ========================================== */}
      {preguntaMotoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-center space-y-6 shadow-2xl">
            <Bike className="w-12 h-12 text-amber-400 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-slate-100">¿El cliente tiene motocicleta?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cliente: <span className="text-amber-300">{clienteSeleccionado?.Nombre} {clienteSeleccionado?.Apellido}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleRespuestaTieneMoto(true)}
                className="flex-1 bg-amber-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-amber-300"
              >
                SÍ
              </button>
              <button
                onClick={() => handleRespuestaTieneMoto(false)}
                className="flex-1 bg-slate-700 text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-600"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: BUSCADOR DE MOTOS / NUEVA MOTO    */}
      {/* ========================================== */}
      {modalMotoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            {!modoNuevaMoto ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-amber-400">Motos de {clienteSeleccionado?.Nombre}</h3>
                    <p className="text-xs text-slate-400">Selecciona una moto registrada o añade una nueva</p>
                  </div>
                  <button
                    onClick={() => setModoNuevaMoto(true)}
                    className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-amber-500/30"
                  >
                    <Plus className="w-4 h-4" /> Registrar Nueva Moto
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {motosCliente.length > 0 ? (
                    motosCliente.map((m) => (
                      <div
                        key={m.id_Motocicleta}
                        onClick={() => {
                          setMotoSeleccionada(m);
                          setModalMotoOpen(false);
                        }}
                        className="p-3 bg-slate-900/60 border border-slate-700 hover:border-amber-400 rounded-xl cursor-pointer flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-bold text-amber-300">Placa: {m.Placa}</p>
                          <p className="text-xs text-slate-400">Marca: {m.Marca} | Color: {m.Color}</p>
                        </div>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-600">
                          {m.Kilometraje_Actual} KM
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 space-y-2">
                      <p className="text-sm text-slate-400">El cliente no tiene motocicletas registradas.</p>
                      <button
                        onClick={() => setModoNuevaMoto(true)}
                        className="text-xs text-amber-400 font-semibold underline"
                      >
                        Registrar primera moto ahora
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleGuardarNuevaMoto} className="space-y-4">
                <h3 className="text-lg font-bold text-amber-400">Registrar Nueva Motocicleta</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Placa:</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. 1234-ABC"
                      value={nuevaMoto.Placa}
                      onChange={(e) => setNuevaMoto({ ...nuevaMoto, Placa: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Marca:</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Honda"
                      value={nuevaMoto.Marca}
                      onChange={(e) => setNuevaMoto({ ...nuevaMoto, Marca: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Modelo:</label>
                    <input
                      type="text"
                      placeholder="Ej. Wave 110"
                      value={nuevaMoto.Modelo}
                      onChange={(e) => setNuevaMoto({ ...nuevaMoto, Modelo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Color:</label>
                    <input
                      type="text"
                      placeholder="Ej. Rojo"
                      value={nuevaMoto.Color}
                      onChange={(e) => setNuevaMoto({ ...nuevaMoto, Color: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400">Kilometraje Actual:</label>
                    <input
                      type="number"
                      placeholder="Ej. 15000"
                      value={nuevaMoto.Kilometraje_Actual}
                      onChange={(e) => setNuevaMoto({ ...nuevaMoto, Kilometraje_Actual: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-amber-400 text-slate-900 py-2.5 rounded-xl font-bold hover:bg-amber-300">
                    Guardar Moto
                  </button>
                  <button type="button" onClick={() => setModoNuevaMoto(false)} className="bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-600">
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}