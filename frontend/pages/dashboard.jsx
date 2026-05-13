import { useState, useEffect } from 'react'
import Shell from '../components/Shell'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import Icons from '../components/Icons'
import client from '../lib/client'

const QUICK = {
  Docente: [
    { label:'Mis grupos',     sub:'Ver grupos asignados',       icon:'users', to:'grupos' },
    { label:'Programar',      sub:'Nueva exposición',           icon:'cal',   to:'exposiciones' },
    { label:'Calificar',      sub:'Ver evaluaciones',           icon:'grade', to:'evaluaciones' },
  ],
  Alumno: [
    { label:'Exposiciones',   sub:'Programa del periodo',       icon:'cal',   to:'exposiciones' },
    { label:'Coevaluar',      sub:'Registrar evaluación',       icon:'grade', to:'evaluaciones' },
    { label:'Mi equipo',      sub:'Ver integrantes',            icon:'team',  to:'equipos' },
  ],
  Administrador: [
    { label:'Materias',       sub:'Gestionar materias',         icon:'book',  to:'materias' },
    { label:'Rúbricas',       sub:'Criterios de evaluación',    icon:'ruler', to:'rubricas' },
    { label:'Alumnos',        sub:'Directorio estudiantil',     icon:'user',  to:'alumnos' },
  ],
}

function StatCard({ label, val, sub, icon, dark, skeleton }) {
  const I = Icons[icon]
  return (
    <div className={'stat' + (dark ? ' dark' : '')}>
      {I && <span className="accent"><I size={15} /></span>}
      <div className="lbl">{label}</div>
      {skeleton
        ? <div className="sk" style={{ height:36, width:80, marginTop:8 }} />
        : <div className="val">{val}</div>}
      <div className="sub">{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  const { session } = useAuth()
  const router = useRouter()
  const [skeleton, setSkeleton] = useState(true)
  const [stats, setStats] = useState({ materias:0, equipos:0, exposiciones:0 })
  const [proximas, setProximas] = useState([])

  const u = session?.usuario
  const rol = u?.rol || 'Alumno'
  const nombre = u?.nombre?.split(' ')[0] || 'Usuario'

  useEffect(() => {
    const t = setTimeout(() => setSkeleton(false), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const load = async () => {
      const [matRes, eqRes, expRes] = await Promise.allSettled([
        client.get('/materias?size=1'),
        client.get('/equipos?size=1'),
        client.get('/exposiciones?size=100'),
      ])
      const exps = expRes.status === 'fulfilled' ? (expRes.value.data?.content || []) : []
      setStats({
        materias:     matRes.status === 'fulfilled' ? (matRes.value.data?.totalElements ?? 0) : 0,
        equipos:      eqRes.status  === 'fulfilled' ? (eqRes.value.data?.totalElements  ?? 0) : 0,
        exposiciones: expRes.status === 'fulfilled' ? (expRes.value.data?.totalElements  ?? 0) : 0,
      })
      setProximas(exps.filter(e => e.estado !== 'cerrada').slice(0, 5))
    }
    load()
  }, [])

  const quick = QUICK[rol] || QUICK.Alumno
  const activas = proximas.filter(e => e.estado === 'activa')

  return (
    <Shell>
      <div className="pagehead">
        <div>
          <div className="eyebrow">Panel principal</div>
          <h1 style={{ marginTop:4 }}>
            Hola, <em>{nombre}</em>
          </h1>
          <p className="sub">Bienvenido al Sistema de Exposiciones y Evaluación con Rúbricas.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className={'grid g-3'} style={{ marginBottom:24 }}>
        {quick.map(q => {
          const I = Icons[q.icon]
          return (
            <button key={q.label} onClick={() => router.push('/' + q.to)}
              style={{ textAlign:'left', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)',
                       padding:'18px 20px', background:'var(--white)', cursor:'pointer',
                       boxShadow:'var(--shadow-sm)', display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ width:38, height:38, borderRadius:10, background:'var(--gold-100)',
                              color:'var(--gold-600)', display:'inline-flex', alignItems:'center',
                              justifyContent:'center', flexShrink:0 }}>
                {I && <I size={18} />}
              </span>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{q.label}</div>
                <div style={{ fontSize:12, color:'var(--ink-500)', marginTop:2 }}>{q.sub}</div>
              </div>
              <Icons.chev size={16} />
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <div className={'grid g-4'} style={{ marginBottom:24 }}>
        <StatCard label="Materias activas"    val={stats.materias}     sub="Periodo 2025-2"         icon="book"  dark skeleton={skeleton} />
        <StatCard label="Equipos registrados" val={stats.equipos}      sub="En todos los grupos"    icon="team"  skeleton={skeleton} />
        <StatCard label="Exposiciones"        val={stats.exposiciones} sub="Programadas este bloque" icon="cal"  skeleton={skeleton} />
        <StatCard label="Exposiciones activas" val={activas.length}    sub="En progreso ahora"      icon="award" skeleton={skeleton} />
      </div>

      {/* Bottom section */}
      <div className={'grid g-12-8-4'}>
        {/* Próximas exposiciones */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Próximas exposiciones</h3>
              <div className="sub">Pendientes y activas del período</div>
            </div>
            <button className="btn btn-ghost" style={{ height:34, padding:'0 12px', fontSize:12 }}
                    onClick={() => router.push('/exposiciones')}>
              Ver todas <Icons.chev size={14} />
            </button>
          </div>
          {proximas.length === 0 ? (
            <p style={{ padding:20, color:'var(--ink-500)', fontSize:13 }}>
              {skeleton ? 'Cargando…' : 'Sin exposiciones próximas.'}
            </p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Tema</th>
                  <th>Fecha</th>
                  <th>Aula</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {proximas.map((exp, i) => (
                  <tr key={exp.id_exposicion || i}>
                    <td><b style={{ fontSize:13 }}>{exp.tema}</b></td>
                    <td className="muted" style={{ fontSize:12, fontFamily:'monospace' }}>
                      {exp.fecha_hora ? new Date(exp.fecha_hora).toLocaleDateString('es-MX') : exp.fecha || '—'}
                    </td>
                    <td className="muted" style={{ fontSize:12 }}>{exp.aula || '—'}</td>
                    <td>
                      <span className={'badge' + (exp.estado === 'activa' ? ' good dot' : exp.estado === 'pendiente' ? ' warn dot' : ' neutral dot')}>
                        {exp.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card card-pad"
               style={{ background:'var(--green-900)', color:'var(--cream)', borderColor:'var(--green-900)' }}>
            <div style={{ color:'var(--gold-400)', marginBottom:8 }}><Icons.star size={20} /></div>
            <div className="eyebrow" style={{ color:'var(--gold-400)' }}>Coevaluación</div>
            <h3 style={{ color:'#fff', marginTop:6, fontFamily:'"Source Serif 4", serif', fontWeight:600 }}>
              Evalúa con rúbrica
            </h3>
            <p style={{ color:'rgba(243,234,219,.75)', fontSize:13, marginTop:8 }}>
              Aplica los criterios definidos y calcula el promedio ponderado automáticamente.
            </p>
            <button className="btn btn-gold" style={{ marginTop:16, width:'100%' }}
                    onClick={() => router.push('/evaluaciones')}>
              Ir a evaluaciones <Icons.arrow size={16} />
            </button>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ color:'var(--gold-600)' }}>Sesión activa</div>
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                ['Token',    session?.tokenType || 'Bearer'],
                ['Expira',   `${session?.expiresIn || 86400}s`],
                ['Rol',      u?.rol || '—'],
                ['Usuario',  u?.matricula || u?.username || '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span className="muted">{k}</span>
                  <span style={{ fontFamily:'monospace', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
