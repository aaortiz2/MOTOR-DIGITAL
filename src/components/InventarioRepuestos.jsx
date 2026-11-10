import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventarioRepuestos.css';

export default function InventarioRepuestos() {
    const navigate = useNavigate();
    const [repuestos, setRepuestos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarRepuestos();
    }, []);

    const cargarRepuestos = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/repuestos');
            const data = await response.json();
            if (data.success) {
                setRepuestos(data.data);
            }
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
        } finally {
            setCargando(false);
        }
    };

    // Filtrado en tiempo real por nombre, marca, descripción o código
    const repuestosFiltrados = repuestos.filter(r => {
        const texto = `${r.Nombre} ${r.Marca} ${r.Descripcion} ${r.Codigo_Repuesto}`.toLowerCase();
        return texto.includes(busqueda.toLowerCase());
    });

    return (
        <div className="repuestos-screen">
            <div className="repuestos-container">

                <div className="repuestos-card">

                    {/* Encabezado con título y botón para agregar */}
                    <div className="repuestos-header-top">
                        <div className="repuestos-header">
                            <h1>📦 Inventario de Repuestos</h1>
                            <p>Refacciones originales y accesorios TVS</p>
                        </div>
                        <button
                            className="btn-agregar"
                            onClick={() => navigate('/agregar-repuesto')}
                        >
                            + Agregar Repuesto
                        </button>
                    </div>

                    {/* Barra de búsqueda interactiva */}
                    <div className="buscador-container">
                        <span style={{ marginRight: '10px' }}>🔍</span>
                        <input
                            type="text"
                            className="buscador-input"
                            placeholder="Buscar por código, nombre, marca o descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Lista de repuestos detallada en tarjetas */}
                    <div className="lista-repuestos-grid">
                        {cargando ? (
                            <div className="sin-datos">Cargando inventario desde la base de datos...</div>
                        ) : repuestosFiltrados.length > 0 ? (
                            repuestosFiltrados.map((rep) => (
                                <div key={rep.Codigo_Repuesto} className="repuesto-card-item">

                                    <div className="rep-item-header">
                                        <span className="rep-codigo">Código #{rep.Codigo_Repuesto}</span>
                                        <span className="rep-marca">{rep.Marca || 'Genérico'}</span>
                                    </div>

                                    <div>
                                        <h3 className="rep-nombre">{rep.Nombre}</h3>
                                        <p className="rep-desc">{rep.Descripcion || 'Sin descripción detallada.'}</p>
                                    </div>

                                    <div className="rep-detalles-footer">
                                        <div>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Unidad: {rep.Unidad_Medida}</span>
                                            <span className="rep-precio">{rep.Precio_Unitario} Bs</span>
                                        </div>
                                        <div>
                                            <span className={`stock-badge ${rep.Stock_Actual <= 5 ? 'stock-bajo' : ''}`}>
                                                Stock: {rep.Stock_Actual}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="sin-datos">No se encontraron repuestos con ese criterio.</div>
                        )}
                    </div>

                    {/* Botón para volver al menú de administrador */}
                    <button className="btn-volver-panel" onClick={() => navigate('/admin')}>
                        ← Volver al Panel de Administrador
                    </button>

                </div>
            </div>
        </div>
    );
}