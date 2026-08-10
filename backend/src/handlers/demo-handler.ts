import type { Context } from 'hono'
import { ValidationError } from '../domain/errors'

export class DemoHandler {
  constructor(private readonly db: D1Database) {}

  seed = async (c: Context) => {
    const now = new Date().toISOString()

    // Check if demo already exists
    const existing = await this.db
      .prepare('SELECT id FROM owners WHERE email = ?')
      .bind('demo@smashup.app')
      .first<{ id: string }>()

    if (existing) {
      return c.json({ data: { message: 'Demo data already seeded' } })
    }

    // Insert demo owner
    const ownerId = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO owners (id, email, password_hash, name, phone, plan, onboarding_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(ownerId, 'demo@smashup.app', '', 'Demo Owner', '0812345678', 'pro', 1, now, now)
      .run()

    // Insert demo venue
    const venueId = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO venues (id, owner_id, slug, name, description, address, phone, email, logo_url, primary_color, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(venueId, ownerId, 'demo', 'Smashup Demo Arena', 'A demo badminton court for trying out Smashup.', '123 Demo St, Bangkok', '021234567', 'demo@smashup.app', null, '#1976D2', 1, now, now)
      .run()

    // Insert site config
    const siteConfigId = crypto.randomUUID()
    await this.db
      .prepare('INSERT INTO site_configs (id, venue_id, theme, hero_image_url, welcome_message, show_pricing, show_map, social_links, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(siteConfigId, venueId, 'default', null, 'Welcome to Smashup Demo Arena!', 1, 1, JSON.stringify({ line: 'https://line.me/demo', facebook: 'https://fb.com/demo' }), now, now)
      .run()

    // Insert courts
    const courts = [
      { name: 'Court A', type: 'standard', rate: 250 },
      { name: 'Court B', type: 'standard', rate: 250 },
      { name: 'Court C', type: 'premium', rate: 350 },
      { name: 'Court D', type: 'premium', rate: 350 },
    ]
    const courtIds: string[] = []
    for (let i = 0; i < courts.length; i++) {
      const court = courts[i]!
      const cid = crypto.randomUUID()
      courtIds.push(cid)
      await this.db
        .prepare('INSERT INTO courts (id, venue_id, name, type, hourly_rate, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(cid, venueId, court.name, court.type, court.rate, 1, i, now, now)
        .run()
    }

    // Generate 7 days of slots
    for (let d = 0; d < 7; d++) {
      const date = new Date()
      date.setUTCDate(date.getUTCDate() + d)
      const dateStr = date.toISOString().slice(0, 10)
      const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6

      for (let ci = 0; ci < courtIds.length; ci++) {
        const courtDef = courts[ci]!
        for (let h = 8; h < 22; h++) {
          const timeStr = `${String(h).padStart(2, '0')}:00`
          const isPeak = h >= 18 || isWeekend
          const price = isPeak ? Math.ceil(courtDef.rate * 1.2) : courtDef.rate
          const sid = crypto.randomUUID()
          await this.db
            .prepare('INSERT INTO time_slots (id, court_id, slot_date, slot_time, duration_minutes, price, is_available, is_peak, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(sid, courtIds[ci], dateStr, timeStr, 60, price, 1, isPeak ? 1 : 0, now, now)
            .run()
        }
      }
    }

    // Create sample bookings
    const slotRows = await this.db
      .prepare('SELECT id, court_id, price FROM time_slots WHERE court_id = ? AND slot_date = ? AND slot_time = ?')
      .bind(courtIds[0], new Date().toISOString().slice(0, 10), '18:00')
      .all<{ id: string; court_id: string; price: number }>()
    const sampleSlot = slotRows.results[0]

    if (sampleSlot) {
      // Pending booking
      const b1 = crypto.randomUUID()
      await this.db
        .prepare('INSERT INTO bookings (id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(b1, venueId, sampleSlot.court_id, JSON.stringify([sampleSlot.id]), 'John Doe', '0811111111', 'john@example.com', 'pending', sampleSlot.price, 'Demo booking', now, now)
        .run()

      // Lock the slot
      await this.db
        .prepare('UPDATE time_slots SET is_available = 0, booking_id = ? WHERE id = ?')
        .bind(b1, sampleSlot.id)
        .run()

      // Create payment for pending booking
      const p1 = crypto.randomUUID()
      await this.db
        .prepare('INSERT INTO payments (id, booking_id, amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(p1, b1, sampleSlot.price, 'pending', now, now)
        .run()

      // Confirmed booking
      const b2 = crypto.randomUUID()
      const slot2 = await this.db
        .prepare('SELECT id, court_id, price FROM time_slots WHERE court_id = ? AND slot_date = ? AND slot_time = ? AND is_available = 1')
        .bind(courtIds[1], new Date().toISOString().slice(0, 10), '19:00')
        .first<{ id: string; court_id: string; price: number }>()
      if (slot2) {
        await this.db
          .prepare('INSERT INTO bookings (id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(b2, venueId, slot2.court_id, JSON.stringify([slot2.id]), 'Jane Smith', '0822222222', 'jane@example.com', 'confirmed', slot2.price, 'Confirmed demo', now, now)
          .run()
        await this.db
          .prepare('UPDATE time_slots SET is_available = 0, booking_id = ? WHERE id = ?')
          .bind(b2, slot2.id)
          .run()
        const p2 = crypto.randomUUID()
        await this.db
          .prepare('INSERT INTO payments (id, booking_id, amount, status, verified_by, verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(p2, b2, slot2.price, 'verified', 'auto', now, now, now)
          .run()
      }

      // Cancelled booking
      const b3 = crypto.randomUUID()
      const slot3 = await this.db
        .prepare('SELECT id, court_id, price FROM time_slots WHERE court_id = ? AND slot_date = ? AND slot_time = ? AND is_available = 1')
        .bind(courtIds[2], new Date().toISOString().slice(0, 10), '20:00')
        .first<{ id: string; court_id: string; price: number }>()
      if (slot3) {
        await this.db
          .prepare('INSERT INTO bookings (id, venue_id, court_id, time_slot_ids, player_name, player_phone, player_email, status, total_amount, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(b3, venueId, slot3.court_id, JSON.stringify([slot3.id]), 'Bob Cancel', '0833333333', null, 'cancelled', slot3.price, 'Cancelled demo', now, now)
          .run()
        // Don't lock slots for cancelled
      }
    }

    return c.json({
      data: {
        message: 'Demo data seeded successfully',
        owner: { id: ownerId, email: 'demo@smashup.app' },
        venue: { id: venueId, slug: 'demo' },
      },
    })
  }
}
