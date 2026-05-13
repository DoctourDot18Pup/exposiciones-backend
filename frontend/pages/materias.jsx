import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

function MatForm({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    clave_materia:  item?.clave_materia  || '',
    nombre_materia: item?.nombre_materia || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = { ...form, clave_materia: form.clave_materia.toUpperCase().trim() }
      if (item) await client.put(`/materias/${item.id_materia}`, body)
      else       await client.post('/materias', body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Clave de materia</label>
        <input className="input" required value={form.clave_materia}
               onChange={set('clave_materia')} placeholder="Ej. ISIC-1310"
               style={{ textTransform: 'uppercase' }} />
      </div>
      <div className="field">
        <label>Nombre de la materia</label>
        <input className="input" required value={form.nombre_materia}
               onChange={set('nombre_materia')} placeholder="Ej. Bases de Datos" />
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Crear materia'}
        </button>
      </div>
    </form>
  )
}

export default function Materias() {
  const { session }  = useAuth()
  const esDocente    = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [materias, setMaterias]     = useState([])
  const [gruposMap, setGruposMap]   = useState({})
  const [totalGrupos, setTotalGrupos] = useState(0)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [tick, setTick]             = useState(0)
  const [modal, setModal]           = useState(null)
  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      client.get('/materias?size=100'),
      client.get('/grupos?size=100'),
    ]).then(([matRes, grpRes]) => {
      const mats = matRes.status === 'fulfilled' ? (matRes.value.data?.content || []) : []
      const grps = grpRes.status === 'fulfilled' ? (grpRes.value.data?.content || []) : []
      const map  = {}
      for (const g of grps) map[g.id_materia] = (map[g.id_materia] || 0) + 1
      setMaterias(mats)
      setGruposMap(map)
      setTotalGrupos(grps.length)
      setLoading(false)
    })
  }, [tick])

  const del = async m => {
    try {
      await client.delete(`/materias/${m.id_materia}`)
      reload(); setModal(null)
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al eliminar.')
    }
  }

  const filtered = materias.filter(m => {
    const q = search.toLowerCase()
    return !q || (m.clave_materia || '').toLowerCase().includes(q)
               || (m.nombre_materia || '').toLowerCase().includes(q)
  })

  return (
    <Shell>
      {modal?.type === 'create' && (
        <Modal title="Nueva materia" onClose={() => setModal(null)}>
          <MatForm onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Editar materia" onClose={() => setModal(null)}>
          <MatForm item={modal.item} onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Eliminar materia" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar <b>{modal.item.nombre_materia}</b> ({modal.item.clave_materia})?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Esta acción no se puede deshacer y podría afectar grupos asociados.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff', border: 0 }}
                    onClick={() => del(modal.item)}>Eliminar</button>
          </div>
        </Modal>
      )}

      <div className="pagehead">
        <div>
          <h1>Catálogo de <em>materias</em></h1>
          <p className="sub">Materias activas del período académico. Cada una puede tener múltiples grupos y una rúbrica asociada.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'create' })}>
              <Icons.plus size={15} /> Nueva materia
            </button>
          </div>
        )}
      </div>

      <div className="grid g-4" style={{ marginBottom: 20 }}>
        <div className="stat dark">
          <span className="accent"><Icons.book size={15} /></span>
          <div className="lbl">Total materias</div>
          <div className="val">{loading ? '—' : materias.length}</div>
          <div className="sub">En el catálogo</div>
        </div>
        <div className="stat">
          <span className="accent"><Icons.cal size={15} /></span>
          <div className="lbl">Periodo</div>
          <div className="val">2025-2</div>
          <div className="sub">Ciclo actual</div>
        </div>
        <div className="stat">
          <span className="accent"><Icons.users size={15} /></span>
          <div className="lbl">Grupos asociados</div>
          <div className="val">{loading ? '—' : totalGrupos}</div>
          <div className="sub">En todas las materias</div>
        </div>
        <div className="stat">
          <span className="accent"><Icons.layers size={15} /></span>
          <div className="lbl">Plan de estudios</div>
          <div className="val" style={{ fontSize: 18 }}>ISIC-2010</div>
          <div className="sub">Ing. en Sistemas</div>
        </div>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }}>
            <Icons.search size={16} />
          </span>
          <input className="input" style={{ paddingLeft: 34, height: 38 }}
                 placeholder="Buscar por clave o nombre…"
                 value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--ink-500)', fontSize: 13 }}>Cargando materias…</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Nombre de la materia</th>
                <th style={{ textAlign: 'right' }}>Grupos</th>
                {esDocente && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id_materia}>
                  <td>
                    <span className="badge neutral" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {m.clave_materia || `MAT-${m.id_materia}`}
                    </span>
                  </td>
                  <td><b>{m.nombre_materia}</b></td>
                  <td className="num">
                    <span style={{ fontFamily: '"Source Serif 4", serif', fontSize: 18, fontWeight: 600, color: 'var(--green-900)' }}>
                      {gruposMap[m.id_materia] || 0}
                    </span>
                  </td>
                  {esDocente && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="iconbtn" style={{ height: 30, minWidth: 30 }} title="Editar"
                                onClick={() => setModal({ type: 'edit', item: m })}>
                          <Icons.edit size={14} />
                        </button>
                        <button className="iconbtn" style={{ height: 30, minWidth: 30, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                                onClick={() => setModal({ type: 'delete', item: m })}>
                          <Icons.trash size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={esDocente ? 4 : 3} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-500)' }}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  )
}
