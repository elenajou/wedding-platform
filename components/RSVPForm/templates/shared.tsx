'use client'
import { useState } from 'react'
import { t } from '@/lib/i18n'
import type { RSVPTemplateProps, GroupMember } from './types'

export function useRSVP({ groupId, guestName, groupMembers = [], dict }: RSVPTemplateProps) {
  const members = groupMembers.map(m => typeof m === 'string' ? { id: 0, name: m } : m) as GroupMember[]
  const displayName = guestName ?? members[0]?.name ?? ''
  const key = (m: GroupMember) => m.id ? String(m.id) : m.name

  const [answers, setAnswers] = useState<Record<string, boolean | null>>(
    Object.fromEntries(members.map(m => [key(m), null]))
  )
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [anyAttending, setAnyAttending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setAnswer(m: GroupMember, attending: boolean) {
    setAnswers(prev => ({ ...prev, [key(m)]: attending }))
  }

  async function handleSubmit() {
    const allAnswered = members.every(m => answers[key(m)] !== null)
    if (!allAnswered) { setError(dict.errorAttendance); return }
    setError(''); setLoading(true)
    const guestAttendance = members.map(m => ({ id: m.id, name: m.name, attending: answers[key(m)] === true }))
    const attending = guestAttendance.some(g => g.attending)
    const guestCount = guestAttendance.filter(g => g.attending).length
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, guestAttendance, attending, guestCount, message: message.trim(), rsvpedBy: displayName }),
      })
      if (!res.ok) throw new Error('Server error')
      setAnyAttending(attending); setSubmitted(true)
    } catch { setError(dict.errorGeneric) } finally { setLoading(false) }
  }

  return { members, displayName, answers, message, setMessage, submitted, anyAttending, loading, error, setAnswer, handleSubmit, t, key }
}
