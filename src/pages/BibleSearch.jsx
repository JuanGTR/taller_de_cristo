import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseReference } from '../utils/parseReference'


// TEMP: mock verses for Phase 1 (we'll swap with API later)
const MOCK = {
ref: 'Filipenses 4:13-14',
verses: [
{ n: '13', t: 'Todo lo puedo en Cristo que me fortalece.' },
{ n: '14', t: 'Sin embargo, bien hicisteis en participar conmigo en mi tribulación.' },
],
}


export default function BibleSearch() {
const [input, setInput] = useState('Filipenses 4:13-14')
const [preview, setPreview] = useState(null)
const navigate = useNavigate()


function onParse(e) {
e.preventDefault()
const parsed = parseReference(input)
if (!parsed) {
alert('Referencia no válida. Ej: Filipenses 4:13-14')
return
}
// For Phase 1 we just show MOCK regardless of input
setPreview({ ref: input.trim(), verses: MOCK.verses })
}


function sendToPresent() {
navigate('/present', { state: { deck: [{ type: 'bible', ref: preview.ref, chunks: [preview.verses] }] } })
}


return (
<div className="container bible">
<h2>Buscar en la Biblia</h2>
<form className="card bible__form" onSubmit={onParse}>
<label>Referencia (ej. Filipenses 4:13-14)</label>
<input className="search-bar__input" value={input} onChange={e => setInput(e.target.value)} />
<div style={{ display: 'flex', gap: 8 }}>
<button className="button button--primary" type="submit">Previsualizar</button>
<button className="button button--ghost" type="button" onClick={() => setInput('')}>Limpiar</button>
</div>
</form>


{preview && (
<div className="card bible__preview preview">
<div className="preview__ref">{preview.ref}</div>
<div className="preview__text">
{preview.verses.map(v => (
<div key={v.n}><strong>{v.n}</strong> {v.t}</div>
))}
</div>
<div style={{ display:'flex', gap:8, marginTop: 10 }}>
<button className="button button--primary" onClick={sendToPresent}>Enviar a Presentación</button>
</div>
</div>
)}
</div>
)
}