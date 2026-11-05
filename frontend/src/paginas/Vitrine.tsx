import { Botao, BotaoLink } from '../componentes/Botao'
import SeloConfianca from '../componentes/SeloConfianca'
import CardServico from '../componentes/CardServico'
import Icone from '../componentes/Icone'
import { categorias } from '../dados/categorias'
import { servicosExemplo } from '../dados/servicosExemplo'
import { cores } from '../estilos/cores'

const UM_DIA_MS = 24 * 60 * 60 * 1000
const diasAtras = (dias: number) => new Date(Date.now() - dias * UM_DIA_MS).toISOString()

// Página temporária para testar os componentes. Remover antes da entrega.
export default function Vitrine() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-14 px-4 py-12">
      <section>
        <h2 className="mb-5 text-2xl">Botões</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Botao variante="acao" icone="busca">Buscar serviços</Botao>
          <BotaoLink href="tel:1133330000" icone="telefone">Ligar</BotaoLink>
          <BotaoLink href="#" variante="suave" icone="rota">Como chegar</BotaoLink>
          <Botao variante="confirmar" icone="confirmar">Confirmo que ainda funciona</Botao>
          <Botao disabled>Desativado</Botao>
          <Botao variante="acao" tamanho="lg" icone="busca">Grande</Botao>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl">Selos</h2>
        <div className="flex flex-wrap gap-8">
          <SeloConfianca ultimaVerificacao={diasAtras(0)} />
          <SeloConfianca ultimaVerificacao={diasAtras(12)} />
          <SeloConfianca ultimaVerificacao={diasAtras(125)} />
          <SeloConfianca ultimaVerificacao={null} />
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl">Ícones de categoria</h2>
        <div className="flex flex-wrap gap-10">
          {categorias.map((c) => (
            <figure key={c.slug} className="grid justify-items-center gap-2 text-sm text-ardosia">
              <Icone nome={c.icone} tamanho={44} cor={cores.marinho} destaque={cores.douradoEscuro} />
              {c.nomeCurto}
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl">Cards de serviço</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {servicosExemplo.map((s) => (
            <CardServico key={s.id} servico={s} />
          ))}
        </div>
      </section>
    </div>
  )
}