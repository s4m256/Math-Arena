'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/admin'
import { contestToRow, normalizeContestId } from '@/lib/contests'
import type { ContestInput, ContestLevel } from '@/lib/contests'
import { applyRatingForContest } from '@/lib/rating'
import { createClient } from '@/lib/supabase/server'

export async function createContest(formData: FormData) {
  const supabase = await requireAdmin()
  const contest = readContestForm(formData)
  const contestRow = contestToRow(contest)
  const { error } = await supabase.from('contests').insert(contestRow)

  if (error) throw new Error(`Não foi possível criar a competição: ${error.message}`)

  const problemRows = readProblemRows(formData, contest.id, contest)
  const { error: problemsError } = await supabase
    .from('contest_problems')
    .insert(problemRows)

  if (problemsError) {
    await supabase.from('contests').delete().eq('id', contest.id)
    throw new Error(`Não foi possível criar os problemas: ${problemsError.message}`)
  }

  revalidateContestPages()
  redirect('/admin')
}

export async function createAnnouncement(formData: FormData) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from('announcements').insert({
    title: readText(formData, 'title'),
    content: readText(formData, 'content'),
  })

  if (error) throw new Error(`Não foi possível criar o anúncio: ${error.message}`)

  revalidateAnnouncementPages()
  redirect('/admin')
}

export async function gradeSubmission(formData: FormData) {
  const supabase = await requireAdmin()
  const submissionId = readText(formData, 'submissionId')
  const contestId = readText(formData, 'contestId')
  const maxScore = readNumber(formData, 'maxScore')
  const score = readScore(formData, maxScore)

  const { error } = await supabase
    .from('contest_submissions')
    .update({
      score,
      status: 'Corrigido',
    })
    .eq('id', submissionId)

  if (error) {
    throw new Error(`Não foi possível salvar a nota: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath(`/contests/${contestId}`)
  redirect(contestId ? `/admin?contest=${encodeURIComponent(contestId)}` : '/admin')
}

export async function applyContestRating(formData: FormData) {
  const supabase = await requireAdmin()
  const contestId = readText(formData, 'contestId')

  await applyRatingForContest(supabase, contestId)

  revalidatePath('/admin')
  revalidatePath('/ranking')
  revalidatePath(`/contests/${contestId}`)
  redirect(`/admin?contest=${encodeURIComponent(contestId)}`)
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!(await isAdminUser(supabase, user?.id ?? null))) {
    throw new Error('Você não tem permissão para gerenciar o site.')
  }

  return supabase
}

function readContestForm(formData: FormData, existingId?: string): ContestInput {
  const title = readText(formData, 'title')
  const id = existingId ?? normalizeContestId(readText(formData, 'id') || title)

  if (!id) throw new Error('Informe um ID para a competição.')

  return {
    id,
    title,
    startTime: normalizeDateTime(readText(formData, 'startTime')),
    duration: readText(formData, 'duration'),
    problemCount: readNumber(formData, 'problemCount'),
    scoringScale: readScoringScale(formData),
    level: readLevel(formData),
    rated: formData.get('rated') === 'on',
    description: readText(formData, 'description'),
  }
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function readNumber(formData: FormData, key: string) {
  const value = Number(readText(formData, key))
  if (!Number.isFinite(value) || value < 1) throw new Error(`Valor inválido: ${key}.`)
  return value
}

function readScore(formData: FormData, maxScore: number) {
  const value = Number(readText(formData, 'score'))

  if (!Number.isFinite(value) || value < 0 || value > maxScore) {
    throw new Error(`A nota deve estar entre 0 e ${maxScore}.`)
  }

  return value
}

function readScoringScale(formData: FormData): '0-7' | '0-10' {
  return readText(formData, 'scoringScale') === '0-10' ? '0-10' : '0-7'
}

function readLevel(formData: FormData): ContestLevel {
  const level = readText(formData, 'level')

  if (level === '1' || level === '2' || level === '3' || level === 'U') {
    return level
  }

  return 'U'
}

function normalizeDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ? `${value}:00-03:00`
    : value
}

function readProblemRows(formData: FormData, contestId: string, contest: ContestInput) {
  return Array.from({ length: contest.problemCount }, (_, index) => {
    const problemNumber = index + 1
    const statement = readText(formData, `problemStatement${problemNumber}`)

    if (!statement) {
      throw new Error(`Escreva o enunciado da questão ${problemNumber}.`)
    }

    return {
      contest_id: contestId,
      problem_index: problemNumber,
      statement,
      points: contest.scoringScale === '0-10' ? 10 : 7,
    }
  })
}

function revalidateContestPages() {
  revalidatePath('/admin')
  revalidatePath('/calendar')
  revalidatePath('/contests')
}

function revalidateAnnouncementPages() {
  revalidatePath('/')
  revalidatePath('/admin')
}
