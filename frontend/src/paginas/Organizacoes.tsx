import { BotaoLink } from '../componentes/Botao'
import PaginaTexto, { Topico } from '../componentes/PaginaTexto'

export default function Organizacoes() {
  return (
    <PaginaTexto
      titulo="Para organizações"
      resumo="ONGs, igrejas, coletivos e órgãos públicos que oferecem atendimento gratuito: coloquem seus serviços no mapa."
    >
      <Topico titulo="Como participar hoje">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Crie uma conta com o e-mail da organização.</li>
          <li>Use “Sugerir serviço” para cada lugar ou atendimento que vocês oferecem.</li>
          <li>A moderação confere os dados e publica. Em seguida o serviço aparece na busca e no mapa.</li>
        </ol>
        <p>
          Se algum horário ou telefone mudar, abra a página do serviço e use “Denunciar informação errada”,
          explicando o que mudou. A moderação atualiza.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <BotaoLink para="/criar-conta">Criar conta</BotaoLink>
          <BotaoLink para="/sugerir" variante="suave" icone="mais">Sugerir serviço</BotaoLink>
        </div>
      </Topico>

      <Topico titulo="O que vem a seguir">
        <p>
          Estamos preparando um painel próprio para organizações verificadas editarem seus serviços, horários e
          vagas sem depender da moderação.
        </p>
      </Topico>

      <Topico titulo="Telefones e contatos">
        <p>
          Publicamos só contatos institucionais da organização, nunca números pessoais de voluntários ou da equipe.
        </p>
      </Topico>
    </PaginaTexto>
  )
}
