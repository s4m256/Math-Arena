import Link from 'next/link'
import { joinContest } from '@/app/contests/[id]/actions'
import StatusPill from './StatusPill'

type JoinContestButtonProps = {
  contestId: string
  userId: string | null
  alreadyJoined: boolean
}

export default function JoinContestButton({
  contestId,
  userId,
  alreadyJoined,
}: JoinContestButtonProps) {
  if (!userId) {
    return (
      <div className="join-box">
        <StatusPill status="Não registrado" />
        <p>
          <Link href="/login">Faça login</Link> para participar.
        </p>
      </div>
    )
  }

  if (alreadyJoined) {
    return (
      <div className="join-box">
        <StatusPill status="Registrado" />
        <p>Você está participando.</p>
      </div>
    )
  }

  return (
    <form action={joinContest} className="join-box">
      <input name="contestId" type="hidden" value={contestId} />
      <StatusPill status="Não registrado" />
      <button className="button" type="submit">
        Registrar
      </button>
    </form>
  )
}
