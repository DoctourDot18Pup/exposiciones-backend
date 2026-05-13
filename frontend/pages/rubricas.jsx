import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import client from '../lib/client'

function RubricaForm({ item, materiasList, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre:     item?.nombre     || '',
    id_materia: String(item?.id_materia || ''),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const body = { nombre: form.nombre.trim(), id_materia: parseInt(form.id_materia) }
      if (item) await client.put(`/rubricas/${item.id_rubrica}`, body)
      else       await client.post('/rubricas', body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Nombre de la rúbrica</label>
        <input className="input" required value={form.nombre}
               onChange={set('nombre')} placeholder="Ej. Rúbrica de Presentación Oral" />
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
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Crear rúbrica'}
        </button>
      </div>
    </form>
  )
}

function CriterioForm({ rubricaId, item, onSave, onClose }) {
  const [form, setForm] = useState({
    descripcion:  item?.descripcion  || '',
    ponderacion:  String(item?.ponderacion || ''),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    const pond = parseFloat(form.ponderacion)
    if (isNaN(pond) || pond < 0.1 || pond > 100) {
      setErr('La ponderación debe estar entre 0.1 y 100.'); return
    }
    setSaving(true); setErr(null)
    try {
      const body = { descripcion: form.descripcion.trim(), ponderacion: pond }
      if (item) await client.put(`/criterios/${item.id_criterio}`, body)
      else       await client.post(`/rubricas/${rubricaId}/criterios`, body)
      onSave()
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.response?.data?.error || 'Error al guardar.')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <div className="field" style={{ marginTop: 0 }}>
        <label>Descripción del criterio</label>
        <input className="input" required value={form.descripcion}
               onChange={set('descripcion')} placeholder="Ej. Dominio del tema" />
      </div>
      <div className="field">
        <label>Ponderación (%)</label>
        <input className="input" required type="number" min="0.1" max="100" step="0.1"
               value={form.ponderacion} onChange={set('ponderacion')} placeholder="Ej. 30" />
        <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
          La suma de todos los criterios debe ser 100%.
        </p>
      </div>
      {err && <div className="alert error" style={{ marginTop: 12 }}><span>{err}</span></div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Guardando…</> : item ? 'Guardar cambios' : 'Agregar criterio'}
        </button>
      </div>
    </form>
  )
}

export default function Rubricas() {
  const { session } = useAuth()
  const esDocente   = ['Docente', 'Administrador'].includes(session?.usuario?.rol)

  const [rubricas, setRubricas]     = useState([])
  const [active, setActive]         = useState(null)
  const [criterios, setCriterios]   = useState([])
  const [materiasList, setMateriasList] = useState([])
  const [materias, setMaterias]     = useState({})
  const [loadingR, setLoadingR]     = useState(true)
  const [loadingC, setLoadingC]     = useState(false)
  const [tick, setTick]             = useState(0)
  const [tickC, setTickC]           = useState(0)
  const [modal, setModal]           = useState(null)
  const reload  = () => setTick(t => t + 1)
  const reloadC = () => setTickC(t => t + 1)

  useEffect(() => {
    setLoadingR(true)
    Promise.allSettled([
      client.get('/rubricas?size=100'),
      client.get('/materias?size=100'),
    ]).then(([rubRes, matRes]) => {
      const rubs = rubRes.status === 'fulfilled' ? (rubRes.value.data?.content || []) : []
      const mats = matRes.status === 'fulfilled' ? (matRes.value.data?.content || []) : []
      const matMap = {}
      for (const m of mats) matMap[m.id_materia] = m.nombre_materia
      setRubricas(rubs)
      setMateriasList(mats)
      setMaterias(matMap)
      if (rubs.length > 0) setActive(prev => prev ?? rubs[0].id_rubrica)
      setLoadingR(false)
    })
  }, [tick])

  useEffect(() => {
    if (!active) return
    setLoadingC(true)
    client.get(`/rubricas/${active}/criterios`)
      .then(res => setCriterios(Array.isArray(res.data) ? res.data : (res.data?.content || [])))
      .catch(() => setCriterios([]))
      .finally(() => setLoadingC(false))
  }, [active, tickC])

  const delRubrica = async r => {
    try {
      await client.delete(`/rubricas/${r.id_rubrica}`)
      setActive(null); reload(); setModal(null)
    } catch (ex) { alert(ex.response?.data?.message || 'Error al eliminar.') }
  }

  const delCriterio = async c => {
    try {
      await client.delete(`/criterios/${c.id_criterio}`)
      reloadC(); setModal(null)
    } catch (ex) { alert(ex.response?.data?.message || 'Error al eliminar.') }
  }

  const sel        = rubricas.find(r => r.id_rubrica === active)
  const totalPond  = criterios.reduce((s, c) => s + Number(c.ponderacion || 0), 0)

  return (
    <Shell>
      {modal?.type === 'createR' && (
        <Modal title="Nueva rúbrica" onClose={() => setModal(null)}>
          <RubricaForm materiasList={materiasList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editR' && (
        <Modal title="Editar rúbrica" onClose={() => setModal(null)}>
          <RubricaForm item={modal.item} materiasList={materiasList}
            onSave={() => { reload(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'deleteR' && (
        <Modal title="Eliminar rúbrica" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar la rúbrica <b>{modal.item.nombre}</b>?</p>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 8 }}>
            Se eliminarán también todos sus criterios asociados.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff', border: 0 }}
                    onClick={() => delRubrica(modal.item)}>Eliminar</button>
          </div>
        </Modal>
      )}
      {modal?.type === 'createC' && (
        <Modal title="Agregar criterio" onClose={() => setModal(null)}>
          <CriterioForm rubricaId={active}
            onSave={() => { reloadC(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editC' && (
        <Modal title="Editar criterio" onClose={() => setModal(null)}>
          <CriterioForm rubricaId={active} item={modal.item}
            onSave={() => { reloadC(); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'deleteC' && (
        <Modal title="Eliminar criterio" onClose={() => setModal(null)} width={420}>
          <p>¿Eliminar el criterio <b>{modal.item.descripcion}</b>?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--bad)', color: '#fff', border: 0 }}
                    onClick={() => delCriterio(modal.item)}>Eliminar</button>
          </div>
        </Modal>
      )}

      <div className="pagehead">
        <div>
          <h1>Rúbricas y <em>criterios</em></h1>
          <p className="sub">Define los criterios de evaluación con su ponderación. La suma de ponderaciones debe ser 100%.</p>
        </div>
        {esDocente && (
          <div className="actions">
            <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, width: 'auto' }}
                    onClick={() => setModal({ type: 'createR' })}>
              <Icons.plus size={15} /> Nueva rúbrica
            </button>
          </div>
        )}
      </div>

      <div className="grid g-12-8-4">
        {/* Criteria table */}
        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>{sel?.nombre || 'Selecciona una rúbrica'}</h3>
                {sel && <div className="sub">{materias[sel.id_materia] || `Materia ${sel.id_materia}`}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={'badge ' + (totalPond === 100 ? 'good dot' : 'warn dot')}>
                  Suma: {totalPond}%
                </span>
                {esDocente && sel && (
                  <>
                    <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Editar rúbrica"
                            onClick={() => setModal({ type: 'editR', item: sel })}>
                      <Icons.edit size={13} />
                    </button>
                    <button className="iconbtn" style={{ height: 28, minWidth: 28, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar rúbrica"
                            onClick={() => setModal({ type: 'deleteR', item: sel })}>
                      <Icons.trash size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {loadingC ? (
              <p style={{ padding: 20, color: 'var(--ink-500)', fontSize: 13 }}>Cargando criterios…</p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción del criterio</th>
                    <th style={{ textAlign: 'right' }}>Ponderación</th>
                    <th>Distribución</th>
                    {esDocente && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {criterios.map(c => (
                    <tr key={c.id_criterio}>
                      <td>
                        <span className="badge neutral" style={{ fontFamily: 'monospace' }}>#{c.id_criterio}</span>
                      </td>
                      <td><b>{c.descripcion}</b></td>
                      <td className="num">
                        <b style={{ fontFamily: '"Source Serif 4", serif', fontSize: 18 }}>{c.ponderacion}%</b>
                      </td>
                      <td>
                        <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden', minWidth: 120 }}>
                          <div style={{ width: `${Math.min(c.ponderacion, 100)}%`, height: '100%',
                                         background: 'linear-gradient(90deg, var(--green-700), var(--gold-500))' }} />
                        </div>
                      </td>
                      {esDocente && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="iconbtn" style={{ height: 28, minWidth: 28 }} title="Editar"
                                    onClick={() => setModal({ type: 'editC', item: c })}>
                              <Icons.edit size={13} />
                            </button>
                            <button className="iconbtn" style={{ height: 28, minWidth: 28, color: 'var(--bad)', borderColor: '#f1cabe' }} title="Eliminar"
                                    onClick={() => setModal({ type: 'deleteC', item: c })}>
                              <Icons.trash size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {criterios.length === 0 && (
                    <tr>
                      <td colSpan={esDocente ? 5 : 4} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-500)' }}>
                        {active ? 'Sin criterios para esta rúbrica.' : 'Selecciona una rúbrica.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {esDocente && active && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
                <button className="btn btn-ghost" style={{ fontSize: 12, height: 32 }}
                        onClick={() => setModal({ type: 'createC' })}>
                  <Icons.plus size={14} /> Agregar criterio
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--gold-100)',
                         border: '1px solid var(--gold-400)', borderRadius: 10,
                         color: 'var(--green-900)', fontSize: 13, display: 'flex', gap: 10 }}>
            <Icons.spark />
            <div>
              <b>RN-03:</b> toda evaluación debe incluir al menos un criterio.{' '}
              <b>RN-06:</b> los criterios son predefinidos y se referencian por <code>id_criterio</code>.
            </div>
          </div>
        </div>

        {/* Rubrica selector */}
        <div>
          {loadingR ? (
            <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando rúbricas…</p>
          ) : rubricas.map(r => (
            <div key={r.id_rubrica} onClick={() => setActive(r.id_rubrica)}
                 className="card card-pad"
                 style={{ marginBottom: 12, cursor: 'pointer',
                           borderColor: r.id_rubrica === active ? 'var(--green-700)' : 'var(--line)',
                           boxShadow:   r.id_rubrica === active ? '0 0 0 3px rgba(26,77,51,.08)' : undefined }}>
              <div className="eyebrow" style={{ color: 'var(--gold-600)' }}>
                {materias[r.id_materia] || `Materia ${r.id_materia}`}
              </div>
              <h3 style={{ fontSize: 15, marginTop: 6 }}>{r.nombre}</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 10 }}>
                id_rubrica · {r.id_rubrica}
              </div>
            </div>
          ))}
          {!loadingR && rubricas.length === 0 && (
            <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Sin rúbricas registradas.</p>
          )}
        </div>
      </div>
    </Shell>
  )
}
