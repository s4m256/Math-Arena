'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { canSubmitToContest } from '@/lib/contest-rules'
import { getContestById } from '@/lib/contests'
import { submissionBucket } from '@/lib/submissions'
import { createClient } from '@/lib/supabase/server'

export async function joinContest(formData: FormData) {
  const contestId = String(formData.get('contestId') ?? '')

  if (!contestId) {
    throw new Error('Competição inválida.')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('contest_participations').upsert(
    {
      contest_id: contestId,
      user_id: user.id,
      score: 0,
    },
    {
      onConflict: 'contest_id,user_id',
      ignoreDuplicates: true,
    }
  )

  if (error) {
    throw new Error(`Não foi possível registrar sua participação: ${error.message}`)
  }

  revalidatePath(`/contests/${contestId}`)
  redirect(`/contests/${contestId}`)
}

export type SubmitSolutionState = {
  ok: boolean
  message: string
}

export async function submitSolution(
  _state: SubmitSolutionState,
  formData: FormData
): Promise<SubmitSolutionState> {
  const contestId = String(formData.get('contestId') ?? '')
  const problemId = String(formData.get('problemId') ?? '')
  const file = formData.get('solution')

  if (!contestId || !problemId) {
    return { ok: false, message: 'Escolha uma questão válida.' }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Selecione um arquivo PDF.' }
  }

  if (!isPdf(file)) {
    return { ok: false, message: 'A submissão deve ser um arquivo PDF.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: 'Faça login para enviar soluções.' }
  }

  const contest = await getContestById(supabase, contestId)

  if (!contest || !canSubmitToContest(contest, new Date())) {
    return {
      ok: false,
      message: 'Submissões só são aceitas durante o intervalo oficial da competição.',
    }
  }

  const filePath = `${contestId}/${user.id}/${problemId}/${Date.now()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from(submissionBucket)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    return {
      ok: false,
      message: getUploadErrorMessage(uploadError.message),
    }
  }

  const { error: insertError } = await supabase.from('contest_submissions').insert({
    contest_id: contestId,
    problem_id: problemId,
    user_id: user.id,
    file_path: filePath,
    file_name: file.name,
    status: 'Pendente',
    score: null,
  })

  if (insertError) {
    await supabase.storage.from(submissionBucket).remove([filePath])
    return {
      ok: false,
      message: `Não foi possível registrar a submissão: ${insertError.message}`,
    }
  }

  revalidatePath(`/contests/${contestId}`)

  return { ok: true, message: 'Solução enviada com sucesso.' }
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function getUploadErrorMessage(message: string) {
  if (message.toLowerCase().includes('bucket not found')) {
    return 'O bucket contest-submissions ainda não existe no Supabase.'
  }

  return `Não foi possível enviar o PDF: ${message}`
}
