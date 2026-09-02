import { useState } from 'react';
import './Login.css';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log("Intentando ingresar con:", usuario, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="brand-header">
          <h1 className="tvs-logo">TVS <span>MotoControl</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">INICIAR SESIÓN</h2>
          
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