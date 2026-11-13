import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Botao } from '../componentes/Botao'
import { AreaTexto } from '../componentes/Campo'
import ExigeConta from '../componentes/ExigeConta'
import Icone from '../componentes/Icone'
import MensagemErro from '../componentes/MensagemErro'
import { categoriaPorSlug } from '../dados/categorias'
import { cores } from '../estilos/cores'
import { decidirServico, listarDenuncias, listarFila, mudarDenuncia } from '../servicos/api'
import type { DenunciaModeracao, ServicoModeracao } from '../servicos/tipos'
import { diasDesde, formatarHora, tempoDecorrido } from '../utils/formatar'

type Aba = 'sugestoes' | 'denuncias'

export default function Moderacao() {
  return (
    <ExigeConta papel="moderador" motivo="A moderação é feita por pessoas da equipe do Pontelo.">
      {() => <Painel />}
    </ExigeConta>
  )
}

function Painel() {
  const [aba, setAba] = useState<Aba>('sugestoes')
  const fila = useQuery({ queryKey: ['moderacao', 'fila'], queryFn: () => listarFila('pendente'), staleTime: 0 })
  const denuncias = useQuery({ queryKey: ['moderacao', 'denuncias'], queryFn: () => listarDenuncias('aberta'), staleTime: 0 })

  const abas: { id: Aba; texto: string; total?: number }[] = [
    { id: 'sugestoes', texto: 'Sugestões pendentes', total: fila.data?.length },
    { id: 'denuncias', texto: 'Denúncias abertas', total: denuncias.data?.length },
  ]

  return (
    <div className="conteudo py-8 md:py-12">
      <h1 className="text-[clamp(1.875rem,4vw,2.75rem)]">Moderação</h1>
      <p className="mt-2 text-ardosia">Confira cada informação antes de publicar. Na dúvida, ligue para o serviço.</p>

      <div role="tablist" aria-label="O que moderar" className="mt-6 flex gap-2 border-b border-nevoa">
        {abas.map((a) => (
          <button
            key={a.id}
            id={`aba-${a.id}`}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            onClick={() => setAba(a.id)}
            className={`-mb-px inline-flex min-h-12 items-center gap-2 border-b-[3px] px-3 font-semibold ${
              aba === a.id ? 'border-azul text-marinho' : 'border-transparent text-ardosia hover:text-marinho'
            }`}
          >
            {a.texto}
            {a.total !== undefined && (
              <span className={`rounded-full px-2 text-sm ${a.total > 0 ? 'bg-dourado text-marinho' : 'bg-nevoa'}`}>{a.total}</span>
            )}
          </button>
        ))}
      </div>

      <div id={`painel-${aba}`} role="tabpanel" aria-labelledby={`aba-${aba}`} className="mt-6">
        {aba === 'sugestoes' ? (
          <Lista
            consulta={fila}
            vazio="Nenhuma sugestão esperando. Tudo em dia!"
            tituloErro="Não conseguimos carregar as sugestões"
            render={(s: ServicoModeracao) => <CartaoSugestao key={s.id} servico={s} />}
          />
        ) : (
          <Lista
            consulta={denuncias}
            vazio="Nenhuma denúncia aberta."
            tituloErro="Não conseguimos carregar as denúncias"
            render={(d: DenunciaModeracao) => <CartaoDenuncia key={d.id} denuncia={d} />}
          />
        )}
      </div>
    </div>
  )
}

type PropsLista<T> = {
  consulta: { isPending: boolean; isError: boolean; error: Error | null; data?: T[]; refetch: () => unknown }
  vazio: string
  tituloErro: string
  render: (item: T) => ReactNode
}

function Lista<T>({ consulta, vazio, tituloErro, render }: PropsLista<T>) {
  if (consulta.isPending) return <p role="status" className="text-ardosia">Carregando…</p>
  if (consulta.isError && consulta.error) {
    return <MensagemErro titulo={tituloErro} erro={consulta.error} aoTentarDeNovo={() => consulta.refetch()} />
  }
  const itens = consulta.data ?? []
  if (itens.length === 0) return <p className="rounded-2xl bg-azul-claro p-6 text-ardosia">{vazio}</p>
  return <ul className="grid gap-4">{itens.map(render)}</ul>
}

function useAtualizarTudo() {
  const clienteConsultas = useQueryClient()
  return () => {
    void clienteConsultas.invalidateQueries({ queryKey: ['moderacao'] })
    void clienteConsultas.invalidateQueries({ queryKey: ['servicos'] })
    void clienteConsultas.invalidateQueries({ queryKey: ['servico'] })
  }
}

const NOMES_DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const ORDEM = [1, 2, 3, 4, 5, 6, 0]

function resumoHorarios(s: ServicoModeracao) {
  if (s.horarios.length === 0) return 'Não informado'
  return ORDEM.flatMap((dia) =>
    s.horarios
      .filter((h) => h.dia_semana === dia)
      .map((h) => `${NOMES_DIAS[dia]} ${formatarHora(h.abre)}–${formatarHora(h.fecha)}`),
  ).join(' · ')
}

function CartaoSugestao({ servico: s }: { servico: ServicoModeracao }) {
  const [rejeitando, setRejeitando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const atualizar = useAtualizarTudo()
  const categoria = categoriaPorSlug[s.categoria]

  const decisao = useMutation({
    mutationFn: (d: 'publicar' | 'rejeitar') => decidirServico(s.id, d, d === 'rejeitar' ? motivo : undefined),
    onSuccess: atualizar,
  })

  const { lat, lng } = s.localizacao
  const mapa = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`

  return (
    <li className="rounded-2xl border border-nevoa bg-white p-5 md:p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-ardosia">
        <Icone nome={categoria.icone} tamanho={18} cor={cores.marinho} destaque={cores.douradoEscuro} />
        {categoria.nome} · sugerido {tempoDecorrido(diasDesde(s.criado_em))}
      </p>
      <h2 className="mt-1 text-xl">{s.nome}</h2>
      {s.descricao && <p className="mt-2 text-ardosia">{s.descricao}</p>}

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-[max-content_1fr]">
        <dt className="font-semibold">Endereço</dt>
        <dd>
          {s.endereco}, {s.cidade} – {s.uf}
          {s.cep && ` · CEP ${s.cep.slice(0, 5)}-${s.cep.slice(5)}`}{' '}
          <a href={mapa} target="_blank" rel="noopener noreferrer" className="font-semibold text-azul underline underline-offset-4">
            conferir no mapa
          </a>
          {s.endereco_restrito && (
            <span className="ml-2 rounded-full bg-dourado px-2 py-0.5 text-sm font-semibold text-marinho">Endereço sigiloso</span>
          )}
        </dd>
        <dt className="font-semibold">Telefone</dt>
        <dd>{s.telefone ?? 'Não informado'}</dd>
        <dt className="font-semibold">Horários</dt>
        <dd>{resumoHorarios(s)}</dd>
        <dt className="font-semibold">Documentos</dt>
        <dd>{s.documentos_exigidos ?? 'Nenhum informado'}</dd>
      </dl>

      {rejeitando ? (
        <div className="mt-5 grid gap-3">
          <AreaTexto rotulo="Por que rejeitar? (opcional, fica no histórico)" rows={2} maxLength={500}
            value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Botao variante="primario" disabled={decisao.isPending} onClick={() => decisao.mutate('rejeitar')}>
              Confirmar rejeição
            </Botao>
            <Botao variante="suave" onClick={() => setRejeitando(false)}>Cancelar</Botao>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <Botao variante="confirmar" icone="confirmar" disabled={decisao.isPending} onClick={() => decisao.mutate('publicar')}>
            Publicar
          </Botao>
          <Botao variante="suave" disabled={decisao.isPending} onClick={() => setRejeitando(true)}>Rejeitar</Botao>
        </div>
      )}
      <div role="status">
        {decisao.isError && <p className="mt-2 font-medium text-erro">{decisao.error.message}</p>}
      </div>
    </li>
  )
}

function CartaoDenuncia({ denuncia: d }: { denuncia: DenunciaModeracao }) {
  const atualizar = useAtualizarTudo()
  const publicado = d.servico.status === 'publicado'

  const acao = useMutation({
    mutationFn: async (tipo: 'resolvida' | 'descartada' | 'arquivar') => {
      if (tipo === 'arquivar') {
        await decidirServico(d.servico.id, 'arquivar', `Denúncia: ${d.motivo}`)
        await mudarDenuncia(d.id, 'resolvida')
        return
      }
      await mudarDenuncia(d.id, tipo)
    },
    onSuccess: atualizar,
  })

  return (
    <li className="rounded-2xl border border-nevoa bg-white p-5 md:p-6">
      <p className="text-sm font-semibold text-ardosia">Recebida {tempoDecorrido(diasDesde(d.criado_em))}</p>
      <h2 className="mt-1 text-xl">{d.motivo}</h2>
      <p className="mt-1">
        Sobre:{' '}
        {publicado ? (
          <Link to={`/servicos/${d.servico.id}`} className="font-semibold text-azul underline underline-offset-4">
            {d.servico.nome}
          </Link>
        ) : (
          <span className="font-semibold">{d.servico.nome} ({d.servico.status})</span>
        )}
      </p>
      {d.descricao && <p className="mt-2 rounded-xl bg-azul-claro p-3 text-ardosia">“{d.descricao}”</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Botao variante="confirmar" disabled={acao.isPending} onClick={() => acao.mutate('resolvida')}>
          Marcar como resolvida
        </Botao>
        {publicado && (
          <Botao variante="primario" disabled={acao.isPending} onClick={() => acao.mutate('arquivar')}>
            Tirar serviço do ar
          </Botao>
        )}
        <Botao variante="suave" disabled={acao.isPending} onClick={() => acao.mutate('descartada')}>
          Descartar
        </Botao>
      </div>
      <div role="status">
        {acao.isError && <p className="mt-2 font-medium text-erro">{acao.error.message}</p>}
      </div>
    </li>
  )
}
