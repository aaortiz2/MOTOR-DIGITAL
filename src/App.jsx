import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/Login/Login';
import MenuAdministrador from './components/MenuAdministrador/menu_Administrador';
import MenuAyudante from './components/MenuAyudante/menu_Ayudante';
import MenuMecanico from './components/MenuMecanico/menu_Mecanico';

import RegistroCliente from './components/RegistroCliente';
import RegistroMecanico from './components/RegistroMecanico';
import Revision from './components/RevisionForm';
import Notificacion from './components/v_notificacion';
import Cotizacion from './components/Cotizacion/Cotizacion';
import EliminarMecanico from './components/Eliminar_Mecanico';
import ControlPagoMecanico from './components/ControlPagoMecanico';
import ControlReparacionesTotal from './components/ControlReparacionesTotal';
import CotizacionesTabla from './components/CotizacionesTabla';
import InventarioRepuestos from './components/InventarioRepuestos';
import AgregarRepuesto from './components/AgregarRepuesto';
import ControlClientes from './components/ControlClientes';
import MisReparacionesMecanico from './components/MisReparacionesMecanico';
import MiAgendaMecanico from './components/MiAgendaMecanico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rutas de los Menús */}
        <Route path="/admin" element={<MenuAdministrador />} />
        <Route path="/ayudante" element={<MenuAyudante />} />
        <Route path="/mecanico" element={<MenuMecanico />} />
        
        {/* Rutas de Módulos y Gestiones */}
        <Route path="/registro-mecanico" element={<RegistroMecanico />} />
        <Route path="/notificaciones" element={<Notificacion />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="/registro-cliente" element={<RegistroCliente />} />
        <Route path="/cotizacion" element={<Cotizacion />} />
        <Route path="/eliminar-mecanico" element={<EliminarMecanico />} />
        <Route path="/pago-mecanico" element={<ControlPagoMecanico />} />
        <Route path="/reparaciones-completa" element={<ControlReparacionesTotal />} />
        <Route path="/cotizaciones-tabla" element={<CotizacionesTabla />} />
        <Route path="/repuestos" element={<InventarioRepuestos />} />
        <Route path="/agregar-repuesto" element={<AgregarRepuesto />} />
        <Route path="/control-clientes" element={<ControlClientes />} />
        <Route path="/mis-reparaciones" element={<MisReparacionesMecanico />} />
        <Route path="/mi-agenda" element={<MiAgendaMecanico />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;