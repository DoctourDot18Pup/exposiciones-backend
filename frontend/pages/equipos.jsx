import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

const GRAD = ['135deg,#1a4d33,#b8975b','135deg,#0b2a1a,#9a7a3e','135deg,#28634a,#cdb079',
              '135deg,#103b25,#b8975b','135deg,#2e4a35,#9a7a3e']

function EquipoForm({ item, gruposList, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre_equipo: item?.nombre_equipo || '',
    id_grupo:      String(item?.id_grupo || ''),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = { nombre_equipo: form.nombre_equipo.trim(), id_grupo: parseInt(form.id_grupo) }
      if (item) await client.put(`/equipos/${item.id_equipo}`, body)
      else       await client.post('/equipos', body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Nombre del equipo</label>
        <input className="input" required value={form.nombre_equipo}
               onChange={set('nombre_equipo')} placeholder="Ej. Los Algoritmos" />
      </div>
      <div className="field">
        <label>Grupo</label>
        <select className="input" required value={form.id_grupo} onChange={set('id_grupo')}>
          <option value="">Seleccionar grupo…</option>
          {gruposList.map(g => (
            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
          ))}
        </select>
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Crear equipo'}
        </button>
      </div>
    </form>
  )
}

function MiembrosModal({ equipo, grupoAlumnos, miembrosActuales, onSave, onClose }) {
  const [selected, setSelected] = useState(new Set(miembrosActuales.map(a => a.id_alumno)))
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState(null)

  const toggle = id => setSelected(s => {
    const next = new Set(s)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const submit = async () => {
    setSaving(true); setErr(null)
    try {
      await client.patch(`/equipos/${equipo.id_equipo}/miembros`, { alumnos: [...selected] })
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <Modal title={`Integrantes — ${equipo.nombre_equipo}`} onClose={onClose} width={480}>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 16 }}>
        Selecciona los alumnos del grupo que pertenecen a este equipo.
        Los alumnos no seleccionados serán desvinculados del equipo.
      </p>

      {grupoAlumnos.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>Sin alumnos en este grupo.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {grupoAlumnos.map(a => {
            const checked = selected.has(a.id_alumno)
            const nombre  = [a.nombre, a.apellido].filter(Boolean).join(' ')
            return (
              <label key={a.id_alumno} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 8, cursor: 'pointer',
                background: checked ? 'var(--green-50)' : 'var(--paper)',
                border: `1px solid ${checked ? 'var(--green-700)' : 'var(--line)'}`,
                transition: 'all .1s',
              }}>
                <input type="checkbox" checked={checked} onChange={() => toggle(a.id_alumno)}
                       style={{ accentColor: 'var(--green-700)', width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{nombre || `Alumno #${a.id_alumno}`}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'monospace' }}>{a.matricula}</div>
                </div>
                {checked && <span className="badge good dot" style={{ fontSize: 10 }}>En equipo</span>}
              </label>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>
          {selected.size} alumno{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <><span className="spinner" /> Guardando…</> : 'Guardar integrantes'}
          </button>
        </div>
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
    </Modal>
  )
}

export default function Equipos() {
  const { session } = useAuth()
  const esDocente   = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [equipos, setEquipos]       = useState([])
  const [gruposList, setGruposList] = useState([])
  const [alumnos, setAlumnos]       = useState([])   // full list for member lookup
  const [grpMap, setGrpMap]         = useState({})
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [tick, setTick]             = useState(0)
  const [modal, setModal]           = useState(null)
  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      client.get('/equipos?size=100'),
      client.get('/alumnos?size=100'),
      client.get('/grupos?size=100'),
    ]).then(([eqRes, almRes, grpRes]) => {
      const eqs  = eqRes.status  === 'fulfilled' ? (eqRes.value.data?.content  || []) : []
      const alms = almRes.status === 'fulfilled' ? (almRes.value.data?.content || []) : []
      const grps = grpRes.status === 'fulfilled' ? (grpRes.value.data?.content || []) : []

      const gMap = {}
      for (const g of grps) gMap[g.id_grupo] = g.nombre_grupo

      setEquipos(eqs)
      setAlumnos(alms)
      setGruposList(grps)
      setGrpMap(gMap)
      setLoading(false)
    })
  }, [tick])

  const del = async eq => {
    try {
      await client.delete(`/equipos/${eq.id_equipo}`)
      reload(); setModal(null)
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al eliminar.')
    }
  }

  const filtered = equipos.filter(eq => {
    const q = search.toLowerCase()
    return !q
      || (eq.nombre_equipo || '').toLowerCase().includes(q)
      || (grpMap[eq.id_grupo] || '').toLowerCase().includes(q)
  })

  return (
    <Shell>
      {modal?.type === 'create' && (
        <Modal title="Nuevo equipo" onClose={() => setModal(null)}>
          <EquipoForm gruposList={gruposList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Editar equipo" onClose={() => setModal(null)}>
          <EquipoForm item={modal.item} gruposList={gruposList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Eliminar equipo" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar el equipo <b>{modal.item.nombre_equipo}</b>?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Esta acción no se puede deshacer y podría afectar exposiciones asociadas.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff', border: 0 }}
                    onClick={() => del(modal.item)}>Eliminar</button>
          </div>
        </Modal>
      )}
      {modal?.type === 'miembros' && (() => {
        const eq = modal.item
        const grupoAlumnos  = alumnos.filter(a => a.id_grupo === eq.id_grupo)
        const miembrosActuales = alumnos.filter(a => a.id_equipo === eq.id_equipo)
        return (
          <MiembrosModal equipo={eq} grupoAlumnos={grupoAlumnos} miembrosActuales={miembrosActuales}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        )
      })()}

      <div className="pagehead">
        <div>
          <h1>Equipos de <em>trabajo</em></h1>
          <p className="sub">Equipos formados por grupo. Cada equipo tiene integrantes designados y está vinculado a sus exposiciones.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'create' })}>
              <Icons.plus size={15} /> Nuevo equipo
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
                 placeholder="Buscar equipo o grupo…"
                 value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando equipos…</p>}

      <div className="grid g-2">
        {filtered.map((eq, i) => {
          // Derive members from alumnos list (id_equipo field)
          const integrantes = alumnos.filter(a => a.id_equipo === eq.id_equipo)

          return (
            <div key={eq.id_equipo} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--gold-600)' }}>
                    Equipo · {grpMap[eq.id_grupo] || `Grupo ${eq.id_grupo}`}
                  </div>
                  <h3 style={{ fontSize: 18, marginTop: 6, fontFamily: '"Source Serif 4", serif', fontWeight: 600 }}>
                    {eq.nombre_equipo}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span className="badge neutral">
                    {integrantes.length} {integrantes.length === 1 ? 'integrante' : 'integrantes'}
                  </span>
                  {esDocente && (
                    <>
                      <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Gestionar integrantes"
                              onClick={() => setModal({ type: 'miembros', item: eq })}>
                        <Icons.users size={13} />
                      </button>
                      <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Editar"
                              onClick={() => setModal({ type: 'edit', item: eq })}>
                        <Icons.edit size={13} />
                      </button>
                      <button className="iconbtn" style={{ height: 28, minWidth: 28, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                              onClick={() => setModal({ type: 'delete', item: eq })}>
                        <Icons.trash size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="divider" />

              {integrantes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {integrantes.map((a, j) => {
                    const nombre   = [a.nombre, a.apellido].filter(Boolean).join(' ')
                    const initials = nombre.split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase()
                    const isLider  = eq.id_lider === a.id_alumno || j === 0
                    return (
                      <div key={a.id_alumno} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                       background: `linear-gradient(${GRAD[j % GRAD.length]})`,
                                       color: '#fff', fontWeight: 700, fontSize: 13,
                                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {initials || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13 }}>{nombre}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'monospace' }}>{a.matricula}</div>
                        </div>
                        {isLider && <span className="badge gold" style={{ fontSize: 10 }}>Líder</span>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="muted" style={{ fontSize: 13 }}>Sin integrantes asignados.</p>
                  {esDocente && (
                    <button className="btn btn-ghost" style={{ height: 30, padding: '0 12px', fontSize: 12 }}
                            onClick={() => setModal({ type: 'miembros', item: eq })}>
                      <Icons.plus size={13} /> Agregar
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Sin equipos registrados.</p>
      )}
    </Shell>
  )
}
