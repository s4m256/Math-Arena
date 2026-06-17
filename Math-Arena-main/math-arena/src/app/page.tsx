import AnnouncementsPanel from '@/components/AnnouncementsPanel'
import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import { getGlobalAnnouncements } from '@/lib/announcements'
import { whatsappGroupUrl } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const announcements = await getGlobalAnnouncements(supabase)

  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>MathArena</h1>
          <p className="subtitle">
            Competições online de matemática olímpica, com problemas discursivos,
            submissões em PDF e rankings simples.
          </p>
        </div>
      </div>

      <Panel title="Sobre o site">
        <p>
          O MathArena é um espaço para treinar e organizar competições de
          matemática. Você pode entrar em uma rodada, resolver os problemas no
          tempo definido, enviar suas soluções e acompanhar o resultado quando a
          correção estiver disponível.
        </p>
        <p>
          A plataforma ainda está em desenvolvimento. Por enquanto, algumas áreas
          usam dados de exemplo, mas o fluxo principal de conta, entrada em
          competição e navegação já está preparado.
        </p>
        <a className="button" href={whatsappGroupUrl} target="_blank" rel="noreferrer">
          Entrar no grupo do WhatsApp
        </a>
      </Panel>

      <AnnouncementsPanel announcements={announcements} />
    </AppShell>
  )
}
