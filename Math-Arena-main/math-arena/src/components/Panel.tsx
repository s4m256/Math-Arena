import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export default function Panel({ title, children, actions }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <span>{title}</span>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  )
}
