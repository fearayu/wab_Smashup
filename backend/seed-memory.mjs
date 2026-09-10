// Seed script for memory-mode backend — sets up demo data via API calls.
// Run after starting the backend: node seed-memory.mjs
const BASE = process.env.API_URL || 'http://127.0.0.1:8787'

async function api(path, opts = {}) {
  const { headers: extraHeaders, ...rest } = opts
  const res = await fetch(BASE + path, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    console.error(`FAIL ${opts.method || 'GET'} ${path} → ${res.status}`, body)
    process.exit(1)
  }
  return body
}

async function main() {
  console.log('Seeding SMASHUP backend at', BASE)

  // 1. Register owner (gets 'member' role by default — sufficient for venue/court/slot management)
  const reg = await api('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@smashup.local',
      password: '12345678',
      name: 'SMASHUP Admin',
      phone: '0912345678',
    }),
  })
  const token = reg.data.token
  const ownerId = reg.data.owner.id
  console.log('  Registered owner:', ownerId)
  const auth = { Authorization: `Bearer ${token}` }

  // 2. Create venue
  const venueRes = await api('/api/v1/venues', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'SMASHUP Badminton Club',
      slug: 'smashup',
      description: 'สนามแบดมินตัน SMASHUP — ถนนพหลโยธิน เชียงราย',
      address: 'ถนนพหลโยธิน อำเภอเมืองเชียงราย เชียงราย 57000',
      phone: '091-234-5678',
      email: 'info@smashup.local',
      primaryColor: '#f4511e',
    }),
  })
  const venueId = venueRes.data.id
  console.log('  Created venue:', venueId)

  // 3. Create courts (match frontend: 1-11, A, B = 13 courts)
  const courtNames = ['1','2','3','4','5','6','7','8','9','10','11','A','B']
  const courtIds = []
  for (let i = 0; i < courtNames.length; i++) {
    const isPremium = i >= 11
    const res = await api(`/api/v1/venues/${venueId}/courts`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        name: courtNames[i],
        type: isPremium ? 'premium' : 'standard',
        hourlyRate: isPremium ? 180 : 130,
        sortOrder: i,
      }),
    })
    courtIds.push(res.data.id)
  }
  console.log('  Created', courtIds.length, 'courts')

  // 4. Generate 7 days of time slots
  const today = new Date()
  const startDate = today.toISOString().slice(0, 10)
  const endDate = new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10)
  const slotRes = await api(`/api/v1/venues/${venueId}/slots/generate`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      startDate,
      endDate,
      openTime: '11:00',
      closeTime: '23:00',
      slotDurationMinutes: 60,
    }),
  })
  console.log('  Generated', slotRes.data.inserted, 'time slots')

  // 5. Register a player account
  const playerReg = await api('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'player01@smashup.local',
      password: 'player1234',
      name: 'player01',
      phone: '0812345678',
    }),
  })
  console.log('  Registered player:', playerReg.data.owner.id)

  console.log('\n=== Seed Complete ===')
  console.log('Backend:', BASE)
  console.log('API Docs:', BASE + '/docs')
  console.log('Public slots:', BASE + '/api/v1/public/venues/smashup/slots?date=' + startDate)
  console.log('\nCredentials:')
  console.log('  Owner:  admin@smashup.local / 12345678')
  console.log('  Player: player01@smashup.local / player1234')
}

main().catch(e => { console.error(e); process.exit(1) })
