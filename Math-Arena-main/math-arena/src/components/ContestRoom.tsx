'use client'

import { useActionState, useMemo, useState } from 'react'
import { submitSolution } from '@/app/contests/[id]/actions'
import type { Announcement, Problem, Standing, Submission } from '@/lib/mock-data'
import AnnouncementsPanel from './AnnouncementsPanel'
import EmptyState from './EmptyState'
import LatexContent from './LatexContent'
import Panel from './Panel'
import ProblemTable from './ProblemTable'
import StandingsTable from './StandingsTable'
import SubmissionTable from './SubmissionTable'

type ContestRoomProps = {
  contestId: string
  problems: Problem[]
  standings: Standing[]
  submissions: Submission[]
  announcements: Announcement[]
  canSubmit: boolean
}

type TabId = 'problems' | 'submit' | 'standings' | 'submissions' | 'clarifications'

const tabs: { id: TabId; label: string }[] = [
  { id: 'problems', label: 'Problemas' },
  { id: 'submit', label: 'Enviar solução' },
  { id: 'standings', label: 'Classificação' },
  { id: 'submissions', label: 'Minhas submissões' },
  { id: 'clarifications', label: 'Clarificações' },
]

export default function ContestRoom({
  contestId,
  problems,
  standings,
  submissions,
  announcements,
  canSubmit,
}: ContestRoomProps) {
  const [activeTab, setActiveTab] = useState<TabId>('problems')
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id)
  const [selectedUploadProblemId, setSelectedUploadProblemId] = useState(
    problems[0]?.id ?? ''
  )
  const [submitState, submitAction, isSubmitting] = useActionState(submitSolution, {
    ok: false,
    message: '',
  })

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem.id === selectedProblemId) ?? problems[0],
    [problems, selectedProblemId]
  )

  return (
    <div className="content-stack">
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'problems' ? (
        <>
          <Panel title="Problemas">
            <ProblemTable
              problems={problems}
              selectedProblemId={selectedProblem?.id}
              onSelectProblem={setSelectedProblemId}
            />
          </Panel>

          {selectedProblem ? (
            <Panel title={formatProblemLabel(selectedProblem)}>
              <LatexContent text={selectedProblem.statement} />
              <dl className="meta-grid">
                <div>
                  <dt>Pontos</dt>
                  <dd>{selectedProblem.points}</dd>
                </div>
                <div>
                  <dt>Submissões</dt>
                  <dd>{selectedProblem.submissions}</dd>
                </div>
              </dl>
            </Panel>
          ) : null}
        </>
      ) : null}

      {activeTab === 'submit' ? (
        <Panel title="Enviar solução em PDF">
          <form className="compact-form" action={submitAction}>
            <input name="contestId" type="hidden" value={contestId} />
            <input name="problemId" type="hidden" value={selectedUploadProblemId} />
            <label>
              Problema
              <select
                value={selectedUploadProblemId}
                onChange={(event) => setSelectedUploadProblemId(event.target.value)}
                disabled={!canSubmit}
              >
                {problems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    {formatProblemLabel(problem)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Arquivo PDF
              <input
                name="solution"
                type="file"
                accept="application/pdf,.pdf"
                disabled={!canSubmit}
              />
            </label>

            <p className="form-hint">
              Apenas a última submissão de cada problema será considerada.
              Submissões fora do horário oficial não são aceitas.
            </p>

            <button
              className="button"
              type="submit"
              disabled={!canSubmit || isSubmitting || problems.length === 0}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar solução'}
            </button>

            {submitState.message ? (
              <p className={submitState.ok ? 'form-message' : 'form-message danger'}>
                {submitState.message}
              </p>
            ) : null}
          </form>
        </Panel>
      ) : null}

      {activeTab === 'standings' ? (
        <Panel title="Classificação">
          {standings.length > 0 ? (
            <StandingsTable standings={standings} problems={problems} />
          ) : (
            <EmptyState message="Ainda não há standings para esta competição." />
          )}
        </Panel>
      ) : null}

      {activeTab === 'submissions' ? (
        <Panel title="Minhas submissões">
          <SubmissionTable submissions={submissions} />
        </Panel>
      ) : null}

      {activeTab === 'clarifications' ? (
        <>
          <AnnouncementsPanel title="Clarificações e anúncios" announcements={announcements} />
          <Panel title="Enviar pergunta">
            <form className="compact-form">
              <label>
                Assunto
                <input type="text" placeholder="Ex.: Problema B" />
              </label>
              <label>
                Pergunta
                <textarea rows={4} placeholder="Escreva sua dúvida." />
              </label>
              <button className="button" type="button">
                Enviar pergunta
              </button>
              <p className="form-hint">Perguntas ainda são mockadas neste MVP.</p>
            </form>
          </Panel>
        </>
      ) : null}
    </div>
  )
}

function formatProblemLabel(problem: Problem) {
  return problem.title || `Problema ${problem.index}`
}
