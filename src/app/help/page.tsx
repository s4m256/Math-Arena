import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import { contactEmail } from '@/lib/site'

export default function HelpPage() {
  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>Ajuda</h1>
          <p className="subtitle">Informações básicas sobre o MathArena.</p>
        </div>
      </div>

      <Panel title="Como usar">
        <div className="content-stack">
          <section>
            <h2>Competições</h2>
            <p>
              A página de competições mostra as rodadas ativas e as rodadas
              passadas. Abra uma competição para ver informações, problemas,
              submissões e standings.
            </p>
          </section>

          <section>
            <h2>Registro</h2>
            <p>
              Para participar, crie uma conta, faça login e clique em Registrar
              dentro da página da competição. Se a competição estiver encerrada,
              ela pode ser usada como treino virtual.
            </p>
          </section>

          <section>
            <h2>Submissões</h2>
            <p>
              As soluções devem ser enviadas em PDF. A ideia é considerar apenas
              a última submissão de cada problema, para manter o processo simples.
            </p>
          </section>

          <section>
            <h2>Correção e ranking</h2>
            <p>
              Cada competição define sua própria escala de pontuação. O ranking
              global usa rating e badges coloridas para indicar a faixa de cada
              usuário.
            </p>
          </section>

          <section>
            <h2>Contato</h2>
            <p>
              Para dúvidas, problemas técnicos ou sugestões, envie email para{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </section>
        </div>
      </Panel>
    </AppShell>
  )
}
