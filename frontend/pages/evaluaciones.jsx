import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Shell from '../components/Shell'
import Icons from '../components/Icons'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { colorFor, labelFor } from '../utils/helpers'
import client from '../lib/client'

// ── Modal: matriz alumnos × criterios ─────────────────────────────────────────

function MatrizModal({ exposicion, evaluaciones, criteriosMap = {}, almMap, onClose }) {
  const criterioIds = useMemo(() => {
    const ids = new Set()
    for (const ev of evaluaciones)
      for (const d of (ev.detalles || [])) ids.add(d.id_criterio)
    return [...ids].sort((a, b) => a - b)
  }, [evaluaciones])

  const criterioNames = Object.fromEntries(
    criterioIds.map(id => [id, criteriosMap[id]?.descripcion || null])
  )

  const rows = evaluaciones.map(ev => {
    const cells = {}
    for (const d of (ev.detalles || [])) cells[d.id_criterio] = parseFloat(d.calificacion)
    return { ...ev, cells }
  })

  const colAvgs = {}
  for (const id of criterioIds) {
    const vals = rows.map(r => r.cells[id]).filter(v => v != null)
    colAvgs[id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const overallAvg = rows.length
    ? rows.reduce((s, r) => s + parseFloat(r.promedio || 0), 0) / rows.length
    : null

  const modalW = Math.max(860, criterioIds.length * 150 + 420)

  return (
    <Modal title={`Matriz — ${exposicion.tema}`} onClose={onClose} width={modalW}>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="badge neutral">{rows.length} evaluación{rows.length !== 1 ? 'es' : ''}</span>
        {overallAvg != null && (
          <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            Promedio grupo:{' '}
            <b style={{ fontFamily: '"Source Serif 4", serif', fontSize: 20, color: 'var(--green-900)' }}>
              {overallAvg.toFixed(2)}
            </b>
          </span>
        )}
        <span className={`badge ${colorFor(overallAvg)} dot`}>{labelFor(overallAvg)}</span>
      </div>

      <table className="tbl" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Evaluador</th>
              {criterioIds.map(id => (
                <th key={id} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis',
                                 whiteSpace: 'nowrap', marginLeft: 'auto', maxWidth: '100%' }}
                       title={criterioNames[id] || `Criterio #${id}`}>
                    {criterioNames[id] || `C#${id}`}
                  </div>
                </th>
              ))}
              <th style={{ textAlign: 'right', width: 100 }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id_evaluacion}>
                <td style={{ fontSize: 14, fontWeight: 600 }}>
                  {almMap[row.id_alumno] || `Alumno #${row.id_alumno}`}
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'monospace', fontWeight: 400, marginTop: 2 }}>
                    {row.fecha_evaluacion
                      ? new Date(row.fecha_evaluacion).toLocaleDateString('es-MX') : ''}
                  </div>
                </td>
                {criterioIds.map(id => {
                  const v = row.cells[id]
                  const pct = v != null ? (v / 10) * 100 : 0
                  return (
                    <td key={id} style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}>
                        {v != null ? v.toFixed(1) : <span style={{ color: 'var(--ink-400)' }}>—</span>}
                      </div>
                      {v != null && (
                        <div style={{ height: 4, background: 'var(--line)', borderRadius: 2,
                                       marginTop: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%',
                                         background: 'linear-gradient(90deg,var(--green-700),var(--gold-500))' }} />
                        </div>
                      )}
                    </td>
                  )
                })}
                <td style={{ textAlign: 'right' }}>
                  <b style={{ fontFamily: '"Source Serif 4", serif', fontSize: 22,
                               color: 'var(--green-900)' }}>
                    {parseFloat(row.promedio || 0).toFixed(2)}
                  </b>
                </td>
              </tr>
            ))}

            {rows.length > 1 && (
              <tr style={{ background: 'var(--paper)' }}>
                <td style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase',
                               letterSpacing: '.06em', fontWeight: 700 }}>
                  Promedio grupo
                </td>
                {criterioIds.map(id => (
                  <td key={id} style={{ textAlign: 'right', fontFamily: 'monospace',
                                         fontSize: 13, fontWeight: 600 }}>
                    {colAvgs[id] != null ? colAvgs[id].toFixed(1) : '—'}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  <b style={{ fontFamily: '"Source Serif 4", serif', fontSize: 17,
                               color: 'var(--green-900)' }}>
                    {overallAvg != null ? overallAvg.toFixed(2) : '—'}
                  </b>
                </td>
              </tr>
            )}

            {rows.length === 0 && (
              <tr>
                <td colSpan={criterioIds.length + 2}
                    style={{ textAlign: 'center', padding: 24, color: 'var(--ink-500)', fontSize: 13 }}>
                  Sin evaluaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  )
}

// ── Tab: Listado (docente) ────────────────────────────────────────────────────
function TabListado({ exposiciones, alumnos }) {
  const [q, setQ]                 = useState('')
  const [evByExp, setEvByExp]     = useState({})
  const [loading, setLoading]     = useState(false)
  const [matriz, setMatriz]       = useState(null)

  const almMap = {}
  for (const a of alumnos) almMap[a.id_alumno] = `${a.nombre || ''} ${a.apellido || ''}`.trim()

  useEffect(() => {
    if (!exposiciones.length) return
    setLoading(true)
    const load = async () => {
      const map = {}
      for (const exp of exposiciones) {
        try {
          const { data } = await client.get(`/evaluaciones/exposicion/${exp.id_exposicion}`)
          const evals = data.evaluaciones || []
          if (evals.length) map[exp.id_exposicion] = { exp, evals, criterios: data.criterios || {} }
        } catch { /* exposición sin evaluaciones */ }
      }
      setEvByExp(map)
      setLoading(false)
    }
    load()
  }, [exposiciones])

  const entries = Object.values(evByExp).filter(({ exp }) =>
    !q || (exp.tema || '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      {matriz && (
        <MatrizModal
          exposicion={matriz.exp}
          evaluaciones={matriz.evals}
          criteriosMap={matriz.criterios}
          almMap={almMap}
          onClose={() => setMatriz(null)}
        />
      )}

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                          color: 'var(--ink-500)' }}>
            <Icons.search size={16} />
          </span>
          <input className="input" style={{ paddingLeft: 34, height: 38 }}
                 placeholder="Filtrar por exposición…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando evaluaciones…</p>
      ) : (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Exposición</th>
                <th>Equipo</th>
                <th style={{ textAlign: 'right' }}>Evaluaciones</th>
                <th style={{ textAlign: 'right' }}>Promedio grupo</th>
                <th>Desempeño</th>
                <th>Matriz</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(({ exp, evals }) => {
                const avg = evals.reduce((s, e) => s + parseFloat(e.promedio || 0), 0) / evals.length
                return (
                  <tr key={exp.id_exposicion}>
                    <td>
                      <b>{exp.tema}</b>
                      <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'monospace', marginTop: 2 }}>
                        #{exp.id_exposicion}{exp.aula ? ` · ${exp.aula}` : ''}
                      </div>
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>equipo #{exp.id_equipo}</td>
                    <td className="num">{evals.length}</td>
                    <td className="num">
                      <b style={{ fontFamily: '"Source Serif 4", serif', fontSize: 18,
                                   color: 'var(--green-900)' }}>
                        {avg.toFixed(2)}
                      </b>
                    </td>
                    <td>
                      <span className={`badge ${colorFor(avg)} dot`}>{labelFor(avg)}</span>
                    </td>
                    <td>
                      <button className="btn btn-ghost"
                              style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                              onClick={() => setMatriz({ exp, evals })}>
                        Ver matriz
                      </button>
                    </td>
                  </tr>
                )
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-500)' }}>
                    Sin evaluaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Tab: Registro (alumno) ────────────────────────────────────────────────────
function TabRegistro({ exposiciones, session }) {
  const [idExp, setIdExp]           = useState('')
  const [criterios, setCriterios]   = useState([])
  const [califs, setCalifs]         = useState({})
  const [loadingC, setLoadingC]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]               = useState(null)
  const [resp, setResp]             = useState(null)

  const activas = exposiciones.filter(e => e.estado !== 'pendiente')

  useEffect(() => {
    if (!idExp) { setCriterios([]); setCalifs({}); return }
    setLoadingC(true); setCriterios([]); setCalifs({}); setErr(null)
    const load = async () => {
      try {
        const expRes = await client.get(`/exposiciones/${idExp}`)
        const eqRes  = await client.get(`/equipos/${expRes.data.id_equipo}`)
        const grpRes = await client.get(`/grupos/${eqRes.data.id_grupo}`)
        const rubRes = await client.get('/rubricas?size=100')
        const rubrica = (rubRes.data?.content || []).find(r => r.id_materia === grpRes.data.id_materia)
          || (rubRes.data?.content || [])[0]
        if (!rubrica) { setErr('No hay rúbrica para esta materia.'); return }
        const critRes = await client.get(`/rubricas/${rubrica.id_rubrica}/criterios`)
        const crits = Array.isArray(critRes.data) ? critRes.data : (critRes.data?.content || [])
        setCriterios(crits)
        const init = {}
        for (const c of crits) init[c.id_criterio] = 8.5
        setCalifs(init)
      } catch { setErr('Error al cargar criterios.') }
      finally { setLoadingC(false) }
    }
    load()
  }, [idExp])

  const promedio = useMemo(() => {
    if (!criterios.length) return null
    let sp = 0, sw = 0
    for (const c of criterios) {
      const v = califs[c.id_criterio]
      if (v != null && !isNaN(v)) { sp += Number(v) * Number(c.ponderacion); sw += Number(c.ponderacion) }
    }
    return sw > 0 ? sp / sw : null
  }, [criterios, califs])

  const submit = async () => {
    setErr(null); setResp(null)
    const detalles = criterios.map(c => ({
      id_criterio: c.id_criterio,
      calificacion: parseFloat(califs[c.id_criterio]),
    })).filter(d => !isNaN(d.calificacion))

    if (detalles.length !== criterios.length) { setErr('Califica todos los criterios.'); return }
    const fuera = detalles.find(d => d.calificacion < 0 || d.calificacion > 10)
    if (fuera) { setErr(`Calificación fuera de rango [0, 10] en criterio #${fuera.id_criterio}.`); return }

    setSubmitting(true)
    try {
      const res = await client.post('/evaluaciones', { id_exposicion: parseInt(idExp), detalles })
      setResp(res.data)
      setIdExp(''); setCriterios([]); setCalifs({})
    } catch (ex) {
      const msg = ex.response?.data?.message || ex.response?.data?.error || 'Error al registrar la evaluación.'
      setErr(`HTTP ${ex.response?.status ?? '—'} · ${msg}`)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="grid g-12-8-4">
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Nueva evaluación</h3>
            <div className="sub">Selecciona la exposición y captura las calificaciones por criterio.</div>
          </div>
        </div>
        <div className="card-pad">
          <div className="field" style={{ marginTop: 0 }}>
            <label>Exposición disponible</label>
            <select className="input" value={idExp}
                    onChange={e => { setIdExp(e.target.value); setErr(null); setResp(null) }} required>
              <option value="">Seleccionar…</option>
              {activas.map(x => (
                <option key={x.id_exposicion} value={x.id_exposicion}>{x.tema}</option>
              ))}
            </select>
            {activas.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>No hay exposiciones disponibles para evaluar.</p>
            )}
          </div>

          <div className="field">
            <label>Evaluador</label>
            <input className="input" readOnly
                   value={`#${session?.usuario?.id_usuario} · ${session?.usuario?.nombre}`} />
          </div>

          {loadingC && (
            <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 14 }}>Cargando criterios…</p>
          )}

          {criterios.length > 0 && (
            <div style={{ marginTop: 18, borderTop: '1px solid var(--line)',
                           borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: 12, padding: '6px 0',
                             fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase',
                             letterSpacing: '.1em', fontWeight: 600 }}>
                <div>Criterio</div><div>Ponderación</div><div>Calificación 0.0 – 10.0</div>
              </div>
              {criterios.map(c => (
                <div key={c.id_criterio}
                     style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: 12,
                               alignItems: 'center', padding: '10px 0', borderTop: '1px dashed var(--line)' }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{c.descripcion}</b>
                    <div className="muted" style={{ fontSize: 11 }}>id_criterio: {c.id_criterio}</div>
                  </div>
                  <div className="muted">{c.ponderacion}%</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="range" min="0" max="10" step="0.5"
                           value={califs[c.id_criterio] ?? 8.5}
                           onChange={e => setCalifs(f => ({ ...f, [c.id_criterio]: parseFloat(e.target.value) }))} />
                    <input type="number" className="input" min="0" max="10" step="0.5"
                           style={{ width: 80, height: 36 }}
                           value={califs[c.id_criterio] ?? ''}
                           onChange={e => setCalifs(f => ({ ...f, [c.id_criterio]: parseFloat(e.target.value) }))} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
            <div>
              {promedio != null && (
                <>
                  <div className="eyebrow" style={{ color: 'var(--gold-600)' }}>Promedio ponderado</div>
                  <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 36, fontWeight: 600,
                                 color: 'var(--green-900)', lineHeight: 1, marginTop: 4 }}>
                    {promedio.toFixed(2)}
                  </div>
                </>
              )}
            </div>
            <button className="btn btn-primary" style={{ width: 220 }}
                    onClick={submit} disabled={submitting || criterios.length === 0}>
              {submitting
                ? <><span className="spinner" /> Enviando…</>
                : <>Enviar evaluación <Icons.arrow size={16} /></>}
            </button>
          </div>

          {err && (
            <div className="alert error" style={{ marginTop: 14 }}>
              <Icons.warn /> <div>{err}</div>
            </div>
          )}
          {resp && (
            <div className="alert info" style={{ marginTop: 14, background: '#e9f4ec',
                                                  borderColor: '#c4e1cc', color: '#1e6a3a' }}>
              <Icons.check />
              <div>
                <b>HTTP 201 · Created</b> · id_evaluacion #{resp.id_evaluacion} · promedio{' '}
                <b>{parseFloat(resp.promedio).toFixed(2)}</b>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="card card-pad" style={{ background: 'var(--green-900)', color: 'var(--cream)',
                                                 borderColor: 'var(--green-900)' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)' }}>Consideraciones</div>
          <ul style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: 13, color: 'rgba(243,234,219,.85)', lineHeight: 1.7 }}>
            <li>No puedes evaluar la misma exposición dos veces.</li>
            <li>Calificación por criterio: entre 0.0 y 10.0.</li>
            <li>Deben calificarse todos los criterios.</li>
            <li>No puedes evaluar la exposición de tu propio equipo.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Resultados (docente) ─────────────────────────────────────────────────
function TabResultados({ exposiciones, alumnos }) {
  const [evByExp, setEvByExp] = useState({})
  const [loading, setLoading] = useState(false)
  const [matriz, setMatriz]   = useState(null)

  const almMap = {}
  for (const a of alumnos) almMap[a.id_alumno] = `${a.nombre || ''} ${a.apellido || ''}`.trim()

  useEffect(() => {
    if (!exposiciones.length) return
    setLoading(true)
    const load = async () => {
      const map = {}
      for (const exp of exposiciones) {
        try {
          const { data } = await client.get(`/evaluaciones/exposicion/${exp.id_exposicion}`)
          const evals = data.evaluaciones || []
          if (evals.length) map[exp.id_exposicion] = { exp, evals, criterios: data.criterios || {} }
        } catch { /* skip */ }
      }
      setEvByExp(map)
      setLoading(false)
    }
    load()
  }, [exposiciones])

  if (loading) return <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Calculando promedios…</p>

  const entries = Object.values(evByExp)

  return (
    <>
      {matriz && (
        <MatrizModal
          exposicion={matriz.exp}
          evaluaciones={matriz.evals}
          criteriosMap={matriz.criterios}
          almMap={almMap}
          onClose={() => setMatriz(null)}
        />
      )}

      <div className="grid g-2">
        {entries.map(({ exp, evals }) => {
          const avg = evals.reduce((s, e) => s + parseFloat(e.promedio || 0), 0) / evals.length
          return (
            <div key={exp.id_exposicion} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between',
                             alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--gold-600)' }}>
                    Exposición #{exp.id_exposicion}
                  </div>
                  <h3 style={{ fontSize: 16, marginTop: 6 }}>{exp.tema}</h3>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {exp.aula ? `Aula ${exp.aula} · ` : ''}{exp.estado}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: 36,
                                 fontWeight: 600, color: 'var(--green-900)', lineHeight: 1 }}>
                    {avg.toFixed(2)}
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>{evals.length} evaluaciones</div>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge ${colorFor(avg)} dot`}>{labelFor(avg)}</span>
                <button className="btn btn-ghost" style={{ height: 28, padding: '0 10px', fontSize: 11 }}
                        onClick={() => setMatriz({ exp, evals, criterios: evByExp[exp.id_exposicion]?.criterios || {} })}>
                  Ver matriz
                </button>
              </div>
            </div>
          )
        })}
        {entries.length === 0 && (
          <div className="card card-pad muted" style={{ textAlign: 'center', gridColumn: '1/-1' }}>
            Aún no hay resultados de exposiciones evaluadas.
          </div>
        )}
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Evaluaciones() {
  const { session } = useAuth()
  const router      = useRouter()
  const { id_exposicion } = router.query

  const esDocente = ['Docente', 'Administrador'].includes(session?.usuario?.rol)
  const esAlumno  = session?.usuario?.rol === 'Alumno'

  const defaultTab = esAlumno ? 'registro' : 'listado'
  const [tab, setTab]                   = useState(defaultTab)
  const [exposiciones, setExposiciones] = useState([])
  const [alumnos, setAlumnos]           = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (id_exposicion) setTab('registro')
  }, [id_exposicion])

  useEffect(() => {
    Promise.allSettled([
      client.get('/exposiciones?size=100'),
      client.get('/alumnos?size=100'),
    ]).then(([expRes, almRes]) => {
      if (expRes.status === 'fulfilled') setExposiciones(expRes.value.data?.content || [])
      if (almRes.status === 'fulfilled') setAlumnos(almRes.value.data?.content || [])
      setLoading(false)
    })
  }, [])

  return (
    <Shell>
      <div className="pagehead">
        <div>
          <h1>Coevaluación con <em>rúbrica</em></h1>
          <p className="sub">
            Registra y consulta las evaluaciones por criterio. El promedio se calcula automáticamente según la ponderación de la rúbrica.
          </p>
        </div>
        <div className="actions">
          <div className="seg">
            {esDocente && (
              <button className={tab === 'listado' ? 'on' : ''} onClick={() => setTab('listado')}>Listado</button>
            )}
            <button className={tab === 'registro' ? 'on' : ''} onClick={() => setTab('registro')}>
              Registrar
            </button>
            {esDocente && (
              <button className={tab === 'resultados' ? 'on' : ''} onClick={() => setTab('resultados')}>Resultados</button>
            )}
          </div>
        </div>
      </div>


      {loading ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Cargando…</p>
      ) : (
        <>
          {tab === 'listado'    && esDocente && <TabListado    exposiciones={exposiciones} alumnos={alumnos} />}
          {tab === 'registro'              && <TabRegistro   exposiciones={exposiciones} session={session} />}
          {tab === 'resultados' && esDocente && <TabResultados exposiciones={exposiciones} alumnos={alumnos} />}
        </>
      )}
    </Shell>
  )
}
