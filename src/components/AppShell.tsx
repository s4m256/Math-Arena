import type { ReactNode } from 'react'
import Navbar from './Navbar'

type AppShellProps = {
  children: ReactNode
  sidebar?: ReactNode
}

export default function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <>
      <Navbar />
      <main className="wrapper page-shell">
        {sidebar ? (
          <div className="main-layout">
            <div className="content-stack">{children}</div>
            <aside className="sidebar-stack">{sidebar}</aside>
          </div>
        ) : (
          <div className="content-stack">{children}</div>
        )}
      </main>
    </>
  )
}
