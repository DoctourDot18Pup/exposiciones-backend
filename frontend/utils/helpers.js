export const colorFor = c => c >= 8 ? 'good' : c >= 7 ? 'warn' : 'bad'
export const labelFor = c => c >= 9 ? 'Excelente' : c >= 8 ? 'Notable' : c >= 7 ? 'Suficiente' : 'Insuficiente'
export const tagColor = m => ({ GET: '#28634a', POST: '#9a7a3e', PUT: '#1a4d33', PATCH: '#7a5fbf', DELETE: '#b04432' }[m] || '#3d4239')
