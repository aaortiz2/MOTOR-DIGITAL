import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Hacemos la petición a nuestro servidor backend en el puerto 3000
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: usuario, // Se conecta con la columna Nombre_Usuario
          password: password       // Se conecta con la columna Contraseña
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Convertimos el rol a minúsculas para compararlo sin errores
        const rol = data.rol.toLowerCase().trim();

        // Guardamos quién inició sesión para que las pantallas siguientes
        // (menú mecánico, administrador, etc.) sepan quién es y qué rol tiene.
        localStorage.setItem('nombreUsuario', usuario.trim());
        localStorage.setItem('rol', rol);

        // Redirección dinámica basada en el rol de la base de datos
        if (rol.includes('admin')) {
          navigate('/admin');
        } else if (rol.includes('mecanico')) {
          navigate('/mecanico');
        } else if (rol.includes('ayudante')) {
          navigate('/ayudante');
        } else {
          navigate('/');
        }
      } else {
        // Si el usuario o contraseña no coinciden
        setError(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor backend.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="brand-header">
          <h1 className="tvs-logo">TVS <span>MotoControl</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">INICIAR SESIÓN</h2>

          {/* Mensaje de error si las credenciales fallan */}
          {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej. admin o mecanico"
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login">INGRESAR</button>
        </form>

        <div className="login-footer">
          <p>TODO LO QUE TU TVS NECESITA</p>
          <p className="highlight">ESTÁ AQUÍ</p>
        </div>

      </div>
    </div>
  );
}
