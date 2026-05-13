import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

function AlumnoForm({ item, gruposList, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre:    item?.nombre    || '',
    apellido:  item?.apellido  || '',
    matricula: item?.matricula || '',
    id_grupo:  String(item?.id_grupo || ''),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = {
        nombre:    form.nombre.trim(),
        apellido:  form.apellido.trim(),
        matricula: form.matricula.trim(),
        id_grupo:  parseInt(form.id_grupo),
      }
      let res
      if (item) res = await client.put(`/alumnos/${item.id_alumno}`, body)
      else       res = await client.post('/alumnos', body)
      onSave(res.data)
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Nombre(s)</label>
          <input className="input" required value={form.nombre}
                 onChange={set('nombre')} placeholder="Ej. Juan Carlos" />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Apellido(s)</label>
          <input className="input" required value={form.apellido}
                 onChange={set('apellido')} placeholder="Ej. García López" />
        </div>
      </div>
      <div className="field">
        <label>Matrícula</label>
        <input className="input" required value={form.matricula}
               onChange={set('matricula')} placeholder="Ej. 21031430" />
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
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Registrar alumno'}
        </button>
      </div>
    </form>
  )
}

function CredencialesModal({ creds, onClose }) {
  return (
    <Modal title="Alumno registrado — credenciales" onClose={onClose} width={460}>
      <div className="alert info" style={{ background: '#e9f4ec', borderColor: '#c4e1cc', color: '#1e6a3a', marginBottom: 0 }}>
        <Icons.check />
        <div>Alumno creado exitosamente. Guarda estas credenciales — no se mostrarán de nuevo.</div>
      </div>
      <div style={{ marginTop: 20, padding: '16px', background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)' }}>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Usuario (correo institucional)</label>
          <input className="input" readOnly value={creds.username}
                 style={{ fontFamily: 'monospace', background: '#fff' }} />
        </div>
        <div className="field">
          <label>Contraseña temporal</label>
          <input className="input" readOnly value={creds.password_temporal}
                 style={{ fontFamily: 'monospace', background: '#fff', letterSpacing: '.08em' }} />
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 12 }}>
        El alumno debe cambiar su contraseña en el primer acceso.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onClose}>Entendido</button>
      </div>
    </Modal>
  )
}

export default function Alumnos() {
  const { session } = useAuth()
  const esDocente   = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [alumnos, setAlumnos]     = useState([])
  const [grupos, setGrupos]       = useState({})
  const [gruposList, setGruposList] = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [tick, setTick]           = useState(0)
  const [modal, setModal]         = useState(null)
  const [creds, setCreds]         = useState(null)
  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      client.get('/alumnos?size=100'),
      client.get('/grupos?size=100'),
    ]).then(([almRes, grpRes]) => {
      const alms = almRes.status === 'fulfilled' ? (almRes.value.data?.content || []) : []
      const grps = grpRes.status === 'fulfilled' ? (grpRes.value.data?.content || []) : []
      const grpMap = {}
      for (const g of grps) grpMap[g.id_grupo] = g.nombre_grupo
      setAlumnos(alms)
      setGrupos(grpMap)
      setGruposList(grps)
      setLoading(false)
    })
  }, [tick])

  const del = async a => {
    try {
      await client.delete(`/alumnos/${a.id_alumno}`)
      reload(); setModal(null)
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al eliminar.')
    }
  }

  const handleSave = data => {
    reload(); setModal(null)
    if (data?.credenciales) setCreds(data.credenciales)
  }

  const filtered = alumnos.filter(a => {
    const q = search.toLowerCase()
    return !q
      || (a.matricula || '').toLowerCase().includes(q)
      || (a.nombre    || '').toLowerCase().includes(q)
      || (a.apellido  || '').toLowerCase().includes(q)
      || (grupos[a.id_grupo] || '').toLowerCase().includes(q)
  })

  return (
    <Shell>
      {creds && <CredencialesModal creds={creds} onClose={() => setCreds(null)} />}

      {modal?.type === 'create' && (
        <Modal title="Registrar alumno" onClose={() => setModal(null)}>
          <AlumnoForm gruposList={gruposList} onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Editar alumno" onClose={() => setModal(null)}>
          <AlumnoForm item={modal.item} gruposList={gruposList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Eliminar alumno" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar a <b>{[modal.item.nombre, modal.item.apellido].filter(Boolean).join(' ')}</b> ({modal.item.matricula})?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Se eliminarán también sus credenciales de acceso.
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
          <h1>Directorio de <em>alumnos</em></h1>
          <p className="sub">Alumnos registrados y sus grupos asignados.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'create' })}>
              <Icons.plus size={15} /> Registrar alumno
            </button>
          </div>
        )}
      </div>

      <div className="filters" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }}>
            <Icons.search size={16} />
          </span>
          <input className="input" style={{ paddingLeft: 34, height: 38 }}
                 placeholder="Buscar por matrícula, nombre o grupo…"
                 value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: 20, color: 'var(--ink-500)', fontSize: 13 }}>Cargando alumnos…</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Grupo</th>
                <th>Correo institucional</th>
                {esDocente && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const nombreCompleto = [a.nombre, a.apellido].filter(Boolean).join(' ')
                const correo = a.correo || `${a.matricula}@itcelaya.edu.mx`
                return (
                  <tr key={a.id_alumno}>
                    <td>
                      <span className="badge neutral" style={{ fontFamily: 'monospace' }}>{a.matricula}</span>
                    </td>
                    <td><b>{nombreCompleto || `Alumno #${a.id_alumno}`}</b></td>
                    <td>
                      <span className="badge gold" style={{ fontFamily: 'monospace' }}>
                        {grupos[a.id_grupo] || `Grupo ${a.id_grupo}`}
                      </span>
                    </td>
                    <td className="muted" style={{ fontSize: 12, fontFamily: 'monospace' }}>{correo}</td>
                    {esDocente && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="iconbtn" style={{ height: 30, minWidth: 30 }} title="Editar"
                                  onClick={() => setModal({ type: 'edit', item: a })}>
                            <Icons.edit size={14} />
                          </button>
                          <button className="iconbtn" style={{ height: 30, minWidth: 30, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                                  onClick={() => setModal({ type: 'delete', item: a })}>
                            <Icons.trash size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={esDocente ? 5 : 4} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-500)' }}>
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
