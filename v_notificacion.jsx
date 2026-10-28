import { useState } from 'react'
import './v_notificacion.css'

// Placeholder: esto vendrá de tu tabla CLIENTE (id_Cliente, Nombre, Apellido, Celular)
// cuando conectes el backend. Por ahora simula esa lista.
const clientes = [
  { id: 1, nombre: 'Juan Pérez', celular: '+591 700 12345' },
  { id: 2, nombre: 'Marisol Rojas', celular: '+591 700 98765' },
]

function v_notificacion() {
  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      id_cliente: 1,
      cliente: 'Juan Pérez',
      canal: 'whatsapp',
      numero: '+591 700 12345',
      mensaje: 'Tu moto ya está lista para retirar.',
      fecha: '2026-09-10 14:30',
    },
    {
      id: 2,
      id_cliente: 2,
      cliente: 'Marisol Rojas',
      canal: 'whatsapp',
      numero: '+591 700 98765',
      mensaje: 'Recordatorio: revisión programada mañana.',
      fecha: '2026-09-11 09:05',
    },
  ])

  const [form, setForm] = useState({
    id_cliente: '',
    canal: 'whatsapp',
    mensaje: '',
  })

  const [mostrarForm, setMostrarForm] = useState(false)

  const clienteSeleccionado = clientes.find(
    (c) => c.id === Number(form.id_cliente)
  )

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const enviarNotificacion = (e) => {
    e.preventDefault()
    if (!form.id_cliente || !form.mensaje || !clienteSeleccionado) return

    const ahora = new Date()
    const fecha = ahora.toISOString().slice(0, 16).replace('T', ' ')

    const nueva = {
      id: Date.now(),
      id_cliente: clienteSeleccionado.id,
      cliente: clienteSeleccionado.nombre,
      numero: clienteSeleccionado.celular,
      canal: form.canal,
      mensaje: form.mensaje,
      fecha,
    }

    setNotificaciones((prev) => [nueva, ...prev])
    setForm({ id_cliente: '', canal: 'whatsapp', mensaje: '' })
    setMostrarForm(false)
  }

  const eliminarNotificacion = (id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="vn-container">
      <div className="vn-head">
        <div>
          <h1 className="vn-title">Notificaciones</h1>
          <p className="vn-subtitle">Avisos enviados a clientes sobre sus motos</p>
        </div>
        <button className="vn-new-button" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Nueva notificación'}
        </button>
      </div>

      {mostrarForm && (
        <form className="vn-form" onSubmit={enviarNotificacion}>
          <div className="vn-field">
            <label htmlFor="id_cliente">Cliente</label>
            <select
              id="id_cliente"
              name="id_cliente"
              value={form.id_cliente}
              onChange={manejarCambio}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="vn-field vn-field-short">
            <label htmlFor="canal">Canal</label>
            <select id="canal" name="canal" value={form.canal} onChange={manejarCambio}>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="vn-field vn-field-short">
            <label>Número</label>
            <input
              type="text"
              value={clienteSeleccionado ? clienteSeleccionado.celular : ''}
              placeholder="Se completa solo"
              disabled
            />
          </div>

          <div className="vn-field vn-field-wide">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={2}
              placeholder="Escribe el mensaje que recibirá el cliente"
              value={form.mensaje}
              onChange={manejarCambio}
            />
          </div>

          <button type="submit" className="vn-send-button">
            Enviar notificación
          </button>
        </form>
      )}

      <div className="vn-table-wrapper">
        <table className="vn-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Canal</th>
              <th>Número</th>
              <th>Mensaje</th>
              <th>Fecha de envío</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {notificaciones.length === 0 && (
              <tr>
                <td colSpan={6} className="vn-empty">
                  Todavía no enviaste ninguna notificación.
                </td>
              </tr>
            )}
            {notificaciones.map((n) => (
              <tr key={n.id}>
                <td className="vn-client-cell">{n.cliente}</td>
                <td>
                  <span className={`vn-channel vn-channel-${n.canal}`}>
                    <span className="vn-channel-dot" />
                    {n.canal === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                  </span>
                </td>
                <td className="vn-number-cell">{n.numero}</td>
                <td className="vn-message-cell">{n.mensaje}</td>
                <td className="vn-date-cell">{n.fecha}</td>
                <td>
                  <button
                    className="vn-delete-button"
                    onClick={() => eliminarNotificacion(n.id)}
                    aria-label={`Eliminar notificación a ${n.cliente}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default v_notificacion
