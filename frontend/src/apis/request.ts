export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('smashup_token') : null

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token)
    baseHeaders.Authorization = `Bearer ${token}`

  // merge init headers on top of base headers
  const mergedHeaders: Record<string, string> = { ...baseHeaders }
  if (init?.headers) {
    Object.entries(init.headers).forEach(([k, v]) => {
      if (v !== undefined && v !== null)
        mergedHeaders[k] = String(v)
      else
        delete mergedHeaders[k]
    })
  }

  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    if (isJson) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
    }
    throw new Error(`HTTP ${res.status} — backend returned non-JSON response. Check VITE_BACKEND_URL.`)
  }

  if (!isJson)
    throw new Error('Backend returned non-JSON response. Check VITE_BACKEND_URL.')

  return res.json()
}
