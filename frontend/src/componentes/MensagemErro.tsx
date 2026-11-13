import { ErroApi } from '../servicos/api'
import { Botao } from './Botao'
import TelefonesUrgentes from './TelefonesUrgentes'

type Props = {
  titulo: string
  erro: Error
  aoTentarDeNovo: () => void
  mostrarTelefones?: boolean
}

function explicar(erro: Error) {
  if (!(erro instanceof ErroApi)) return 'O sistema pode estar fora do ar por alguns minutos. Tente de novo.'
  switch (erro.codigo) {
    case 'SEM_CONEXAO':
      return 'Parece que você está sem internet. Confira a conexão e tente de novo.'
    // Mensagens da API que já foram escritas para quem usa o site
    case 'LOCAL_NAO_ENCONTRADO':
    case 'GEOCODIFICACAO_INDISPONIVEL':
    case 'LIMITE_EXCEDIDO':
      return erro.message
    default:
      return 'O sistema pode estar fora do ar por alguns minutos. Tente de novo.'
  }
}

export default function MensagemErro({ titulo, erro, aoTentarDeNovo, mostrarTelefones = false }: Props) {
  const localErrado = erro instanceof ErroApi && erro.codigo === 'LOCAL_NAO_ENCONTRADO'

  return (
    <div role="alert" className="mt-4 rounded-2xl border border-nevoa bg-white p-6 md:p-8">
      <h2 className="text-2xl">{titulo}</h2>
      <p className="mt-2 text-ardosia">{explicar(erro)}</p>
      {/* Tentar de novo com o mesmo CEP errado não adianta: aí o caminho é o "Mudar busca" */}
      {!localErrado && <Botao className="mt-4" onClick={aoTentarDeNovo}>Tentar de novo</Botao>}
      {mostrarTelefones && <TelefonesUrgentes />}
    </div>
  )
}