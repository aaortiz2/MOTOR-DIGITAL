import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/Login/Login';
import MenuAdministrador from './components/MenuAdministrador/menu_Administrador';
import MenuAyudante from './components/MenuAyudante/menu_Ayudante';
import MenuMecanico from './components/MenuMecanico/menu_Mecanico';

import RegistroMecanico from './components/RegistroMecanico';
import Revision from './components/RevisionForm';
import Notificacion from './components/v_notificacion';

// Importamos los componentes de Cotizaciones
import Cotizacion from './components/Cotizacion/Cotizacion';
import ListaCotizaciones from './components/Cotizacion/ListaCotizaciones'; // <--- NUEVO IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/admin" element={<MenuAdministrador />} />
        <Route path="/ayudante" element={<MenuAyudante />} />
        <Route path="/mecanico" element={<MenuMecanico />} />
        
        <Route path="/registro-mecanico" element={<RegistroMecanico />} />
        <Route path="/notificaciones" element={<Notificacion />} />
        <Route path="/revision" element={<Revision />} />

        {/* Ruta para CREAR una nueva cotización */}
        <Route path="/cotizacion" element={<Cotizacion />} />
        
        {/* RUTA NUEVA: Para ver el historial de cotizaciones */}
        <Route path="/cotizaciones" element={<ListaCotizaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;