import { lazy, Suspense, useState } from 'react'
import { Link, useLocation } from 'react-router'
import CaixaBusca from '../componentes/CaixaBusca'
import CardServico from '../componentes/CardServico'
import Chip from '../componentes/Chip'
import Icone from '../componentes/Icone'
import { Botao } from '../componentes/Botao'
import { categoriaPorSlug } from '../dados/categorias'
import { servicosExemplo } from '../dados/servicosExemplo'
import { telefonesEmergencia } from '../dados/telefones'
import { cores } from '../estilos/cores'
import { filtrarServicos } from '../servicos/filtrar'
import type { Busca, Categoria, Local } from '../servicos/tipos'
import LimiteErroMapa from '../componentes/LimiteErroMapa'

// Só baixa o mapa quando a pessoa abrir a visão de mapa
const MapaServicos = lazy(() => import('../componentes/MapaServicos'))
const RAIO_PERTO = 3000
const RAIO_LONGE = 10000

export default function Resultados() {
  const { state, key } = useLocation()
  const busca = state as Busca | null

  if (!busca?.local) {
    return <PedirLocal categoria={busca?.categoria ?? null} />
  }

  // A "key" muda a cada nova busca e faz os filtros voltarem ao padrão
  return <ListaResultados key={key} local={busca.local} categoria={busca.categoria} />
}

function PedirLocal({ categoria }: { categoria: Categoria | null }) {
  return (
    <section className="conteudo max-w-[640px] py-10 md:py-16">
      <h1 className="titulo-secao">
        {categoria ? `${categoriaPorSlug[categoria].nome} perto de você` : 'Buscar serviços'}
      </h1>
      <p className="mb-6 mt-3 text-lg text-ardosia">
        Diga onde você está para vermos o que existe por perto. Sua localização não fica guardada.
      </p>
      <CaixaBusca key={categoria ?? 'todas'} categoriaInicial={categoria} />
    </section>
  )
}

function descreverLocal(local: Local) {
  return local.tipo === 'texto' ? local.texto : 'Sua localização atual'
}

type ListaProps = { local: Local; categoria: Categoria | null }

function ListaResultados({ local, categoria }: ListaProps) {
  const [visao, setVisao] = useState<'lista' | 'mapa'>('lista')
  const [raioM, setRaioM] = useState(RAIO_PERTO)
  const [abertoAgora, setAbertoAgora] = useState(false)
  const [soConferidos, setSoConferidos] = useState(false)

  const servicos = filtrarServicos(servicosExemplo, { categoria, raioM, abertoAgora, soConferidos })
  const voltar: Busca = { local: null, categoria }

  return (
    <section className="conteudo py-8 md:py-12">
      <h1 className="titulo-secao">
        {categoria ? categoriaPorSlug[categoria].nome : 'Serviços'} perto de você
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="flex items-center gap-2 text-ardosia">
          <Icone nome="local" tamanho={18} cor={cores.azul} />
          {descreverLocal(local)} · até {raioM / 1000} km
        </p>
        <Link to="/servicos" state={voltar} className="font-semibold text-azul underline underline-offset-4">
          Mudar busca
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtros" className="flex flex-wrap gap-2">
          <Chip ativo={abertoAgora} icone="relogio" aoClicar={() => setAbertoAgora(!abertoAgora)}>
            Aberto agora
          </Chip>
          <Chip ativo={soConferidos} icone="elo" aoClicar={() => setSoConferidos(!soConferidos)}>
            Só conferidos
          </Chip>
          <Chip ativo={raioM === RAIO_PERTO} aoClicar={() => setRaioM(RAIO_PERTO)}>
            Até 3 km
          </Chip>
          <Chip ativo={raioM === RAIO_LONGE} aoClicar={() => setRaioM(RAIO_LONGE)}>
            Até 10 km
          </Chip>
        </div>

        <AlternarVisao visao={visao} aoMudar={setVisao} />
      </div>

      <p role="status" className="mt-6 text-sm font-semibold text-ardosia">
        {servicos.length === 1 ? '1 serviço encontrado' : `${servicos.length} serviços encontrados`}
      </p>

      {servicos.length === 0 ? (
        <SemResultados
          local={local}
          raioM={raioM}
          abertoAgora={abertoAgora}
          soConferidos={soConferidos}
          aumentarRaio={() => setRaioM(RAIO_LONGE)}
          mostrarFechados={() => setAbertoAgora(false)}
          mostrarNaoConferidos={() => setSoConferidos(false)}
        />
      ) : visao === 'lista' ? (
        <>
          <h2 className="sr-only">Lista de serviços</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <CardServico key={s.id} servico={s} />
            ))}
          </div>

          {raioM === RAIO_PERTO && (
            <div className="mt-10 grid justify-items-center gap-2 border-t border-nevoa pt-8 text-center">
              <h2 className="text-lg">Não achou o que precisava?</h2>
              <p className="text-ardosia">Aumente a distância da busca ou tente outra categoria.</p>
              <Botao variante="suave" className="mt-2" onClick={() => setRaioM(RAIO_LONGE)}>
                Buscar em até 10 km
              </Botao>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <h2 className="sr-only">Mapa de serviços</h2>
          <LimiteErroMapa aoVoltarParaLista={() => setVisao('lista')}>
            <Suspense
               fallback={
                <div role="status" className="grid min-h-80 place-items-center rounded-2xl border border-nevoa bg-white p-6 text-ardosia">
                  Carregando o mapa…
                </div>
      }
    >
      <MapaServicos servicos={servicos} local={local} />
    </Suspense>
  </LimiteErroMapa>
</div>
      )}
    </section>
  )
}

type Visao = 'lista' | 'mapa'

function AlternarVisao({ visao, aoMudar }: { visao: Visao; aoMudar: (v: Visao) => void }) {
  const estilo = (ativo: boolean) =>
    `inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-semibold transition-colors ${
      ativo ? 'bg-marinho text-white' : 'hover:bg-azul-claro'
    }`

  return (
    <div role="group" aria-label="Forma de ver os resultados" className="flex rounded-[14px] border border-nevoa bg-white p-1 lg:w-64">
      <button type="button" aria-pressed={visao === 'lista'} onClick={() => aoMudar('lista')} className={estilo(visao === 'lista')}>
        <Icone nome="lista" tamanho={18} />
        Lista
      </button>
      <button type="button" aria-pressed={visao === 'mapa'} onClick={() => aoMudar('mapa')} className={estilo(visao === 'mapa')}>
        <Icone nome="mapa" tamanho={18} cor={visao === 'mapa' ? cores.branco : cores.marinho} destaque={visao === 'mapa' ? cores.marinho : cores.branco} />
        Mapa
      </button>
    </div>
  )
}

type SemResultadosProps = {
  local: Local
  raioM: number
  abertoAgora: boolean
  soConferidos: boolean
  aumentarRaio: () => void
  mostrarFechados: () => void
  mostrarNaoConferidos: () => void
}

function SemResultados(props: SemResultadosProps) {
  const todasCategorias: Busca = { local: props.local, categoria: null }

  return (
    <div className="mt-4 rounded-2xl border border-nevoa bg-white p-6 md:p-8">
      <h2 className="text-2xl">Nenhum serviço encontrado com esses filtros</h2>
      <p className="mt-2 text-ardosia">Tente uma destas opções:</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {props.raioM < RAIO_LONGE && (
          <Botao variante="primario" onClick={props.aumentarRaio}>Buscar em até 10 km</Botao>
        )}
        {props.abertoAgora && (
          <Botao variante="suave" onClick={props.mostrarFechados}>Mostrar também os fechados</Botao>
        )}
        {props.soConferidos && (
          <Botao variante="suave" onClick={props.mostrarNaoConferidos}>Mostrar também os não conferidos</Botao>
        )}
        <Link to="/servicos" state={todasCategorias} className="font-semibold text-azul underline underline-offset-4">
          Ver todas as categorias
        </Link>
      </div>

      <div className="mt-6 border-t border-nevoa pt-5">
        <h3 className="text-lg">Se for urgente, ligue:</h3>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {telefonesEmergencia.map((t) => (
            <li key={t.numero}>
              <a href={`tel:${t.numero}`} className="inline-flex min-h-11 items-center gap-2 hover:underline">
                <span className="font-titulo text-xl font-extrabold text-azul">{t.numero}</span>
                {t.nome}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}