import { lazy, Suspense, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Botao, BotaoLink } from '../componentes/Botao'
import Denuncia from '../componentes/Denuncia'
import Icone from '../componentes/Icone'
import LimiteErroMapa from '../componentes/LimiteErroMapa'
import SeloConfianca from '../componentes/SeloConfianca'
import { categoriaPorSlug } from '../dados/categorias'
import MensagemErro from '../componentes/MensagemErro'
import { useServico } from '../hooks/useServicos'
import { confirmarServico, ErroApi } from '../servicos/api'
import { useSessao } from '../servicos/sessao'
import { cores } from '../estilos/cores'
import type { Horario, ServicoDetalhe } from '../servicos/tipos'
import { formatarDistancia, formatarHora, linkDeRota } from '../utils/formatar'
import NaoEncontrada from './NaoEncontrada'
import type React from 'react'

const MapaServicos = lazy(() => import('../componentes/MapaServicos'))

export default function DetalheServico() {
  const { id = '' } = useParams()
  const consulta = useServico(id)

  if (consulta.isPending) {
    return (
      <div className="conteudo min-h-screen py-10">
        <p role="status" className="text-ardosia">Carregando o serviço…</p>
      </div>
    )
  }

  if (consulta.isError) {
    if (consulta.error instanceof ErroApi && consulta.error.status === 404) {
      return <NaoEncontrada />
    }
    return (
      <div className="conteudo py-10">
        <MensagemErro titulo="Não conseguimos abrir este serviço" erro={consulta.error} aoTentarDeNovo={() => consulta.refetch()} />
      </div>
    )
  }

  return <Conteudo servico={consulta.data} />
}

function Conteudo({ servico }: { servico: ServicoDetalhe }) {
  const categoria = categoriaPorSlug[servico.categoria]
  const rota = servico.localizacao ? linkDeRota(servico.localizacao.lat, servico.localizacao.lng) : null

  return (
    <div className="conteudo py-6 md:py-10">
      <BotaoVoltar />

      <header className="mt-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ardosia">
          <Icone nome={categoria.icone} tamanho={20} cor={cores.marinho} destaque={cores.douradoEscuro} />
          {categoria.nome}
          {servico.distancia_m !== null && ` · ${formatarDistancia(servico.distancia_m)} de você`}
        </p>
        <h1 className="mt-2 max-w-[22ch] text-[clamp(1.875rem,4.5vw,3rem)]">{servico.nome}</h1>
        <div className="mt-3">
          <SeloConfianca ultimaVerificacao={servico.ultima_verificacao_em} />
        </div>
        <p className="mt-3 max-w-2xl text-lg text-ardosia">{servico.descricao}</p>
      </header>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-16">
        <aside aria-label="Ações" className="grid gap-2.5 lg:sticky lg:top-6 lg:order-2">
          {servico.telefone && (
            <BotaoLink href={`tel:${servico.telefone}`} icone="telefone" tamanho="lg" larguraTotal>
              Ligar
            </BotaoLink>
          )}
          {rota && (
            <BotaoLink href={rota} novaAba variante="acao" icone="rota" tamanho="lg" larguraTotal>
              Como chegar
            </BotaoLink>
          )}
        </aside>

        <div className="lg:order-1">
          <Secao titulo="Endereço">
            <EnderecoComMapa servico={servico} />
          </Secao>

          <Secao titulo="Horários">
            <p className={`mb-2 flex items-center gap-2 font-semibold ${servico.aberto_agora ? 'text-verificado' : 'text-ardosia'}`}>
              <Icone nome="relogio" tamanho={16} />
              {servico.aberto_agora ? 'Aberto agora' : 'Fechado'} · {servico.horario_hoje}
            </p>
            <TabelaHorarios horarios={servico.horarios} />
          </Secao>

          <Secao titulo="Documentos exigidos">
            <p className="text-ardosia">
              {servico.documentos_exigidos ?? 'Nenhum documento é exigido.'}
            </p>
          </Secao>

          <Secao titulo="Este serviço ainda funciona?">
            <p className="mb-3 text-ardosia">
              Se você esteve lá ou ligou recentemente, sua confirmação ajuda a próxima pessoa.
            </p>
            <ConfirmarFuncionamento servicoId={servico.id} />
          </Secao>

          <div className="border-t border-nevoa pt-5">
            <Denuncia servicoId={servico.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

// "Confirmo que ainda funciona": exige conta, para a confirmação ter alguém responsável por ela
function ConfirmarFuncionamento({ servicoId }: { servicoId: string }) {
  const sessao = useSessao()
  const { pathname } = useLocation()
  const clienteConsultas = useQueryClient()

  const envio = useMutation({
    mutationFn: () => confirmarServico(servicoId),
    onSuccess: (ultimaVerificacao) => {
      // Atualiza o selo desta página na hora e faz as listas buscarem de novo
      clienteConsultas.setQueryData<ServicoDetalhe>(['servico', servicoId], (atual) =>
        atual && { ...atual, ultima_verificacao_em: ultimaVerificacao },
      )
      void clienteConsultas.invalidateQueries({ queryKey: ['servicos'] })
    },
  })

  if (sessao.status === 'carregando') return null

  if (sessao.status === 'anonimo') {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <BotaoLink para="/entrar" estado={{ de: pathname }} variante="confirmar" icone="confirmar">
          Entrar para confirmar
        </BotaoLink>
        <span className="text-sm text-ardosia">Leva menos de um minuto.</span>
      </div>
    )
  }

  const jaConfirmou = envio.error instanceof ErroApi && envio.error.codigo === 'CONFIRMACAO_RECENTE'

  return (
    <>
      {!envio.isSuccess && !jaConfirmou && (
        <Botao variante="confirmar" icone="confirmar" disabled={envio.isPending} onClick={() => envio.mutate()}>
          {envio.isPending ? 'Enviando…' : 'Confirmo que ainda funciona'}
        </Botao>
      )}
      <div role="status">
        {envio.isSuccess && <p className="font-semibold text-verificado">Obrigado! Você é mais um elo dessa ponte.</p>}
        {jaConfirmou && <p className="font-semibold text-verificado">{envio.error.message}</p>}
        {envio.isError && !jaConfirmou && (
          <p className="mt-2 font-medium text-erro">Não conseguimos registrar agora. Tente de novo em alguns minutos.</p>
        )}
      </div>
    </>
  )
}

function BotaoVoltar() {
  const navegar = useNavigate()
  const { key } = useLocation()

  // "default" = a pessoa abriu direto por este endereço, sem página anterior no site
  const veioDoSite = key !== 'default'

  return (
    <button
      type="button"
      onClick={() => (veioDoSite ? navegar(-1) : navegar('/servicos'))}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-[10px] px-2 font-semibold hover:bg-azul-claro"
    >
      <Icone nome="voltar" tamanho={20} />
      Voltar
    </button>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-nevoa py-5 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-5">
      <h2 className="mb-2.5 text-xl">{titulo}</h2>
      {children}
    </section>
  )
}

function EnderecoComMapa({ servico }: { servico: ServicoDetalhe }) {
  const [verMapa, setVerMapa] = useState(false)
  const servicosNoMapa = useMemo(() => [servico], [servico])

  // Abrigo com endereço sigiloso: só a cidade e o caminho para ligar
  if (servico.endereco_restrito) {
    return (
      <p className="text-ardosia">
        Por segurança de quem é atendido aqui, o endereço não é divulgado.
        {servico.telefone ? ' Ligue para combinar o atendimento.' : ''}
        <br />
        {servico.cidade} – {servico.uf}
      </p>
    )
  }

  return (
    <>
      <p className="text-ardosia">
        {servico.endereco}
        <br />
        {servico.cidade} – {servico.uf}
        {servico.cep && ` · CEP ${servico.cep.slice(0, 5)}-${servico.cep.slice(5)}`}
      </p>

      {verMapa ? (
        <div className="mt-4">
          <LimiteErroMapa
            aoVoltarParaLista={() => setVerMapa(false)}
            mensagem="Sua conexão pode estar fraca. O endereço e a rota continuam disponíveis nesta página."
            textoBotao="Fechar"
          >
            <Suspense fallback={<p role="status" className="text-ardosia">Carregando o mapa…</p>}>
              <MapaServicos servicos={servicosNoMapa} />
            </Suspense>
          </LimiteErroMapa>
        </div>
      ) : (
        <Botao variante="suave" icone="local" className="mt-3" onClick={() => setVerMapa(true)}>
          Ver no mapa
        </Botao>
      )}
    </>
  )
}

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
// Começa na segunda, deixando o domingo por último
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]

function TabelaHorarios({ horarios }: { horarios: Horario[] }) {
  const hoje = new Date().getDay()

  return (
    <ul className="max-w-sm">
      {ORDEM_DIAS.map((dia) => {
        const doDia = horarios.filter((h) => h.dia_semana === dia)
        const ehHoje = dia === hoje

        return (
          <li key={dia} className={`flex justify-between gap-4 py-1 ${ehHoje ? 'font-semibold' : 'text-ardosia'}`}>
            <span>{DIAS[dia]}{ehHoje && ' (hoje)'}</span>
            <span>
              {doDia.length === 0
                ? 'Fechado'
                : doDia.map((h) => `${formatarHora(h.abre)} às ${formatarHora(h.fecha)}`).join(', ')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}