import { useState } from 'react';
import './RegistroCliente.css';

const RegistroCliente = () => {
  const [paso, setPaso] = useState(1); // 1: Cliente, 2: Moto
  const [esClienteExistente, setEsClienteExistente] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  const [preguntarMoto, setPreguntarMoto] = useState(false);
  const [cliente, setCliente] = useState({ id_Cliente: null, Nombre: '', Apellido: '', Celular: '' });
  const [moto, setMoto] = useState({ Marca: '', Modelo: '', Placa: '', Color: '', Kilometraje_Actual: '', Foto: '' });

  const buscarCliente = async () => {
    try {
      // Si no han escrito nada, limpiamos la lista para que no muestre todos
      if (!busqueda.trim()) {
        setClientesEncontrados([]);
        return;
      }
      
      const res = await fetch(`http://localhost:3000/api/clientes/buscar?query=${busqueda.trim()}`);
      const data = await res.json();
      setClientesEncontrados(data);
    } catch (error) {
      console.error("Error al buscar:", error);
    }
  };

  const seleccionarCliente = (c) => {
    setCliente(c);
    setPaso(2); 
  };

   const guardarCliente = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCliente({ ...cliente, id_Cliente: data.id_Cliente });
        setPreguntarMoto(true); // <--- AQUÍ ACTIVAMOS LA PREGUNTA
      } else {
        alert("❌ ERROR DE POSTGRESQL:\n\n" + (data.detalle || data.error || "Error desconocido"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión con el servidor.");
    }
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setMoto({ ...moto, Foto: reader.result });
    };
    if (file) reader.readAsDataURL(file);
  };

  const guardarMoto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/motos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...moto, id_Cliente: cliente.id_Cliente })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('¡Moto registrada con éxito!');
        setPaso(1);
        setCliente({ id_Cliente: null, Nombre: '', Apellido: '', Celular: '' });
        setMoto({ Marca: '', Modelo: '', Placa: '', Color: '', Kilometraje_Actual: '', Foto: '' });
        setBusqueda(''); 
        setClientesEncontrados([]);
        setPreguntarMoto(false); // Reiniciamos la pregunta
      } else {
        alert("❌ Error al guardar moto:\n\n" + (data.detalle || data.error || "Error desconocido"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error de conexión al guardar moto.");
    }
  };

  return (
    <div className="registro-container">
      <h2>Registro de Clientes y Motos</h2>
      
      {paso === 1 && (
        <div className="paso-cliente">
          <div className="botones-iniciales">
            <button type="button" onClick={() => { setEsClienteExistente(false); setPreguntarMoto(false); }}>Nuevo Cliente</button>
            <button type="button" onClick={() => { setEsClienteExistente(true); setPreguntarMoto(false); }}>Cliente Existente</button>
          </div>

          {esClienteExistente ? (
            <div className="buscar-cliente">
              <input 
                type="text" 
                placeholder="Buscar por nombre o celular" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
              />
              <button type="button" onClick={buscarCliente}>Buscar</button>
              
              <ul>
                {clientesEncontrados.map(c => (
                  <li key={c.id_Cliente} onClick={() => seleccionarCliente(c)}>
                    {c.Nombre} {c.Apellido} - {c.Celular}
                  </li>
                ))}
              </ul>
            </div>
          ) : preguntarMoto ? (
            /* AQUÍ ESTÁ LA NUEVA PREGUNTA */
            <div className="pregunta-moto" style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3>Cliente registrado: {cliente.Nombre} {cliente.Apellido}</h3>
              <p style={{ marginBottom: '15px' }}>¿El cliente tiene una motocicleta para registrar?</p>
              <button 
                type="button" 
                onClick={() => setPaso(2)} 
                style={{ marginRight: '10px', backgroundColor: '#28a745' }}
              >
                Sí, registrar moto
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setPreguntarMoto(false);
                  setCliente({ id_Cliente: null, Nombre: '', Apellido: '', Celular: '' });
                  alert('Cliente guardado sin moto. Listo para el siguiente registro.');
                }}
                style={{ backgroundColor: '#dc3545' }}
              >
                No, solo guardar cliente
              </button>
            </div>
          ) : (
            <form onSubmit={guardarCliente}>
              <input type="text" placeholder="Nombre" required onChange={(e) => setCliente({...cliente, Nombre: e.target.value})} />
              <input type="text" placeholder="Apellido" required onChange={(e) => setCliente({...cliente, Apellido: e.target.value})} />
              <input type="text" placeholder="Celular" required onChange={(e) => setCliente({...cliente, Celular: e.target.value})} />
              <button type="submit">Guardar Cliente</button>
            </form>
          )}
        </div>
      )}

      {paso === 2 && (
        <div className="paso-moto">
          <h3>Registrando moto para: {cliente.Nombre} {cliente.Apellido}</h3>
          <form onSubmit={guardarMoto}>
            <input type="text" placeholder="Marca" required onChange={(e) => setMoto({...moto, Marca: e.target.value})} />
            <input type="text" placeholder="Modelo" onChange={(e) => setMoto({...moto, Modelo: e.target.value})} />
            <input type="text" placeholder="Placa" required onChange={(e) => setMoto({...moto, Placa: e.target.value})} />
            <input type="text" placeholder="Color" required onChange={(e) => setMoto({...moto, Color: e.target.value})} />
            <input type="number" placeholder="Kilometraje" required onChange={(e) => setMoto({...moto, Kilometraje_Actual: e.target.value})} />
            <label>Foto de la moto:</label>
            <input type="file" accept="image/*" onChange={handleFoto} />
            <button type="submit">Guardar Moto</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegistroCliente;