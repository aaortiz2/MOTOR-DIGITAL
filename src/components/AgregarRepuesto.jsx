import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgregarRepuesto.css';

export default function AgregarRepuesto() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Nombre: '',
    Marca: '',
    Descripcion: '',
    Unidad_Medida: 'Unidad',
    Precio_Unitario: '',
    Stock_Actual: ''
  });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/repuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      
      if (data.success) {
        setMensaje({ texto: '¡Repuesto agregado exitosamente a la base de datos!', tipo: 'exito' });
        setTimeout(() => {
          navigate('/repuestos'); // Redirige de vuelta al inventario
        }, 1500);
      } else {
        setMensaje({ texto: data.message || 'Error al registrar el repuesto', tipo: 'error' });
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
    }
  };

  return (
    <div className="agregar-rep-screen">
      <div className="agregar-rep-card">
        
        <div className="agregar-rep-header">
          <h1>📦 Registrar Nuevo Repuesto</h1>
          <p>Añadir refacción o accesorio a la base de datos</p>
        </div>

        {mensaje.texto && (
          <div className={`alerta-mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="agregar-rep-form">
          
          <div className="rep-input-group">
            <label>Nombre del Repuesto</label>
            <input 
              type="text" 
              name="Nombre" 
              placeholder="Ej. Bujía NGK, Filtro de Aire..." 
              value={form.Nombre} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="rep-grid-2">
            <div className="rep-input-group">
              <label>Marca</label>
              <input 
                type="text" 
                name="Marca" 
                placeholder="Ej. NGK, Motul, Yamaha..." 
                value={form.Marca} 
                onChange={handleChange} 
              />
            </div>

            <div className="rep-input-group">
              <label>Unidad de Medida</label>
              <select name="Unidad_Medida" value={form.Unidad_Medida} onChange={handleChange}>
                <option value="Unidad">Unidad</option>
                <option value="Litro">Litro</option>
                <option value="Juego">Juego</option>
                <option value="Kit">Kit</option>
                <option value="Par">Par</option>
              </select>
            </div>
          </div>

          <div className="rep-grid-2">
            <div className="rep-input-group">
              <label>Precio Unitario (Bs)</label>
              <input 
                type="number" 
                step="0.01" 
                name="Precio_Unitario" 
                placeholder="Ej. 45.00" 
                value={form.Precio_Unitario} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="rep-input-group">
              <label>Stock Inicial (Cantidad)</label>
              <input 
                type="number" 
                name="Stock_Actual" 
                placeholder="Ej. 20" 
                value={form.Stock_Actual} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="rep-input-group">
            <label>Descripción detallada</label>
            <textarea 
              name="Descripcion" 
              placeholder="Escribe características o especificaciones técnicas..." 
              value={form.Descripcion} 
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="rep-actions">
            <button type="submit" className="btn-guardar-rep">Guardar en Base de Datos</button>
            <button type="button" className="btn-cancelar-rep" onClick={() => navigate('/repuestos')}>Cancelar</button>
          </div>

        </form>

      </div>
    </div>
  );
}