'use client'

import { useEffect, useState } from 'react'
import type { Contest } from '@/lib/mock-data'
import { getContestEndTime } from '@/lib/contest-rules'

type ContestTimerProps = {
  contest: Contest
}

export default function ContestTimer({ contest }: ContestTimerProps) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    function updateNow() {
      setNow(Date.now())
    }

    updateNow()
    const interval = window.setInterval(updateNow, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const startTime = new Date(contest.startTime).getTime()
  const endTime = getContestEndTime(contest).getTime()
  const timer = getTimerState(now, startTime, endTime)

  return (
    <div className="contest-timer">
      <span className="contest-timer-label">{timer.label}</span>
      <strong className="contest-countdown">{timer.value}</strong>
    </div>
  )
}

function getTimerState(now: number | null, startTime: number, endTime: number) {
  if (now === null) {
    return { label: 'Tempo', value: '--:--:--' }
  }

  if (now < startTime) {
    return { label: 'Começa em', value: formatRemaining(startTime - now) }
  }

  if (now <= endTime) {
    return { label: 'Termina em', value: formatRemaining(endTime - now) }
  }

  return { label: 'Status', value: 'Encerrado' }
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}
