import { Link } from 'react-router'
import type { Servico } from '../servicos/tipos'
import { categoriaPorSlug } from '../dados/categorias'
import { formatarDistancia, linkDeRota } from '../utils/formatar'
import { cores } from '../estilos/cores'
import Icone from './Icone'
import SeloConfianca from './SeloConfianca'
import { BotaoLink } from './Botao'

type Props = { servico: Servico }

export default function CardServico({ servico }: Props) {
  const categoria = categoriaPorSlug[servico.categoria]
  const rota = linkDeRota(servico.localizacao.lat, servico.localizacao.lng)

  return (
    <article className="grid gap-3.5 rounded-2xl border border-nevoa bg-white p-5">
      <div className="flex items-start gap-3">
        <Icone nome={categoria.icone} tamanho={28} cor={cores.marinho} destaque={cores.douradoEscuro} className="mt-0.5 shrink-0" />
        <div>
          <h3 className="text-lg font-bold leading-tight">
            <Link to={`/servicos/${servico.id}`} className="hover:underline">
              {servico.nome}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-ardosia">
            {categoria.nome} · {formatarDistancia(servico.distancia_m)} de você
          </p>
        </div>
      </div>

      <ul className="grid gap-2 text-sm">
        <li>
          <SeloConfianca ultimaVerificacao={servico.ultima_verificacao_em} />
        </li>
        <li className={`flex items-center gap-2 font-medium ${servico.aberto_agora ? 'text-verificado' : 'text-ardosia'}`}>
          <Icone nome="relogio" tamanho={16} />
          {servico.aberto_agora ? 'Aberto agora' : 'Fechado'} · {servico.horario_hoje}
        </li>
        <li className="flex items-center gap-2 text-ardosia">
          <Icone nome="local" tamanho={16} />
          {servico.endereco}
        </li>
      </ul>

      <div className="grid grid-cols-2 gap-2">
        {servico.telefone && (
          <BotaoLink href={`tel:${servico.telefone}`} icone="telefone">
            Ligar
          </BotaoLink>
        )}
        <BotaoLink href={rota} novaAba variante="suave" icone="rota" className={servico.telefone ? '' : 'col-span-2'}>
          Como chegar
        </BotaoLink>
      </div>
    </article>
  )
}