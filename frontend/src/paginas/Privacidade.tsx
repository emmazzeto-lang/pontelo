import { Link } from 'react-router'
import PaginaTexto, { Topico } from '../componentes/PaginaTexto'

const link = 'font-semibold text-azul underline underline-offset-4'

// Política de privacidade em linguagem simples (LGPD, Lei nº 13.709/2018; seção 8 da documentação)
export default function Privacidade() {
  return (
    <PaginaTexto
      titulo="Política de privacidade"
      resumo="Quem procura ajuda pode estar em risco. Por isso o Pontelo guarda o mínimo possível e nunca sabe quem está buscando."
    >
      <Topico titulo="Para buscar, você não precisa se identificar">
        <p>Não pedimos nome, e-mail nem cadastro para procurar um serviço.</p>
        <p>
          Sua localização (GPS, CEP ou cidade) é usada só para calcular quais serviços estão perto. Ela não é gravada
          no banco de dados, não aparece no endereço da página e não fica nos registros do servidor.
        </p>
        <p>O site não usa ferramentas de propaganda nem de rastreamento, como Google Analytics ou pixels de redes sociais.</p>
      </Topico>

      <Topico titulo="Se você criar uma conta">
        <p>Uma conta só é necessária para sugerir um serviço ou confirmar que ele ainda funciona. Guardamos:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>o nome ou apelido que você escolher;</li>
          <li>seu e-mail, usado só para você entrar;</li>
          <li>sua senha, guardada de forma embaralhada (Argon2id): nem a equipe consegue ver;</li>
          <li>os serviços que você sugeriu e as confirmações que fez.</li>
        </ul>
        <p>
          A base legal é o seu consentimento, dado ao criar a conta. Não vendemos nem compartilhamos esses dados
          com ninguém.
        </p>
      </Topico>

      <Topico titulo="Cookies">
        <p>
          Usamos um único cookie, e só para quem entra na conta: ele mantém você conectado por até 7 dias.
          O cookie não pode ser lido por outros sites nem pelo código da página. Quem não tem conta não recebe cookie.
        </p>
      </Topico>

      <Topico titulo="Denúncias são anônimas">
        <p>
          Ao denunciar uma informação errada, não registramos quem enviou, mesmo que você esteja na sua conta.
        </p>
      </Topico>

      <Topico titulo="Serviços de outras empresas">
        <p>
          O mapa é desenhado com imagens do OpenStreetMap, que o seu navegador baixa direto de lá. Como em qualquer
          site, o OpenStreetMap recebe o endereço de internet (IP) do aparelho, mas não sabe o que você buscou.
        </p>
        <p>
          Para transformar CEP em ponto no mapa, o servidor do Pontelo consulta o ViaCEP e o Nominatim
          (OpenStreetMap). Essas consultas saem do nosso servidor, não do seu aparelho.
        </p>
      </Topico>

      <Topico titulo="Saída rápida">
        <p>
          O botão vermelho “Saída rápida” (ou a tecla Esc) troca o site por uma página de previsão do tempo, apaga os
          dados da busca nesta aba e encerra a sua conta neste aparelho.
        </p>
        <p>
          Atenção: outras páginas do Pontelo abertas antes ainda ficam no histórico do navegador. Se alguém pode mexer
          no seu celular, use uma aba anônima (ou privada) para buscar ajuda: ao fechá-la, nada fica guardado.
        </p>
      </Topico>

      <Topico titulo="Seus direitos">
        <p>
          Em <Link to="/minha-conta" className={link}>Minha conta</Link> você pode, a qualquer momento:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>baixar todos os dados que guardamos sobre você;</li>
          <li>
            excluir a conta. Nome, e-mail e senha são apagados. Os serviços que você sugeriu continuam no mapa, porque
            ajudam outras pessoas, mas sem nenhuma ligação com você.
          </li>
        </ul>
      </Topico>

      <Topico titulo="Por quanto tempo guardamos">
        <p>
          Os dados da conta ficam guardados até você excluí-la. As sessões vencem em 7 dias e são apagadas
          automaticamente.
        </p>
      </Topico>

      <p className="border-t border-nevoa pt-7 text-sm text-ardosia">
        O Pontelo é um projeto acadêmico. Este texto foi escrito para ser claro e ainda não passou por revisão jurídica.
      </p>
    </PaginaTexto>
  )
}
