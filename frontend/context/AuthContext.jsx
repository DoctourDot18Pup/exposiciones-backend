import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import client from '../lib/client'

const Ctx = createContext(null)

const ROLE_MAP = { docente: 'Docente', alumno: 'Alumno', admin: 'Administrador', administrador: 'Administrador' }

export function AuthProvider({ children }) {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sii_token')
    const raw = localStorage.getItem('sii_user')
    if (token && raw) {
      try { setSession({ token, usuario: JSON.parse(raw), expiresIn: 86400, tokenType: 'Bearer' }) }
      catch { /* corrupted storage */ }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await client.post('/auth/login', { username, password })
    const { token, expiresIn, tokenType } = res.data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const rawRol = payload.rol ?? 'alumno'
    const rol = ROLE_MAP[rawRol.toLowerCase()] ?? (rawRol.charAt(0).toUpperCase() + rawRol.slice(1))
    const usuario = {
      id_usuario: payload.id_usuario ?? payload.sub,
      username: payload.username ?? username,
      nombre: payload.nombre ?? username.split('@')[0],
      rol,
      matricula: payload.matricula ?? username.split('@')[0],
      email: payload.email ?? username,
    }
    localStorage.setItem('sii_token', token)
    localStorage.setItem('sii_user', JSON.stringify(usuario))
    setSession({ token, usuario, expiresIn, tokenType })
    return usuario
  }

  const logout = () => {
    localStorage.removeItem('sii_token')
    localStorage.removeItem('sii_user')
    setSession(null)
    router.push('/login')
  }

  return <Ctx.Provider value={{ session, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
