import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Icons from '../components/Icons'

const ROLES = [
  { rol: 'Docente',       desc: 'Programa exposiciones, evalúa y administra grupos.' },
  { rol: 'Alumno',        desc: 'Consulta exposiciones, coevalúa y revisa resultados.' },
  { rol: 'Administrador', desc: 'Gestiona materias, grupos, rúbricas y usuarios.' },
]

export default function Login() {
  const { login, session, loading } = useAuth()
  const router = useRouter()
  const [rolSel, setRolSel] = useState('Alumno')
  const [username, setUsername] = useState('')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  const [touched, setTouched] = useState({})

  if (!loading && session) {
    router.replace('/dashboard')
    return null
  }

  const submit = async e => {
    e.preventDefault()
    setTouched({ username: true, pwd: true })
    if (!username || !pwd) { setErr('Por favor completa todos los campos.'); return }
    if (pwd.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return }
    setErr(null)
    setSubmitting(true)
    try {
      await login(username, pwd)
      router.push('/dashboard')
    } catch (ex) {
      const msg = ex.response?.data?.message || ex.response?.data?.error || 'Credenciales incorrectas.'
      setErr(`HTTP ${ex.response?.status ?? '—'} · ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-stage">
      <div className="login-side">
        <div className="ring" />
        <div className="ring2" />

        <div className="brand-mark">
          <img src="/assets/logo_lince.png" alt="Linces TecNM Celaya" width={52} height={52}
               style={{ borderRadius: 6 }}
               onError={e => { e.currentTarget.style.display = 'none' }} />
          <div>
            <div className="b1">Sistema de Exposiciones</div>
            <div className="b2">TecNM · Celaya · v 1.1.0</div>
          </div>
        </div>

        <div className="pitch">
          <div className="eyebrow" style={{ color:'var(--gold-400)' }}>TecNM · Campus Celaya</div>
          <h1>Coevaluación con <em>rúbrica</em>, para toda la comunidad académica.</h1>
          <p>
            Administradores, docentes y alumnos en una sola plataforma, con permisos diferenciados por rol.
          </p>
        </div>

        <div className="meta">
          <div>Ciclo Ene–Jun 2026</div>
          <div className="v">Acceso seguro institucional</div>
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2>Iniciar sesión</h2>
          <p className="hint">Ingresa tus credenciales institucionales.</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:18 }}>
            {ROLES.map(r => (
              <button key={r.rol} type="button" onClick={() => setRolSel(r.rol)}
                style={{
                  textAlign:'left', padding:'12px 10px',
                  border:'1px solid ' + (rolSel === r.rol ? 'var(--green-700)' : 'var(--line-strong)'),
                  background: rolSel === r.rol ? 'var(--green-50)' : 'var(--white)',
                  borderRadius:10, cursor:'pointer',
                  boxShadow: rolSel === r.rol ? '0 0 0 3px rgba(26,77,51,.12)' : 'none',
                }}>
                <div style={{ fontSize:11, color:'var(--gold-600)', letterSpacing:'.08em',
                              textTransform:'uppercase', fontWeight:700 }}>{r.rol}</div>
                <div style={{ fontSize:11, color:'var(--ink-500)', marginTop:4, lineHeight:1.3 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <div className="field">
            <label>Usuario (matrícula institucional)</label>
            <input
              className={'input' + (touched.username && !username ? ' error' : '')}
              type="text" autoComplete="username"
              value={username} onChange={e => setUsername(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, username:true }))}
              placeholder="ej. 20030543@itcelaya.edu.mx"
            />
          </div>

          <div className="field">
            <label>Contraseña <span className="muted" style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>· mín. 6 caracteres</span></label>
            <div className="pwd-wrap">
              <input
                className={'input' + (touched.pwd && !pwd ? ' error' : '')}
                type={show ? 'text' : 'password'} autoComplete="current-password"
                value={pwd} onChange={e => setPwd(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, pwd:true }))}
                placeholder="••••••••"
                style={{ paddingRight:78 }}
              />
              <button type="button" className="pwd-toggle" onClick={() => setShow(s => !s)}>
                {show ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="row-between">
            <label className="check">
              <input type="checkbox" defaultChecked /> Mantener sesión iniciada
            </label>
            <a href="#" className="link" onClick={e => e.preventDefault()}>¿Necesitas ayuda?</a>
          </div>

          {err && (
            <div className="alert error" style={{ marginTop:14 }}>
              <Icons.warn /> <span>{err}</span>
            </div>
          )}

          <div style={{ marginTop:22 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting
                ? <><span className="spinner" /> Validando JWT…</>
                : <>Entrar como {rolSel} <Icons.arrow /></>}
            </button>
          </div>

          <div className="alert info" style={{ marginTop:18 }}>
            <Icons.spark />
            <div>
              <strong style={{ display:'block', marginBottom:2 }}>Credenciales</strong>
              Usa tu matrícula institucional como usuario. Contraseña asignada por el docente.
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
