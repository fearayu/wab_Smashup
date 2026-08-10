export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
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
