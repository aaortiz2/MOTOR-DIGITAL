import { useState } from 'react';
import "./RevisionForm.css";

export default function RevisionForm() {
  const [revision, setRevision] = useState({
    idMoto: '',
    idReparacion: '',
    fechaProgramada: '',
    descripcion: '',
    estadoRevision: 'Pendiente' 
  });

  const handleChange = (e) => {
    setRevision({
      ...revision,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando revisión:", revision);
    alert("¡Revisión registrada con éxito!");
  };

  return (
    <div className="contenedor-revision">
      <h2>Registrar Nueva Revisión</h2>
      <form onSubmit={handleSubmit} className="formulario-revision">
        
        <div className="grupo-entrada">
          <label>ID Moto</label>
          <input 
            type="number" 
            name="idMoto" 
            value={revision.idMoto} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="grupo-entrada">
          <label>ID Reparación (Previa)</label>
          <input 
            type="number" 
            name="idReparacion" 
            value={revision.idReparacion} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="grupo-entrada">
          <label>Fecha Programada</label>
          <input 
            type="date" 
            name="fechaProgramada" 
            value={revision.fechaProgramada} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="grupo-entrada">
          <label>Descripción</label>
          <textarea 
            name="descripcion" 
            value={revision.descripcion} 
            onChange={handleChange} 
            placeholder="Detalles de la revisión..."
            required 
          />
        </div>

        <div className="grupo-entrada">
          <label>Estado de Revisión</label>
          <select name="estadoRevision" value={revision.estadoRevision} onChange={handleChange}>
            <option value="Pendiente">Pendiente</option>
            <option value="Notificada">Notificada</option>
            <option value="Realizada">Realizada</option>
          </select>
        </div>

        <button type="submit" className="boton-guardar">Guardar Revisión</button>
      </form>
    </div>
  );
}