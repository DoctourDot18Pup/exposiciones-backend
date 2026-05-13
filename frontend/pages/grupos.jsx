import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

const AVATAR_COLORS = ['#1C3A2B','#2D6A4F','#3D5A40','#4A7C59','#2E4A35','#9a7a3e']

function GrupoForm({ item, materiasList, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre_grupo: item?.nombre_grupo || '',
    id_materia:   String(item?.id_materia || ''),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = { nombre_grupo: form.nombre_grupo.trim(), id_materia: parseInt(form.id_materia) }
      if (item) await client.put(`/grupos/${item.id_grupo}`, body)
      else       await client.post('/grupos', body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Nombre del grupo</label>
        <input className="input" required value={form.nombre_grupo}
               onChange={set('nombre_grupo')} placeholder="Ej. ISC-7A" />
      </div>
      <div className="field">
        <label>Materia</label>
        <select className="input" required value={form.id_materia} onChange={set('id_materia')}>
          <option value="">Seleccionar materia…</option>
          {materiasList.map(m => (
            <option key={m.id_materia} value={m.id_materia}>
              {m.clave_materia} · {m.nombre_materia}
            </option>
          ))}
        </select>
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Crear grupo'}
        </button>
      </div>
    </form>
  )
}

export default function Grupos() {
  const { session } = useAuth()
  const esDocente   = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [grupos, setGrupos]         = useState([])
  const [materiasList, setMateriasList] = useState([])
  const [materias, setMaterias]     = useState({})
  const [alumnos, setAlumnos]       = useState({})
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [tick, setTick]             = useState(0)
  const [modal, setModal]           = useState(null)
  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      client.get('/grupos?size=100'),
      client.get('/materias?size=100'),
      client.get('/alumnos?size=100'),
    ]).then(([grpRes, matRes, almRes]) => {
      const grps = grpRes.status === 'fulfilled' ? (grpRes.value.data?.content || []) : []
      const mats = matRes.status === 'fulfilled' ? (matRes.value.data?.content || []) : []
      const alms = almRes.status === 'fulfilled' ? (almRes.value.data?.content || []) : []

      const matMap = {}
      for (const m of mats) matMap[m.id_materia] = m.nombre_materia

      const almMap = {}
      for (const a of alms) almMap[a.id_grupo] = (almMap[a.id_grupo] || 0) + 1

      setGrupos(grps)
      setMateriasList(mats)
      setMaterias(matMap)
      setAlumnos(almMap)
      setLoading(false)
    })
  }, [tick])

  const del = async g => {
    try {
      await client.delete(`/grupos/${g.id_grupo}`)
      reload(); setModal(null)
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al eliminar.')
    }
  }

  const filtered = grupos.filter(g => {
    const q = search.toLowerCase()
    return !q
      || (g.nombre_grupo || '').toLowerCase().includes(q)
      || (materias[g.id_materia] || '').toLowerCase().includes(q)
      || String(g.id_grupo).includes(q)
  })

  return (
    <Shell>
      {modal?.type === 'create' && (
        <Modal title="Nuevo grupo" onClose={() => setModal(null)}>
          <GrupoForm materiasList={materiasList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Editar grupo" onClose={() => setModal(null)}>
          <GrupoForm item={modal.item} materiasList={materiasList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Eliminar grupo" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar el grupo <b>{modal.item.nombre_grupo}</b>?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Esta acción no se puede deshacer y podría afectar los alumnos asociados.
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
          <h1>Grupos <em>académicos</em></h1>
          <p className="sub">Grupos activos del período, vinculados a materia y docente.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'create' })}>
              <Icons.plus size={15} /> Nuevo grupo
            </button>
          </div>
        )}
      </div>

      <div className="filters" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }}>
            <Icons.search size={16} />
          </span>
          <input className="input" style={{ paddingLeft: 34, height: 38 }}
                 placeholder="Buscar por nombre o materia…"
                 value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando grupos…</p>}

      <div className="grid g-3">
        {filtered.map((g, i) => (
          <div key={g.id_grupo} className="card card-pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                             color: 'var(--gold-600)', fontFamily: 'monospace' }}>
                {g.nombre_grupo}
              </span>
              <span className="badge neutral">{alumnos[g.id_grupo] ?? '—'} alumnos</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{g.nombre_grupo}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 14 }}>
              {materias[g.id_materia] || `Materia ${g.id_materia}`}
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: 14 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                               background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                               color: '#fff', fontSize: 13, fontWeight: 700,
                               display: 'flex', alignItems: 'center', justifyContent: 'center' }}>D</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Docente</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-500)' }}>Responsable del grupo</p>
                </div>
              </div>
              {esDocente && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Editar"
                          onClick={() => setModal({ type: 'edit', item: g })}>
                    <Icons.edit size={13} />
                  </button>
                  <button className="iconbtn" style={{ height: 28, minWidth: 28, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                          onClick={() => setModal({ type: 'delete', item: g })}>
                    <Icons.trash size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>
          {search ? 'Sin resultados.' : 'No hay grupos registrados.'}
        </p>
      )}
    </Shell>
  )
}
