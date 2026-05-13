import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Icons from './Icons'

const NAV = [
  { id: 'dashboard',    label: 'Inicio',       icon: 'home',  group: 'principal',  roles: ['Administrador','Docente','Alumno'] },
  { id: 'materias',     label: 'Materias',     icon: 'book',  group: 'academico',  roles: ['Administrador','Docente'] },
  { id: 'grupos',       label: 'Grupos',       icon: 'users', group: 'academico',  roles: ['Administrador','Docente'] },
  { id: 'alumnos',      label: 'Alumnos',      icon: 'user',  group: 'academico',  roles: ['Administrador','Docente'] },
  { id: 'equipos',      label: 'Equipos',      icon: 'team',  group: 'exposicion', roles: ['Administrador','Docente','Alumno'] },
  { id: 'exposiciones', label: 'Exposiciones', icon: 'cal',   group: 'exposicion', roles: ['Administrador','Docente','Alumno'] },
  { id: 'rubricas',     label: 'Rúbricas',     icon: 'ruler', group: 'exposicion', roles: ['Administrador','Docente'] },
  { id: 'evaluaciones', label: 'Evaluaciones', icon: 'grade', group: 'exposicion', roles: ['Administrador','Docente','Alumno'],
    tagByRole: { Alumno: 'Coevaluar', Docente: 'Calificar' } },
]

const GROUPS = [
  { id: 'principal',  label: 'Principal' },
  { id: 'academico',  label: 'Académico' },
  { id: 'exposicion', label: 'Exposiciones' },
]

const ROL_BADGE = {
  Administrador: { color: '#9a7a3e' },
  Docente:       { color: '#1a4d33' },
  Alumno:        { color: '#28634a' },
}

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard', '/materias': 'Materias', '/grupos': 'Grupos',
  '/alumnos': 'Alumnos', '/equipos': 'Equipos', '/exposiciones': 'Exposiciones',
  '/rubricas': 'Rúbricas', '/evaluaciones': 'Evaluaciones',
}

function NavContent({ activeId, rol, u, onGo, logout }) {
  const rolBadge = ROL_BADGE[rol] || ROL_BADGE.Alumno

  return (
    <>
      <div className="brand-mark">
        <img src="/assets/logo_lince.png" alt="Linces" width={40} height={40}
             style={{ borderRadius: 4 }}
             onError={e => { e.currentTarget.style.display = 'none' }} />
        <div>
          <div className="b1">Exposiciones · SII</div>
          <div className="b2">TecNM · Celaya · v 1.1.0</div>
        </div>
      </div>

      <div style={{ margin:'10px 4px 4px', padding:'10px 12px', borderRadius:10,
                    background:'rgba(184,151,91,.10)', border:'1px solid rgba(184,151,91,.18)' }}>
        <div style={{ fontSize:10, letterSpacing:'.14em', textTransform:'uppercase',
                      color:'rgba(243,234,219,.55)', fontWeight:600 }}>
          Sesión activa como
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:rolBadge.color, flexShrink:0 }} />
          <strong style={{ color:'#fff', fontSize:13 }}>{rol}</strong>
        </div>
      </div>

      <nav className="nav">
        {GROUPS.map(g => {
          const items = NAV.filter(n => n.group === g.id && n.roles.includes(rol))
          if (!items.length) return null
          return (
            <Fragment key={g.id}>
              <div className="nav-section">{g.label}</div>
              {items.map(n => {
                const I = Icons[n.icon]
                const tag = n.tagByRole?.[rol]
                return (
                  <a key={n.id} href={`/${n.id}`}
                     className={activeId === n.id ? 'active' : ''}
                     onClick={e => { e.preventDefault(); onGo(n.id) }}>
                    <span className="ico">{I && <I />}</span>
                    <span style={{ flex:1 }}>{n.label}</span>
                    {tag && <span className="badge gold" style={{ fontSize:10 }}>{tag}</span>}
                  </a>
                )
              })}
            </Fragment>
          )
        })}
      </nav>

      <div className="footer-card">
        <strong>{u?.nombre}</strong>
        {u?.email}
      </div>

      <a href="#" onClick={e => { e.preventDefault(); logout() }}
         style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', marginTop:8,
                  color:'rgba(243,234,219,.7)', textDecoration:'none', fontSize:13.5, borderRadius:8 }}>
        <span className="ico" style={{ color:'var(--gold-400)' }}><Icons.out /></span>
        Cerrar sesión
      </a>
    </>
  )
}

export default function Shell({ children }) {
  const router = useRouter()
  const { session, loading, logout } = useAuth()
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (!loading && !session) router.replace('/login')
  }, [session, loading])

  if (loading || !session) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh',
                    color:'var(--ink-500)', fontSize:13 }}>
        Cargando…
      </div>
    )
  }

  const u = session.usuario
  const rol = u?.rol || 'Alumno'
  const rolBadge = ROL_BADGE[rol] || ROL_BADGE.Alumno
  const initials = u?.nombre?.split(' ').slice(0,2).map(s => s[0]).join('') || '??'
  const activeId = router.pathname.replace('/', '') || 'dashboard'
  const crumb = ROUTE_LABELS[router.pathname] || 'Panel'
  const onGo = id => router.push('/' + id)

  return (
    <div className="layout">
      <aside className="sidebar">
        <NavContent activeId={activeId} rol={rol} u={u} onGo={onGo} logout={logout} />
      </aside>

      <div className={'drawer-bg' + (drawer ? ' on' : '')} onClick={() => setDrawer(false)} />
      <aside className={'drawer' + (drawer ? ' on' : '')}>
        <NavContent activeId={activeId} rol={rol} u={u} onGo={id => { setDrawer(false); onGo(id) }} logout={logout} />
      </aside>

      <main className="main">
        <div className="topbar">
          <button className="iconbtn mobile-nav-btn" onClick={() => setDrawer(true)}>
            <Icons.menu />
          </button>
          <div className="crumb">
            <b>API · /api/v1</b> &nbsp;/&nbsp; {crumb}
          </div>
          <div className="spacer" />
          <div className="search topbar-search" style={{ position:'relative', width:280 }}>
            <Icons.search />
            <input className="input" placeholder="Buscar materia, equipo, exposición…"
                   style={{ height:36, paddingLeft:34 }} />
          </div>
          <button className="iconbtn" title="Notificaciones"><Icons.bell /></button>
          <button className="iconbtn" title="Sincronizar" onClick={() => router.reload()}>
            <Icons.refresh />
          </button>
          <div className="userchip">
            <div className="av"
                 style={{ background:`linear-gradient(135deg, ${rolBadge.color}, var(--gold-500))` }}>
              {initials}
            </div>
            <div>
              <div className="nm">{u?.nombre}</div>
              <div className="rl">
                <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%',
                               background:rolBadge.color, marginRight:4, verticalAlign:'middle' }} />
                {u?.rol} · {u?.matricula}
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
