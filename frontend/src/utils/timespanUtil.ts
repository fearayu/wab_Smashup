import { DateTime } from 'luxon'

export function calculateTimeSpan(
  timeStamp: number | string,
  currentTime: number,
) {
  let convertedTimeStamp: number
  if (typeof timeStamp === 'string') {
    const date = DateTime.fromJSDate(new Date(timeStamp))
    convertedTimeStamp = date.toMillis()
  }
  else {
    convertedTimeStamp = timeStamp
  }

  const uptime = DateTime.fromMillis(convertedTimeStamp)
  const current = DateTime.fromMillis(currentTime)

  const diff = current.diff(uptime, [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
  ])

  // Calculate the difference in milliseconds
  // Calculate years, months, days, hours, and minutes using appropriate divisors
  const years = Math.floor(diff.years)
  const months = Math.floor(diff.months) // Approximate months
  const days = Math.floor(diff.days)
  const hours = Math.floor(diff.hours)
  const minutes = Math.floor(diff.minutes)
  const seconds = Math.floor(diff.seconds)

  // Format the result string
  let result = ''

  if (years > 0)
    result += `${years}Y `

  if (months > 0)
    result += `${months}M `

  if (days > 0)
    result += `${days}D `

  if (hours > 0)
    result += `${hours}H `

  if (minutes > 0)
    result += `${minutes}m `

  if (seconds > 0)
    result += `${seconds}s `

  result += 'ago'

  return result
}

export function convertTimeStampToText(
  timestamp: number,
  format: string = 'dd/MM/yyyy HH:mm:ss',
) {
  if (timestamp === 0)
    return '-'
  return DateTime.fromMillis(timestamp).toFormat(format)
}

export function convertJsonDateToText(
  jsonDate: string,
  outputFormat: string = 'dd/MM/yyyy HH:mm:ss',
) {
  const date = DateTime.fromJSDate(new Date(jsonDate))
  return date.toFormat(outputFormat)
}
