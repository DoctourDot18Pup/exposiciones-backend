import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

const ESTADOS = ['Todas', 'pendiente', 'activa', 'cerrada']

function EstadoBadge({ estado }) {
  const cls = estado === 'activa' ? 'good dot' : estado === 'pendiente' ? 'warn dot' : 'neutral dot'
  return <span className={'badge ' + cls}>{estado}</span>
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = dateStr.length === 10 ? dateStr + 'T12:00:00' : dateStr
    return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }
  catch { return dateStr }
}

function ExposicionForm({ item, equiposList, onSave, onClose }) {
  const toDateInput = d => {
    if (!d) return ''
    try { return new Date(d).toISOString().slice(0, 16) }
    catch { return '' }
  }
  const [form, setForm] = useState({
    tema:      item?.tema      || '',
    id_equipo: String(item?.id_equipo || ''),
    fecha:     toDateInput(item?.fecha),
    aula:      item?.aula      || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = {
        tema:      form.tema.trim(),
        id_equipo: parseInt(form.id_equipo),
        fecha:     form.fecha || undefined,
        aula:      form.aula.trim() || undefined,
      }
      if (item) await client.put(`/exposiciones/${item.id_exposicion}`, body)
      else       await client.post('/exposiciones', body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Tema</label>
        <input className="input" required value={form.tema}
               onChange={set('tema')} placeholder="Ej. Sistemas de Gestión de Bases de Datos" />
      </div>
      <div className="field">
        <label>Equipo</label>
        <select className="input" required value={form.id_equipo} onChange={set('id_equipo')}>
          <option value="">Seleccionar equipo…</option>
          {equiposList.map(eq => (
            <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div className="field">
          <label>Fecha y hora</label>
          <input className="input" type="datetime-local" value={form.fecha} onChange={set('fecha')} />
        </div>
        <div className="field">
          <label>Aula</label>
          <input className="input" value={form.aula} onChange={set('aula')} placeholder="Ej. B-204" />
        </div>
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Crear exposición'}
        </button>
      </div>
    </form>
  )
}

function HabilitarModal({ exp, onSave, onClose }) {
  const [minutos, setMinutos] = useState(10)
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState(null)

  const submit = async () => {
    setSaving(true); setErr(null)
    try {
      await client.patch(`/exposiciones/${exp.id_exposicion}/habilitar`, { minutos_ventana: minutos })
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al habilitar.')
    } finally { setSaving(false) }
  }

  return (
    <Modal title="Habilitar exposición" onClose={onClose} width={420}>
      <p>Habilitar <b>{exp.tema}</b> para coevaluación.</p>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Ventana de evaluación</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {[10, 15].map(m => (
            <button key={m} type="button"
                    className={'btn ' + (minutos === m ? 'btn-primary' : 'btn-ghost')}
                    style={{ flex: 1, height: 44 }}
                    onClick={() => setMinutos(m)}>
              {m} minutos
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 8 }}>
        Los alumnos del grupo (excepto el equipo expositor) recibirán permisos de evaluación por {minutos} minutos.
      </p>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? <><span className="spinner" /> Habilitando…</> : 'Habilitar'}
        </button>
      </div>
    </Modal>
  )
}

function CerrarModal({ exp, onSave, onClose }) {
  const [metodo, setMetodo]   = useState('captcha')
  const [password, setPassword] = useState('')
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState(null)

  const submit = async () => {
    setSaving(true); setErr(null)
    try {
      const body = { metodo }
      if (metodo === 'password') body.password_confirmacion = password
      await client.patch(`/exposiciones/${exp.id_exposicion}/cerrar`, body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al cerrar.')
    } finally { setSaving(false) }
  }

  return (
    <Modal title="Cerrar exposición" onClose={onClose} width={460}>
      <p>Cerrar <b>{exp.tema}</b>. Esta acción cambia el estado a <em>cerrada</em>.</p>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Método de confirmación</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {['captcha', 'password'].map(m => (
            <button key={m} type="button"
                    className={'btn ' + (metodo === m ? 'btn-primary' : 'btn-ghost')}
                    style={{ flex: 1, height: 44, textTransform: 'capitalize' }}
                    onClick={() => setMetodo(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      {metodo === 'password' && (
        <div className="field">
          <label>Contraseña de confirmación</label>
          <input className="input" type="password" value={password}
                 onChange={e => setPassword(e.target.value)}
                 placeholder="Tu contraseña de acceso" />
        </div>
      )}
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn" style={{ background: 'var(--green-900)', color: '#fff', border: 0 }}
                onClick={submit} disabled={saving}>
          {saving ? <><span className="spinner" /> Cerrando…</> : 'Confirmar cierre'}
        </button>
      </div>
    </Modal>
  )
}

function PermisosModal({ exp, almMap, onClose }) {
  const [permisos, setPermisos] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    client.get(`/permisos/exposicion/${exp.id_exposicion}`)
      .then(res => setPermisos(res.data || []))
      .catch(() => setPermisos([]))
      .finally(() => setLoading(false))
  }, [exp.id_exposicion])

  const reabrir = async permiso => {
    try {
      await client.patch(`/permisos/${permiso.id_permiso}/reabrir`)
      const res = await client.get(`/permisos/exposicion/${exp.id_exposicion}`)
      setPermisos(res.data || [])
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al reabrir.')
    }
  }

  return (
    <Modal title={`Permisos — ${exp.tema}`} onClose={onClose} width={640}>
      {loading ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando permisos…</p>
      ) : permisos.length === 0 ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>
          Sin permisos generados. Habilita la exposición primero.
        </p>
      ) : (
        <>
          <table className="tbl">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Habilitado</th>
                <th>Evaluado</th>
                <th>Cierre</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {permisos.map(p => (
                <tr key={p.id_permiso}>
                  <td><b>{almMap[p.id_alumno] || `Alumno #${p.id_alumno}`}</b></td>
                  <td>
                    <span className={'badge ' + (p.habilitado ? 'good dot' : 'neutral dot')}>
                      {p.habilitado ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={'badge ' + (p.evaluado ? 'good dot' : 'warn dot')}>
                      {p.evaluado ? 'Sí' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                    {p.fecha_cierre && new Date(p.fecha_cierre) < new Date('2099-01-01')
                      ? new Date(p.fecha_cierre).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                      : <span className="badge good" style={{ fontSize: 10 }}>Sin límite</span>}
                  </td>
                  <td>
                    {!p.evaluado ? (
                      <button className="btn btn-ghost" style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                              onClick={() => reabrir(p)}>
                        Reabrir
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>Ya evaluó</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  )
}

export default function Exposiciones() {
  const router = useRouter()
  const { session } = useAuth()
  const esDocente   = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [exposiciones, setExposiciones] = useState([])
  const [equiposList, setEquiposList]   = useState([])
  const [equipos, setEquipos]           = useState({})
  const [almMap, setAlmMap]             = useState({})
  const [search, setSearch]             = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('Todas')
  const [loading, setLoading]           = useState(true)
  const [tick, setTick]                 = useState(0)
  const [modal, setModal]               = useState(null)
  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      client.get('/exposiciones?size=100'),
      client.get('/equipos?size=100'),
      client.get('/alumnos?size=100'),
    ]).then(([expRes, eqRes, almRes]) => {
      if (expRes.status === 'fulfilled') setExposiciones(expRes.value.data?.content || [])
      const eqList = eqRes.status === 'fulfilled' ? (eqRes.value.data?.content || []) : []
      const alms   = almRes.status === 'fulfilled' ? (almRes.value.data?.content || []) : []
      const map = {}
      for (const eq of eqList) map[eq.id_equipo] = eq.nombre_equipo
      const aMap = {}
      for (const a of alms) aMap[a.id_alumno] = `${a.nombre || ''} ${a.apellido || ''}`.trim()
      setEquiposList(eqList)
      setEquipos(map)
      setAlmMap(aMap)
      setLoading(false)
    })
  }, [tick])

  const del = async exp => {
    try {
      await client.delete(`/exposiciones/${exp.id_exposicion}`)
      reload(); setModal(null)
    } catch (ex) {
      alert(ex.response?.data?.message || 'Error al eliminar.')
    }
  }

  const filtered = exposiciones.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (e.tema || '').toLowerCase().includes(q)
      || (equipos[e.id_equipo] || '').toLowerCase().includes(q)
    const matchEstado = estadoFiltro === 'Todas' || e.estado === estadoFiltro
    return matchSearch && matchEstado
  })

  return (
    <Shell>
      {modal?.type === 'create' && (
        <Modal title="Nueva exposición" onClose={() => setModal(null)}>
          <ExposicionForm equiposList={equiposList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Editar exposición" onClose={() => setModal(null)}>
          <ExposicionForm item={modal.item} equiposList={equiposList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Eliminar exposición" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar <b>{modal.item.tema}</b>?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Solo se pueden eliminar exposiciones en estado <em>pendiente</em>.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff', border: 0 }}
                    onClick={() => del(modal.item)}>Eliminar</button>
          </div>
        </Modal>
      )}
      {modal?.type === 'habilitar' && (
        <HabilitarModal exp={modal.item}
          onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'cerrar' && (
        <CerrarModal exp={modal.item}
          onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'permisos' && (
        <PermisosModal exp={modal.item} almMap={almMap} onClose={() => setModal(null)} />
      )}

      <div className="pagehead">
        <div>
          <h1>Programa de <em>exposiciones</em></h1>
          <p className="sub">Exposiciones programadas y realizadas, agrupadas por estado. Vincula equipo + grupo + fecha.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'create' })}>
              <Icons.plus size={15} /> Nueva exposición
            </button>
          </div>
        )}
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-500)' }}>
            <Icons.search size={16} />
          </span>
          <input className="input" style={{ paddingLeft: 34, height: 38 }}
                 placeholder="Buscar por tema o equipo…"
                 value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {ESTADOS.map(est => (
            <button key={est} onClick={() => setEstadoFiltro(est)}
              style={{
                padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: estadoFiltro === est ? 600 : 400,
                border: '1px solid', cursor: 'pointer', transition: 'all .12s',
                borderColor: estadoFiltro === est ? 'var(--green-700)' : 'var(--line-strong)',
                background:  estadoFiltro === est ? 'var(--green-800)' : 'var(--white)',
                color:       estadoFiltro === est ? '#fff' : 'var(--ink-700)',
              }}>
              {est}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando exposiciones…</p>}

      {!loading && (
        <div className="card">
          {filtered.length === 0 ? (
            <p style={{ padding: 20, color: 'var(--ink-500)', fontSize: 13 }}>Sin resultados.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Equipo</th>
                  <th>Fecha · Hora</th>
                  <th>Aula</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => (
                  <tr key={exp.id_exposicion || i}>
                    <td style={{ maxWidth: 240 }}>
                      <b style={{ display: '-webkit-box', WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 13 }}>
                        {exp.tema || '—'}
                      </b>
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>
                      {equipos[exp.id_equipo] || `Equipo ${exp.id_equipo}`}
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>
                      {fmt(exp.fecha_hora || exp.fecha)}
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>
                      {exp.aula
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Icons.pin size={12} /> {exp.aula}
                          </span>
                        : '—'}
                    </td>
                    <td><EstadoBadge estado={exp.estado} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {!esDocente && exp.estado !== 'pendiente' && (
                          exp._evaluado
                            ? <span className="badge good" style={{ fontSize: 10, height: 28, display: 'inline-flex', alignItems: 'center' }}>
                                Evaluada
                              </span>
                            : <button className="btn btn-gold"
                                      style={{ height: 28, padding: '0 10px', fontSize: 11, width: 'auto' }}
                                      onClick={() => router.push(`/evaluaciones?id_exposicion=${exp.id_exposicion}`)}>
                                Evaluar →
                              </button>
                        )}
                        {esDocente && exp.estado === 'pendiente' && (
                          <>
                            <button className="btn btn-primary"
                                    style={{ height: 28, padding: '0 10px', fontSize: 11, width: 'auto' }}
                                    onClick={() => setModal({ type: 'habilitar', item: exp })}>
                              Habilitar
                            </button>
                            <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Editar"
                                    onClick={() => setModal({ type: 'edit', item: exp })}>
                              <Icons.edit size={13} />
                            </button>
                            <button className="iconbtn" style={{ height: 28, minWidth: 28, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                                    onClick={() => setModal({ type: 'delete', item: exp })}>
                              <Icons.trash size={13} />
                            </button>
                          </>
                        )}
                        {esDocente && exp.estado === 'activa' && (
                          <>
                            <button className="btn btn-ghost"
                                    style={{ height: 28, padding: '0 10px', fontSize: 11, width: 'auto' }}
                                    onClick={() => setModal({ type: 'cerrar', item: exp })}>
                              Cerrar
                            </button>
                            <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Permisos"
                                    onClick={() => setModal({ type: 'permisos', item: exp })}>
                              <Icons.users size={13} />
                            </button>
                          </>
                        )}
                        {esDocente && exp.estado === 'cerrada' && (
                          <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Ver permisos"
                                  onClick={() => setModal({ type: 'permisos', item: exp })}>
                            <Icons.users size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Shell>
  )
}
