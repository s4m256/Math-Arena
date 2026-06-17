'use client'

import katex from 'katex'
import { useEffect, useRef } from 'react'

type LatexContentProps = {
  text: string
}

type Segment = {
  content: string
  displayMode: boolean
  latex: boolean
}

export default function LatexContent({ text }: LatexContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    contentRef.current.innerHTML = parseLatex(text)
      .map((segment) => renderSegment(segment))
      .join('')
  }, [text])

  return (
    <div
      ref={contentRef}
      className="statement"
      dangerouslySetInnerHTML={{ __html: renderPlainText(text) }}
    />
  )
}

function renderPlainText(text: string) {
  return escapeHtml(text).replace(/\n/g, '<br />')
}

function parseLatex(text: string) {
  const segments: Segment[] = []
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({
        content: text.slice(lastIndex, match.index),
        displayMode: false,
        latex: false,
      })
    }

    const raw = match[0]
    const displayMode = raw.startsWith('$$')
    segments.push({
      content: displayMode ? raw.slice(2, -2) : raw.slice(1, -1),
      displayMode,
      latex: true,
    })
    lastIndex = match.index + raw.length
  }

  if (lastIndex < text.length) {
    segments.push({
      content: text.slice(lastIndex),
      displayMode: false,
      latex: false,
    })
  }

  return segments
}

function renderSegment(segment: Segment) {
  if (!segment.latex) {
    return escapeHtml(segment.content).replace(/\n/g, '<br />')
  }

  try {
    return katex.renderToString(segment.content, {
      displayMode: segment.displayMode,
      throwOnError: false,
    })
  } catch {
    return escapeHtml(segment.content)
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
