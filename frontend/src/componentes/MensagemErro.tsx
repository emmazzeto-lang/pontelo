import { ErroApi } from '../servicos/api'
import { Botao } from './Botao'
import TelefonesUrgentes from './TelefonesUrgentes'

type Props = {
  titulo: string
  erro: Error
  aoTentarDeNovo: () => void
  mostrarTelefones?: boolean
}

export default function MensagemErro({ titulo, erro, aoTentarDeNovo, mostrarTelefones = false }: Props) {
  const semInternet = erro instanceof ErroApi && erro.codigo === 'SEM_CONEXAO'

  return (
    <div role="alert" className="mt-4 rounded-2xl border border-nevoa bg-white p-6 md:p-8">
      <h2 className="text-2xl">{titulo}</h2>
      <p className="mt-2 text-ardosia">
        {semInternet
          ? 'Parece que você está sem internet. Confira a conexão e tente de novo.'
          : 'O sistema pode estar fora do ar por alguns minutos. Tente de novo.'}
      </p>
      <Botao className="mt-4" onClick={aoTentarDeNovo}>Tentar de novo</Botao>
      {mostrarTelefones && <TelefonesUrgentes />}
    </div>
  )
}