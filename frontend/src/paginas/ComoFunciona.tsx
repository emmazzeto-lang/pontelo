import { BotaoLink } from '../componentes/Botao'
import PaginaTexto, { Topico } from '../componentes/PaginaTexto'
import SeloConfianca from '../componentes/SeloConfianca'
import { PRAZO_CONFERENCIA_DIAS, diasAtras } from '../utils/formatar'

const etapas = [
  { titulo: 'Alguém sugere', texto: 'Uma pessoa com conta conta sobre um serviço gratuito que conhece.' },
  { titulo: 'A moderação confere', texto: 'A equipe confere endereço, telefone e horários antes de publicar. Nada aparece sem essa conferência.' },
  { titulo: 'A comunidade mantém', texto: 'Quem usa confirma que continua funcionando ou avisa quando algo mudou.' },
]

export default function ComoFunciona() {
  return (
    <PaginaTexto
      titulo="Como conferimos os dados"
      resumo="Informação errada faz alguém atravessar a cidade à toa. Por isso cada serviço passa por pessoas antes de aparecer, e mostra quando foi conferido pela última vez."
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {etapas.map((etapa, i) => (
          <li key={etapa.titulo}>
            <span className="grid size-11 place-items-center rounded-full bg-marinho font-titulo text-lg font-extrabold text-white">
              {i + 1}
            </span>
            <h2 className="mt-3 text-xl">{etapa.titulo}</h2>
            <p className="mt-1 text-ardosia">{etapa.texto}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <Topico titulo="O selo de confiança">
          <p>Todo serviço mostra há quanto tempo foi conferido:</p>
          <dl className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <dt><SeloConfianca ultimaVerificacao={diasAtras(5)} /></dt>
              <dd className="text-ardosia">alguém confirmou nos últimos {PRAZO_CONFERENCIA_DIAS} dias.</dd>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <dt><SeloConfianca ultimaVerificacao={diasAtras(140)} /></dt>
              <dd className="text-ardosia">faz mais de {PRAZO_CONFERENCIA_DIAS} dias. Ligue antes de ir.</dd>
            </div>
          </dl>
          <p>
            Cada vez que alguém aperta “Confirmo que ainda funciona”, o selo volta a contar do zero. Cada pessoa pode
            confirmar o mesmo serviço uma vez por dia, para evitar exageros.
          </p>
        </Topico>

        <Topico titulo="Quando algo está errado">
          <p>
            Qualquer pessoa pode denunciar uma informação errada, sem conta e sem se identificar. A moderação recebe o
            aviso, confere e corrige ou tira o serviço do ar.
          </p>
        </Topico>

        <Topico titulo="Endereços que não aparecem">
          <p>
            Abrigos para quem sofre violência têm endereço sigiloso. Nesses casos o site mostra só a cidade e o
            telefone, e o serviço não aparece no mapa. Até a distância é arredondada, para ninguém descobrir o local.
          </p>
        </Topico>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <BotaoLink para="/servicos" icone="busca">Buscar serviços</BotaoLink>
        <BotaoLink para="/sugerir" variante="suave" icone="mais">Sugerir um serviço</BotaoLink>
      </div>
    </PaginaTexto>
  )
}
