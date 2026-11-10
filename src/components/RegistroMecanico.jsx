import React from 'react';
import './RegistroMecanico.css';

export default function RegistroMecanico({ onVolver }) {
  return (
    <div className="registro-container">
      <div className="registro-card">

        <div className="brand-header">
          <h1 className="tvs-logo">
            TVS <span>MotoControl</span>
          </h1>
        </div>

        <h2 className="registro-title">REGISTRO DE MECÁNICO</h2>

        <div className="registro-form">

            {/* Inicio: campos del registro de mecánico */}

          <div className="registro-input-group">
            <label>Nombre</label>
            <input type="text" placeholder="Ingrese el nombre" />
          </div>

          <div className="registro-input-group">
            <label>Apellido</label>
            <input type="text" placeholder="Ingrese el apellido" />
          </div>

          <div className="registro-input-group">
            <label>Nombre de usuario</label>
            <input type="text" placeholder="Ingrese el nombre de usuario" />
          </div>

          <div className="registro-input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Ingrese la contraseña" />
          </div>

          <div className="registro-input-group">
            <label>Rol</label>
            <select defaultValue="">
              <option value="" disabled>Seleccione un rol</option>
              <option value="Mecánico">Mecánico</option>
              <option value="Ayudante">Ayudante</option>
            </select>
          </div>

          <div className="registro-input-group">
            <label>Celular</label>
            <input type="text" placeholder="Ingrese el número de celular" />
          </div>

          <div className="registro-input-group">
            <label>Fecha de ingreso</label>
            <input type="date" />
          </div>

          <div className="registro-input-group">
            <label>Foto</label>
            <input type="file" accept="image/*" />
          </div>

            {/* Fin: campos del registro de mecánico */}

            {/* Inicio: botones del registro */}

          <button type="button" className="btn-registro">
            REGISTRAR
          </button>

          <button
                type="button"
                className="btn-volver"
                onClick={onVolver}
           >
                ← VOLVER AL INICIO
           </button>

            {/* Fin: botones del registro */}

        </div>

      </div>
    </div>
  );
}