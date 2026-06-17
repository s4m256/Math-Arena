'use client'

import { useState } from 'react'
import { createContest } from './actions'

export default function AdminContestForm() {
  const [problemCount, setProblemCount] = useState('')
  const visibleProblemCount = Math.max(0, Number(problemCount) || 0)

  return (
    <form action={createContest} className="compact-form admin-form">
      <label>
        Título
        <input name="title" required type="text" />
      </label>

      <label>
        Descrição
        <textarea name="description" rows={4} />
      </label>

      <div className="admin-grid">
        <label>
          Início
          <input name="startTime" required type="datetime-local" />
        </label>

        <label>
          Duração
          <input name="duration" required type="time" />
        </label>

        <label>
          Problemas
          <input
            min={1}
            name="problemCount"
            required
            type="number"
            value={problemCount}
            onChange={(event) => setProblemCount(event.target.value)}
          />
        </label>

        <label>
          Nível
          <select name="level">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="U">U</option>
          </select>
        </label>

        <label>
          Escala
          <select name="scoringScale">
            <option value="0-7">0-7</option>
            <option value="0-10">0-10</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input name="rated" type="checkbox" />
          Com rating
        </label>
      </div>

      <div className="problem-editor-list">
        {Array.from({ length: visibleProblemCount }, (_, index) => {
          const problemNumber = index + 1

          return (
            <label key={problemNumber}>
              Questão {problemNumber}
              <textarea
                name={`problemStatement${problemNumber}`}
                required
                rows={5}
              />
            </label>
          )
        })}
      </div>

      <button className="button" type="submit">
        Criar competição
      </button>
    </form>
  )
}
