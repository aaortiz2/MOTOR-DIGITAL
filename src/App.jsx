import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/Login/Login';
import MenuAdministrador from './components/MenuAdministrador/menu_Administrador';
import MenuAyudante from './components/MenuAyudante/menu_Ayudante';
import MenuMecanico from './components/MenuMecanico/menu_Mecanico';

import RegistroMecanico from './components/RegistroMecanico';
import Revision from './components/RevisionForm';
import Notificacion from './components/v_notificacion';

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
        
        {/* Rutas de los demás componentes */}
        <Route path="/registro-mecanico" element={<RegistroMecanico />} />
        <Route path="/notificaciones" element={<Notificacion />} />
        <Route path="/revision" element={<Revision />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;