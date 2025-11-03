import { useNavigate } from 'react-router-dom'

export default function Operator() {
  const navigate = useNavigate()
  return (
    <div className="container operator">
      <div className="operator__preview card">
        <div>Vista previa (letras próximamente)</div>
      </div>
      <div className="card operator__transport">
        <button className="button">◀ Anterior</button>
        <button className="button button--primary">Siguiente ▶</button>
        <button className="button button--ghost" onClick={() => navigate('/present')}>Abrir Presentación</button>
      </div>
    </div>
  )
}