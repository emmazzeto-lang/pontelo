import { Link } from 'react-router'
import CaixaBusca from '../componentes/CaixaBusca'
import CardServico from '../componentes/CardServico'
import SeloConfianca from '../componentes/SeloConfianca'
import Icone from '../componentes/Icone'
import { BotaoLink } from '../componentes/Botao'
import { categorias } from '../dados/categorias'
import { telefonesEmergencia } from '../dados/telefones'
import { servicosExemplo } from '../dados/servicosExemplo'
import { cores } from '../estilos/cores'
import { diasAtras } from '../utils/formatar'
import type { Busca } from '../servicos/tipos'

export default function Inicio() {
  return (
    <>
      <Abertura />
      <TelefonesNoCelular />
      <Categorias />
      <ComoFunciona />
      <SeloDeConfianca />
      <SejaUmElo />
    </>
  )
}

function Abertura() {
  return (
    <section className="bg-areia">
      <div className="conteudo grid items-center gap-10 py-10 md:py-20 lg:grid-cols-[1fr_minmax(0,540px)] lg:gap-16">
        <div>
          <h1 className="text-[clamp(2.25rem,5.2vw,3.875rem)] tracking-[-0.035em]">
            Encontre ajuda gratuita <span className="text-azul">perto de você.</span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg text-ardosia md:text-[19px]">
            Abrigos, refeitórios, atendimento jurídico, vacinação e CRAS num só lugar,
            em linguagem simples e conferidos pela comunidade.
          </p>
        </div>
        <CaixaBusca />
      </div>
    </section>
  )
}

function TelefonesNoCelular() {
  return (
    <section aria-labelledby="titulo-telefones" className="bg-areia md:hidden">
      <div className="conteudo pb-10">
        <h2 id="titulo-telefones" className="text-lg">Telefones de emergência</h2>
        <ul className="mt-2">
          {telefonesEmergencia.map((t) => (
            <li key={t.numero} className="border-b border-nevoa">
              <a href={`tel:${t.numero}`} className="flex min-h-14 items-center gap-3.5">
                <span className="font-titulo text-2xl font-extrabold text-azul">{t.numero}</span>
                {t.nome}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Categorias() {
  return (
    <section aria-labelledby="titulo-categorias" className="bg-white py-16 md:py-26">
      <div className="conteudo">
        <h2 id="titulo-categorias" className="titulo-secao max-w-[18ch]">
          Que tipo de ajuda você precisa?
        </h2>
        <p className="mt-3.5 max-w-xl text-lg text-ardosia">
          Escolha uma categoria e veja o que existe perto de você, do mais próximo ao mais distante.
        </p>

        <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => {
            const busca: Busca = { local: null, categoria: c.slug }
            return (
              <li key={c.slug} className="border-t border-marinho/20">
                <Link to="/servicos" state={busca} className="group flex gap-5 pb-9 pt-7">
                  <Icone nome={c.icone} tamanho={36} cor={cores.marinho} destaque={cores.douradoEscuro} className="shrink-0" />
                  <span>
                    <span className="block font-titulo text-2xl font-extrabold tracking-[-0.01em] group-hover:text-azul">
                      {c.nome}
                    </span>
                    <span className="mt-2 block text-ardosia">{c.descricao}</span>
                    <span className="mt-3 inline-block font-semibold text-azul underline underline-offset-4">
                      Ver lugares perto de você
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

const passos = [
  { titulo: 'Diga onde você está', texto: 'Use o GPS, digite o CEP ou o nome da cidade. Sua localização não fica guardada.' },
  { titulo: 'Escolha o tipo de ajuda', texto: 'Veja a lista pela distância. Use o filtro "aberto agora" se for urgente.' },
  { titulo: 'Ligue ou vá até lá', texto: 'Botões grandes para ligar e traçar a rota. Endereço, horários e documentos num só lugar.' },
]

function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="titulo-como-funciona" className="bg-areia py-16 md:py-26">
      <div className="conteudo">
        <h2 id="titulo-como-funciona" className="titulo-secao">Três passos até a ajuda certa</h2>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
          {passos.map((passo, i) => {
            const ultimo = i === passos.length - 1
            return (
              <li key={passo.titulo}>
                <div className="flex items-center">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-full font-titulo text-xl font-extrabold ${
                      ultimo ? 'bg-dourado text-marinho' : 'bg-marinho text-white'
                    }`}
                  >
                    {i + 1}
                  </span>
                  {!ultimo && <span aria-hidden="true" className="hidden h-1 flex-1 rounded-full bg-dourado-escuro md:block" />}
                </div>
                <h3 className="mt-5 text-2xl md:pr-8">{passo.titulo}</h3>
                <p className="mt-2 text-ardosia md:pr-8">{passo.texto}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function SeloDeConfianca() {
  return (
    <section aria-labelledby="titulo-selo" className="bg-white py-16 md:py-26">
      <div className="conteudo grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 id="titulo-selo" className="titulo-secao max-w-[16ch]">Cada serviço mostra quando foi conferido</h2>
          <p className="mt-3.5 max-w-xl text-lg text-ardosia">
            Moderadores aprovam cada cadastro, e quem usa confirma que o serviço continua
            funcionando. Cada confirmação é mais um elo.
          </p>

          <dl className="mt-8">
            <div className="border-t border-nevoa py-4">
              <dt><SeloConfianca ultimaVerificacao={diasAtras(12)} /></dt>
              <dd className="mt-1 text-ardosia">Confirmado nos últimos 90 dias.</dd>
            </div>
            <div className="border-t border-nevoa py-4">
              <dt><SeloConfianca ultimaVerificacao={diasAtras(125)} /></dt>
              <dd className="mt-1 text-ardosia">Informação antiga. Ligue antes de ir até lá.</dd>
            </div>
          </dl>
        </div>

        <figure className="grid gap-4 rounded-3xl bg-azul-claro p-5 md:p-10">
          <CardServico servico={servicosExemplo[0]} />
          <CardServico servico={servicosExemplo[2]} />
          <figcaption className="text-sm text-ardosia">Exemplo de como os serviços aparecem na busca.</figcaption>
        </figure>
      </div>
    </section>
  )
}

const convites = [
  {
    titulo: 'Colaborador',
    texto: 'Sugira um serviço que você conhece, corrija dados e confirme que ele ainda funciona.',
    acao: 'Quero colaborar',
    para: '/sugerir',
    variante: 'acao' as const,
  },
  {
    titulo: 'Organização',
    texto: 'ONGs e órgãos públicos mantêm horários, vagas e contatos sempre em dia.',
    acao: 'Cadastrar organização',
    para: '/organizacoes',
    variante: 'claro' as const,
  },
  {
    titulo: 'Dados abertos',
    texto: 'Pesquisadores e governo usam a API pública para ver onde falta atendimento.',
    acao: 'Ver documentação da API',
    para: '/dados-abertos',
    variante: 'claro' as const,
  },
]

function SejaUmElo() {
  return (
    <section aria-labelledby="titulo-elo" className="bg-azul py-16 text-white md:py-26">
      <div className="conteudo grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-20">
        <div>
          <h2 id="titulo-elo" className="titulo-secao">Seja um elo dessa ponte</h2>
          <p className="mt-3.5 text-lg text-white/85">
            Quanto mais gente confere e atualiza os dados, mais fácil fica para quem precisa encontrar ajuda.
          </p>
        </div>

        <ul>
          {convites.map((c) => (
            <li
              key={c.titulo}
              className="flex flex-col gap-4 border-t border-white/25 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <div>
                <h3 className="text-[26px]">{c.titulo}</h3>
                <p className="mt-2 max-w-md text-white/85">{c.texto}</p>
              </div>
              <BotaoLink para={c.para} variante={c.variante} className="shrink-0 self-start sm:self-auto">
                {c.acao}
              </BotaoLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}